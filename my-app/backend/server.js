const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const OpenAI = require('openai');
const speakeasy = require('speakeasy'); // For generating and verifying 2FA codes

dotenv.config();

const app = express();
const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_API, // Ensure this matches your .env
});

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:3000" // Change to your React app's URL
}));

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
        user: process.env.EMAIL_USER, // Use environment variables for sensitive info
        pass: process.env.EMAIL_PASS, // Use environment variables for sensitive info
    },
});
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Replace '*' with specific domain for production
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
// Store user data temporarily for 2FA (consider a database for production)
let userTwoFactorData = {};

// Utility function to send emails
const sendMail = (to, subject, text) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return reject('Error sending email');
            }
            console.log('Email sent:', info.response);
            resolve('Email sent successfully');
        });
    });
};

// Example route to handle newsletter subscription
app.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    // Basic email validation
    if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    try {
        // Sending welcome email
        await sendMail(email, 'Welcome to the Newsletter!', 'Thank you for subscribing to our newsletter!');
        res.json({ success: true, message: 'Subscription successful! Welcome email sent.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error });
    }
});

// Endpoint to send 2FA code
app.post('/send-2fa-code', async (req, res) => {
    const { email } = req.body;

    // Generate a 2FA secret
    const secret = speakeasy.generateSecret({ length: 20 });
    
    // Store the secret for the user (in production, use a database)
    userTwoFactorData[email] = { secret: secret.base32 };

    const code = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
    });
    

    try {
        await sendMail(email, 'Your 2FA Code', `Your 2FA code is: ${code}`);
        console.log(code);
        res.status(200).send('2FA code sent');
    } catch (error) {
        return res.status(500).send(error);
    }
});

app.post('/verify-2fa-code', (req, res) => {
    const { email, token } = req.body;
    const userData = userTwoFactorData[email];

    if (!userData) {
        console.log(`Invalid email or token for ${email}`);
        return res.status(400).send('Invalid email or token');
    }

    const verified = speakeasy.totp.verify({
        secret: userData.secret,
        encoding: 'base32',
        token: token,
        window: 1 // Allow for a small window of time
    });

    if (verified) {
        delete userTwoFactorData[email]; // Remove the data after verification
        console.log(`2FA verification successful for ${email}`);
        return res.status(200).json({ success: true, message: "2FA verification successful" });

    } else {
        console.log(`Invalid 2FA token for ${email}`);
        return res.status(400).send('Invalid 2FA token');
    }
});

// OpenAI chat endpoint
app.post("/chat", async (req, res) => {
    const { prompt } = req.body;
    console.log("Prompt sent to OpenAI:", prompt);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // or "gpt-4"
            messages: [{ role: "user", content: prompt }],
        });
        const responseMessage = completion.choices[0].message.content;
        res.json({ message: responseMessage });
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
