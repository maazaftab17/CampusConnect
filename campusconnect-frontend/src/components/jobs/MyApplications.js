import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Paper,
  Avatar,
  Divider
} from '@mui/material';
import { jobAPI } from '../../services/api';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const MyApplications = ({ userId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchApplications();
    }
  }, [userId]);

  const fetchApplications = async () => {
    try {
      const response = await jobAPI.getMyApplications(userId);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    setLoading(false);
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
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (applications.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
        <WorkIcon sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Applications Yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start applying to job postings to see them here
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        My Applications ({applications.length})
      </Typography>

      <Grid container spacing={3}>
        {applications.map((application) => (
          <Grid item xs={12} key={application.id}>
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: '#667eea',
                      mr: 2
                    }}
                  >
                    <BusinessIcon />
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {application.jobPosting.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <BusinessIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {application.jobPosting.companyName}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {application.jobPosting.location}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={formatStatus(application.status)}
                    color={getStatusColor(application.status)}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                  <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Applied on {formatDate(application.appliedAt)}
                  </Typography>
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#f7fafc',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Your Cover Letter
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {application.coverLetter}
                  </Typography>
                </Paper>

                {application.resumeUrl && (
                  <Button
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{ mt: 2, textTransform: 'none' }}
                  >
                    View Resume
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyApplications;