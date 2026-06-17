import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { useUser } from '../context/UserContext';
import { jobAPI } from '../services/api';
import ApplicationsView from '../components/jobs/ApplicationsView';
import MyApplications from '../components/jobs/MyApplications';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Jobs = () => {
  const { currentUser } = useUser();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applicationsDialogOpen, setApplicationsDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobForApplications, setSelectedJobForApplications] = useState(null);
  const [showMyApplications, setShowMyApplications] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companyName: '',
    companyLogo: '',
    location: '',
    jobType: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryRange: '',
    requirements: '',
    responsibilities: '',
    applyLink: '',
    applyEmail: '',
    applicationDeadline: ''
  });
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resumeUrl: ''
  });

  const jobTypes = ['ALL', 'FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'];

  useEffect(() => {
    fetchJobs();
  }, [tabValue]);

  const fetchJobs = async () => {
    if (showMyApplications) return;
    
    setLoading(true);
    try {
      let response;
      if (tabValue === 0) {
        response = await jobAPI.getAllJobs(currentUser?.id);
      } else {
        const type = jobTypes[tabValue];
        response = await jobAPI.getJobsByType(type, currentUser?.id);
      }
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateJob = async () => {
    try {
      await jobAPI.createJob({
        ...formData,
        userId: currentUser.id
      });
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        companyName: '',
        companyLogo: '',
        location: '',
        jobType: 'FULL_TIME',
        experienceLevel: 'ENTRY',
        salaryRange: '',
        requirements: '',
        responsibilities: '',
        applyLink: '',
        applyEmail: '',
        applicationDeadline: ''
      });
      fetchJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      alert(error.response?.data?.error || 'Failed to create job posting');
    }
  };

  const handleApplyForJob = async () => {
    try {
      await jobAPI.applyForJob(selectedJob.id, {
        userId: currentUser.id,
        ...applicationData
      });
      setApplyDialogOpen(false);
      setApplicationData({ coverLetter: '', resumeUrl: '' });
      fetchJobs();
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying for job:', error);
      alert(error.response?.data?.error || 'Failed to apply');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;

    try {
      await jobAPI.deleteJob(jobId, currentUser.id);
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job posting');
    }
  };

  const handleTabChange = (e, newValue) => {
    setTabValue(newValue);
    if (currentUser?.role === 'STUDENT' && newValue === 5) {
      setShowMyApplications(true);
    } else {
      setShowMyApplications(false);
    }
  };

  const getJobTypeColor = (type) => {
    const colors = {
      FULL_TIME: 'primary',
      PART_TIME: 'secondary',
      INTERNSHIP: 'success',
      CONTRACT: 'warning'
    };
    return colors[type] || 'default';
  };

  const formatJobType = (type) => {
    return type.replace('_', ' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
        py: 4
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
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
              Career Opportunities
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover internships and job openings posted by alumni
            </Typography>
          </Box>

          {currentUser?.role === 'ALUMNI' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Post Opportunity
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Paper elevation={0} sx={{ mb: 3, borderRadius: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600
              }
            }}
          >
            <Tab label="All Opportunities" />
            <Tab label="Full Time" />
            <Tab label="Part Time" />
            <Tab label="Internships" />
            <Tab label="Contract" />
            {currentUser?.role === 'STUDENT' && <Tab label="My Applications" />}
          </Tabs>
        </Paper>

        {/* Job Cards or My Applications */}
        {showMyApplications ? (
          <MyApplications userId={currentUser?.id} />
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Loading...</Typography>
          </Box>
        ) : jobs.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <WorkIcon sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No opportunities yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later for new postings
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Company Logo & Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: '#667eea'
                        }}
                      >
                        <BusinessIcon />
                      </Avatar>

                      {job.postedBy.id === currentUser?.id && (
                        <Box>
                          <IconButton size="small" onClick={() => handleDeleteJob(job.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>

                    {/* Job Title */}
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {job.title}
                    </Typography>

                    {/* Company & Location */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <BusinessIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.companyName}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                      <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.location}
                      </Typography>
                    </Box>

                    {/* Job Type */}
                    <Chip
                      label={formatJobType(job.jobType)}
                      color={getJobTypeColor(job.jobType)}
                      size="small"
                      sx={{ mb: 2 }}
                    />

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {job.description}
                    </Typography>

                    {/* Salary Range */}
                    {job.salaryRange && (
                      <Typography variant="body2" fontWeight={600} color="primary" sx={{ mb: 1 }}>
                        💰 {job.salaryRange}
                      </Typography>
                    )}

                    {/* Deadline */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Deadline: {formatDate(job.applicationDeadline)}
                      </Typography>
                    </Box>

                    {/* Applications Count */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PeopleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ p: 2 }}>
                    {job.hasApplied ? (
                      <Button
                        fullWidth
                        variant="outlined"
                        disabled
                        startIcon={<CheckCircleIcon />}
                        sx={{ textTransform: 'none' }}
                      >
                        Applied
                      </Button>
                    ) : job.postedBy.id === currentUser?.id ? (
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                          setSelectedJobForApplications(job);
                          setApplicationsDialogOpen(true);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        View Applications ({job.applicationsCount})
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          setSelectedJob(job);
                          setApplyDialogOpen(true);
                        }}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Apply Now
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Create Job Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Post a New Opportunity
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Job Type"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="FULL_TIME">Full Time</MenuItem>
                  <MenuItem value="PART_TIME">Part Time</MenuItem>
                  <MenuItem value="INTERNSHIP">Internship</MenuItem>
                  <MenuItem value="CONTRACT">Contract</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Experience Level"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="ENTRY">Entry Level</MenuItem>
                  <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                  <MenuItem value="SENIOR">Senior</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Salary Range (Optional)"
              name="salaryRange"
              value={formData.salaryRange}
              onChange={handleChange}
              placeholder="e.g., $50,000 - $70,000"
              fullWidth
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
              fullWidth
            />

            <TextField
              label="Requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="List key requirements..."
              fullWidth
            />

            <TextField
              label="Responsibilities"
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="List key responsibilities..."
              fullWidth
            />

            <TextField
              label="Application Link (Optional)"
              name="applyLink"
              value={formData.applyLink}
              onChange={handleChange}
              placeholder="https://company.com/apply"
              fullWidth
            />

            <TextField
              label="Application Email (Optional)"
              name="applyEmail"
              value={formData.applyEmail}
              onChange={handleChange}
              placeholder="jobs@company.com"
              fullWidth
            />

            <TextField
              label="Application Deadline"
              name="applicationDeadline"
              type="datetime-local"
              value={formData.applicationDeadline}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateJob}
            disabled={!formData.title || !formData.companyName || !formData.description}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Post Opportunity
          </Button>
        </DialogActions>
      </Dialog>

      {/* Apply Dialog */}
      <Dialog
        open={applyDialogOpen}
        onClose={() => setApplyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Apply for {selectedJob?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedJob?.companyName}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Cover Letter"
              multiline
              rows={6}
              value={applicationData.coverLetter}
              onChange={(e) =>
                setApplicationData({ ...applicationData, coverLetter: e.target.value })
              }
              placeholder="Tell the employer why you're a great fit..."
              required
              fullWidth
            />

            <TextField
              label="Resume URL (Optional)"
              value={applicationData.resumeUrl}
              onChange={(e) =>
                setApplicationData({ ...applicationData, resumeUrl: e.target.value })
              }
              placeholder="https://drive.google.com/..."
              fullWidth
              helperText="Link to your resume on Google Drive, Dropbox, or your portfolio"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleApplyForJob}
            disabled={!applicationData.coverLetter.trim()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Applications View Dialog */}
      <ApplicationsView
        open={applicationsDialogOpen}
        onClose={() => {
          setApplicationsDialogOpen(false);
          setSelectedJobForApplications(null);
          fetchJobs(); // Refresh to update application counts
        }}
        job={selectedJobForApplications}
        currentUserId={currentUser?.id}
      />
    </Box>
  );
};

export default Jobs;