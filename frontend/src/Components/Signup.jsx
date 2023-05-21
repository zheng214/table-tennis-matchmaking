import React, { useState } from 'react'
import axios from 'axios';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Box, Button, FormControl } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';

import { useHistory } from 'react-router-dom';
import { ChatState } from '../Context/ChatProvider';
import LoadingButton from './LoadingButton';
import CountryPicker from './CountryPicker';
import GoogleMaps from './GoogleMaps';

const Signup = () => {
  const history = useHistory();
  const { user, setUser } = ChatState();

  const steps = ['Fill Credentials', 'Enter Details'];
  const [activeStep, setActiveStep] = React.useState(0);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pic, setPic] = useState();
  const [availability, setAvailability] = useState('');
  const [level, setLevel] = useState('Beginner');

  const [locationValue, setLocationValue] = React.useState(null);
  const [locationInputValue, setLocationInputValue] = React.useState('');

  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [imageErrSnackbarOpen, setImageErrSnackbarOpen] = useState(false);

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (event) => { event.preventDefault() };
  const handleMouseDownConfirmPassword = (event) => { event.preventDefault() };

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = React.useState(false);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

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
        setPic(data.url.toString())
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

  const handleNext = async () => {
    setActiveStep(a => a+1)
    if (!email) {
      return setEmailError('Please enter your email!');
    } else if (!/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}/.test(email)) {
      return setEmailError('Please enter a valid email!');
    } else {
      setEmailError('');
    }

    if (!name) {
      return setNameError('Please enter your name!');
    } else {
      setNameError('');
    }

    if (!password) {
      return setPasswordError('Please enter a password!');
    } else if (password.length < 6) {
      return setPasswordError('Password must have at least length 6!');
    } else {
      setPasswordError('');
    }

    if (password !== confirm) {
      return setConfirmError('Passwords do not match!')
    } else {
      setConfirmError('');
    }
    setLoading(true);
    try {
      await axios.get(`/api/user/emailExists/${email}`);
      setLoading(false)
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
      setLoading(false)
      setEmailError('An user already exists with this email');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
        }
      }
      const { data } = await axios.post(
        'api/user',
        { name, email, password, pic, location: locationInputValue, availability, level },
        config,
      );

      setOpen(true);

      setTimeout(() => {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setLoading(false);
        setUser(data)
        history.push('/');
      }, 2000)
    } catch (error) {
      console.log(error)
      setLoading(false);
    }
  }

  return (
    <>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          return (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === 0 ? (
        <>
          <div className='form'>
            <TextField
              style ={{width: 300}}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email Address*"
              variant="outlined"
              error={!!emailError}
              helperText={emailError}
            />
            <TextField
              style ={{width: 300}}
              value={name}
              onChange={(e) => setName(e.target.value)}
              label="Name*"
              variant="outlined"
              error={!!nameError}
              helperText={nameError}
              inputProps={{ maxLength: 30 }}
            />
            <TextField
              style ={{width: 300}}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password*"
              variant="outlined"
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              style ={{width: 300}}
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              label="Confirm Password*"
              variant="outlined"
              error={!!confirmError}
              helperText={confirmError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={handleMouseDownConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <InputLabel>Upload your profile picture</InputLabel>
              <input accept="image/*" type="file" onChange={(e) => postDetails(e.target.files[0])} />
            <LoadingButton
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              loading={loading}
            >
              Next
            </LoadingButton>
          </div>
          <Snackbar open={imageErrSnackbarOpen} autoHideDuration={4000} onClose={() => setImageErrSnackbarOpen(false)}>
            <Alert onClose={() => setImageErrSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
              Please select an Image!
            </Alert>
          </Snackbar>
        </>
      ) : (
        <>
          <div className='form'>
            <GoogleMaps
              value={locationValue}
              setValue={setLocationValue}
              inputValue={locationInputValue}
              setInputValue={setLocationInputValue}
              sx={{
                ".MuiAutocomplete-endAdornment": {
                  top: '5px',
                },
              }}
            />
            <FormControl sx={{ mt: 2, minWidth: 300 }}>
              <InputLabel>Skill Level</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={level}
                label="Skill Level"
                sx={{ "& .MuiSelect-icon": { right: 9 } }}
                onChange={(e) => setLevel(e.target.value)}
              >
                <MenuItem value={'Beginner'}>Beginner</MenuItem>
                <MenuItem value={'Intermediate'}>Intermediate</MenuItem>
                <MenuItem value={'Advanced'}>Advanced</MenuItem>
              </Select>
            </FormControl>
            <TextField
              style = {{width: 300}}
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              label="Availability"
              multiline
              rows={4}
              placeholder='Please list time ranges that you could play'
              variant="outlined"
            />
            <div className="signup_steptwo_buttons">
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={loading}
                sx={{ m: '10px' }}
              >
                Back
              </Button>
              <LoadingButton
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                loading={loading}
                sx={{ m: '10px' }}
              >
                Submit
              </LoadingButton>
            </div>
          </div>
        </>
      )}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Account created!
        </Alert>
      </Snackbar>
    </>
  );
}

export default Signup

