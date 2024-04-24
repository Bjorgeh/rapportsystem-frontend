import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardHeader, Divider, Grid, TextField } from '@mui/material';
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
        const response = await axios.get(API_BASE_URL + 'api/user/get/user/info', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const { user_Id, email, accountType } = response.data;
        setValues({ user_id: user_Id, email, accountType });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, []); // Tomt avhengighetsarray for å kun kjøre en gang

  return (
    <Grid xs={12} md={6}>
      <Card>
        <CardHeader subheader="Informasjon" title="Profil" />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ m: -1.5 }}>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Bruker ID"
                name="user_id"
                value={values.user_id}
                disabled // fjerner muligheten for å endre bruker ID i grensesnitt.
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="E-postadresse"
                name="email"
                value={values.email}
                disabled // fjerner mulighet for å redigere i grensesnittet
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Tilgangsnivå"
                name="accountType"
                value={values.accountType}
                disabled // Fjerner mulighet for a redigere i grensesnittet
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
