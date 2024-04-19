import Head from 'next/head';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from 'src/config/apiConnection';

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

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

  const [tableNames, setTableNames] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = window.sessionStorage.getItem('accessToken');

        const response = await fetch(API_BASE_URL + 'api/user/get/rapportInfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        const names = Object.keys(data.Table_descriptions.Tables);

        setTableNames(names);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const [successMessage, setSuccessMessage] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      name: '',
      password: '',
      selectedTable: '',
      accountTypeSelectLabel: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
      password: Yup.string().max(255).required('Password is required'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        let apiUrl = '';
        let requestData = {};

        const accessToken = window.sessionStorage.getItem('accessToken');

        if (values.accountTypeSelectLabel === 'leader') {
          apiUrl = API_BASE_URL + 'api/admin/post/createSubLeader';
          requestData = {
            email: values.email,
            password: values.password,
          };
        } else if (values.accountTypeSelectLabel === 'operator') {
          apiUrl = API_BASE_URL + 'api/admin/post/createSubOperator';
          requestData = {
            email: values.email,
            password: values.password,
            rapportName: values.selectedTable,
          };
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error('Failed to create sub user');
        }

        setSuccessMessage('Sub user created successfully');
        formik.resetForm(); // Tøm skjemaet
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
              <Typography variant="h4">Register sub user</Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel id="account-type-select-label">Account type</InputLabel>
                  <Select
                    labelId="account-type-select-label"
                    id="account-type-select"
                    value={formik.values.accountTypeSelectLabel}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="accountTypeSelectLabel"
                  >
                    <MenuItem value="operator">Operator</MenuItem>
                    <MenuItem value="leader">Leader</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="table-select-label">Report type</InputLabel>
                  <Select
                    labelId="table-select-label"
                    id="table-select"
                    value={formik.values.selectedTable}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="selectedTable"
                    disabled={formik.values.accountTypeSelectLabel === 'leader'}
                  >
                    {formik.values.accountTypeSelectLabel === 'leader' ? (
                      <MenuItem value="All">All</MenuItem>
                    ) : (
                      tableNames.map((tableName) => (
                        <MenuItem key={tableName} value={tableName}>
                          {tableName}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <TextField
                  error={!!(formik.touched.email && formik.errors.email)}
                  fullWidth
                  helperText={formik.touched.email && formik.errors.email}
                  label="Email Address"
                  name="email"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="email"
                  value={formik.values.email}
                />
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
              </Stack>
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
