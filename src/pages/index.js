import Head from 'next/head';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useRouter } from 'next/router';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { OverviewSales } from 'src/sections/overview/overview-sales';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from 'src/config/apiConnection';
import { randomInt } from 'crypto';

const Page = () => {
  const unselectableFields = [
    'id',
    'date',
    'time',
    'sum_',
    'model_number',
    'catalog_number',
    'comment',
    'approved',
    'sign',
    'part_type',
    'ordrer_number',
    'signature',
  ];
  const [tableNames, setTableNames] = useState([]);
  const [selectableFields, setSelectableFields] = useState([]);
  const [dynamicChartData, setDynamicChartData] = useState([]);

  const router = useRouter();

  const [showInputs, setShowInputs] = useState(true); // Tilstand for å vise eller skjule input-feltene

  const handleToggleChange = () => {
    setShowInputs(!showInputs); // Bytt tilstand når knappen klikkes
  };

  const formik = useFormik({
    initialValues: {
      selectedTable: 'SmelteRapport',
      startDate: '2023-04-01',
      endDate: '2024-04-01',
      reportCount: '100',
      selectedOptions: ['kg_returns', 'kg_carbon'],
    },
    onSubmit: async (values) => {
      try {
        // kode for å hente data
        const requestBody = {
          table_name: values.selectedTable,
        };
        if (showInputs) {
          requestBody.start_date = values.startDate;
          requestBody.end_date = values.endDate;
        } else {
          requestBody.report_count = values.reportCount;
        }
        const accessToken = window.sessionStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}api/user/post/extractPreciseData`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        // Oppdaterer dynamisk grafdata basert på responsen
        const newData = values.selectedOptions
          .map((selectedOption) => {
            const fieldValueArray = Object.keys(data.requested_data).flatMap((key) => {
              if (data.requested_data[key] && data.requested_data[key].Data) {
                const dataEntries = data.requested_data[key].Data;
                return dataEntries.flatMap((dataEntry) => {
                  return Object.keys(dataEntry)
                    .filter((fieldName) => fieldName === selectedOption)
                    .map((fieldName) => dataEntry[fieldName])
                    .filter(Boolean)
                    .filter((fieldValue) => fieldValue instanceof Number || !isNaN(fieldValue));
                });
              } else {
                throw new Error('Missing ' + selectedOption + ' value: ' + key);
              }
            });
            return {
              name: selectedOption
                .split('_')
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
                .reduce((s1, s2) => s1 + ' ' + s2),
              data: fieldValueArray,
            };
          })
          .filter((graph) => graph && graph.data && graph.data.length > 0);
        setDynamicChartData(newData);

        // Eksisterende kode for å lagre data for visning
        setTableData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = window.sessionStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}api/user/get/rapportInfo`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        const reportTables = data.Table_descriptions.Tables;
        const tableNames = Object.keys(reportTables);
        setTableNames(tableNames);

        const selectedTable = formik.values.selectedTable;
        if (selectedTable === '' || (tableNames && !tableNames.includes(selectedTable))) {
          formik.setFieldValue('selectedTable', tableNames[randomInt(0, tableNames.length - 1)]);
        }

        const fieldNames = Object.keys(reportTables[selectedTable]).filter(Boolean);
        const selectableFields = fieldNames.filter(
          (fieldName) => !unselectableFields.includes(fieldName)
        );
        if (fieldNames && fieldNames.length > 0) {
          setSelectableFields(selectableFields);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [formik.values.selectedTable]);

  const handleCreateReport = (/*Rapportnavn*/) => {
    router.push(`/reports/`); 
  };

  const handleReadReport = (reportName) => {
    router.push(`/read` + reportName);
  };

  return (
    <>
      <Head>
        <title>Forside | Rapportsystem</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={2}>
            <Grid xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    {tableNames.length > 0 ? (
                      tableNames.map((tableName, index) => (
                        <>
                          <Grid item key={index} xs={6}>
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => handleCreateReport(tableName)}
                            >
                              {'Ny ' + tableName}
                            </Button>
                          </Grid>
                          <Grid item key={index} xs={6}>
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => handleReadReport(tableName)}
                            >
                              {'Se ' + tableName}
                            </Button>
                          </Grid>
                        </>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <p>Ingen rapport tilgjengelig</p>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} lg={8}>
              <OverviewSales
                chartSeries={
                  dynamicChartData && dynamicChartData.length > 0 ? dynamicChartData : []
                }
                title={
                  dynamicChartData && dynamicChartData.length > 0
                    ? formik.values.selectedTable
                    : null
                }
                categories={
                  dynamicChartData && dynamicChartData.length > 0
                    ? dynamicChartData[0].data.map((e, i) => 'Målepunkt ' + i)
                    : []
                }
                sx={{ height: '100%' }}
                refreshChartData={formik.handleSubmit}
              />
            </Grid>
            <Grid xs={120} md={6} lg={4}>
              <Grid xs={120} md={60} lg={12}>
                <FormControl fullWidth>
                  <InputLabel id="table-select-label">Rapporttype</InputLabel>
                  <Select
                    labelId="table-select-label"
                    id="table-select"
                    value={formik.values.selectedTable}
                    onChange={(event) => {
                      formik.handleChange(event);
                    }}
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

              <Grid xs={12} md={6} lg={4}>
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2} alignItems="center">
                    {' '}
                    {/* Grid container for å plassere elementene ved siden av hverandre */}
                    {showInputs && ( // Sjekk om input-feltene skal vises
                      <>
                        <Grid item>
                          {' '}
                          {/* Grid item for å plassere startdato */}
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
                        <Grid item>
                          {' '}
                          {/* Grid item for å plassere sluttdato */}
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
                      <Grid item>
                        {' '}
                        {/* Grid item for å plassere antall rapporter */}
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
                    <Grid item>
                      {' '}
                      {/* Grid item for å plassere knappene */}
                      <Button onClick={handleToggleChange} variant="contained">
                        Dato/Antall
                      </Button>
                    </Grid>
                    <Grid item>
                      {' '}
                      {/* Grid item for å plassere hent data-knappen */}
                      <Button type="submit" variant="contained">
                        Hent data
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
              <Grid xs={12} md={6} lg={4}>
                <Stack spacing={1} width={200}>
                  <Typography variant="h6">
                    Verdier i rapport
                    <Grid container spacing={1}>
                      {selectableFields.map((fieldName, index) => (
                        <Grid item key={index} width="100%">
                          <FormControlLabel
                            labelPlacement="end" // Flytt etiketten til slutten av knappen
                            control={
                              <ToggleButtonGroup
                                value={formik.values.selectedOptions} // Verdien som er valgt
                                onChange={(event, newSelectedOptions) => {
                                  formik.setFieldValue('selectedOptions', newSelectedOptions); // Oppdaterer verdien når knappene blir endret
                                }}
                              >
                                <ToggleButton value={fieldName}>
                                  {fieldName.replaceAll('_', ' ')}
                                </ToggleButton>
                              </ToggleButtonGroup>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Typography>
                  <Stack></Stack>
                </Stack>
              </Grid>
            </Grid>
            <Grid xs={12} md={6} lg={4}></Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
