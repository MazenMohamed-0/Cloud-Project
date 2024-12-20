import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.tsx';  
import Signup from './pages/Signup.tsx';  
import EnglishToArabic from './pages/EnglishToArabic.tsx';  
import ArabicToEnglish from './pages/ArabicToEnglish.tsx';  
import TextSummarization from './pages/TextSummarization.tsx';  

const RoutesConfig: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />  {/* Default route */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/english-to-arabic" element={<EnglishToArabic />} />
      <Route path="/arabic-to-english" element={<ArabicToEnglish />} />
      <Route path="/text-summarization" element={<TextSummarization />} />
    </Routes>
  );
};

export default RoutesConfig;
