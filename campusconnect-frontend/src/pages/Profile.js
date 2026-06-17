import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4">User Profile</Typography>
        <Typography>User ID: {id}</Typography>
      </Paper>
    </Container>
  );
};

export default Profile;