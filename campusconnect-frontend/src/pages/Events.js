import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { useUser } from '../context/UserContext';
import { eventAPI } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';

const Events = () => {
  const { currentUser } = useUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    eventDate: '',
    eventEndDate: '',
    category: 'WORKSHOP',
    imageUrl: ''
  });

  const categories = [
    'WORKSHOP',
    'SEMINAR',
    'CULTURAL',
    'SPORTS',
    'TECHNICAL',
    'CONFERENCE',
    'HACKATHON',
    'OTHER'
  ];

  useEffect(() => {
    fetchEvents();
  }, [tabValue]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const upcoming = tabValue === 1;
      const response = await eventAPI.getAllEvents(currentUser?.id, upcoming);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  };

  const handleCreateClick = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      eventDate: '',
      eventEndDate: '',
      category: 'WORKSHOP',
      imageUrl: ''
    });
    setCreateDialogOpen(true);
  };

  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      eventDate: event.eventDate.substring(0, 16),
      eventEndDate: event.eventEndDate ? event.eventEndDate.substring(0, 16) : '',
      category: event.category,
      imageUrl: event.imageUrl || ''
    });
    setEditDialogOpen(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateEvent = async () => {
    try {
      await eventAPI.createEvent({
        ...formData,
        userId: currentUser.id
      });
      setCreateDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const handleUpdateEvent = async () => {
    try {
      await eventAPI.updateEvent(selectedEvent.id, {
        ...formData,
        userId: currentUser.id
      });
      setEditDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventAPI.deleteEvent(eventId, currentUser.id);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleRegisterToggle = async (event) => {
    try {
      if (event.isAttending) {
        await eventAPI.unregisterFromEvent(event.id, currentUser.id);
      } else {
        await eventAPI.registerForEvent(event.id, currentUser.id);
      }
      fetchEvents();
    } catch (error) {
      console.error('Error toggling registration:', error);
      alert(error.response?.data || 'Failed to update registration');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      WORKSHOP: 'primary',
      SEMINAR: 'secondary',
      CULTURAL: 'success',
      SPORTS: 'error',
      TECHNICAL: 'info',
      CONFERENCE: 'warning',
      HACKATHON: 'error',
      OTHER: 'default'
    };
    return colors[category] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Campus Events</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Create Event
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Events" />
          <Tab label="Upcoming Events" />
        </Tabs>
      </Paper>

      {/* Events Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : events.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No events yet. Be the first to create one!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} md={6} key={event.id}>
              <Card>
                {event.imageUrl && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={event.imageUrl}
                    alt={event.title}
                  />
                )}
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {event.title}
                    </Typography>
                    {event.organizer.id === currentUser.id && (
                      <Box>
                        <IconButton size="small" onClick={() => handleEditClick(event)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteEvent(event.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  <Chip
                    label={event.category}
                    color={getCategoryColor(event.category)}
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {event.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(event.eventDate)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {event.attendeesCount} attending
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                      {event.organizer.firstName[0]}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      Organized by {event.organizer.firstName} {event.organizer.lastName}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions>
                  {event.organizer.id !== currentUser.id && (
                    <Button
                      fullWidth
                      variant={event.isAttending ? "outlined" : "contained"}
                      startIcon={event.isAttending ? <EventBusyIcon /> : <EventAvailableIcon />}
                      onClick={() => handleRegisterToggle(event)}
                    >
                      {event.isAttending ? 'Unregister' : 'Register'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Event Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              required
            />
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Event Date & Time"
              name="eventDate"
              type="datetime-local"
              value={formData.eventDate}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date & Time (Optional)"
              name="eventEndDate"
              type="datetime-local"
              value={formData.eventEndDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Image URL (Optional)"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateEvent} variant="contained">Create Event</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              required
            />
            <TextField
              label="Location"
              name="location"
              value={formData.location}onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Event Date & Time"
              name="eventDate"    
              type="datetime-local"
              value={formData.eventDate}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              />
              <TextField
              label="End Date & Time (Optional)"
              name="eventEndDate"
              type="datetime-local"
              value={formData.eventEndDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              />
              <TextField
                         select
                         label="Category"
                         name="category"
                         value={formData.category}
                         onChange={handleChange}
                         fullWidth
                       >
              {categories.map((category) => (
              <MenuItem key={category} value={category}>
              {category}
              </MenuItem>
              ))}
              </TextField>
              <TextField
                         label="Image URL (Optional)"
                         name="imageUrl"
                         value={formData.imageUrl}
                         onChange={handleChange}
                         fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateEvent} variant="contained">Update Event</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  };
export default Events;
