import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { messageAPI, userAPI } from '../services/api';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import AddCommentIcon from '@mui/icons-material/AddComment';

const Messages = () => {
  const { currentUser } = useUser();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [firstMessage, setFirstMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && conversations.length > 0) {
      const userId = searchParams.get('userId');
      if (userId) {
        const conversation = conversations.find(
          c => c.otherUser.id === parseInt(userId)
        );
        if (conversation) {
          setSelectedConversation(conversation);
        }
      }
    }
  }, [conversations, searchParams, currentUser]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      markAsRead();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await messageAPI.getUserConversations(currentUser.id);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      // Filter out current user
      const filteredUsers = response.data.filter(u => u.id !== currentUser.id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await messageAPI.getConversation(
        currentUser.id,
        selectedConversation.otherUser.id
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async () => {
    if (!selectedConversation) return;
    
    try {
      await messageAPI.markAsRead(currentUser.id, selectedConversation.otherUser.id);
      fetchConversations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await messageAPI.sendMessage(
        currentUser.id,
        selectedConversation.otherUser.id,
        newMessage
      );
      setNewMessage('');
      fetchMessages();
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setSending(false);
  };

  const handleStartNewConversation = async () => {
    if (!selectedUser || !firstMessage.trim()) return;

    setSending(true);
    try {
      await messageAPI.sendMessage(
        currentUser.id,
        selectedUser.id,
        firstMessage
      );
      
      setNewConversationOpen(false);
      setSelectedUser(null);
      setFirstMessage('');
      
      // Refresh conversations
      await fetchConversations();
      
      // Select the new conversation
      const newConv = conversations.find(c => c.otherUser.id === selectedUser.id);
      if (newConv) {
        setSelectedConversation(newConv);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation');
    }
    setSending(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
        display: 'flex'
      }}
    >
      <Container maxWidth="xl" sx={{ py: 3, display: 'flex', gap: 2, height: '100%' }}>
        {/* Conversations List */}
        <Paper
          elevation={0}
          sx={{
            width: 360,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700} color="white">
                Messages
              </Typography>
              <IconButton
                size="small"
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                }}
                onClick={() => setNewConversationOpen(true)}
              >
                <AddCommentIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#F7FAFC'
                }
              }}
            />
          </Box>

          <Divider />

          <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {conversations.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <ChatIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No conversations yet
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddCommentIcon />}
                  onClick={() => setNewConversationOpen(true)}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    textTransform: 'none'
                  }}
                >
                  Start Conversation
                </Button>
              </Box>
            ) : (
              conversations.map((conversation) => (
                <ListItemButton
                  key={conversation.id}
                  selected={selectedConversation?.id === conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  sx={{
                    py: 2,
                    '&.Mui-selected': {
                      bgcolor: '#667eea11',
                      borderLeft: '4px solid #667eea'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={conversation.unreadCount}
                      color="error"
                    >
                      <Avatar
                        sx={{
                          bgcolor: '#667eea',
                          width: 50,
                          height: 50
                        }}
                      >
                        {conversation.otherUser.firstName[0]}{conversation.otherUser.lastName[0]}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={600}>
                        {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ fontWeight: conversation.unreadCount > 0 ? 600 : 400 }}
                      >
                        {conversation.lastMessage}
                      </Typography>
                    }
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(conversation.lastMessageTime)}
                  </Typography>
                </ListItemButton>
              ))
            )}
          </List>
        </Paper>

        {/* Chat Area */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'white',
                    color: '#667eea',
                    width: 45,
                    height: 45
                  }}
                >
                  {selectedConversation.otherUser.firstName[0]}{selectedConversation.otherUser.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
                  </Typography>
                  <Typography variant="caption">
                    {selectedConversation.otherUser.email}
                  </Typography>
                </Box>
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  background: '#f7fafc'
                }}
              >
                {messages.map((message) => {
                  const isOwn = message.sender.id === currentUser.id;
                  return (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isOwn ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 3,
                            background: isOwn
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'white',
                            color: isOwn ? 'white' : 'text.primary',
                            borderTopRightRadius: isOwn ? 4 : 16,
                            borderTopLeftRadius: isOwn ? 16 : 4
                          }}
                        >
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                        </Paper>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, px: 1 }}
                        >
                          {formatTime(message.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  p: 2,
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex',
                  gap: 1
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#F7FAFC'
                    }
                  }}
                />
                <IconButton
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    width: 56,
                    height: 56,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    },
                    '&:disabled': {
                      background: '#e0e0e0'
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary'
              }}
            >
              <ChatIcon sx={{ fontSize: 100, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a conversation to start messaging
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddCommentIcon />}
                onClick={() => setNewConversationOpen(true)}
                sx={{
                  mt: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Start New Conversation
              </Button>
            </Box>
          )}
        </Paper>
      </Container>

      {/* New Conversation Dialog */}
      <Dialog
        open={newConversationOpen}
        onClose={() => setNewConversationOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Start New Conversation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Select User
            </Typography>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
              value={selectedUser}
              onChange={(event, newValue) => setSelectedUser(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search users..."
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar
                    sx={{
                      bgcolor: '#667eea',
                      width: 35,
                      height: 35,
                      mr: 2
                    }}
                  >
                    {option.firstName[0]}{option.lastName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {option.firstName} {option.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            {selectedUser && (
              <>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
                  Message
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Type your first message..."
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setNewConversationOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleStartNewConversation}
            disabled={!selectedUser || !firstMessage.trim() || sending}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
              }
            }}
          >
            {sending ? 'Sending...' : 'Start Conversation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;