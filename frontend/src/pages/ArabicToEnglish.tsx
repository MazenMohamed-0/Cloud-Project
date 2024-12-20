import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import  PreviewBox  from '../components/PreviewBox.tsx'; // Assuming PreviewBox is for showing results

const ArabicToEnglish = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  const handleTranslation = () => {
    setTranslatedText(`Translated English: ${inputText}`); // Example translation output
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        marginTop: 4, 
        padding: 3, 
        backgroundColor: '#f1e2ea', 
        borderRadius: 2 
        }}>
        <Typography variant="h5" align="center" sx={{ marginBottom: 3 }}>
          Arabic to English Translation
        </Typography>
        <TextField
          label="Enter text in Arabic"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <Button variant="contained" color="primary" fullWidth sx={{ 
          marginTop: 2 
          }} onClick={handleTranslation}>
          Translate
        </Button>
        {translatedText && (
          <PreviewBox
            title="Translated Text"
            content={translatedText}
          />
        )}
      </Box>
    </Container>
  );
};

export default ArabicToEnglish;
