import React, { useState } from 'react';
import { Box, Typography, Button, TextField, CircularProgress } from '@mui/material';
import FileUploader from '../components/FileUploader.tsx';

const TextSummarization: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
    // Placeholder for processing uploaded files
    console.log('Uploaded Files:', files);
  };

  const handleSummarize = async () => {
    setLoading(true);
    setSummary(null);

    // Simulate an API call for text summarization
    setTimeout(() => {
      setSummary(`Summarized text: ${text.slice(0, 50)}...`);
      setLoading(false);
    }, 2000);
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Text Summarization
      </Typography>

      <Box sx={{ marginBottom: 4 }}>
        <FileUploader onUpload={handleFileUpload} />
      </Box>

      <Typography variant="h6" gutterBottom>
        Enter or Paste Text for Summarization
      </Typography>
      <TextField
        multiline
        rows={6}
        fullWidth
        variant="outlined"
        placeholder="Paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{ marginBottom: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSummarize}
        disabled={loading || !text.trim()}
      >
        {loading ? <CircularProgress size={24} /> : 'Summarize Text'}
      </Button>

      {summary && (
        <Box sx={{ marginTop: 4, padding: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6">Summary:</Typography>
          <Typography variant="body1">{summary}</Typography>
        </Box>
      )}

      {uploadedFiles.length > 0 && (
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h6">Uploaded Files:</Typography>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
};

export default TextSummarization;
