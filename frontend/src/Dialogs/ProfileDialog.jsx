import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { ChatState } from '../Context/ChatProvider';
import LoadingButton from '../Components/LoadingButton';
import GoogleMaps from '../Components/GoogleMaps';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import Profile from '../Components/Profile';
import CountryPicker from '../Components/CountryPicker';

export default function ProfileDialog(props) {
  const { user, viewOnly } = props;
  const { setUser } = ChatState();

  const [loading, setLoading] = useState(false);

  const [locationInputValue, setLocationInputValue] = React.useState('');
  const [editingLocation, setEditingLocation] = useState(false);
  const [savedLocation, setSavedLocation] = useState(user.location);
  const [locationValue, setLocationValue] = React.useState(null);
 
  
  const handleEditLocation = () => {
    setEditingLocation(true);
  }

  const handleDoneEditingLocation = () => {
    setSavedLocation(locationInputValue);
    setEditingLocation(false);
  }

  // const [country, setCountry] = useState(user.country);
  // const [editingCountry, setEditingCountry] = useState(false);
  // const [savedCountry, setSavedCountry] = useState(user.country);
  
  // const handleEditCountry = () => {
  //   setEditingCountry(true);
  // }

  // const handleDoneEditingCountry = () => {
  //   setSavedCountry(country);
  //   setEditingCountry(false);
  // }

  const [level, setLevel] = useState(user.level);
  const [editingLevel, setEditingLevel] = useState(false);
  console.log(user)
  const [savedLevel, setSavedLevel] = useState(user.level);
  
  const handleEditLevel = () => {
    setEditingLevel(true);
  }

  const handleDoneEditingLevel = () => {
    setSavedLevel(level);
    setEditingLevel(false);
  }

  const [availability, setAvailability] = useState(user.availability);
  const [savedAvailability, setSavedAvailability] = useState(user.availability);
  const [editingAvailability, setEditingAvailability] = useState(false);
  
  const handleEditAvailability = () => {
    setEditingAvailability(true);
  }
  
  const handleDoneEditingAvailability = () => {
    setSavedAvailability(availability);
    setEditingAvailability(false);
  }

  const [pic, setPic] = useState(user.pic);
  const [savedPic, setSavedPic] = useState(user.pic);
  const [imageErrSnackbarOpen, setImageErrSnackbarOpen] = useState(false);

  const postDetails = (file) => {
    if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif') {
      setLoading(true);
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'tt-matchmaking')
      data.append('cloud_name', 'dgnv8kpsm')
      fetch('https://api.cloudinary.com/v1_1/dgnv8kpsm/image/upload ', {
        method: 'post',
        body: data,
      })
      .then((res) => res.json())
      .then(data => {
        setSavedPic(data.url.toString())
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      setImageErrSnackbarOpen(true)
    }
  }

  const handleClose = () => {
    setSavedLocation(user.location);
    setLocationInputValue(user.location);
    setEditingLocation(false);
    setSavedAvailability(user.availability);
    setAvailability(user.availability);
    setEditingAvailability(false);
    props.onClose();
  }

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        }
      }
      const { data } = await axios.put(
        'api/user/edit',
        { location: savedLocation, availability: savedAvailability, level: savedLevel, pic: savedPic },
        config,
      );
      const updatedUser = {
        ...user,
        location: data.location,
        availability: data.availability,
        level: data.level,
        pic: data.pic,
      }
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      props.onSaveChange();
      props.onClose();
    } catch (error) {
      setLoading(false);
      console.log(error)
    }
  }

  return (
    <Dialog
      maxWidth="xl"
      fullWidth
      open={props.open}
      onClose={handleClose}
    >
      <DialogTitle>{'Profile'}</DialogTitle>
      <DialogContent sx={{ minHeight: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', px : 3 }}>
        {viewOnly
        ? <Profile user={user} />
        : <Box sx={{ display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', maxWidth: '500px', p: 1 }}>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'start' }}>
            <Avatar src={savedPic} alt={user.name} style={{ width: 100, height: 100 }} />
            <IconButton color="primary" aria-label="upload picture" component="label">
              <input hidden accept="image/*" type="file" onChange={(e) => postDetails(e.target.files[0])} />
              <EditIcon />
            </IconButton>
            <Snackbar open={imageErrSnackbarOpen} autoHideDuration={4000} onClose={() => setImageErrSnackbarOpen(false)}>
              <Alert onClose={() => setImageErrSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
                Please select an Image!
              </Alert>
            </Snackbar>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', width: '100%', mr: 2.5 }}>
            <Typography variant="h4" sx={{ m: 1, textAlign: 'center', width: '100%', whiteSpace: 'pre-line', overflowWrap: 'break-word', wordWrap: 'break-word' }}>
              {user.name}
            </Typography>
          </Box>
          {/* <Box sx={{ m: 1 }}>
            {editingCity
              ? (
                <>
                  <TextField
                    style={{width: 275}}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    label="City"
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    sx={{ m: '10px' }}
                    onClick={handleDoneEditingCity}
                  >
                    Save
                  </Button>
                </>
              )
              : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ fontSize: 18, color: 'text.secondary' }}>City: {savedCity || 'No city specified'}</Box>
                  <IconButton color="primary" aria-label="edit" onClick={handleEditCity}>
                    <EditIcon />
                  </IconButton>
                </Box>
              )
            }
          </Box> */}
          <Box sx={{ m: 1 }}>
            {editingLocation
              ? (
                <Box sx={{
                  display: {
                    xs: 'block',
                    sm: 'flex',
                    md: 'flex'
                  }
                }}>
                  <GoogleMaps
                    value={locationValue}
                    setValue={setLocationValue}
                    inputValue={locationInputValue}
                    setInputValue={setLocationInputValue}
                    sx={{
                      width: 275,
                      ".MuiAutocomplete-endAdornment": {
                        top: '15px',
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    sx={{ m: '10px' }}
                    onClick={handleDoneEditingLocation}
                  >
                    Save
                  </Button>
                </Box>
              )
              : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ fontSize: 18, color: 'text.secondary' }}>Location: {savedLocation || 'No location specified'}</Box>
                  <IconButton color="primary" aria-label="edit" onClick={handleEditLocation}>
                    <EditIcon />
                  </IconButton>
                </Box>
              )
            }
          </Box>
          <Box sx={{ m: 1 }}>
            {editingLevel
              ? (
                <>
                  <FormControl sx={{ mt: 2, maxWidth: 275 }}>
                    <InputLabel>Skill Level</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={level}
                      label="Skill Level"
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      <MenuItem value={'Beginner'}>Beginner</MenuItem>
                      <MenuItem value={'Intermediate'}>Intermediate</MenuItem>
                      <MenuItem value={'Advanced'}>Advanced</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    sx={{ m: '10px', mt: '25px' }}
                    onClick={handleDoneEditingLevel}
                  >
                    Save
                  </Button>
                </>
              )
              : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ fontSize: 18, color: 'text.secondary' }}>Skill level: {savedLevel || 'Not specified'}</Box>
                  <IconButton color="primary" aria-label="edit" onClick={handleEditLevel}>
                    <EditIcon />
                  </IconButton>
                </Box>
              )
            }
          </Box>
          <Box sx={{ mt: 2, ml: 1 }}>
            {editingAvailability
              ? (
                <>
                  <TextField
                    sx = {{width: 275}}
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    label="Availability"
                    multiline
                    rows={4}
                    placeholder='Please list time ranges that you could play'
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    sx={{ m: '10px' }}
                    onClick={handleDoneEditingAvailability}
                  >
                    Save
                  </Button>
                </>
              )
              : (
                <Box sx={{ display:'flex' }}>
                  <Box sx={{ fontSize: 18, color: 'text.secondary' }}>
                    Availability:&nbsp;
                  </Box>
                  <Box sx={{ fontSize: 18, color: 'text.secondary', maxHeight: 150, maxWidth: 275, overflowY: 'auto', whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>
                    {savedAvailability || 'No availability specified'}
                  </Box>
                  <Box>
                    <IconButton color="primary" sx={{ mt: -1 }} aria-label="edit" onClick={handleEditAvailability}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                </Box>
              )
            }
          </Box>
        </Box>}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Close</Button>
        {!viewOnly && <LoadingButton
          variant="contained"
          onClick={handleSaveChanges}
          disabled={
            loading || editingAvailability || editingLocation || editingLevel ||
            (savedLocation === user.location
              && savedAvailability === user.availability
              && savedLevel === user.level
              && savedPic === user.pic
            )
          }
          loading={loading}
        >
          Save Changes
        </LoadingButton>}
      </DialogActions>
    </Dialog>
  );
}
