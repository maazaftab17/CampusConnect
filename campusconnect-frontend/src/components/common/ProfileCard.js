import React, { useState, useEffect } from 'react';
import {
  Card,
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { followRequestAPI } from '../../services/api';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MessageIcon from '@mui/icons-material/Message';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StarIcon from '@mui/icons-material/Star';
import ArticleIcon from '@mui/icons-material/Article';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';



const ProfileCard = ({ user }) => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [followStatus, setFollowStatus] = useState('NOT_FOLLOWING');
  const [bookmarked, setBookmarked] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && user.id !== currentUser.id) {
      fetchFollowStatus();
    }
  }, [currentUser, user.id]);

  const fetchFollowStatus = async () => {
    try {
      const response = await followRequestAPI.getFollowStatus(currentUser.id, user.id);
      setFollowStatus(response.data);
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  const handleFollowAction = async () => {
    setLoading(true);
    try {
      if (followStatus === 'NOT_FOLLOWING' || followStatus === 'REJECTED') {
        await followRequestAPI.sendFollowRequest(currentUser.id, user.id);
        setFollowStatus('PENDING');
      } else if (followStatus === 'ACCEPTED') {
        await followRequestAPI.unfollowUser(currentUser.id, user.id);
        setFollowStatus('NOT_FOLLOWING');
      }
    } catch (error) {
      console.error('Error with follow action:', error);
      alert(error.response?.data?.error || 'Action failed');
    }
    setLoading(false);
  };

  

  const handleSendMessage = () => {
    console.log('Sending message:', message);
    setMessage('');
    setMessageDialogOpen(false);
  };

  const handleMessageClick = () => {
    navigate(`/messages?userId=${user.id}`);
  };

  const getRoleColor = (role) => {
    const colors = {
      STUDENT: '#667eea',
      ALUMNI: '#f59e0b',
      FACULTY: '#10b981',
      ADMIN: '#ef4444'
    };
    return colors[role] || '#667eea';
  };

  const stats = {
    rating: (4.0 + Math.random() * 1).toFixed(1),
    posts: Math.floor(Math.random() * 50) + 5,
    followers: Math.floor(Math.random() * 200) + 10
  };

  const getButtonContent = () => {
    switch (followStatus) {
      case 'PENDING':
        return {
          icon: <HourglassEmptyIcon />,
          text: 'Pending',
          disabled: true,
          color: 'warning'
        };
      case 'ACCEPTED':
        return {
          icon: <MessageIcon />,
          text: 'Message',
          disabled: false,
          action: handleMessageClick
        };
      default:
        return {
          icon: <PersonAddIcon />,
          text: 'Follow',
          disabled: false,
          action: handleFollowAction
        };
    }
  };

  const buttonContent = getButtonContent();

  // Don't show card for current user
  if (currentUser && user.id === currentUser.id) {
    return null;
  }

  return (
    <>
      <Card
        sx={{
          width: 320,
          height: 480,
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Background/Avatar Section - Fixed Height */}
        <Box
          sx={{
            height: 280,
            background: `linear-gradient(135deg, ${getRoleColor(user.role)}22 0%, ${getRoleColor(user.role)}44 100%)`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }
          }}
        >
          <Avatar
            sx={{
              width: 140,
              height: 140,
              fontSize: '3.5rem',
              bgcolor: getRoleColor(user.role),
              border: '4px solid white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/profile/${user.id}`)}
          >
            {user.firstName[0]}{user.lastName[0]}
          </Avatar>

          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'white' }
            }}
            onClick={() => setBookmarked(!bookmarked)}
          >
            {bookmarked ? <BookmarkIcon sx={{ color: '#667eea' }} /> : <BookmarkBorderIcon />}
          </IconButton>
        </Box>

        {/* Content Section - Fixed Height */}
        <Box
          sx={{
            flex: 1,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.95))',
            color: 'white',
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              noWrap
              sx={{
                cursor: 'pointer',
                '&:hover': { color: '#667eea' }
              }}
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              {user.firstName} {user.lastName}
            </Typography>
            <VerifiedIcon sx={{ color: '#667eea', fontSize: 20 }} />
          </Box>

          <Chip
            label={user.role}
            size="small"
            sx={{
              bgcolor: getRoleColor(user.role),
              color: 'white',
              fontWeight: 600,
              mb: 1,
              width: 'fit-content',
              height: 22
            }}
          />

          {/* Bio */}
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              mb: 1.5,
              lineHeight: 1.4,
              height: 34,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {user.bio || `${user.department || 'CampusConnect'} Member`}
          </Typography>

          {/* Stats */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              py: 1,
              mb: 1,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                <StarIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                <Typography variant="body2" fontWeight={700}>{stats.rating}</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>
                Rating
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                <ArticleIcon sx={{ fontSize: 16, color: '#667eea' }} />
                <Typography variant="body2" fontWeight={700}>{stats.posts}</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>
                Posts
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                <PersonAddIcon sx={{ fontSize: 16, color: '#10b981' }} />
                <Typography variant="body2" fontWeight={700}>{stats.followers}</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>
                Followers
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={buttonContent.icon}
              onClick={buttonContent.action || handleFollowAction}
              disabled={loading || buttonContent.disabled}
              color={buttonContent.color}
              sx={{
                py: 1,
                borderRadius: 2.5,
                bgcolor: buttonContent.color ? undefined : 'white',
                color: buttonContent.color ? undefined : '#000',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  bgcolor: buttonContent.color ? undefined : '#f3f4f6'
                },
                '&.Mui-disabled': {
                  bgcolor: '#fbbf24',
                  color: 'white'
                }
              }}
            >
              {buttonContent.text}
            </Button>

            {followStatus === 'ACCEPTED' && (
              <IconButton
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,0,0,0.2)'
                  }
                }}
                onClick={handleFollowAction}
                title="Unfollow"
              >
                <PersonRemoveIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      </Card>

      {/* Message Dialog */}
      <Dialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          Send Message to {user.firstName} {user.lastName}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!message.trim()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileCard;