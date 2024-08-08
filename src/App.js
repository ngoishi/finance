import React, { useState, useEffect, useMemo } from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { fetchData } from './api';
import './App.css';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale
);

const App = () => {
  const [data, setData] = useState([]);
  const [lineVar1, setLineVar1] = useState('10YDEY.B');
  const [lineVar2, setLineVar2] = useState('1YDEY.B');

  useEffect(() => {
    fetchData().then(setData).catch(console.error);
  }, []);

  const variables = {
    '10YDEY.B': 'ドイツ10年国債利回り',
    '1YDEY.B': 'ドイツ1年国債利回り',
    '1YUSY.B': '米国１年国債利回り',
    '10YUSY.B': '米国10年国債利回り',
    '1YJPY.B': '日本1年国債利回り',
    '10YJPY.B': '日本10年国債利回り',
    'USDJPY': 'ドル円為替レート',
    'EURJPY': 'ユーロ円為替レート',
    'CL=F': '原油価格（WTI）',
    'PL=F': 'プラチナ',
    'XAUUSD': '金 (ozt) / 米ドル',
    'US_SPREAD': '米国長短期金利差',
    'DE_SPREAD': 'ドイツ長短期金利差',
    'JP_SPREAD': '日本長短期金利差',
    'JP_US_SPREAD': '日米金利差',
    'JP_DE_SPREAD': '日独金利差'
  };

  const processedData = useMemo(() => {
    if (data.length === 0) return [];

    return data.map(item => {
      const calculateSpread = (long, short) => {
        const longRate = parseFloat(item[long]);
        const shortRate = parseFloat(item[short]);
        return (!isNaN(longRate) && !isNaN(shortRate)) ? longRate - shortRate : null;
      };

      const calculateCrossSpread = (country1, country2) => {
        const rate1 = parseFloat(item[country1]);
        const rate2 = parseFloat(item[country2]);
        return (!isNaN(rate1) && !isNaN(rate2)) ? rate1 - rate2 : null;
      };

      return {
        ...item,
        US_SPREAD: calculateSpread('10YUSY.B', '1YUSY.B'),
        DE_SPREAD: calculateSpread('10YDEY.B', '1YDEY.B'),
        JP_SPREAD: calculateSpread('10YJPY.B', '1YJPY.B'),
        JP_US_SPREAD: calculateCrossSpread('10YUSY.B', '10YJPY.B'),
        JP_DE_SPREAD: calculateCrossSpread('10YDEY.B', '10YJPY.B')
      };
    });
  }, [data]);

  const filteredData = useMemo(() => {
    return processedData.filter(item => 
      item[lineVar1] != null && item[lineVar2] != null &&
      !isNaN(parseFloat(item[lineVar1])) && !isNaN(parseFloat(item[lineVar2]))
    );
  }, [processedData, lineVar1, lineVar2]);

  const lineChartData = {
    datasets: [
      {
        label: variables[lineVar1],
        data: filteredData.map(item => ({x: new Date(item.Date), y: parseFloat(item[lineVar1])})),
        borderColor: 'rgb(75, 192, 192)',
        yAxisID: 'y',
        tension: 0.1
      },
      {
        label: variables[lineVar2],
        data: filteredData.map(item => ({x: new Date(item.Date), y: parseFloat(item[lineVar2])})),
        borderColor: 'rgb(255, 99, 132)',
        yAxisID: 'y1',
        tension: 0.1
      }
    ]
  };

  const scatterChartData = {
    datasets: [
      {
        label: 'データポイント',
        data: filteredData.map(item => ({ 
          x: parseFloat(item[lineVar1]), 
          y: parseFloat(item[lineVar2]),
          date: new Date(item.Date)
        })),
        backgroundColor: 'rgb(75, 192, 192)'
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: '',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null && !isNaN(context.parsed.y)) {
              label += context.parsed.y.toFixed(2);
            } else {
              label += 'N/A';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day'
        },
        title: {
          display: true,
          text: '日付'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: variables[lineVar1]
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: variables[lineVar2]
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '散布図',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataPoint = context.raw;
            return [
              `日付: ${dataPoint.date.toLocaleDateString()}`,
              `${variables[lineVar1]}: ${!isNaN(dataPoint.x) ? dataPoint.x.toFixed(2) : 'N/A'}`,
              `${variables[lineVar2]}: ${!isNaN(dataPoint.y) ? dataPoint.y.toFixed(2) : 'N/A'}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: variables[lineVar1]
        }
      },
      y: {
        title: {
          display: true,
          text: variables[lineVar2]
        }
      }
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Financial Data Visualization</h1>
      
      {/* Line Chart */}
      <div className="chart-container">
        <h2 className="chart-title">折れ線グラフ（主軸・副軸）</h2>
        <div className="select-container">
          <select 
            value={lineVar1} 
            onChange={(e) => setLineVar1(e.target.value)}
            className="variable-select"
          >
            {Object.entries(variables).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
          <select 
            value={lineVar2} 
            onChange={(e) => setLineVar2(e.target.value)}
            className="variable-select"
          >
            {Object.entries(variables).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
        <div className="chart-wrapper">
          <Line key={`line-${lineVar1}-${lineVar2}`} data={lineChartData} options={lineOptions} />
        </div>
      </div>

      {/* Scatter Plot */}
      <div className="chart-container">
        <h2 className="chart-title">散布図</h2>
        <div className="chart-wrapper">
          <Scatter key={`scatter-${lineVar1}-${lineVar2}`} data={scatterChartData} options={scatterOptions} />
        </div>
      </div>
    </div>
  );
};

export default App;