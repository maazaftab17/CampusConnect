import axios from 'axios';
import config from '../config';

// Use environment variable for API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

console.log('API Base URL:', API_BASE_URL); // For debugging

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// User APIs
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserProfile: (id) => api.get(`/users/${id}/profile`),
  createUser: (userData) => api.post('/users', userData),
  login: (credentials) => api.post('/users/login', credentials),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
};

// Post APIs
export const postAPI = {
  getAllPosts: (userId, profileUserId) => api.get('/posts', { 
    params: { userId, profileUserId } 
  }),
  createPost: (postData) => api.post('/posts', postData),
  updatePost: (postId, postData) => api.put(`/posts/${postId}`, postData),
  likePost: (postId, userId) => api.post(`/posts/${postId}/like`, { userId }),
  unlikePost: (postId, userId) => api.post(`/posts/${postId}/unlike`, { userId }),
  deletePost: (postId, userId) => api.delete(`/posts/${postId}`, { params: { userId } }),
};

// Comment APIs
export const commentAPI = {
  getCommentsByPost: (postId) => api.get(`/comments/post/${postId}`),
  createComment: (commentData) => api.post('/comments', commentData),
  deleteComment: (commentId, userId) => api.delete(`/comments/${commentId}`, { params: { userId } }),
};

// Notification APIs
export const notificationAPI = {
  getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),
  getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread-count`),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
};

// Event APIs
export const eventAPI = {
  getAllEvents: (userId, upcoming = false) => api.get('/events', { 
    params: { userId, upcoming } 
  }),
  getEventById: (id, userId) => api.get(`/events/${id}`, { params: { userId } }),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id, userId) => api.delete(`/events/${id}`, { params: { userId } }),
  registerForEvent: (id, userId) => api.post(`/events/${id}/register`, { userId }),
  unregisterFromEvent: (id, userId) => api.post(`/events/${id}/unregister`, { userId }),
};

// Follow Request APIs
export const followRequestAPI = {
  sendFollowRequest: (followerId, followingId) => 
    api.post('/follow-requests/send', { followerId, followingId }),
  acceptFollowRequest: (requestId) => 
    api.post(`/follow-requests/${requestId}/accept`),
  rejectFollowRequest: (requestId) => 
    api.post(`/follow-requests/${requestId}/reject`),
  unfollowUser: (followerId, followingId) => 
    api.delete('/follow-requests/unfollow', { data: { followerId, followingId } }),
  getPendingRequests: (userId) => 
    api.get(`/follow-requests/pending/${userId}`),
  getPendingRequestCount: (userId) => 
    api.get(`/follow-requests/pending-count/${userId}`),
  getFollowStatus: (userId, targetUserId) => 
    api.get('/follow-requests/status', { params: { userId, targetUserId } }),
};

// Message APIs
export const messageAPI = {
  sendMessage: (senderId, receiverId, content) => 
    api.post('/messages/send', { senderId, receiverId, content }),
  getConversation: (user1Id, user2Id) => 
    api.get('/messages/conversation', { params: { user1Id, user2Id } }),
  getUserConversations: (userId) => 
    api.get(`/messages/conversations/${userId}`),
  markAsRead: (user1Id, user2Id) => 
    api.post('/messages/mark-read', { user1Id, user2Id }),
  getUnreadCount: (userId) => 
    api.get(`/messages/unread-count/${userId}`),
};


// Job Posting APIs
export const jobAPI = {
  getAllJobs: (userId) => api.get('/jobs', { params: { userId } }),
  getJobsByType: (type, userId) => api.get(`/jobs/type/${type}`, { params: { userId } }),
  getMyPostedJobs: (userId) => api.get(`/jobs/my-posts/${userId}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (jobId, jobData) => api.put(`/jobs/${jobId}`, jobData),
  deleteJob: (jobId, userId) => api.delete(`/jobs/${jobId}`, { params: { userId } }),
  applyForJob: (jobId, applicationData) => api.post(`/jobs/${jobId}/apply`, applicationData),
  getJobApplications: (jobId, userId) => api.get(`/jobs/${jobId}/applications`, { params: { userId } }),
  getMyApplications: (userId) => api.get(`/jobs/my-applications/${userId}`),
  updateApplicationStatus: (applicationId, userId, status) => 
    api.put(`/jobs/applications/${applicationId}/status`, { userId, status }),
};

// Verification APIs
export const verificationAPI = {
  getPendingRequests: () => api.get('/verification/pending'),
  getAllRequests: () => api.get('/verification/all'),
  approveUser: (requestId, adminId, notes) => 
    api.post(`/verification/${requestId}/approve`, { adminId, notes }),
  rejectUser: (requestId, adminId, reason) => 
    api.post(`/verification/${requestId}/reject`, { adminId, reason }),
};

export default api;