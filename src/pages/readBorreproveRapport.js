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
  //Her velger mann anntall rader. Ferdig innlagte valg er 5, 10, 15, 20, 50, 100 og 200.
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
            {data.map(
              (
                item //Over legger grensesnittet opp med headers, her putter vi inn verdiene fra api kallet. slik at vi får en tabell med data.
              ) => (
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
              )
            )}
          </tbody>
        </table>
      ) : (
        <p>Laster...</p>
      )}
    </div>
  );
};

export default YourComponent;
