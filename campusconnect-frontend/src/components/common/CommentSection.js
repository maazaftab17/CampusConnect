import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { commentAPI } from '../../services/api';
import { useUser } from '../../context/UserContext';

const CommentSection = ({ postId, commentsCount, onCommentCountChange }) => {
  const { currentUser } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await commentAPI.getCommentsByPost(postId);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
    setLoading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentAPI.createComment({
        postId,
        userId: currentUser.id,
        content: newComment
      });
      setNewComment('');
      fetchComments();
      if (onCommentCountChange) {
        onCommentCountChange(commentsCount + 1);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await commentAPI.deleteComment(commentId, currentUser.id);
      fetchComments();
      if (onCommentCountChange) {
        onCommentCountChange(Math.max(0, commentsCount - 1));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  return (
    <Box>
      <Button
        size="small"
        onClick={() => setShowComments(!showComments)}
        sx={{ textTransform: 'none', mb: 1 }}
      >
        {showComments ? 'Hide' : 'View'} {commentsCount} comment{commentsCount !== 1 ? 's' : ''}
      </Button>

      {showComments && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />

          {/* Add Comment Form */}
          <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              {currentUser?.firstName[0]}
            </Avatar>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
            />
            <Button 
              type="submit" 
              variant="contained" 
              disabled={!newComment.trim()}
              size="small"
            >
              Post
            </Button>
          </Box>

          {/* Comments List */}
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Loading comments...
            </Typography>
          ) : comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {comments.map((comment) => (
                <Paper key={comment.id} sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      {comment.user.firstName[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {comment.user.firstName} {comment.user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        {comment.user.id === currentUser.id && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteComment(comment.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {comment.content}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CommentSection;