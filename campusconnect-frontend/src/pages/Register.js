import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  MenuItem,
  Alert,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { authAPI } from '../services/api';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    department: '',
    rollNumber: '',
    course: '',
    academicYear: 1,
    batchYear: new Date().getFullYear(),
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const steps = ['Account Info', 'Personal Details', 'Role Details'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.firstName || !formData.lastName) {
        setError('Please fill all fields');
        return;
      }
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await authAPI.register(formData);
      alert('Registration successful! Your account is pending admin verification. You will be notified once approved.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };



  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Email
            </Typography>
            <TextField
              fullWidth
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#F7FAFC' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Password
            </Typography>
            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#F7FAFC' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Confirm Password
            </Typography>
            <TextField
              fullWidth
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#F7FAFC' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              First Name
            </Typography>
            <TextField
              fullWidth
              name="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
              required
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#F7FAFC' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Last Name
            </Typography>
            <TextField
              fullWidth
              name="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
              required
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#F7FAFC' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Role
            </Typography>
            <TextField
              select
              fullWidth
              name="role"
              value={formData.role}
              onChange={handleChange}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#F7FAFC' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="STUDENT">Student</MenuItem>
              <MenuItem value="ALUMNI">Alumni</MenuItem>
              <MenuItem value="FACULTY">Faculty</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Department
            </Typography>
            <TextField
              fullWidth
              name="department"
              placeholder="Enter your department"
              value={formData.department}
              onChange={handleChange}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#F7FAFC' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />

            {formData.role === 'STUDENT' && (
              <>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Roll Number
                </Typography>
                <TextField
                  fullWidth
                  name="rollNumber"
                  placeholder="Enter your roll number"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#F7FAFC' } }}
                />

                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Course
                </Typography>
                <TextField
                  fullWidth
                  name="course"
                  placeholder="Enter your course"
                  value={formData.course}
                  onChange={handleChange}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#F7FAFC' } }}
                />

                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Academic Year
                </Typography>
                <TextField
                  fullWidth
                  name="academicYear"
                  type="number"
                  value={formData.academicYear}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 4 }}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#F7FAFC' } }}
                />
              </>
            )}

            {formData.role === 'ALUMNI' && (
              <>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Batch Year
                </Typography>
                <TextField
                  fullWidth
                  name="batchYear"
                  type="number"
                  value={formData.batchYear}
                  onChange={handleChange}
                  inputProps={{ min: 1950, max: new Date().getFullYear() }}
                  required
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#F7FAFC' } }}
                />
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            p: 5,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Pacifico', cursive",
                mb: 1
              }}
            >
              CampusConnect
            </Typography>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Create your account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join the campus community today
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form" onSubmit={activeStep === steps.length - 1 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                Registration successful! Redirecting to login...
              </Alert>
            )}

            {renderStepContent()}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  }
                }}
              >
                {activeStep === steps.length - 1 ? (loading ? 'Creating...' : 'Create Account') : 'Next'}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#667eea',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;