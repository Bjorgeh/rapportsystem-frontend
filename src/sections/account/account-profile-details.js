import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Grid,
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from 'src/config/apiConnection';

const AccountProfileDetails = () => {
  const [values, setValues] = useState({
    user_id: '',
    email: '',
    accountType: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = window.sessionStorage.getItem('accessToken');
        console.log('Access token:', accessToken);
        const response = await axios.get(API_BASE_URL + "api/user/get/user/info", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        const { user_Id, email, accountType } = response.data;
        setValues({ user_id: user_Id, email, accountType });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs only once after the component mounts

  return (
    <Grid xs={12} md={6}>
      <Card>
        <CardHeader subheader="Profilinfo" title="Profil" />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ m: -1.5 }}>
            
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Id"
                  name="user_id"
                  value={values.user_id}
                  disabled // Disable editing of user_id field
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={values.email}
                  disabled // Disable editing of email field
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kontotype"
                  name="accountType"
                  value={values.accountType}
                  disabled // Disable editing of accountType field
                />
              </Grid>
            
          </Box>
        </CardContent>
        <Divider />
      </Card>
      </Grid>
  );
};

export default AccountProfileDetails;
