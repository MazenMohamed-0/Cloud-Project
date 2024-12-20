import React from 'react';
import { TextField } from '@mui/material';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange }) => (
  <TextField 
    fullWidth 
    label={label} 
    variant="outlined" 
    value={value} 
    onChange={onChange} 
    margin="normal"
  />
);

export default TextInput;
