import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Function to format salary values
const formatSalary = (value, currency) => {
  const symbol = currency === 'USD' ? 'USD' : 'INR';
  if (currency === 'USD') {
    value = value / 82; // Assuming 1 USD = 82 INR
  }
  if (value >= 1000000) {
    return symbol + (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return symbol + (value / 1000).toFixed(0) + 'K';
  }
  return symbol + value.toString();
};

const HorizontalBarChart = () => {
  const [currency, setCurrency] = useState('INR');
  const chartRef = useRef(null);

  const dataValues = [
    [1300000, 1500000, 2000000, 2500000, 3300000], // Senior: 10th, 30th, 50th, 70th, 90th
    [700000, 900000, 1200000, 1500000, 1900000], // Mid: 10th, 30th, 50th, 70th, 90th
    [300000, 500000, 700000, 900000, 1100000] // Junior: 10th, 30th, 50th, 70th, 90th
  ];

  const labels = ['Senior', 'Mid', 'Junior'];
  const maxValues = [3400000, 3400000, 3400000]; // Maximum value for each bar
  const minValues = [300000, 300000, 300000]; // Minimum value for each bar

  const convertValues = (values, currency) => {
    return values.map(value => (currency === 'USD' ? value / 82 : value));
  };

  const data = useCallback(() => ({
    labels: labels,
    datasets: [
      {
        label: 'Salary',
        data: maxValues,
        backgroundColor: function(context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return null;
          }
          const index = context.dataIndex;
          const [tenth, thirtieth, fiftieth, seventieth, ninetieth] = dataValues[index];
          const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);

          // Calculate the positions of the percentiles as a fraction of the max value
          const minPos = minValues[index] / maxValues[index];
          const tenthPos = tenth / maxValues[index];
          const thirtiethPos = thirtieth / maxValues[index];
          const fiftiethPos = fiftieth / maxValues[index];
          const seventiethPos = seventieth / maxValues[index];
          const ninetiethPos = ninetieth / maxValues[index];
          const maxPos = 1;

          // Add color stops for the gradient
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(minPos, 'transparent');
          gradient.addColorStop(minPos, '#D9EBFB');
          gradient.addColorStop(tenthPos - 0.00, '#005dff');
          gradient.addColorStop(tenthPos, '#005dff');
          gradient.addColorStop(thirtiethPos - 0.001, '#005dff');
          gradient.addColorStop(thirtiethPos, '#005dff');
          gradient.addColorStop(fiftiethPos - 0.001, '#005dff');
          gradient.addColorStop(fiftiethPos, '#005dff');
          gradient.addColorStop(seventiethPos - 0.001, '#005dff');
          gradient.addColorStop(seventiethPos, '#005dff');
          gradient.addColorStop(ninetiethPos - 0.001, '#005dff');
          gradient.addColorStop(ninetiethPos, '#005dff');
          gradient.addColorStop(ninetiethPos + 0.025, '#D9EBFB');
          gradient.addColorStop(maxPos, '#D9EBFB');
          gradient.addColorStop(maxPos, 'transparent');

          return gradient;
        },
        barThickness: 5,
        minBarLength: minValues[0],
        borderRadius: {
          topLeft: 10,
          topRight: 10,
          bottomLeft: 10,
          bottomRight: 10,
        },
      },
      {
        type: 'scatter',
        label: '10th Percentile',
        data: dataValues.map((values, index) => ({ x: convertValues(values, currency)[0], y: index })),
        backgroundColor: '#005dff',
        borderColor: '#005dff',
        pointRadius: 8,
        pointHoverRadius: 10,
      },
      {
        type: 'scatter',
        label: '30th Percentile',
        data: dataValues.map((values, index) =>   ({ x: convertValues([values[1]], currency)[0], y: index })),        
        backgroundColor: '#005dff',
        borderColor: '#005dff',
        pointRadius: 1,
        pointHoverRadius: 10,
      },
      {
        type: 'scatter',
        label: '50th Percentile',
        data: dataValues.map((values, index) => ({ x: convertValues(values, currency)[2], y: index })),
        backgroundColor: '#005dff',
        borderColor: '#005dff',
        pointRadius: 8,
        pointHoverRadius: 10,
      },
      {
        type: 'scatter',
        label: '70th Percentile',
        data: dataValues.map((values, index) => ({ x: convertValues([values[3]], currency)[0], y: index })),
        backgroundColor: '#005dff',
        borderColor: '#005dff',
        pointRadius: 1,
        pointHoverRadius: 10,
      },
      {
        type: 'scatter',
        label: '90th Percentile',
        data: dataValues.map((values, index) => ({ x: convertValues(values, currency)[4], y: index })),
        backgroundColor: '#005dff',
        borderColor: '#005dff',
        pointRadius: 8,
        pointHoverRadius: 10,
      }
    ],
  }), [currency]);
  
  const verticalTickPlugin = {
    id: 'verticalTickPlugin',
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const xAxis = chart.scales.x;
      const yAxis = chart.scales.y;
      const barThickness = chart.config.data.datasets[0].barThickness;
      const tickHeight = barThickness * 2; // Height of the tick line
  
      ctx.save();
      ctx.strokeStyle = '#005dff';
      ctx.lineWidth = 2;
  
      // Draw vertical ticks for both INR and USD
      dataValues.forEach((values, index) => {
        [1, 3].forEach(percentileIndex => {
          // Draw tick for INR
          let inrValue = values[percentileIndex];
          if (inrValue > 0) {
            const inrX = xAxis.getPixelForValue(inrValue);
            const y = yAxis.getPixelForTick(index);
            
            if (inrX >= xAxis.left && inrX <= xAxis.right) {
              ctx.beginPath();
              ctx.moveTo(inrX, y - tickHeight / 2);
              ctx.lineTo(inrX, y + tickHeight / 2);
              ctx.stroke();
            }
          }
  
          // Draw tick for USD
          let usdValue = inrValue / 82; // Convert to USD
          if (usdValue > 0) {
            const usdX = xAxis.getPixelForValue(usdValue);
            const y = yAxis.getPixelForTick(index);
            
            if (usdX >= xAxis.left && usdX <= xAxis.right) {
              ctx.beginPath();
              ctx.moveTo(usdX, y - tickHeight / 2);
              ctx.lineTo(usdX, y + tickHeight / 2);
              ctx.stroke();
            }
          }
        });
      });
  
      ctx.restore();
    }
  };

  const options = useCallback(() => ({
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        min: 0,
        max: currency === 'USD' ? Math.round(3400000 / 82) : 3400000,
        ticks: {
          stepSize: currency === 'USD' ? Math.round(800000 / 82) : 800000,
          callback: function (value) {
            if (currency === 'USD') {
              value = value * 82; // Convert back to INR for formatting
            }
            return `${formatSalary(value, currency)}`;
          },
          color: 'black',
        },
        grid: {
          display: false,
        },
        border: {
          color: 'white',
        },
        title: {
          display: true,
          text: `Salary (${currency})`,
          font: {
            family: 'Onest',
            size: 18,
          },
          color: 'white',
        },
      },
      y: {
        ticks: {
          display: true,
          font: {
            family: 'Onest',
            size: 18,
          },
        },
        grid: {
          display: false,
        },
        border: {
          color: 'white',
        },
        title: {
          display: false,
          text: 'Position',
          font: {
            family: 'Onest',
            size: 18,
          },
        },
        barPercentage: 0.3,
        categoryPercentage: 0.8,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        yAlign:'top',
        mode: 'nearest',
        intersect: false,
        filter: function(tooltipItem) {
          return tooltipItem.dataset.type === 'scatter';
        },displayColors:false,
       
        callbacks: {
          //remember if you comment out this then automatically fromdefault the labels will be the title
          title: function(tooltipItems) {
            const datasetIndex = tooltipItems[0].datasetIndex;
            if (datasetIndex === 1) return '10th ';
            if (datasetIndex === 2) return '30th ';
            if (datasetIndex === 3) return '50th ';
            if (datasetIndex === 4) return '70th ';
            if (datasetIndex === 5) return '90th ';
            return '';
          },
          
          label: function(context) {
            const datasetIndex = context.datasetIndex;
            const index = context.dataIndex;
            const values = dataValues[index];
            if (!values) return '';
            const [tenth, thirtieth, fiftieth, seventieth, ninetieth] = values;

            if (datasetIndex === 1) {
              return `Percentile: ${formatSalary(tenth, currency)}`;
            } else if (datasetIndex === 2) {
              return `Percentile: ${formatSalary(thirtieth, currency)}`;
            } else if (datasetIndex === 3) {
              return `Percentile: ${formatSalary(fiftieth, currency)}`;
            } else if (datasetIndex === 4) {
              return `Percentile: ${formatSalary(seventieth, currency)}`;
            } else if (datasetIndex === 5) {
              return `Percentile: ${formatSalary(ninetieth, currency)}`;
            }
            
          },
          
        },
        titleFont: {
          family: 'Onest',
          size: 18,
        },
        bodyFont: {
          family: 'Onest',
          size: 18,
        },
      },
      datalabels: {
        color: 'black',
        font: { weight: 'bold', size: 12 },
        formatter: function(value, context) {
          if (context.datasetIndex === 0) return ''; // Don't show labels for the bar
          const salaryValue = value.x;
          const currentCurrency = context.chart.options.scales.x.title.text.includes('USD') ? 'USD' : 'INR';

          if (currentCurrency === 'USD') {
            const usdValue = salaryValue; // Convert to USD

            if (usdValue >= 1000000) {
              return 'USD ' + (usdValue / 1000000).toFixed(1) + 'M';
            } else {
              return 'USD ' + (usdValue / 1000).toFixed(0) + 'K';
            }
          } else {
            if (salaryValue >= 1000000) {
              return 'INR ' + (salaryValue / 1000000).toFixed(1) + 'M';
            } else {
              return 'INR ' + (salaryValue / 1000).toFixed(0) + 'K';
            }
          }
        },
        anchor: 'end',
        align: 'top',
        display: function(context) {
          return context.datasetIndex === 1 || context.datasetIndex === 3 || context.datasetIndex === 5;
        },
      },
      verticalTickPlugin, // Register the custom vertical tick plugin
    },
    hover: {
      mode: null, // Disable hover on bars
    },
  }), [currency]);

  const CurrencyButton = ({ value }) => {
    const isActive = currency === value;
    return (
      <button 
        onClick={() => setCurrency(value)}
        style={{
          padding: '7.5px 15px',
          backgroundColor: isActive ? '#005dff' : '#fff',
          color: isActive ? '#fff' : '#000',
          border: '1px solid #005dff',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'Onest',
          fontSize: '12px',
          marginRight: '10px',
        }}
      >
        {value}
      </button>
    );
  };

  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      chart.data = data();
      chart.options = options();
      chart.update();
    }
  }, [currency, data, options]);

  return (
    <div className="chart-container" style={{ 
      backgroundColor: '#FDFEFE',  
      borderRadius: '8px', 
      height: '300px', 
      padding: '30px',
      position: 'relative'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#005dff', fontFamily: 'Onest', marginBottom: '10px' }}>
          Annual Salary Range for Full Stack Developers in India
        </h2>
        <div>
          <CurrencyButton value="INR" />
          <CurrencyButton value="USD" />
        </div>
      </div>
      <Bar 
        data={data()} 
        options={options()} 
        plugins={[ChartDataLabels, verticalTickPlugin]}
        ref={chartRef}
      />
    </div>
  );
};

export default HorizontalBarChart;
