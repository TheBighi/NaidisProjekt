import { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';

function Dashboard() {
  const [data, setData] = useState([]);
  const [averages, setAverages] = useState([]);
  const [regionAvg, setRegionAvg] = useState([]);
  const [allRegionsData, setAllRegionsData] = useState([]);

  useEffect(() => {
    const fetchDefaultData = async () => {
      const response = await fetch(
        'http://localhost:3001/api/readings?start=2025-04-01T00:00:00.000Z&end=2025-04-02T00:00:00.000Z&location=EE'
      );
      const json = await response.json();
      const formatted = json.map((item) => ({
        date: new Date(item.timestamp),
        price: parseFloat(item.price_eur_mwh),
      }));
      setData(formatted);
      setAverages(getAverages(formatted));
    };

    fetchDefaultData();
  }, []);

  const getAverages = (data) => {
    const grouped = {};
    data.forEach(({ date, price }) => {
      const day = date.toISOString().split('T')[0];
      if (!grouped[day]) grouped[day] = { sum: 0, count: 0 };
      grouped[day].sum += price;
      grouped[day].count += 1;
    });
    return Object.entries(grouped).map(([day, { sum, count }]) => ({
      date: new Date(day),
      price: Math.round((sum / count) * 100) / 100,
    }));
  };

  const getAverageByLocation = (data) => {
    const groups = {};
    data.forEach((item) => {
      const loc = item.location;
      if (!groups[loc]) groups[loc] = { total: 0, count: 0 };
      groups[loc].total += Number(item.price_eur_mwh);
      groups[loc].count += 1;
    });
    return Object.entries(groups).map(([location, val]) => ({
      location,
      price: val.total / val.count,
    }));
  };

  const mergeRegionData = (eeJson, lvJson, fiJson) => {
    const byTimestamp = {};
    const addEntries = (json, key) => {
      json.forEach((item) => {
        const ts = item.timestamp;
        if (!byTimestamp[ts]) byTimestamp[ts] = { date: new Date(ts) };
        byTimestamp[ts][key] = parseFloat(item.price_eur_mwh);
      });
    };
    addEntries(eeJson, 'EE');
    addEntries(lvJson, 'LV');
    addEntries(fiJson, 'FI');
    return Object.values(byTimestamp).sort((a, b) => a.date - b.date);
  };

  const getDataset = async () => {
    const startInput = document.getElementById('start').value;
    const endInput = document.getElementById('end').value;
    const locationInput = document.getElementById('location').value;

    const locations = ['EE', 'LV', 'FI'];
    const startISO = new Date(startInput).toISOString();
    const endISO = new Date(endInput).toISOString();

    const [eeJson, lvJson, fiJson] = await Promise.all(
      locations.map((loc) =>
        fetch(`http://localhost:3001/api/readings?start=${startISO}&end=${endISO}&location=${loc}`)
          .then((r) => r.json())
          .then((json) => json.map((item) => ({ ...item, location: loc })))
      )
    );

    const allData = [...eeJson, ...lvJson, ...fiJson];
    setRegionAvg(getAverageByLocation(allData));
    setAllRegionsData(mergeRegionData(eeJson, lvJson, fiJson));

    const mainJson = { EE: eeJson, LV: lvJson, FI: fiJson }[locationInput];
    const formatted = mainJson.map((item) => ({
      date: new Date(item.timestamp),
      price: parseFloat(item.price_eur_mwh),
    }));
    setData(formatted);
    setAverages(getAverages(formatted));
  };

  return (
    <>
      <div>
        <label>Ajavahemik:</label>
        <input type="date" id="start" name="start" />
        <input type="date" id="end" name="end" />
        <label>Asukoht</label>
        <select id="location" name="location">
          <option value="EE">Eesti</option>
          <option value="LV">Läti</option>
          <option value="FI">Soome</option>
        </select>
        <button onClick={getDataset}>Lae andmed</button>
      </div>

      <LineChart
        dataset={data}
        xAxis={[{ dataKey: 'date', scaleType: 'time' }]}
        yAxis={[{ label: '€/MWh' }]}
        series={[{ dataKey: 'price', label: 'Electricity Price' }]}
        height={300}
        grid={{ vertical: true, horizontal: true }}
      />

      <BarChart
        dataset={averages}
        xAxis={[{
          scaleType: 'band',
          dataKey: 'date',
          valueFormatter: (value) => new Date(value).toLocaleDateString(),
        }]}
        series={[{ dataKey: 'price', label: 'Average Price (€/MWh)' }]}
        height={300}
        grid={{ vertical: true, horizontal: true }}
      />

      <BarChart
        dataset={regionAvg}
        xAxis={[{ scaleType: 'band', dataKey: 'location' }]}
        series={[{ dataKey: 'price', label: 'Average Price (€/MWh)' }]}
        height={300}
        grid={{ vertical: true, horizontal: true }}
      />

      <LineChart
        dataset={allRegionsData}
        xAxis={[{ dataKey: 'date', scaleType: 'time' }]}
        yAxis={[{ label: '€/MWh' }]}
        series={[
          { dataKey: 'EE', label: 'EE' },
          { dataKey: 'LV', label: 'LV' },
          { dataKey: 'FI', label: 'FI' },
        ]}
        height={300}
        grid={{ vertical: true, horizontal: true }}
      />
    </>
  );
}

export default Dashboard;