import React, { useState } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText } from '@mui/material';

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(filesArray);
      onUpload(filesArray); 
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
      <Typography variant="h6">Upload Documents</Typography>
      <Button variant="contained" component="label">
        Select Files
        <input
          type="file"
          hidden
          accept=".txt,.docx,.pdf"
          multiple
          onChange={handleFileChange}
        />
      </Button>
      {selectedFiles.length > 0 && (
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle1">Selected Files:</Typography>
          <List>
            {selectedFiles.map((file, index) => (
              <ListItem key={index}>
                <ListItemText primary={file.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FileUploader;
