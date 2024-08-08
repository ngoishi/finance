import axios from 'axios';

// 環境変数から値を取得し、余分な文字を取り除く
const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID?.replace(/[';]/g, '');
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY?.replace(/[';]/g, '');

export const fetchData = async () => {
  try {
    console.log('Attempting to fetch data with:');
    console.log('SPREADSHEET_ID:', SPREADSHEET_ID);
    console.log('API_KEY:', API_KEY ? 'Set (not shown for security)' : 'Not set');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A:L`;
    console.log('Fetching from URL:', url);

    const response = await axios.get(url, {
      params: {
        key: API_KEY
      }
    });

    console.log('Response received:', response.status);
    console.log('Data sample:', response.data.values?.slice(0, 3));

    const [headers, ...rows] = response.data.values || [];

    return rows.map(row => {
      const obj = { Date: row[0] };
      for (let i = 1; i < headers.length; i++) {
        obj[headers[i]] = parseFloat(row[i]) || row[i];
      }
      return obj;
    });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};
