import { Box, Avatar, Typography, Paper, Card, List, ListItemAvatar, ListItem, Divider, ListItemText } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SpeedIcon from '@mui/icons-material/Speed';
import BoltIcon from '@mui/icons-material/Bolt';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

export default function Profile({ user }) {
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: 500, p: 1 }}>
        <Box sx={{ m: 2, display: 'flex', alignItems: 'start' }}>
          <Avatar src={user.pic} alt={user.name} style={{ width: 100, height: 100 }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Typography variant="h5" sx={{ m: 1, textAlign: 'center', width: '100%', whiteSpace: 'pre-line', overflowWrap: 'break-word', wordWrap: 'break-word' }}>
            {user.name}
          </Typography>
        </Box>
        <List
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
          }}
        >
          <ListItem sx={{ alignItems: 'start', pl: 0 }}>
            <ListItemAvatar sx={{ mt: 1 }}>
              <Avatar>
                <PlaceIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Location" secondary={renderLocation(user.city, user.country)} />
          </ListItem>
          <Divider component="li" />
          <ListItem sx={{ alignItems: 'start', pl: 0 }}>
            <ListItemAvatar sx={{ mt: 1 }}>
              <Avatar>
                <BoltIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Skill Level" secondary={user.level} />
          </ListItem>
          <Divider component="li" />
          <ListItem sx={{ alignItems: 'start', pl: 0 }}>
            <ListItemAvatar sx={{ mt: 1 }}>
              <Avatar>
                <CalendarMonthIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Availability"
              secondary={user.availability || 'No availability specified'}
              secondaryTypographyProps={{ style: { maxHeight: 100, maxWidth: '100%', overflowY: 'auto', whiteSpace: 'pre-line', overflowWrap: 'break-word' } }}
            />
          </ListItem>
        </List>
      </Box>
    </>
  )
}

export function renderLocation(city, country) {
  if (city && country) {
    return `${city}, ${country}`;
  }

  if (!city && country) {
    return country;
  }

  return city || 'No location specified'
}