import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  CircularProgress,
  CardMedia,
  Menu,
  MenuItem
} from '@mui/material';
import { useUser } from '../context/UserContext';
import { postAPI } from '../services/api';
import CommentSection from '../components/common/CommentSection';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const { currentUser } = useUser();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const fileInputRef = useRef(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [currentUser]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await postAPI.getAllPosts(currentUser?.id);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !selectedImage) return;

    setPosting(true);
    try {
      let imageData = '';
      
      if (selectedImage) {
        const reader = new FileReader();
        imageData = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(selectedImage);
        });
      }

      await postAPI.createPost({
        userId: currentUser.id,
        content: newPost || 'Shared an image',
        imageUrl: imageData
      });

      setNewPost('');
      handleRemoveImage();
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
    setPosting(false);
  };

  const handleLikeToggle = async (post) => {
    try {
      if (post.liked) {
        await postAPI.unlikePost(post.id, currentUser.id);
      } else {
        await postAPI.likePost(post.id, currentUser.id);
      }
      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleMenuOpen = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      handleMenuClose();
      return;
    }

    try {
      await postAPI.deletePost(selectedPostId, currentUser.id);
      fetchPosts();
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
      handleMenuClose();
    }
  };

  const handleCommentCountChange = (postId, newCount) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, commentsCount: newCount } : post
      )
    );
  };
  
  const handleEditClick = (post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
    setEditImagePreview(post.imageUrl);
    handleMenuClose();
  };

  const handleEditCancel = () => {
    setEditingPostId(null);
    setEditContent('');
    setEditImage(null);
    setEditImagePreview(null);
  };

  const handleEditSave = async (postId) => {
    try {
      let imageData = editImagePreview;
    
      if (editImage) {
        const reader = new FileReader();
        imageData = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(editImage);
        });
      }

      await postAPI.updatePost(postId, {
        userId: currentUser.id,
        content: editContent,
        imageUrl: imageData
      });

      handleEditCancel();
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    }
  };

  const handleEditImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setEditImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };






  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Create Post Card */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          What's on your mind, {currentUser?.firstName}?
        </Typography>
        <Box component="form" onSubmit={handleCreatePost}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Share your thoughts..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          {imagePreview && (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  width: '100%', 
                  maxHeight: '400px', 
                  objectFit: 'contain',
                  borderRadius: '8px'
                }} 
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                }}
                onClick={handleRemoveImage}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <input
              ref={fileInputRef}
              accept="image/*"
              type="file"
              hidden
              onChange={handleImageSelect}
            />
            <Button
              variant="outlined"
              startIcon={<PhotoCamera />}
              onClick={() => fileInputRef.current?.click()}
              disabled={posting}
            >
              Add Photo
            </Button>

            <Button 
              type="submit" 
              variant="contained" 
              disabled={(!newPost.trim() && !selectedImage) || posting}
            >
              {posting ? 'Posting...' : 'Post'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Posts Feed */}
      <Typography variant="h5" gutterBottom>
        Campus Feed
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No posts yet. Be the first to post!
          </Typography>
        </Paper>
      ) : (
        posts.map((post) => (
          <Card key={post.id} sx={{ mb: 2 }}>
            <CardHeader
              avatar={
                <Avatar 
                  sx={{ bgcolor: 'primary.main', cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/${post.user.id}`)}
                >
                  {post.user.firstName[0]}
                </Avatar>
              }
              action={
                post.user.id === currentUser.id && (
                  <IconButton onClick={(e) => handleMenuOpen(e, post.id)}>
                    <MoreVertIcon />
                  </IconButton>
                )
              }
              title={
                <Typography 
                  variant="subtitle1" 
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate(`/profile/${post.user.id}`)}
                >
                  {post.user.firstName} {post.user.lastName}
                </Typography>
              }
              subheader={new Date(post.createdAt).toLocaleString()}
            />
            
            {editingPostId === post.id ? (
              <CardContent>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                {editImagePreview && (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <img 
                      src={editImagePreview} 
                      alt="Edit preview" 
                      style={{ 
                        width: '100%', 
                        maxHeight: '400px', 
                        objectFit: 'contain',
                        borderRadius: '8px'
                      }} 
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                      }}
                      onClick={() => setEditImagePreview(null)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <input
                    accept="image/*"
                    type="file"
                    hidden
                    id={`edit-image-${post.id}`}
                    onChange={handleEditImageSelect}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PhotoCamera />}
                    onClick={() => document.getElementById(`edit-image-${post.id}`).click()}
                  >
                    Change Photo
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => handleEditSave(post.id)}
                  >
                    Save
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={handleEditCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            ) : (
              <>
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
              </>
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
                <IconButton>
                  <ShareIcon />
                </IconButton>
              </Box>

              {/* Comment Section */}
              <Box sx={{ px: 2, pb: 1 }}>
                <CommentSection 
                  postId={post.id} 
                  commentsCount={post.commentsCount}
                  onCommentCountChange={(newCount) => handleCommentCountChange(post.id, newCount)}
                />
              </Box>
            </CardActions>
          </Card>
        ))
      )}

      {/* Delete Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const post = posts.find(p => p.id === selectedPostId);
          handleEditClick(post);
        }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Post
        </MenuItem>
        <MenuItem onClick={handleDeletePost}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Post
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Feed;