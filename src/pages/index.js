import Head from 'next/head';
import { Typography, FormControlLabel,TextField,Button, Stack, Box, Checkbox, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { OverviewBudget } from 'src/sections/overview/overview-budget';
import { OverviewSales } from 'src/sections/overview/overview-sales';
import { OverviewTasksProgress } from 'src/sections/overview/overview-tasks-progress';
import { OverviewTotalCustomers } from 'src/sections/overview/overview-total-customers';
import { OverviewTotalProfit } from 'src/sections/overview/overview-total-profit';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { API_BASE_URL } from 'src/config/apiConnection';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';


const now = new Date();

const Page = () => {
  const [tableNames, setTableNames] = useState([]); 
  const [reportFields, setReportFields] = useState({}); 
  const [dynamicChartData, setDynamicChartData] = useState([]);

  const [showInputs, setShowInputs] = useState(true); // Tilstand for å vise eller skjule input-feltene

  const handleToggleChange = () => {
    setShowInputs(!showInputs); // Bytt tilstand når knappen klikkes
  };

  const handleSelectedOptionsChange = (event, newSelectedOptions) => {
    setSelectedOptions(newSelectedOptions); // Oppdater valgte verdier i rapport når knappene blir endret
  };


  const renderReportFields = () => {
    const selectedReport = formik.values.selectedTable;
    const fields = reportFields[selectedReport];

    if (!fields) {
      return null;
    }

    // Anta at spørringsresultatene har både feltene og navnene
    return Object.entries(fields).map(([fieldName, fieldInfo], index) => {
      // Fjern felt som fylles automatisk av backend
      if (fieldName.includes('id') || fieldName.includes('date') || fieldName.includes('time') || fieldName.includes('sum_')) {
        return null;
      }

      // Returner et objekt med både fieldName og fieldLabel (navn)
      return {
        fieldName: fieldName,
        fieldLabel: fieldInfo.label, // Anta at navnet hentes fra 'label' i spørringsresultatene
      };
    }).filter(Boolean); // Fjern eventuelle null-verdier
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = window.sessionStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}api/user/get/rapportInfo`, {
          headers: {
            Authorization: `Bearer ${accessToken}` 
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        setTableInfo(data.Table_descriptions.Tables);
        setTableNames(Object.keys(data.Table_descriptions.Tables));

        // Set reportFields based on data
        setReportFields(data.Table_descriptions.Tables);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  
  const formik = useFormik({
    initialValues: {
      selectedTable: '',
      startDate: '',
      endDate: '',
      reportCount: '',
      selectedOptions: [] // Initial value for selected options
    },
    onSubmit: async (values) => {
      try {
        // Din eksisterende kode for å hente data
        const accessToken = window.sessionStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}api/user/post/extractPreciseData`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            table_name: values.selectedTable, // Access selectedTable from values
            date_start: values.startDate, // Access startDate from values
            date_stop: values.endDate, // Access endDate from values
            rapport_count: values.reportCount // Access reportCount from values
          })
        });
    
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
    
        const data = await response.json();
    
        // Oppdaterer dynamisk grafdata basert på responsen 
        const newData = Object.keys(data.requested_data).map(key => {
          if (data.requested_data[key] && data.requested_data[key].Data) {
            return data.requested_data[key].Data.map(entry => entry.amt_formed);
          } else {
            return [];
          }
        });
        setDynamicChartData(newData.flat()); 
    
        // Din eksisterende kode for å lagre data for visning
        setTableData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  });

  

  return (
  <>
    <Head>
      <title>
        Overview | Rapportsystem
      </title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Container maxWidth="xl">
        <Grid
          container
          spacing={3}
        >
          <Grid
            xs={12}
            sm={6}
            lg={3}
          >
            <OverviewBudget
              difference={12}
              positive
              sx={{ height: '100%' }}
              value=""
            />
          </Grid>
          <Grid
            xs={12}
            sm={6}
            lg={3}
          >
            <OverviewTotalCustomers
              difference={16}
              positive={false}
              sx={{ height: '100%' }}
              value=""
            />
          </Grid>
          <Grid
            xs={12}
            sm={6}
            lg={3}
          >
            <OverviewTasksProgress
              sx={{ height: '100%' }}
              value={75.5}
            />
          </Grid>
          <Grid
            xs={12}
            sm={6}
            lg={3}
          >
            <OverviewTotalProfit
              sx={{ height: '100%' }}
              value="$15k"
            />
          </Grid>
          <Grid
            xs={12}
            lg={8}
          >
            <OverviewSales
              chartSeries={[
                {
                  name: 'Dynamic data',
                  data: dynamicChartData
                },
                {
                  name: 'Last year',
                  data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] // Eksempeldata for fjoråret
                }
              ]}
              sx={{ height: '100%' }}
            />

          </Grid>
          <Grid
            xs={120}
            md={6}
            lg={4}
          >
            <Grid
            xs={120}
            md={60}
            lg={12}
          >
            <FormControl fullWidth>
              <InputLabel id="table-select-label">Rapporttype</InputLabel>
              <Select
                labelId="table-select-label"
                id="table-select"
                value={formik.values.selectedTable}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="selectedTable"
              >
                  {tableNames.map((tableName) => (
                    <MenuItem key={tableName} value={tableName}>
                      {tableName}
                    </MenuItem>
                  ))}
              </Select>

            </FormControl>
            </Grid>
            
            <Grid
              xs={12}
              md={6}
              lg={4}
            >

              <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2} alignItems="center"> {/* Grid container for å plassere elementene ved siden av hverandre */}
                {showInputs && ( // Sjekk om input-feltene skal vises
                  <>
                    <Grid item> {/* Grid item for å plassere startdato */}
                      <TextField
                        id="startDate"
                        name="startDate"
                        label="Startdato"
                        type="date"
                        value={formik.values.startDate}
                        onChange={formik.handleChange}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item> {/* Grid item for å plassere sluttdato */}
                      <TextField
                        id="endDate"
                        name="endDate"
                        label="Sluttdato"
                        type="date"
                        value={formik.values.endDate}
                        onChange={formik.handleChange}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  </>
                )}
                {!showInputs && ( // Sjekk om antall rapporter skal vises
                  <Grid item> {/* Grid item for å plassere antall rapporter */}
                    <TextField
                      id="reportCount"
                      name="reportCount"
                      label="Antall rapporter"
                      type="number"
                      value={formik.values.reportCount}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                )}
                <Grid item> {/* Grid item for å plassere knappene */}
                  <Button onClick={handleToggleChange} variant="contained">Dato/Antall</Button>
                </Grid>
                <Grid item> {/* Grid item for å plassere hent data-knappen */}
                <Button type="submit" variant="contained">Hent data</Button>
              </Grid>
              </Grid>
            </form>
            </Grid>
            <Grid
            xs={12}
            md={6}
            lg={4}
          >
            <Stack spacing={1}>
                <Typography variant="h6">
                  Verdier i rapport
                  <Grid container spacing={1}>
                {renderReportFields() && renderReportFields().map(({ fieldName, fieldLabel }, index) => (
                  <Grid item key={index}>
                    <FormControlLabel
                      label={fieldLabel}
                      labelPlacement="end" // Flytt etiketten til slutten av knappen
                      control={
                        <ToggleButtonGroup
                          value={formik.values.selectedOptions} // Verdien som er valgt
                          onChange={(event, newSelectedOptions) => {
                            formik.setFieldValue('selectedOptions', newSelectedOptions); // Oppdaterer verdien når knappene blir endret
                          }}
                          aria-label="selected options"
                        >
                        <ToggleButton value={fieldName} aria-label={fieldLabel}>
                          {fieldName}
                        </ToggleButton>
                      </ToggleButtonGroup>
                   }
                />
              </Grid>
            ))}
          </Grid>
                </Typography>
                <Stack>

                </Stack>
              </Stack>
              </Grid>
          </Grid>
          <Grid
            xs={12}
            md={6}
            lg={4}
          >
          </Grid>
        </Grid>
      </Container>
    </Box>
  </>
)};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
