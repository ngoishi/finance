import axios from 'axios';

const SPREADSHEET_ID = '1hM9S0b9KH3UTpq7-94euWe2DKtZpnjCXqLLQrsp1USU';
const SHEET_NAME = 'シート1'; // 実際のシート名に変更してください
const RANGE = 'A:L'; // 必要に応じて範囲を調整してください
const API_KEY = 'AIzaSyDMBHEod0DX0IVbLbHbUiPxzON_fj_dbZU';

export const fetchData = async () => {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!${RANGE}`,
      {
        params: {
          key: API_KEY,
          valueRenderOption: 'UNFORMATTED_VALUE',
          dateTimeRenderOption: 'FORMATTED_STRING'
        }
      }
    );

    if (!response.data || !response.data.values || response.data.values.length < 2) {
      throw new Error('Invalid or empty response from Google Sheets API');
    }

    const [headers, ...rows] = response.data.values;

    return rows.map(row => {
      const obj = { Date: row[0] };
      for (let i = 1; i < headers.length; i++) {
        const value = parseFloat(row[i]);
        obj[headers[i]] = isNaN(value) ? null : value; // NaNを除外し、nullに置き換え
      }
      return obj;
    }).filter(row => Object.values(row).some(value => value !== null)); // 全ての値がnullの行を除外
  } catch (error) {
    console.error('Error fetching data:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      if (error.response.data && error.response.data.error) {
        console.error('Google Sheets API Error:', error.response.data.error.message);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};