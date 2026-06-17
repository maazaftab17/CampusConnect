import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { followRequestAPI } from '../services/api';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';

const FollowRequests = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, [currentUser]);

  const fetchRequests = async () => {
    try {
      const response = await followRequestAPI.getPendingRequests(currentUser.id);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
    setLoading(false);
  };

  const handleAccept = async (requestId) => {
    try {
      await followRequestAPI.acceptFollowRequest(requestId);
      fetchRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await followRequestAPI.rejectFollowRequest(requestId);
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Follow Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {requests.length} pending request{requests.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {requests.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              borderRadius: 3,
              background: 'white'
            }}
          >
            <PeopleIcon sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Pending Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don't have any follow requests at the moment
            </Typography>
          </Paper>
        ) : (
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              background: 'white'
            }}
          >
            <List sx={{ p: 0 }}>
              {requests.map((request, index) => (
                <React.Fragment key={request.id}>
                  <ListItem
                    sx={{
                      py: 2.5,
                      px: 3,
                      '&:hover': {
                        bgcolor: '#f7fafc'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: '#667eea',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                        onClick={() => navigate(`/profile/${request.follower.id}`)}
                      >
                        <Typography variant="h5" fontWeight={600}>
                          {request.follower.firstName[0]}{request.follower.lastName[0]}
                        </Typography>
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      sx={{ ml: 2 }}
                      primary={
                        <Typography 
                          variant="h6" 
                          fontWeight={600}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              color: '#667eea'
                            }
                          }}
                          onClick={() => navigate(`/profile/${request.follower.id}`)}
                        >
                          {request.follower.firstName} {request.follower.lastName}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {request.follower.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sent {new Date(request.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <Box sx={{ display: 'flex', gap: 1.5, ml: 2 }}>
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={<CheckIcon />}
                        onClick={() => handleAccept(request.id)}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 3,
                          borderRadius: 2,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                          }
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<CloseIcon />}
                        onClick={() => handleReject(request.id)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 3,
                          borderRadius: 2,
                          borderColor: '#e0e0e0',
                          color: '#666',
                          '&:hover': {
                            borderColor: '#ef4444',
                            color: '#ef4444',
                            bgcolor: '#fef2f2'
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </ListItem>
                  
                  {index < requests.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default FollowRequests;