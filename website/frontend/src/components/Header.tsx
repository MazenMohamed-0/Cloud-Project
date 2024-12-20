import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ backgroundColor: '#3B1C32' }}>
      <Toolbar>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 1,
            width: '100%',
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ cursor: 'pointer', marginBottom: 1 }}
            onClick={() => navigate('/')}
          >
            Translation Platform
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/english-to-arabic')}
            >
              English to Arabic
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/arabic-to-english')}
            >
              Arabic to English
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/text-summarization')}
            >
              Text Summarization
            </Button>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
