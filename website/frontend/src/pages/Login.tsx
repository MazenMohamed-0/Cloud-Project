import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Add your authentication logic here
    console.log('Logging in with', email, password);
    // Navigate to the dashboard or home page on successful login
    navigate('/');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 4, padding: 3, backgroundColor: '#f1e2ea', borderRadius: 2 }}>
        <Typography variant="h5" align="center" sx={{ marginBottom: 3 }}>
          Login
        </Typography>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }} onClick={handleLogin}>
          Login
        </Button>
        <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
          Don't have an account?{' '}
          <Button onClick={() => navigate('/signup')} color="primary">
            Sign Up
          </Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
