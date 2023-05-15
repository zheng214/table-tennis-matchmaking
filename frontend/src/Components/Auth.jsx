import React from "react";
import Login from "./Login";
import Signup from "./Signup";
import './Auth.scss';

import { Box, Tabs, Tab, Button } from "@mui/material";

export default function Auth() {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ height: 'fit-content' }}>
      <Tabs value={value} onChange={handleChange} centered>
        <Tab label="Login" />
        <Tab label="Signup" />
      </Tabs>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '20px' }}>{value === 0 ? <Login /> : <Signup />}</Box>
    </Box>
  );
}