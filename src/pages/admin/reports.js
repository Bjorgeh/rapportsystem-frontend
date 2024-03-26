import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router'; 
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Checkbox, Grid, Link, Stack, TextField, Typography } from '@mui/material';
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
      // Add initial values for other fields as needed
    },
    validationSchema: Yup.object({
      selectedTable: Yup.string().required('Velg en rapporttype'),
      // Add validation schema for other fields as needed
    }),
    onSubmit: async (values, helpers) => {
      try {
        const selectedReportFields = reportFields[values.selectedTable]; // Get fields for selected report
        const requestData = {
          table_name: values.selectedTable,
          data: {},
        };
    
        // Populate requestData with values from form based on selected report fields
        Object.keys(selectedReportFields).forEach(fieldName => {
          // Exclude unwanted fields
          if (!fieldName.includes('id') && !fieldName.includes('date') && !fieldName.includes('time') && !fieldName.includes('sum_')) {
            const fieldValue = formik.values[fieldName];
            requestData.data[fieldName] = fieldValue;
            console.log(`Field name: ${fieldName}, Field value: ${fieldValue}`); //Skriver ut data som sendes til backend
          }
        });
    
        console.log(requestData);
    
        const apiUrl = `${API_BASE_URL}api/user/post/insertData`; // Construct API URL
        const accessToken = window.sessionStorage.getItem('accessToken');
    
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestData),
        });
    
        if (!response.ok) {
          throw new Error('Failed to insert data');
        }
    
        const responseData = await response.json();
        console.log(responseData);
    
        // Assuming response has a message with success status
        if (responseData.Message && responseData.Message.Success) {
          setSuccessMessage(responseData.Message.Success);
          formik.resetForm(); // Tøm skjemaet
        } else {
          throw new Error('Failed to insert data');
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
        //Fjerner felt som fylles automatisk av backend
        if (fieldName.includes('id') || fieldName.includes('date') || fieldName.includes('time') || fieldName.includes('sum_')){
          return null;
        }
    
        return (
          <Box key={index} sx={{ mt: 3 }}>
            <TextField
              required
              id={fieldName}
              label={fieldName}
              type={inputType}
              value={formik.values[fieldName]} // Bind value to formik values
              onChange={formik.handleChange} // Bind onChange to formik handleChange
              onBlur={formik.handleBlur}
              name={fieldName} // Set the name attribute to fieldName
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
                disabled={formik.isSubmitting} // Disable button while submitting
              >
                {formik.isSubmitting ? 'Sender...' : 'Lagre'} {/* Show loading text while submitting */}
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
