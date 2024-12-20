import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6A1E55', // Deep Purple
    },
    secondary: {
      main: '#A64D79', // Rose
    },
    background: {
      default: '#FFFFFF', // Charcoal Black
      paper: '#3B1C32',   // Dark Purple
    },
    text: {
      primary: '#000000', // White for contrast
      secondary: '#A64D79', // Rose for highlights
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default theme;
