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
        table_name: 'DisaRapport',
        rapport_count: rapportCount
      };
      console.log('Request data:', requestData);
      const response = await fetch(API_BASE_URL + 'api/user/post/extractPreciseData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestData)
      });
      if (!response.ok) {
        throw new Error('Failed to fetch table data');
      }
      const responseData = await response.json();
      setData(responseData.requested_data.DisaRapport.Data);
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
              <th style={{ textAlign: 'center' }}>ID</th>
              <th style={{ textAlign: 'center' }}>Skift</th>
              <th style={{ textAlign: 'center' }}>Dato</th>
              <th style={{ textAlign: 'center' }}>Tid</th>
              <th style={{ textAlign: 'center' }}>Antall formet</th>
              <th style={{ textAlign: 'center' }}>Antall støpt</th>
              <th style={{ textAlign: 'center' }}>Modellnummer</th>
              <th style={{ textAlign: 'center' }}>Kommentar</th>
              <th style={{ textAlign: 'center' }}>Sign</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center' }}>{item.id}</td>
                <td style={{ textAlign: 'center' }}>{item.shift}</td>
                <td style={{ textAlign: 'center' }}>{item.date}</td>
                <td style={{ textAlign: 'center' }}>{item.time}</td>
                <td style={{ textAlign: 'center' }}>{item.amt_formed}</td>
                <td style={{ textAlign: 'center' }}>{item.amt_cast}</td>
                <td style={{ textAlign: 'center' }}>{item.model_number}</td>
                <td style={{ textAlign: 'center' }}>{item.comment}</td>
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
