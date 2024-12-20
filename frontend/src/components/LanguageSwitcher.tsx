import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

interface LanguageSwitcherProps {
  language: string;
  onChange: (language: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, onChange }) => {
  const handleLanguageChange = (
    event: React.MouseEvent<HTMLElement>,
    newLanguage: string
  ) => {
    if (newLanguage) onChange(newLanguage);
  };

  return (
    <ToggleButtonGroup
      value={language}
      exclusive
      onChange={handleLanguageChange}
      sx={{ mb: 2 }}
    >
      <ToggleButton value="english">English</ToggleButton>
      <ToggleButton value="arabic">Arabic</ToggleButton>
    </ToggleButtonGroup>
  );
};

export default LanguageSwitcher;