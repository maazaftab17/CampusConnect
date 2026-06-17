import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import { userAPI } from '../services/api';
import ProfileCard from '../components/common/ProfileCard';
import SearchIcon from '@mui/icons-material/Search';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [followedUsers, setFollowedUsers] = useState(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, departmentFilter, users]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.course && user.course.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter(user => user.department === departmentFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleFollow = (userId) => {
    setFollowedUsers(prev => new Set([...prev, userId]));
    // Add API call to follow user
    console.log('Following user:', userId);
  };

  const handleUnfollow = (userId) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
    // Add API call to unfollow user
    console.log('Unfollowing user:', userId);
  };

  const departments = ['ALL', ...new Set(users.map(u => u.department).filter(Boolean))];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
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
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Campus Community
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Connect with students, alumni, and faculty members
        </Typography>

        {/* Search and Filters */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by name, email, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#F7FAFC',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#F7FAFC',
                  }}
                >
                  <MenuItem value="ALL">All Roles</MenuItem>
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="ALUMNI">Alumni</MenuItem>
                  <MenuItem value="FACULTY">Faculty</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  label="Department"
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#F7FAFC',
                  }}
                >
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>
                      {dept === 'ALL' ? 'All Departments' : dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Showing {filteredUsers.length} of {users.length} members
          </Typography>
        </Paper>

        {/* Profile Cards Grid */}
        {filteredUsers.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography color="text.secondary">
              No users found matching your criteria
            </Typography>
          </Paper>
        ) : (
          <Grid 
            container 
            spacing={3}
            sx={{
              justifyContent: 'flex-start'
            }}
          >
            {filteredUsers.map((user) => (
              <Grid 
                item 
                key={user.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <ProfileCard user={user} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Users;