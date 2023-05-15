import React, { useEffect, useContext } from 'react'
import { useHistory  } from 'react-router-dom';
import { ChatState } from '../Context/ChatProvider';

import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Login from '../Components/Login';
import Signup from '../Components/Signup';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useMediaQuery } from 'react-responsive'

import Auth from '../Components/Auth';

import './Homepage.scss';

const Homepage = (props) => {
  const { user, setUser } = ChatState();
  const history = useHistory();

  const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 1224 })
    return isDesktop ? children : null
  }
  const Tablet = ({ children }) => {
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1224 })
    return isTablet ? children : null
  }
  const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 })
    return isMobile ? children : null
  }

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  
    if (userInfo) {
      history.push('/');
    }
  }, [history])

  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Desktop>
        <div className="app-homepage">
          <div className="left">
            <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.33)', minHeight: '100vh', width: '100%' }}>
              <Box sx={{ p: '100px' }}>
                <p className="logo">
                  Table Tennis Matchmaking
                </p>
                <p className="desc">
                  Sign up to find a table tennis partner in your city!
                </p>
              </Box>
            </Box>
          </div>
          <div className="right">
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, p: 6 }}>
              <Auth />
            </Box>
          </div>
        </div>
      </Desktop>
      <Tablet>
        <div className="app-homepage tablet">
          <Box sx={{ display:'flex', alignItems: 'center', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: 'rgba(255, 255, 255, 0.75)' }}>
            <Box sx={{ pt: '50px',  }}>
              <p className="logo tablet">
                Table Tennis Matchmaking
              </p>
              <p className="desc tablet">
                Sign up to find a table tennis partner in your city!
              </p>
            </Box>
            <Box sx={{ mt: '10px', width: 400 }}>
              <Auth />
            </Box>
          </Box>
        </div>
      </Tablet>
      <Mobile>
        <div className="app-homepage mobile">
          <Box sx={{ display:'flex', alignItems: 'center', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: 'rgba(255, 255, 255, 0.75)' }}>
            <Box sx={{ width: '80%' }}>
              <p className="logo mobile">
                Table Tennis Matchmaking
              </p>
              <p className="desc mobile">
                Sign up to find a table tennis partner in your city!
              </p>
            </Box>
            <Box sx={{ mt: '10px', width: 400 }}>
              <Auth />
            </Box>
          </Box>
        </div>
      </Mobile>
    </div>
  );
}

export default Homepage