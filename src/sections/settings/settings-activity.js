import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  Unstable_Grid2 as Grid,
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
          Authorization: `Bearer ${accessToken}`,
        },
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

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="Din nylige aktivitet på plattformen" title="Kontoaktivitet" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {loading ? (
              <Typography>Laster...</Typography>
            ) : (
              activityData.map((activity) => (
                <Grid item key={activity.id}>
                  <Typography>
                    ID: {activity.id}, IP: {activity.ip_address}, Nettleser: {activity.user_agent},
                    OS: {activity.operating_system}, Tid: {activity.activity_timestamp}
                  </Typography>
                </Grid>
              ))
            )}
          </Grid>
        </CardContent>
      </Card>
    </form>
  );
};
