import Head from 'next/head';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from 'src/config/apiConnection';

const Page = () => {
  const router = useRouter();
  const auth = useAuth();
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
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
      password: Yup.string().max(255).required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match') // Password confirmation should match the password
        .required('Please confirm your password'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const accessToken = window.sessionStorage.getItem('accessToken');
        const response = await fetch(API_BASE_URL + '/api/admin/post/updateUsersPassword', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            username: values.email,
            password1: values.password,
            password2: values.confirmPassword,
          }),
        });

        if (response.ok) {
          setSuccessMessage('Password updated successfully');
          formik.resetForm();
        } else {
          throw new Error('Failed to update password');
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
        <title>Register sub user | Rapportsystem</title>
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
              <Typography variant="h4">Change sub user password</Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Select Subuser</InputLabel>
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

                {/* Password field */}
                <TextField
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
                  label="Password"
                  name="password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.password}
                />

                {/* Confirm Password field */}
                <TextField
                  error={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                  fullWidth
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  label="Confirm Password"
                  name="confirmPassword"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.confirmPassword}
                />
              </Stack>

              {/* Error and success messages */}
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
                Continue
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
