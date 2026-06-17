import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  List,
  ListItem,
  Avatar,
  Button,
  Chip,
  IconButton,
  Divider,
  Paper,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { jobAPI } from '../../services/api';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';

const ApplicationsView = ({ open, onClose, job, currentUserId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

  useEffect(() => {
    if (open && job) {
      fetchApplications();
    }
  }, [open, job]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await jobAPI.getJobApplications(job.id, currentUserId);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    setLoading(false);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await jobAPI.updateApplicationStatus(applicationId, currentUserId, newStatus);
      fetchApplications();
      setMenuAnchor(null);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      REVIEWED: 'info',
      SHORTLISTED: 'success',
      REJECTED: 'error'
    };
    return colors[status] || 'default';
  };

  const formatStatus = (status) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Applications for {job?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {applications.length} total application{applications.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : applications.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Applications Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Applications will appear here once students apply
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {applications.map((application, index) => (
              <React.Fragment key={application.id}>
                <ListItem
                  sx={{
                    py: 3,
                    px: 3,
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    '&:hover': {
                      bgcolor: '#f7fafc'
                    }
                  }}
                >
                  {/* Applicant Header */}
                  <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: '#667eea',
                        mr: 2
                      }}
                    >
                      <Typography variant="h6">
                        {application.user.firstName[0]}{application.user.lastName[0]}
                      </Typography>
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {application.user.firstName} {application.user.lastName}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {application.user.email}
                        </Typography>
                      </Box>

                      {application.user.rollNumber && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <SchoolIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Roll No: {application.user.rollNumber} • {application.user.department}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={formatStatus(application.status)}
                        color={getStatusColor(application.status)}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setMenuAnchor(e.currentTarget);
                          setSelectedApplication(application);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Cover Letter */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: '#f7fafc',
                      borderRadius: 2,
                      mb: 2
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Cover Letter
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {application.coverLetter}
                    </Typography>
                  </Paper>

                  {/* Resume Link */}
                  {application.resumeUrl && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <DescriptionIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      <Button
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ textTransform: 'none' }}
                      >
                        View Resume
                      </Button>
                    </Box>
                  )}

                  {/* Applied Date */}
                  <Typography variant="caption" color="text.secondary">
                    Applied on {formatDate(application.appliedAt)}
                  </Typography>

                  {/* Quick Actions */}
                  {application.status === 'PENDING' && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleStatusChange(application.id, 'SHORTLISTED')}
                        sx={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          textTransform: 'none'
                        }}
                      >
                        Shortlist
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusChange(application.id, 'REVIEWED')}
                        sx={{ textTransform: 'none' }}
                      >
                        Mark as Reviewed
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleStatusChange(application.id, 'REJECTED')}
                        sx={{ textTransform: 'none' }}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </ListItem>

                {index < applications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Status Change Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => {
            setMenuAnchor(null);
            setSelectedApplication(null);
          }}
        >
          <MenuItem onClick={() => handleStatusChange(selectedApplication?.id, 'PENDING')}>
            <Chip label="Pending" color="warning" size="small" sx={{ mr: 1 }} />
            Mark as Pending
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange(selectedApplication?.id, 'REVIEWED')}>
            <Chip label="Reviewed" color="info" size="small" sx={{ mr: 1 }} />
            Mark as Reviewed
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange(selectedApplication?.id, 'SHORTLISTED')}>
            <Chip label="Shortlisted" color="success" size="small" sx={{ mr: 1 }} />
            Shortlist
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleStatusChange(selectedApplication?.id, 'REJECTED')}>
            <Chip label="Rejected" color="error" size="small" sx={{ mr: 1 }} />
            Reject
          </MenuItem>
        </Menu>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationsView;