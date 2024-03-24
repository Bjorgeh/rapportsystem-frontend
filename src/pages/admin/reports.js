import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router'; 
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Grid, Link, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react'; 
import { API_BASE_URL } from 'src/config/apiConnection';
import { useIsDayDisabled } from '@mui/x-date-pickers/internals/hooks/validation/useDateValidation';


const Page = () => {
  const router = useRouter();
  const auth = useAuth();
  const [user, setUser] = useState(null); 
  const [reportFields, setReportFields] = useState({}); // Object to store report fields and titles

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
    
        const response = await fetch(API_BASE_URL+'api/user/get/rapportInfo', {
          headers: {
            Authorization: `Bearer ${accessToken}` 
          }
        });
    
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
    
        const data = await response.json();
  
        const names = Object.keys(data.Table_descriptions.Tables);
    
        setTableNames(names);
        setReportFields(data.Table_descriptions.Tables); // Set report fields and titles
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const [successMessage, setSuccessMessage] = useState(null); 

  const formik = useFormik({
    initialValues: {
        selectedTable: '',

    },
    validationSchema: Yup.object({
      selectedTable: Yup.string().required('Velg en rapporttype')
    }),
    onSubmit: async (values, helpers) => {
      try {
        let apiUrl = '';
        let requestData = {};
  
        const accessToken = window.sessionStorage.getItem('accessToken'); 

  
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` 
          },
          body: JSON.stringify(requestData)
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
    }
  });
  
  if (!user || user.accountType !== 'admin') {
    return null; 
  }

    // Function to render fields based on selected report
    const renderReportFields = () => {
      const selectedReport = formik.values.selectedTable;
      const fields = reportFields[selectedReport];
  
      if (!fields) {
        return null;
      }
  
      return Object.entries(fields).map(([fieldName, fieldType], index) => {
        let inputType = 'text'; // Default input type
        // Determine input type based on field data type
        if (fieldType.includes('int')) {
          inputType = 'number';
        } else if (fieldType.includes('float') || fieldType.includes('decimal') || fieldType.includes('double')) {
          inputType = 'number';
          // You may add step, min, max attributes for more precision control
        } else if (fieldType.includes('date')) {
          inputType = 'date';
          
        } else if (fieldType.includes('time')) {
          inputType = 'time';
        }
  
        return (
          <Box key={index} sx={{ mt: 3 }}>
            <TextField
              required
              id={fieldName}
              label={fieldName}
              type={inputType}
              disabled={fieldName.includes('id') || fieldType.includes('date') || fieldType.includes('time') || fieldType.includes('sum')} // Disable editing of id fields
              // You can add additional attributes based on the input type if needed
            />
          </Box>
        );
      });
    };

  return (
    <>
      <Head>
        <title>
          Register report| Rapportsystem
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
                Ny rapport
              </Typography>
              
            </Stack>
            <form
              noValidate
              onSubmit={formik.handleSubmit}
            >
              <Stack spacing={3}>

            <FormControl fullWidth>
              <InputLabel id="table-select-label">Type rapport</InputLabel>
              <Select
                labelId="table-select-label"
                id="table-select"
                value={formik.values.selectedTable}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="selectedTable"
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
            {renderReportFields()} {/* Render dynamic fields */}
              </Stack>
              
              <Button
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                variant="contained"
              >
                Lagre
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
