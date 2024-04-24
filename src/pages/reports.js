import Head from 'next/head';
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
  TextField,
  Typography,
} from '@mui/material';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from 'src/config/apiConnection';

const Page = () => {
  const [reportFields, setReportFields] = useState({}); // Objekt for å lagre rapportfelt og titler

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
        setReportFields(data.Table_descriptions.Tables); // Setter rapportfelte og titler
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      selectedTable: '',
      // Legg til ytteliger felt om nødvendig
    },
    validationSchema: Yup.object({
      selectedTable: Yup.string().required('Velg en rapporttype'),
      // Legg til validasjonsskjema for andre felt om nødvendig
    }),
    onSubmit: async (values, helpers) => {
      try {
        //sjekk om feltene er fylt ut
        const selectedReportFields = reportFields[values.selectedTable]; // Henter feltene for valgt rapport
        if (selectedReportFields === undefined || selectedReportFields === null) {
          throw new Error('mangler feltinformasjon for valgt rapporttype');
        }
        const requestData = {
          table_name: values.selectedTable,
          data: {},
        };

        // fyller requestData med feltene fra skjemaet
        Object.keys(selectedReportFields).forEach((fieldName) => {
          // Exclude unwanted fields
          if (
            !fieldName.includes('id') &&
            !fieldName.includes('date') &&
            !fieldName.includes('time') &&
            !fieldName.includes('sum_')
          ) {
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
          throw new Error('rapportering feilet, prøv igjen senere');
        }

        const responseData = await response.json();
        console.log(responseData);

        // Antar backend sender en suksessmelding
        if (responseData.Message && responseData.Message.Success) {
          formik.resetForm(); // Tøm skjemaet
        } else {
          throw new Error('rapportering feilet, prøv igjen senere');
        }
      } catch (error) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: error.message });
        helpers.setSubmitting(false);
      }
    },
  });

  // Funksjon som lager felt basert på rapporten
  const renderReportFields = () => {
    const selectedReport = formik.values.selectedTable;
    const fields = reportFields[selectedReport];

    if (!fields) {
      return null;
    }

    return Object.entries(fields).map(([fieldName, fieldType], index) => {
      let inputType = 'text'; // Standard innput-type
      required: true;
      // Avgjør inputtype basert på felttype fra api. Dette bidrar til datavalidering
      if (fieldType.includes('int')) {
        inputType = 'number';
        required: true;
      } else if (
        fieldType.includes('float') ||
        fieldType.includes('decimal') ||
        fieldType.includes('double')
      ) {
        inputType = 'number';
        // Det kan legges inn mer granulær kontroll her, f.eks. min, max, step
      } else if (fieldType.includes('date')) {
        inputType = 'date';
      } else if (fieldType.includes('time')) {
        inputType = 'time';
      }
      //Fjerner felt som fylles automatisk av backend
      if (
        fieldName.includes('id') ||
        fieldName.includes('date') ||
        fieldName.includes('time') ||
        fieldName.includes('sum_')
      ) {
        return null;
      }

      return (
        <Box key={index} sx={{ mt: 3 }}>
          <TextField
            required
            id={fieldName}
            label={fieldName}
            type={inputType}
            value={formik.values[fieldName]} // Binder verdier til formik
            onChange={formik.handleChange} // Binder onchange til formik
            onBlur={formik.handleBlur}
            name={fieldName} // Setter navn på feltet
          />
        </Box>
      );
    });
  };

  return (
    <>
      <Head>
        <title>Register report | Rapportsystem</title>
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
              <Typography variant="h4">Ny rapport</Typography>
            </Stack>
            <form Validate onSubmit={formik.handleSubmit}>
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
                {renderReportFields()} {/* Lager felter dynamisk */}
              </Stack>

              <Button
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting} // Slår av knapp når rapport sendes
              >
                {formik.isSubmitting ? 'Sender...' : 'Lagre'}{' '}
                {/* vis "laster" text mens rapporten sendes */}
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
