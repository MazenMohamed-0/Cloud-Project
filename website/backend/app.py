from fastapi import FastAPI, APIRouter, BackgroundTasks, HTTPException, Request, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from cachetools import TTLCache
from kafka import KafkaProducer
from kafka.errors import KafkaError
from dotenv import load_dotenv
import hashlib
import ollama
import logging
import asyncio
import json
import time
import os
from contextlib import asynccontextmanager
from circuitbreaker import circuit
import uuid
from shared.base_service import BaseService

# Load environment variables from .env
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.kafka_producer = await init_kafka()
    logger.info("Kafka producer initialized")
    yield
    # Shutdown
    if hasattr(app.state, 'kafka_producer'):
        app.state.kafka_producer.close()
        logger.info("Kafka producer closed")

# Initialize service and app
service = BaseService("translation_and_summarization_service")
app = service.app
app.lifespan = lifespan  # Set lifespan for the service app
app.add_middleware(GZipMiddleware, minimum_size=1000)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cache configurations
translation_cache = TTLCache(maxsize=100, ttl=3600)
summary_cache = TTLCache(maxsize=100, ttl=3600)

# JWT settings from .env file
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory user database (for demonstration)
fake_users_db = {}

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Data models for authentication
class User(BaseModel):
    username: str
    email: str | None = None

class UserInDB(User):
    hashed_password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    username: str
    password: str
    email: str | None = None

# Data models for translation and summarization
class TranslationRequest(BaseModel):
    text: str
    formality: str = "neutral"

class TranslationStatus(BaseModel):
    id: str
    status: str
    result: dict = None
    error: str = None

class SummaryRequest(BaseModel):
    text: str
    style: str = "formal"
    max_length: int = 500
    bullet_points: bool = False

class SummaryStatus(BaseModel):
    id: str
    status: str
    result: dict = None
    error: str = None

# In-memory status storage
translation_status = {}
summary_status = {}

# Translation prompts
FORMALITY_PROMPTS = {
    "formal": "Translate to formal Arabic (provide ONLY the Arabic translation):",
    "neutral": "Translate to Arabic (provide ONLY the Arabic translation):",
    "informal": "Translate to informal Arabic (provide ONLY the Arabic translation):"
}

# Summary prompts
STYLE_PROMPTS = {
    "formal": """I will now provide a formal academic summary:...""",
    "informal": """I will now provide a conversational summary:...""",
    "technical": """I will now provide a technical summary:...""",
    "executive": """I will now provide an executive summary:...""",
    "creative": """I will now provide a creative narrative summary:..."""
}

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(db, username: str):
    if username in db:
        return db[username]
    return None

# Function to create user (for signup)
def create_user(user_create: UserCreate):
    hashed_password = get_password_hash(user_create.password)
    user = UserInDB(**user_create.dict(), hashed_password=hashed_password)
    fake_users_db[user.username] = user
    return user

# JWT token validation
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = {"username": username}
    except JWTError:
        raise credentials_exception
    return token_data

# In-memory Kafka producer initialization
async def init_kafka():
    try:
        return KafkaProducer(
            bootstrap_servers=os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:9092'),
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            acks='all',
            retries=3
        )
    except KafkaError as e:
        logger.error(f"Kafka initialization error: {e}")
        return None

async def send_to_kafka(producer, message):
    if not producer:
        return
    try:
        future = producer.send('translator_requests', message)
        await asyncio.get_event_loop().run_in_executor(None, future.get, 60)
    except Exception as e:
        logger.error(f"Kafka send error: {e}")

# API routes for login, signup, and translation/summarization
api_router = APIRouter(prefix="/api/v1")

# Signup route
@api_router.post("/signup")
async def signup(user_create: UserCreate):
    user = create_user(user_create)
    return {"msg": "User created successfully", "username": user.username}

# Login route
@api_router.post("/token", response_model=LoginResponse)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Translation route
@api_router.post("/translate/en2ar")
async def translate_text(request: TranslationRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    request_id = str(uuid.uuid4())
    try:
        service.request_count.inc()
        cache_key = hashlib.md5(f"{request.text}{request.formality}".encode()).hexdigest()

        if cache_key in translation_cache:
            result = translation_cache[cache_key]
            translation_status[request_id] = {"status": "completed", "result": result}
            return {"id": request_id, "status": "completed", "result": result, "cache_hit": True}

        try:
            prompt = f"""{FORMALITY_PROMPTS.get(request.formality, FORMALITY_PROMPTS["neutral"])}

{request.text}

Reply with ONLY the Arabic translation, no explanations or transliterations."""
            translation = generate_translation(prompt)
            arabic_only = ''.join(char for char in translation if '\u0600' <= char <= '\u06FF' or char in ['؟', '،', ' '])
            arabic_only = ' '.join(arabic_only.split())

            result = {"translation": arabic_only, "formality": request.formality}
            translation_cache[cache_key] = result
            translation_status[request_id] = {"status": "completed", "result": result}

            background_tasks.add_task(process_translation, request, request_id, cache_key)
            return {"id": request_id, "status": "completed", "result": result, "cache_hit": False}
        except Exception as e:
            translation_status[request_id] = {"status": "processing"}
            background_tasks.add_task(process_translation, request, request_id, cache_key)
            return {"id": request_id, "status": "processing"}
    except Exception as e:
        translation_status[request_id] = {"status": "error", "error": str(e)}
        raise HTTPException(status_code=500, detail=str(e))

# Text summarization route
@api_router.post("/summarize")
async def summarize_text(request: SummaryRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    request_id = str(uuid.uuid4())
    try:
        service.request_count.inc()
        cache_key = hashlib.md5(f"{request.text}{request.style}{request.max_length}{request.bullet_points}".encode()).hexdigest()

        if cache_key in summary_cache:
            result = summary_cache[cache_key]
            summary_status[request_id] = {"status": "completed", "result": result}
            return {"id": request_id, "status": "completed", "result": result, "cache_hit": True}

        try:
            style_prompt = STYLE_PROMPTS.get(request.style, STYLE_PROMPTS["formal"])
            max_length_instruction = f"\nLimit the summary to approximately {request.max_length} characters."
            bullet_points_instruction = "\nUse bullet points for main ideas." if request.bullet_points else ""

            prompt = f"""Based on the following style guide:
{style_prompt}

{max_length_instruction}
{bullet_points_instruction}

Text to summarize:
{request.text}

Provide a concise summary:"""

            summary = generate_completion(prompt)

            if len(summary) > request.max_length:
                summary = summary[:request.max_length].rsplit(' ', 1)[0] + '...'

            result = {"summary": summary, "style": request.style, "bullet_points": request.bullet_points, "length": len(summary), "truncated": len(summary) < len(generate_completion(prompt))}
            summary_cache[cache_key] = result
            summary_status[request_id] = {"status": "completed", "result": result}

            background_tasks.add_task(process_summary, request, request_id, cache_key)
            return {"id": request_id, "status": "completed", "result": result, "cache_hit": False}
        except Exception as e:
            summary_status[request_id] = {"status": "processing"}
            background_tasks.add_task(process_summary, request, request_id, cache_key)
            return {"id": request_id, "status": "processing"}
    except Exception as e:
        summary_status[request_id] = {"status": "error", "error": str(e)}
        raise HTTPException(status_code=500, detail=str(e))

# Register the API router
app.include_router(api_router)
