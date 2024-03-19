import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router'; // Endret fra next/navigation til next/router
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react'; // Importer useEffect og useState

const Page = () => {
  const router = useRouter();
  const auth = useAuth();
  const [user, setUser] = useState(null); // Lagrer brukerinformasjonen i state

  useEffect(() => {
    const userString = window.sessionStorage.getItem('user');
    const parsedUser = userString ? JSON.parse(userString) : null;
    setUser(parsedUser);
  }, []);

  // Sjekk om brukeren er logget inn og om accountType er admin
  useEffect(() => {
    if (user && user.accountType !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const [tableNames, setTableNames] = useState([]); // Setter opp en state for tabellnavnene

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hent token fra autentiseringskonteksten
        const accessToken = window.sessionStorage.getItem('accessToken');
    
        // Send en GET forespørsel til API-endepunktet med Authorization header som inneholder bearer token
        const response = await fetch('http://34.116.241.11:5001/api/user/get/rapportInfo', {
          headers: {
            Authorization: `Bearer ${accessToken}` // Legg til bearer token i Authorization-overskriften
          }
        });
    
        // Sjekk om responsen er ok
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
    
        // Konverter responsen til JSON-format
        const data = await response.json();
  
        console.log('Data:', data);
    
        // Hent ut tabellnavnene fra responsen og legg dem i en liste
        const names = Object.keys(data.Table_descriptions.Tables);
    
        // Sett tabellnavnene i state
        setTableNames(names);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Kjør fetchData-funksjonen for å hente data
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      email: '',
      name: '',
      password: '',
      selectedTable: '', // Sett initialverdi for selectedTable til et tomt streng
      accountTypeSelectLabel: '' // Legg til initialverdi for accountTypeSelectLabel
    },
    validationSchema: Yup.object({
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
      password: Yup
        .string()
        .max(255)
        .required('Password is required')
    }),
    onSubmit: async (values, helpers) => {
      try {
        let apiUrl = '';
        let requestData = {};
  
        const accessToken = window.sessionStorage.getItem('accessToken'); // Hent bearer token fra sessionStorage
  
        if (values.accountTypeSelectLabel === 'leader') {
          apiUrl = 'http://34.116.241.11:5001/api/admin/post/createSubLeader';
          requestData = {
            email: values.email,
            password: values.password
          };
        } else if (values.accountTypeSelectLabel === 'operator') {
          apiUrl = 'http://34.116.241.11:5001/api/admin/post/createSubOperator';
          requestData = {
            email: values.email,
            password: values.password,
            rapportName: values.selectedTable // Endre fra reportName til rapportName
          };
        }
  
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` // Legg til bearer token i Authorization header
          },
          body: JSON.stringify(requestData)
        });
  
        if (!response.ok) {
          throw new Error('Failed to create sub user');
        }
  
        // Handle success scenario, for eksempel vise en suksessmelding eller navigere til en annen side
      } catch (error) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: error.message });
        helpers.setSubmitting(false);
      }
    }
  });
  
  

  if (!user || user.accountType !== 'admin') {
    return null; // Hvis brukeren ikke er logget inn eller ikke har admin-tilgang, returner null for å unngå at komponenten rendres
  }

  return (
    <>
      <Head>
        <title>
          Register sub user | Rapportsystem
        </title>
      </Head>
      <Box
        sx={{
          flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            maxWidth: 550,
            px: 3,
            py: '100px',
            width: '100%'
          }}
        >
          <div>
            <Stack
              spacing={1}
              sx={{ mb: 3 }}
            >
              <Typography variant="h4">
                Register sub user
              </Typography>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                Already have an account?
                &nbsp;
                <Link
                  component={NextLink}
                  href="/auth/login"
                  underline="hover"
                  variant="subtitle2"
                >
                  Log in
                </Link>
              </Typography>
            </Stack>
            <form
              noValidate
              onSubmit={formik.handleSubmit}
            >
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
                disabled={formik.values.accountTypeSelectLabel === 'leader'} // Deaktiverer rapporttypefeltet når kontoen er en leder
              >
                {formik.values.accountTypeSelectLabel === 'leader' ? ( // Setter verdi til 'All' når kontoen er en leder
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
                <Typography
                  color="error"
                  sx={{ mt: 3 }}
                  variant="body2"
                >
                  {formik.errors.submit}
                </Typography>
              )}
              <Button
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                variant="contained"
              >
                Continue
              </Button>
            </form>
          </div>
        </Box>
      </Box>
    </>
  );
};

Page.getLayout = (page) => (
  <AuthLayout>
    {page}
  </AuthLayout>
);

export default Page;
