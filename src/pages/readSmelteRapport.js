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
        table_name: 'SmelteRapport',
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
      setData(responseData.requested_data.SmelteRapport.Data);
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>ID</th>
                <th style={{ textAlign: 'center' }}>Ovnsnummer</th>
                <th style={{ textAlign: 'center' }}>Dato</th>
                <th style={{ textAlign: 'center' }}>Tid</th>
                <th style={{ textAlign: 'center' }}>Kg Returgods</th>
                <th style={{ textAlign: 'center' }}>Kg Skrapmetall</th>
                <th style={{ textAlign: 'center' }}>Total smeltevekt</th>
                <th style={{ textAlign: 'center' }}>Kg Karbon</th>
                <th style={{ textAlign: 'center' }}>Kg Jernmalm</th>
                <th style={{ textAlign: 'center' }}>Kg FeSi</th>
                <th style={{ textAlign: 'center' }}>Kg FeP</th>
                <th style={{ textAlign: 'center' }}>Kwh før smelting</th>
                <th style={{ textAlign: 'center' }}>Kwh etter smelting</th>
                <th style={{ textAlign: 'center' }}>Sum Kwh brukt på smelte</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>{item.id}</td>
                  <td style={{ textAlign: 'center' }}>{item.furnace_number}</td>
                  <td style={{ textAlign: 'center' }}>{item.date}</td>
                  <td style={{ textAlign: 'center' }}>{item.time}</td>
                  <td style={{ textAlign: 'center' }}>{item.kg_returns}</td>
                  <td style={{ textAlign: 'center' }}>{item.kg_scrap_metal}</td>
                  <td style={{ textAlign: 'center' }}>{item.total_weight_melt}</td>
                  <td style={{ textAlign: 'center' }}>{item.kg_carbon}</td>
                  <td style={{ textAlign: 'center' }}>{item.kg_ore}</td>
                  <td style={{ textAlign: 'center' }}>{item.kg_fesi}</td>
                  <td style={{ textAlign: 'center' }}>{item.kg_fep}</td>
                  <td style={{ textAlign: 'center' }}>{item.kwh_pre_melt}</td>
                  <td style={{ textAlign: 'center' }}>{item.kwh_post_melt}</td>
                  <td style={{ textAlign: 'center' }}>{item.sum_kwh_used}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Laster...</p>
      )}
    </div>
  );
};

export default YourComponent;
