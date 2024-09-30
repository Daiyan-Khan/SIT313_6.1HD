const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors'); // To handle cross-origin requests from the frontend
const dotenv = require('dotenv');
const OpenAI = require('openai'); // Make sure this is the correct import
const axios = require('axios'); // Ensure axios is imported

dotenv.config();

const app = express();

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_API, // Ensure this matches your .env
});

// Middleware
app.use(bodyParser.json()); // To parse JSON body in requests
app.use(cors({
    origin: "http://localhost:3000" // Change to your React app's URL
}));

// Example route to handle newsletter subscription
app.post('/subscribe', (req, res) => {
    const { email } = req.body;

    // Basic email validation
    if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    // Sending welcome email (optional)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Access the email user from .env
            pass: process.env.EMAIL_PASS, // Access the email password from .env
        },
    });

    const mailOptions = {
        from: 'iamdaiyankhan@gmail.com',
        to: email,
        subject: 'Welcome to the Newsletter!',
        text: 'Thank you for subscribing to our newsletter!',
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ success: false, message: 'Failed to send welcome email.' });
        }

        res.json({ success: true, message: 'Subscription successful! Welcome email sent.' });
    });
});

app.post("/chat", async (req, res) => {
    const { prompt } = req.body;
    console.log("Prompt sent to OpenAI:", prompt);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // or "gpt-4"
            messages: [{ role: "user", content: prompt }],
        });
        const responseMessage = completion.choices[0].message.content;

        // Send the response as a JSON object
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
