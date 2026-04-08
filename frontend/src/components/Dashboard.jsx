import { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';

function Dashboard() {
  const [data, setData] = useState([]);
  const [averages, setAverages] = useState([]);

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
        const day = date.toISOString().split("T")[0];

        if (!grouped[day]) {
            grouped[day] = { sum: 0, count: 0 };
        }

        grouped[day].sum += price;
        grouped[day].count += 1;
        });

        const averages = Object.entries(grouped).map(([day, { sum, count }]) => ({
        date: new Date(day),
        price: Math.round((sum / count) * 100) / 100
        }));

        return averages;
  }


    const getDataset = async () => {
        const startInput = document.getElementById('start').value;
        const endInput = document.getElementById('end').value;
        const locationInput = document.getElementById('location').value;

        const response = await fetch(
          `http://localhost:3001/api/readings?start=${new Date(startInput).toISOString()}&end=${new Date(endInput).toISOString()}&location=${locationInput}`
        );
        const json = await response.json();

        const formatted = json.map((item) => ({
          date: new Date(item.timestamp),
          price: parseFloat(item.price_eur_mwh),
        }));

        setData(formatted);
        setAverages(getAverages(formatted));
        console.log(getAverages(formatted));
        console.log(formatted);
    }


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
      xAxis={[
        {
          dataKey: 'date',
          scaleType: 'time',
        },
      ]}
      yAxis={[
        {
          label: '€/MWh',
        },
      ]}
      series={[
        {
          dataKey: 'price',
          label: 'Electricity Price',
        },
      ]}
      height={300}
      grid={{ vertical: true, horizontal: true }}
    />

    <BarChart
    dataset={averages}
    xAxis={[
        {
        scaleType: 'band',
        dataKey: 'date',
        valueFormatter: (value) =>
            new Date(value).toLocaleDateString(),
        },
    ]}
    series={[
        {
        dataKey: 'price',
        label: 'Average Price (€/MWh)',
        },
    ]}
    height={300}
    grid={{ vertical: true, horizontal: true }}
    />

    </>
  );
}

export default Dashboard;