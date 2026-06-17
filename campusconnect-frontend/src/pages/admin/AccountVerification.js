import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import { useUser } from '../../context/UserContext';
import { verificationAPI } from '../../services/api';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const AccountVerification = () => {
  const { currentUser } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchRequests();
    }
  }, [tabValue, currentUser]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = tabValue === 0 
        ? await verificationAPI.getPendingRequests()
        : await verificationAPI.getAllRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Failed to load verification requests');
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    try {
      await verificationAPI.approveUser(selectedRequest.id, currentUser.id, notes);
      setApproveDialogOpen(false);
      setNotes('');
      setSelectedRequest(null);
      fetchRequests();
      alert('User approved successfully! They can now login.');
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await verificationAPI.rejectUser(selectedRequest.id, currentUser.id, rejectionReason);
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
      alert('User account rejected.');
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="error">
            Access Denied: Admin privileges required
          </Typography>
        </Paper>
      </Container>
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
      <Container maxWidth="xl">
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
          Account Verification
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Review and approve new user registrations
        </Typography>

        <Paper elevation={0} sx={{ mb: 3, borderRadius: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600
              }
            }}
          >
            <Tab label="Pending Requests" />
            <Tab label="All Requests" />
          </Tabs>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <PersonIcon sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No {tabValue === 0 ? 'pending' : ''} verification requests
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {requests.map((request) => (
              <Grid item xs={12} md={6} lg={4} key={request.id}>
                <Card 
                  sx={{ 
                    borderRadius: 3, 
                    height: '100%',
                    boxShadow: request.status === 'PENDING' ? '0 4px 12px rgba(102, 126, 234, 0.2)' : undefined
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: '#667eea',
                          mr: 2
                        }}
                      >
                        <Typography variant="h5">
                          {request.user.firstName[0]}{request.user.lastName[0]}
                        </Typography>
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={700}>
                          {request.user.firstName} {request.user.lastName}
                        </Typography>
                        <Chip
                          label={request.user.role}
                          size="small"
                          color="primary"
                          sx={{ mt: 0.5 }}
                        />
                        <Chip
                          label={request.status}
                          color={getStatusColor(request.status)}
                          size="small"
                          sx={{ mt: 0.5, ml: 1 }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {request.user.email}
                      </Typography>
                    </Box>

                    {request.user.rollNumber && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <SchoolIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Roll No: {request.user.rollNumber}
                        </Typography>
                      </Box>
                    )}

                    {request.user.department && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <SchoolIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {request.user.department}
                        </Typography>
                      </Box>
                    )}

                    {request.user.currentCompany && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <BusinessIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {request.user.currentCompany}
                          {request.user.currentPosition && ` - ${request.user.currentPosition}`}
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                      Requested: {formatDate(request.requestedAt)}
                    </Typography>

                    {request.reviewedAt && (
                      <>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Reviewed: {formatDate(request.reviewedAt)}
                        </Typography>
                        {request.reviewNotes && (
                          <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: '#f7fafc', borderRadius: 1 }}>
                            <strong>Notes:</strong> {request.reviewNotes}
                          </Typography>
                        )}
                      </>
                    )}

                    {request.status === 'PENDING' && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => {
                            setSelectedRequest(request);
                            setApproveDialogOpen(true);
                          }}
                          fullWidth
                          sx={{ 
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setSelectedRequest(request);
                            setRejectDialogOpen(true);
                          }}
                          fullWidth
                          sx={{ 
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Approve Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Approve User Account
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Approve {selectedRequest?.user.firstName} {selectedRequest?.user.lastName}'s account?
            They will be able to login immediately after approval.
          </Typography>
          <TextField
            label="Notes (Optional)"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any welcome notes for the user..."
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setApproveDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            startIcon={<CheckCircleIcon />}
          >
            Approve Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Reject User Account
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Reject {selectedRequest?.user.firstName} {selectedRequest?.user.lastName}'s account?
            They will not be able to login.
          </Typography>
          <TextField
            label="Rejection Reason *"
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Provide a clear reason for rejection..."
            required
            fullWidth
            error={!rejectionReason.trim()}
            helperText="Required - This will be shown to the user"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setRejectDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            startIcon={<CancelIcon />}
            disabled={!rejectionReason.trim()}
          >
            Reject Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountVerification;