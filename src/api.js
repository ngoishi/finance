import axios from 'axios';

const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

export const fetchData = async () => {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A:L`,
      {
        params: {
          key: API_KEY
        }
      }
    );

    const [headers, ...rows] = response.data.values;

    return rows.map(row => {
      const obj = { Date: row[0] };
      for (let i = 1; i < headers.length; i++) {
        obj[headers[i]] = parseFloat(row[i]);
      }
      return obj;
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    return [];
  }
};