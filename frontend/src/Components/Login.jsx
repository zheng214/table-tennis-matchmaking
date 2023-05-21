import React, { useState } from 'react'
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';

import LoadingButton from './LoadingButton';

import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { ChatState } from '../Context/ChatProvider';

const Login = () => {
  const { user, setUser } = ChatState();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => { event.preventDefault() };

  const handleSubmit = async () => {
    if (!email) {
      setEmailError('Please enter your email');
    } else if (!/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}/.test(email)) {
      setEmailError('Please enter a valid email');
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Please enter your password');
    } else {
      setPasswordError('');
    }

    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
        }
      }
      const { data } = await axios.post(
        'api/user/login',
        { email, password },
        config,
      );

      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data)
      setLoading(false);
      history.push('/');
    } catch (error) {
      setEmailError(error?.response?.data?.message)
      setPasswordError(error?.response?.data?.message)
      setLoading(false);
    }
  }

  return (
    <div className='form'>
      <TextField
        style ={{width: 300}}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email Address"
        variant="outlined"
        error={!!emailError}
        helperText={emailError}
      />
      <TextField
        style ={{width: 300}}
        value={password}
        type={showPassword ? 'text' : 'password'}
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
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
      <LoadingButton
        variant="contained"
        onClick={() => { setEmail('guest@example.com'); setPassword('123123') }}
        disabled={loading}
        color="secondary"
      >
        Fill in Guest credentials
      </LoadingButton>
      <LoadingButton
        variant="contained"
        onClick={handleSubmit}
        disabled={loading}
      >
        Login
      </LoadingButton>
    </div>
  )
}

export default Login