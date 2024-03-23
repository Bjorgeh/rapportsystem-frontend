import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material';
import { API_BASE_URL } from 'src/config/apiConnection';

export const RecentActivity = () => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = window.sessionStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}api/user/get/activity`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      setActivityData(data.Activity);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
    },
    []
  );

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          subheader="Your recent activity on the platform"
          title="Recent Activity"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : (
              activityData.map((activity) => (
                <Grid item key={activity.id}>
                  <Typography>
                    ID: {activity.id}, IP Address: {activity.ip_address}, User Agent: {activity.user_agent}, Operating System: {activity.operating_system}, Timestamp: {activity.activity_timestamp}
                  </Typography>
                </Grid>
              ))
            )}
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained">Save</Button>
        </CardActions>
      </Card>
    </form>
  );
};
