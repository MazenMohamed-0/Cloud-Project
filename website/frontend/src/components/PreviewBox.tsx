import React from 'react';
import { Box, Typography } from '@mui/material';

// Define the prop types for PreviewBox
interface PreviewBoxProps {
  title: string;
  content: string;
}

const PreviewBox: React.FC<PreviewBoxProps> = ({ title, content }) => {
  return (
    <Box sx={{ marginTop: 3, padding: 2, backgroundColor: '#F5F5F5', borderRadius: 2 }}>
      <Typography variant="h6">{title}</Typography>
      <Typography>{content}</Typography>
    </Box>
  );
};

export default PreviewBox;
