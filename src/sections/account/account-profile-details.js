import { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Unstable_Grid2 as Grid
} from '@mui/material';
import { API_BASE_URL } from 'src/config/apiConnection';

try {
  const response = await axios.post(API_BASE_URL + 'api/user/get/user/info', credentials);
  const data = response.data;

  console.log('Login response data: ', data);

  // Lagre brukerobjektet og tilgangstokenet i sessionStorage
  window.sessionStorage.setItem('user', JSON.stringify(data.user));
  window.sessionStorage.setItem('accessToken', data.access_token);
  window.sessionStorage.setItem('email', JSON.stringify(email));

  // Sett authenticated til true i sessionStorage etter vellykket innlogging
  window.sessionStorage.setItem('authenticated', 'true');

  // Bruk dispatch for å oppdatere tilstanden med brukerdataene
  dispatch({
    type: HANDLERS.SIGN_IN,
    payload: data.user
  });
} catch (error) {
  console.error('Error during login:', error);
}


//Dette peker på "account"-siden. I praksis er det profil-siden til brukeren.
export const AccountProfileDetails = () => {
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: data.user_id,
    type: ''
  });

  const handleChange = useCallback(
    (event) => {
      setValues((prevState) => ({
        ...prevState,
        [event.target.name]: event.target.value
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
    },
    []
  );

  return (
    <form
      autoComplete="off"
      noValidate
      onSubmit={handleSubmit}
    >
      <Card>
        <CardHeader
          subheader="Profilinfo"
          title="Profil"
        />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ m: -1.5 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                md={6}
              >
                
                <TextField
                  fullWidth
                  label="Bruker"
                  name="Bruker"
                  value={values.firstName}
                 />
                 
              </Grid>
              <Grid
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  label="Last name"
                  name="lastName"
                  onChange={handleChange}
                  required
                  value={values.lastName}
                />
              </Grid>
              <Grid
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  label="Email"
                  name="Email"
                  onChange={handleChange}
                  required
                  value={values.email}
                />
              </Grid>

              <Grid
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  label="Kontotype"
                  name="Kontotype"
                  onChange={handleChange}
                  required
                  value={values.type}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
        <Divider />
      </Card>
    </form>
  );
};
