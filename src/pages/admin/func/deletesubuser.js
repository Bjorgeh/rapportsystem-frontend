import Head from 'next/head';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from 'src/config/apiConnection';

//Denne siden er for slette en subbruker - Kan kun brukes av en administrator

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [subUsers, setSubUsers] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const userString = window.sessionStorage.getItem('user');
    const parsedUser = userString ? JSON.parse(userString) : null;
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    if (user && user.accountType !== 'admin') {
      router.push('/');
    }
  }, [user, router]);
  //Her velges sub-user av administratoren. Henviser til API for å slette subbruker
  useEffect(() => {
    const fetchSubUsers = async () => {
      try {
        const accessToken = window.sessionStorage.getItem('accessToken');
        const response = await fetch(API_BASE_URL + '/api/admin/get/extractSubUsers', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const email = window.sessionStorage.getItem('email');
          const parsedEmail = email ? JSON.parse(email) : null;
          const subUserList = data[parsedEmail].Subusers.map(([email, role]) => ({
            id: email,
            name: email,
            role,
          }));
          setSubUsers(subUserList);
        } else {
          console.error('Failed to fetch sub users:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching sub users:', error);
      }
    };

    fetchSubUsers();
  }, []);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().required('Subuser is required'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const accessToken = window.sessionStorage.getItem('accessToken');
        const response = await fetch(API_BASE_URL + '/api/admin/post/deleteSubUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            username: values.email,
          }),
        });

        if (response.ok) {
          setSuccessMessage('Subuser deleted successfully');
          // Her kan de hende du vil oppdatere lista om nødvedig
        } else {
          throw new Error('Failed to delete subuser');
        }
      } catch (error) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: error.message });
        helpers.setSubmitting(false);
      }
    },
  });

  if (!user || user.accountType !== 'admin') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Registrer under-bruker | Rapportsystem</title>
      </Head>
      <Box
        sx={{
          flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            maxWidth: 550,
            px: 3,
            py: '100px',
            width: '100%',
          }}
        >
          <div>
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="h4">Slett under-bruker</Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Velg under-bruker</InputLabel>
                  <Select
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="email"
                    error={formik.touched.email && Boolean(formik.errors.email)}
                  >
                    {subUsers.map((subUser) => (
                      <MenuItem key={subUser.id} value={subUser.id}>
                        {subUser.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* feil og suksessmeldinger */}
              {formik.errors.submit && (
                <Typography color="error" sx={{ mt: 3 }} variant="body2">
                  {formik.errors.submit}
                </Typography>
              )}
              {successMessage && (
                <Typography color="success" sx={{ mt: 3 }} variant="body2">
                  {successMessage}
                </Typography>
              )}

              {/* Submit button */}
              <Button fullWidth size="large" sx={{ mt: 3 }} type="submit" variant="contained">
                Bekreft sletting
              </Button>
            </form>
          </div>
        </Box>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;
