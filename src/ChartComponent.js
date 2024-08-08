import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const ChartComponent = ({ data, chartType, var1, var2 }) => {
  const CustomizedXAxis = (props) => <XAxis {...props} />;
  const CustomizedYAxis = (props) => <YAxis {...props} />;

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <CustomizedXAxis dataKey="Date" />
          <CustomizedYAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={var1} stroke="#8884d8" />
          <Line type="monotone" dataKey={var2} stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    );
  } else if (chartType === 'scatter') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid />
          <CustomizedXAxis dataKey={var1} name={var1} />
          <CustomizedYAxis dataKey={var2} name={var2} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="A school" data={data} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default ChartComponent;
