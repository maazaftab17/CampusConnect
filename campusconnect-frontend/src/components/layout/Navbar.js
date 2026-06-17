import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { notificationAPI, followRequestAPI } from '../../services/api';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { messageAPI } from '../../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [followRequestCount, setFollowRequestCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
      fetchFollowRequestCount();
      fetchUnreadMessageCount();
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchFollowRequestCount();
        fetchUnreadMessageCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

    // Don't render if no user
  if (!currentUser) {
    return null;
  }


  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount(currentUser.id);
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchFollowRequestCount = async () => {
    try {
      const response = await followRequestAPI.getPendingRequestCount(currentUser.id);
      setFollowRequestCount(response.data);
    } catch (error) {
      console.error('Error fetching follow request count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getUserNotifications(currentUser.id);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadMessageCount = async () => {
    try {
      const response = await messageAPI.getUnreadCount(currentUser.id);
      setUnreadMessageCount(response.data);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  };

  const handleNotificationClick = async (event) => {
    setAnchorEl(event.currentTarget);
    await fetchNotifications();
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationItemClick = async (notification) => {
    if (!notification.isRead) {
      await notificationAPI.markAsRead(notification.id);
      fetchUnreadCount();
    }
    
    if (notification.postId) {
      navigate(`/feed`);
    }
    
    handleNotificationClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(currentUser.id);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTimeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm';
    
    return Math.floor(seconds) + 's';
  };

  return (
    <AppBar position="sticky" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 700,
            fontFamily: "'Pacifico', cursive"
          }}
          onClick={() => navigate('/')}
        >
          🎓 CampusConnect
        </Typography>

        {currentUser && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button 
              color="inherit" 
              startIcon={<HomeIcon />}
              onClick={() => navigate('/feed')}
              sx={{ fontWeight: 600 }}
            >
              Feed
            </Button>
            <Button 
              color="inherit" 
              startIcon={<EventIcon />}
              onClick={() => navigate('/events')}
              sx={{ fontWeight: 600 }}
            >
              Events
            </Button>
            <Button 
              color="inherit" 
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/users')}
              sx={{ fontWeight: 600 }}
            >
              Users
            </Button>

            {/* Jobs Button */}
            <Button
              color='inherit'
              startIcon={<WorkIcon />}
              onClick={() => navigate('/jobs')}
              sx={{ fontWeight: 600 }}
            >
              Jobs
            </Button>

            {/* Admin Verification Button - Only visible to ADMIN */}
            {currentUser?.role === 'ADMIN' && (
              <Button
                color='inherit'
                startIcon={<VerifiedUserIcon />}
                onClick={() => navigate('/admin/verification')}
                sx={{ 
                  fontWeight: 600,
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.25)'
                  }
                }}
              >
                Verifications
              </Button>
            )}

            {/* Follow Requests Button */}
            <Button 
              color="inherit" 
              onClick={() => navigate('/follow-requests')}
              sx={{ position: 'relative', fontWeight: 600 }}
            >
              Requests
              {followRequestCount > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}
                >
                  {followRequestCount}
                </Box>
              )}
            </Button>

            <IconButton color="inherit" onClick={() => navigate('/messages')}>
              <Badge badgeContent={unreadMessageCount} color="error">
                <MailIcon />
              </Badge>
            </IconButton>

            {/* Notifications */}
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Button 
              color="inherit" 
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ fontWeight: 600 }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>

      {/* Notifications Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 480 }
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationItemClick(notification)}
              sx={{
                bgcolor: notification.isRead ? 'inherit' : 'action.hover',
                py: 1.5
              }}
            >
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {notification.actor ? notification.actor.firstName[0] : '🔔'}
              </Avatar>
              <ListItemText
                primary={notification.message}
                secondary={getTimeSince(notification.createdAt) + ' ago'}
              />
      </MenuItem>
          ))
        )}
      </Menu>
    </AppBar>
  );
};

export default Navbar;