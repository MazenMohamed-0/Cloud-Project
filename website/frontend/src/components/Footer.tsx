import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer"
    sx={{
      backgroundColor: '#3B1C32', // Dark Blue background
      color: 'white',
      padding: '20px',
      textAlign: 'center',
      marginTop: 'auto', // Ensures footer sticks to bottom
      height: '60px', 
      width: 'auto'
    }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="white" align="center">
          &copy; {new Date().getFullYear()} Translation Platform. All Rights Reserved.
        </Typography>
        <Typography variant="body2" color="white" align="center">
          
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
