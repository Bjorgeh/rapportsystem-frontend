import { API_BASE_URL } from 'src/config/apiConnection';
import { useEffect, useState } from 'react';

//Dennne siden inneholder en funksjon som henter data fra databasen og viser det i en tabell.
//Funksjonen bruker useState og useEffect for å hente data fra databasen og vise det i en tabell.
//Funksjonen bruker også en select tag for å velge antall rapporter som skal vises i tabellen.
//Funksjonen bruker også en handleRapportCountChange funksjon for å endre antall rapporter som skal vises i tabellen.

//Siden er hardkodet til spesifikk rapport. Dette er gjort grunnet tidpress. Ideelt sett bygger mann en dynamisk hentefunskjon som henter data basert på input fra bruker.
//på samme måte som i grafen i oversikten.

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
        table_name: 'SandanalyseRapport',
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
      setData(responseData.requested_data.SandanalyseRapport.Data);
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
                <th style={{ textAlign: 'center' }}>Dato</th>
                <th style={{ textAlign: 'center' }}>Tid</th>
                <th style={{ textAlign: 'center' }}>Fuktighet</th>
                <th style={{ textAlign: 'center' }}>Trykkstyrke</th>
                <th style={{ textAlign: 'center' }}>Pakningsgrad</th>
                <th style={{ textAlign: 'center' }}>Glødetap</th>
                <th style={{ textAlign: 'center' }}>Spaltestyrke</th>
                <th style={{ textAlign: 'center' }}>Aktiv bentonitt</th>
                <th style={{ textAlign: 'center' }}>Slaminnhold</th>
                <th style={{ textAlign: 'center' }}>Sikteanalyse</th>
                <th style={{ textAlign: 'center' }}>Kompressibilitet</th>
                <th style={{ textAlign: 'center' }}>Sandtemperatur</th>
                <th style={{ textAlign: 'center' }}>Sign</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>{item.id}</td>
                  <td style={{ textAlign: 'center' }}>{item.date}</td>
                  <td style={{ textAlign: 'center' }}>{item.time}</td>
                  <td style={{ textAlign: 'center' }}>{item.moisture}</td>
                  <td style={{ textAlign: 'center' }}>{item.pressure_strengt}</td>
                  <td style={{ textAlign: 'center' }}>{item.packing_degree}</td>
                  <td style={{ textAlign: 'center' }}>{item.burn_out}</td>
                  <td style={{ textAlign: 'center' }}>{item.shear_strength}</td>
                  <td style={{ textAlign: 'center' }}>{item.active_bentonie}</td>
                  <td style={{ textAlign: 'center' }}>{item.sludge_content}</td>
                  <td style={{ textAlign: 'center' }}>{item.sieve_analysis}</td>
                  <td style={{ textAlign: 'center' }}>{item.compressibility}</td>
                  <td style={{ textAlign: 'center' }}>{item.sand_temp}</td>
                  <td style={{ textAlign: 'center' }}>{item.signature}</td>
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
