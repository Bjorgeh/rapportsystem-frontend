import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import { Typography, FormControlLabel, Stack, Box, Checkbox, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { OverviewBudget } from 'src/sections/overview/overview-budget';
import { OverviewLatestOrders } from 'src/sections/overview/overview-latest-orders';
import { OverviewLatestProducts } from 'src/sections/overview/overview-latest-products';
import { OverviewSales } from 'src/sections/overview/overview-sales';
import { OverviewTasksProgress } from 'src/sections/overview/overview-tasks-progress';
import { OverviewTotalCustomers } from 'src/sections/overview/overview-total-customers';
import { OverviewTotalProfit } from 'src/sections/overview/overview-total-profit';
import { OverviewTraffic } from 'src/sections/overview/overview-traffic';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
//import { table } from 'console';
import { API_BASE_URL } from 'src/config/apiConnection';

const now = new Date();

const Page = () => {

  const [tableNames, setTableNames] = useState([]); 
  const [tableInfo, setTableInfo] = useState([]); 

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
  
        const names = Object.keys(data.Table_descriptions.Tables);

        setTableInfo(data.Table_descriptions.Tables);
        //console.log("Rapport datatypes" + tableInfo);
        
        setTableNames(names);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  const formik = useFormik({
    initialValues: {
      selectedTable: '',
      
    }
  })

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
              value="$24k"
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
              value="1.6k"
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
                  name: 'This year',
                  data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20]
                },
                {
                  name: 'Last year',
                  data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13]
                },

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
              <InputLabel id="table-select-label">Report type</InputLabel>
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
            <Stack spacing={1}>
                <Typography variant="h6">
                  Overskrift
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
