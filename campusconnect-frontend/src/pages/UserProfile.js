import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Avatar,
  Typography,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CardMedia,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { userAPI, postAPI } from '../services/api';
import CommentSection from '../components/common/CommentSection';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import ArticleIcon from '@mui/icons-material/Article';

const UserProfile = () => {
  const { userId } = useParams();
  const { currentUser } = useUser();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    department: '',
    course: '',
    academicYear: 1
  });

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getUserProfile(userId);
      setProfile(response.data);
      setEditForm({
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        bio: response.data.user.bio || '',
        department: response.data.user.department || '',
        course: response.data.user.course || '',
        academicYear: response.data.user.academicYear || 1,
        batchYear: response.data.user.batchYear || new Date().getFullYear()
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      const response = await postAPI.getAllPosts(currentUser?.id, userId);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
    setLoading(false);
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSave = async () => {
    try {
      await userAPI.updateUser(userId, editForm);
      setEditDialogOpen(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleLikeToggle = async (post) => {
    try {
      if (post.liked) {
        await postAPI.unlikePost(post.id, currentUser.id);
      } else {
        await postAPI.likePost(post.id, currentUser.id);
      }
      fetchUserPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (!profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isOwnProfile = currentUser?.id === parseInt(userId);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{ 
                width: 120, 
                height: 120, 
                bgcolor: 'primary.main',
                fontSize: '3rem'
              }}
            >
              {profile.user.firstName[0]}{profile.user.lastName[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4">
                {profile.user.firstName} {profile.user.lastName}
              </Typography>
              {isOwnProfile && (
                <IconButton color="primary" onClick={handleEditClick}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip 
                label={profile.user.role} 
                color="primary" 
                size="small"
              />
              {profile.user.department && (
                <Chip 
                  label={profile.user.department} 
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>

            <Typography variant="body1" color="text.secondary" paragraph>
              {profile.user.email}
            </Typography>

            {profile.user.bio && (
              <Typography variant="body1" paragraph>
                {profile.user.bio}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="h6">{profile.postCount}</Typography>
                <Typography variant="body2" color="text.secondary">Posts</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Additional Info */}
        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {profile.user.rollNumber && (
            <Box>
              <Typography variant="caption" color="text.secondary">Roll Number</Typography>
              <Typography variant="body2">{profile.user.rollNumber}</Typography>
            </Box>
          )}
          {profile.user.course && (
            <Box>
              <Typography variant="caption" color="text.secondary">Course</Typography>
              <Typography variant="body2">{profile.user.course}</Typography>
            </Box>
          )}
          {profile.user.academicYear && (
            <Box>
              <Typography variant="caption" color="text.secondary">Academic Year</Typography>
              <Typography variant="body2">Year {profile.user.academicYear}</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* User Posts */}
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ArticleIcon />
        Posts by {profile.user.firstName}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
          </Typography>
        </Paper>
      ) : (
        posts.map((post) => (
          <Card key={post.id} sx={{ mb: 2 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {post.user.firstName[0]}
                </Avatar>
              }
              title={`${post.user.firstName} ${post.user.lastName}`}
              subheader={new Date(post.createdAt).toLocaleString()}
            />
            
            <CardContent>
              <Typography variant="body1">
                {post.content}
              </Typography>
            </CardContent>

            {post.imageUrl && (
              <CardMedia
                component="img"
                image={post.imageUrl}
                alt="Post image"
                sx={{ maxHeight: 500, objectFit: 'contain' }}
              />
            )}

            <CardActions disableSpacing sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                <IconButton 
                  onClick={() => handleLikeToggle(post)}
                  color={post.liked ? "error" : "default"}
                >
                  {post.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {post.likesCount}
                </Typography>
                <IconButton>
                  <CommentIcon />
                </IconButton>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {post.commentsCount}
                </Typography>
              </Box>

              <Box sx={{ px: 2, pb: 1 }}>
                <CommentSection 
                  postId={post.id} 
                  commentsCount={post.commentsCount}
                  onCommentCountChange={(newCount) => {
                    setPosts(prevPosts => 
                      prevPosts.map(p => 
                        p.id === post.id ? { ...p, commentsCount: newCount } : p
                      )
                    );
                  }}
                />
              </Box>
            </CardActions>
          </Card>
        ))
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="First Name"
              name="firstName"
              value={editForm.firstName}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={editForm.lastName}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              label="Bio"
              name="bio"
              value={editForm.bio}
              onChange={handleEditChange}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Department"
              name="department"
              value={editForm.department}
              onChange={handleEditChange}
              fullWidth
            />
  
            {/* Show course and academic year only for students */}
            {profile?.user.role === 'STUDENT' && (
              <>
                <TextField
                  label="Course"
                  name="course"
                  value={editForm.course}
                  onChange={handleEditChange}
                  fullWidth
                />
                <TextField
                  label="Academic Year"
                  name="academicYear"
                  type="number"
                  value={editForm.academicYear}
                  onChange={handleEditChange}
                  inputProps={{ min: 1, max: 4 }}
                  fullWidth
                />
              </>
            )}
  
            {/* Show batch year only for alumni */}
            {profile?.user.role === 'ALUMNI' && (
              <TextField
                label="Batch Year"
                name="batchYear"
                type="number"
                value={editForm.batchYear || new Date().getFullYear()}
                onChange={handleEditChange}
                inputProps={{ min: 1950, max: new Date().getFullYear() }}
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;