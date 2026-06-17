import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Navbar from './layout/Navbar';
import { Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useUser();

  // If no user is logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, show Navbar + Page
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      {children}
    </Box>
  );
};

export default ProtectedRoute;