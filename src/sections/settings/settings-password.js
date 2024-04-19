import { useCallback, useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter from Next.js
import { useAuthContext } from 'src/contexts/auth-context'; // Import useAuthContext hook
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  TextField
} from '@mui/material';
import { API_BASE_URL } from 'src/config/apiConnection';

export const SettingsPassword = () => {
  const [values, setValues] = useState({
    password: '',
    confirm: ''
  });

  const router = useRouter(); // Initialize useRouter
  const { signOut } = useAuthContext(); // Access the signOut function from AuthContext

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
    async (event) => {
      event.preventDefault();
      try {
        const accessToken = window.sessionStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}api/user/post/updatePassword`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            password1: values.password,
            password2: values.confirm
          })
        });
        if (response.ok) {
          const data = await response.json();
          // Update the interface with the password update confirmation
          setValues({ password: '', confirm: '' }); // Clear the form fields
          console.log('Password updated successfully:', data);
          router.push('/auth/login'); // Redirect after successful password update
          signOut(); // Calls the signOut function here
        } else {
          console.error('Failed to update password');
        }
      } catch (error) {
        console.error('Error updating password:', error);
      }
    },
    [values, router, signOut]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          subheader="Endre passord"
          title="Passord"
        />
        <Divider />
        <CardContent>
          <Stack
            spacing={3}
            sx={{ maxWidth: 400 }}
          >
            <TextField
              fullWidth
              label="Nytt passord"
              name="password"
              onChange={handleChange}
              type="password"
              value={values.password}
            />
            <TextField
              fullWidth
              label="Bekreft passord"
              name="confirm"
              onChange={handleChange}
              type="password"
              value={values.confirm}
            />
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">
            Oppdater
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};
