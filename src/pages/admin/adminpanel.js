import Head from 'next/head';
import { Container, Grid, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from 'src/hooks/use-auth';
import { API_BASE_URL } from 'src/config/apiConnection';

const Page = () => {
  const router = useRouter();
  const auth = useAuth();
  const [user, setUser] = useState(null);
  const [subUsers, setSubUsers] = useState([]);
  const [tables, setTables] = useState([]);

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
        const response = await fetch(API_BASE_URL+'/api/admin/get/extractSubUsers', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const email = window.sessionStorage.getItem('email');
          const parsedEmail = email ? JSON.parse(email) : null;
          const subUserList = data[parsedEmail].Subusers.map(([email, role]) => ({ id: email, name: email, role }));
          setSubUsers(subUserList);
        } else {
          console.error('Failed to fetch sub users:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching sub users:', error);
      }
    };

    const fetchTables = async () => {
      try {
        const accessToken = window.sessionStorage.getItem('accessToken');
        const response = await fetch(API_BASE_URL+'/api/admin/get/extract_tables', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const tableNames = Object.keys(data.Table_descriptions.Tables);
          setTables(tableNames);
        } else {
          console.error('Failed to fetch tables:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    fetchSubUsers();
    fetchTables();
  }, []);

  const redirectToPage_newsubuser = () => {
    router.push('/admin/func/newsubuser');
  };

  const redirectToPage_changesubpassword = () => {
    router.push('/admin/func/changesubpass');
  };

  const redirectToPage_deletesubuser = () => {
    router.push('/admin/func/deletesubuser');
  };

  return (
    <>
      <Head>
        <title>Adminpanel | Rapportsystem</title>
      </Head>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Buttons row */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Button variant="contained" color="primary" size="large" onClick={redirectToPage_newsubuser}>
                  Add user
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="contained" color="secondary" size="large" onClick={redirectToPage_changesubpassword}>
                  Change users password
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="contained" color="primary" size="large" onClick={redirectToPage_deletesubuser}>
                  Delete users
                </Button>
              </Grid>
            </Grid>
          </Grid>
          {/* Sub users list */}
          <Grid item xs={12} sm={6} lg={3}>
            <Typography variant="h6" gutterBottom>
              Sub users
            </Typography>
            <List>
              {subUsers.map((user) => (
                <ListItem key={user.id}>
                  <ListItemText primary={user.name} secondary={user.role} />
                </ListItem>
              ))}
            </List>
          </Grid>
          {/* Tables list */}
          <Grid item xs={12} sm={6} lg={3}>
            <Typography variant="h6" gutterBottom>
              Reports
            </Typography>
            <List>
              {tables.map((table, index) => (
                <ListItem key={index}>
                  <ListItemText primary={table} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
