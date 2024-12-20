import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header.tsx';  
import Footer from './components/Footer.tsx';  
import RoutesConfig from './routes.tsx';  
import './index.css';

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header />
        <div style={{ flex: 1 }}>
          <RoutesConfig />  {/* Use RoutesConfig for the routes */}
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
