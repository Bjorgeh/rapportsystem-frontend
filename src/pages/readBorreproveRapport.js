import { API_BASE_URL } from 'src/config/apiConnection';
import { useEffect, useState } from 'react';

const YourComponent = () => {
  const [data, setData] = useState(null);
  const [rapportCount, setRapportCount] = useState('5');

  useEffect(() => {
    fetchData();
  }, [rapportCount]);

  const fetchData = async () => {
    try {
      const accessToken = window.sessionStorage.getItem('accessToken');
      const requestData = {
        table_name: 'BorreproveRapport',
        rapport_count: rapportCount,
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
      setData(responseData.requested_data.BorreproveRapport.Data);
      console.log(responseData);
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };

  const handleRapportCountChange = (event) => {
    setRapportCount(event.target.value);
  };

  return (
    <div>
      <h1>API Data</h1>
      <label htmlFor="rapportCount">Velg antall rapporter: </label>
      <select id="rapportCount" value={rapportCount} onChange={handleRapportCountChange}>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="200">200</option>
      </select>
      {data ? (
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: 'center', width: 200 }}>ID</th>
              <th style={{ textAlign: 'center' }}>Type del</th>
              <th style={{ textAlign: 'center' }}>Modell</th>
              <th style={{ textAlign: 'center' }}>katalognummer</th>
              <th style={{ textAlign: 'center' }}>antall testet</th>
              <th style={{ textAlign: 'center' }}>Ordrenummer</th>
              <th style={{ textAlign: 'center' }}>Godkjent</th>
              <th style={{ textAlign: 'center' }}>Dato</th>
              <th style={{ textAlign: 'center' }}>Tid</th>
              <th style={{ textAlign: 'center' }}>Sign</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center' }}>{item.id}</td>
                <td style={{ textAlign: 'center' }}>{item.part_type}</td>
                <td style={{ textAlign: 'center' }}>{item.stove}</td>
                <td style={{ textAlign: 'center' }}>{item.catalog_number}</td>
                <td style={{ textAlign: 'center' }}>{item.test_amount}</td>
                <td style={{ textAlign: 'center' }}>{item.ordrer_number}</td>
                <td style={{ textAlign: 'center' }}>{item.approved ? 'Ja' : 'Nei '}</td>
                <td style={{ textAlign: 'center' }}>{item.date}</td>
                <td style={{ textAlign: 'center' }}>{item.time}</td>
                <td style={{ textAlign: 'center' }}>{item.sign}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Laster...</p>
      )}
    </div>
  );
};

export default YourComponent;
