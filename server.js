
const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Configure Brevo SMTP
const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY
    }
});

app.post("/subscribe", async (req, res) => {
    const email = req.body.email;

    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    const mailingList = path.join(__dirname, "mailing-list.txt");

    try {
        // Save subscriber to mailing list
        fs.appendFileSync(mailingList, email + "\n");

        // Prepare welcome email
        const mailOptions = {
            from: process.env.BREVO_SENDER,
            to: email,
            subject: "Welcome to Lav's Website",
            text: "Thank you for subscribing to my newsletter!"
        };

        // Send email using Brevo SMTP
        const info = await transporter.sendMail(mailOptions);

        console.log("Welcome email sent successfully");
        console.log("SMTP Response:", info.response);
        console.log("Message ID:", info.messageId);

        res.status(200).json({
            message: "Successfully subscribed! Welcome email sent.",
            response: info.response,
            messageId: info.messageId
        });

    } catch (error) {
        console.error("Email error:", error.message);

        res.status(500).json({
            message: "Subscription saved, but welcome email could not be sent."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
