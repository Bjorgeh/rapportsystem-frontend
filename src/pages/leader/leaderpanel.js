import Head from 'next/head';
import {
  Container,
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from 'src/config/apiConnection';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [subUsers, setSubUsers] = useState([]);
  const [tables, setTables] = useState([]);
  const [reportFields, setReportFields] = useState({});
  const [selectedReportData, setSelectedReportData] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  const handleRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    const userString = window.sessionStorage.getItem('user');
    const parsedUser = userString ? JSON.parse(userString) : null;
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    if (user && user.accountType !== 'leader' && user.accountType !== 'admin') {
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
        setReportFields(data.Table_descriptions.Tables); // Set report fields and titles
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const fetchReportData = async (tableName) => {
    try {
      const accessToken = window.sessionStorage.getItem('accessToken');

      const response = await fetch(API_BASE_URL + 'api/leader/post/extract_last', {
        // Endre URL-en her
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          table_name: tableName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const data = await response.json();
      setSelectedReportData(data[tableName].Data[0]); // Oppdater tilsvarende del av svaret fra serveren
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  const handleReportDataChange = (fieldName, value) => {
    setSelectedReportData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  const changeDataInReport = async () => {
    setActionType('changeData');
    setConfirmDialogOpen(true);
  };

  const deleteLastReport = async () => {
    setActionType('deleteReport');
    setConfirmDialogOpen(true);
  };

  // Oppdater bekreftelsesfunksjonen for å utføre riktig handling basert på handlingstypen
  const confirmAction = async () => {
    if (actionType === 'changeData') {
      confirmChangeData();
    } else if (actionType === 'deleteReport') {
      confirmDeleteLastReport();
    }
  };

  const confirmChangeData = async () => {
    try {
      const accessToken = window.sessionStorage.getItem('accessToken');
      const apiUrl = `${API_BASE_URL}api/leader/post/changeDataInRapport`;

      const requestData = {
        table_name: formik.values.selectedTable,
        data: {},
      };

      // Legg til feltene som ikke skal inkluderes i forespørselen
      Object.entries(selectedReportData).forEach(([fieldName, value]) => {
        if (
          !fieldName.includes('id') &&
          !fieldName.includes('date') &&
          !fieldName.includes('time') &&
          !fieldName.includes('sum_') &&
          !fieldName.includes('total_')
        ) {
          requestData.data[fieldName] = value;
        }
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to change report data');
      }

      console.log('Report data changed successfully');

      setConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error changing report data:', error);
    }
    handleRefresh();
  };

  const confirmDeleteLastReport = async () => {
    try {
      const accessToken = window.sessionStorage.getItem('accessToken');
      const apiUrl = `${API_BASE_URL}api/leader/post/deleteLastRapport`;

      const requestData = {
        table_name: formik.values.selectedTable,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to delete last report');
      }

      console.log('Last report deleted successfully');
      setConfirmDialogOpen(false); // Lukk bekreftelsesdialogen etter sletting er vellykket
    } catch (error) {
      console.error('Error deleting last report:', error);
    }
    handleRefresh();
  };

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
      // Handle form submission if needed
    },
  });

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
      } else if (
        fieldType.includes('float') ||
        fieldType.includes('decimal') ||
        fieldType.includes('double')
      ) {
        inputType = 'number';
        // You may add step, min, max attributes for more precision control
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
        fieldName.includes('sum_') ||
        fieldName.includes('total_')
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
            value={
              formik.values[fieldName] ||
              (selectedReportData && selectedReportData[fieldName]) ||
              ''
            } // Bind value to formik values or selectedReportData
            onChange={(event) => {
              formik.handleChange(event);
              handleReportDataChange(fieldName, event.target.value); // Update selectedReportData
            }}
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
        <title>Leaderpanel | Rapportsystem</title>
      </Head>
      <Container maxWidth="xl">
        <FormControl fullWidth>
          <InputLabel id="table-select-label">Type rapport</InputLabel>
          <Select
            labelId="table-select-label"
            id="table-select"
            value={formik.values.selectedTable}
            onChange={(event) => {
              formik.handleChange(event);
              fetchReportData(event.target.value);
            }}
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
        {selectedReportData && (
          <Typography variant="h6" gutterBottom>
            Latest data for {formik.values.selectedTable}:
          </Typography>
        )}
        {renderReportFields()} {/* Render dynamic fields */}
        <Grid container spacing={3}>
          {/* Buttons row */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={changeDataInReport}
                >
                  Change report data
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={deleteLastReport}
                >
                  Delete last report
                </Button>
              </Grid>
            </Grid>
          </Grid>
          {/* Sub users list */}
          <Grid item xs={12} sm={6} lg={3}>
            <List>
              {subUsers.map((user) => (
                <ListItem key={user.id}>
                  <ListItemText primary={user.name} secondary={user.role} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}></Grid>
        </Grid>
      </Container>
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Er du sikker på at du vil endre rapporten?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Denne handlingen kan ikke angres.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose} color="primary">
            Nei
          </Button>
          <Button onClick={confirmAction} color="primary" autoFocus>
            Ja
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
