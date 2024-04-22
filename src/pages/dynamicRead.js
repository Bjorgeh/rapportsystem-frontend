import * as React from 'react';
import { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { API_BASE_URL } from 'src/config/apiConnection';

const ReactVirtualizedTable = () => {
  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = window.sessionStorage.getItem('accessToken');
        const requestData = {
          table_name: 'BorreproveRapport',
          date_start: '1992-01-01',
          date_stop: '2025-01-31',
          rapport_count: '5',
        };
        console.log('Request data:', requestData);
        const response = await fetch(API_BASE_URL + 'api/user/post/extractPreciseData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestData),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch table data');
        }
        const responseData = await response.json();
        const firstRow = responseData.requested_data[0]; // Assuming the first row contains headers
        setTableHeaders(Object.keys(firstRow)); // Set table headers based on the keys of the first row
        setTableData(responseData.requested_data); // Set table data
        console.log(responsedData);
      } catch (error) {
        console.error('Error fetching table data:', error);
      }
    };
    console.log('Fetching data');
    fetchData();
  }, []); // Fetch data on component mount, remove the dependency array

  return (
    <Paper style={{ height: 400, width: '100%' }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {tableHeaders.map((header, index) => (
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {tableHeaders.map((header, headerIndex) => (
                  <TableCell key={headerIndex}>{row[header]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ReactVirtualizedTable;
