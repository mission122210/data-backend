const express = require("express")
const cors = require("cors")
const multer = require("multer")
const nodemailer = require("nodemailer")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// File storage setup
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    },
})
const upload = multer({ storage })

// Nodemailer config
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

// POST /send-email
app.post("/send-email", upload.single("pdf"), async (req, res) => {
    try {
        const { recipientEmail, subject, body } = req.body
        const attachment = req.file

        if (!recipientEmail || !subject || !body) {
            return res.status(400).json({ success: false, message: "Missing fields" })
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject,
            text: body,
            attachments: attachment
                ? [
                      {
                          filename: attachment.originalname,
                          path: attachment.path,
                      },
                  ]
                : [],
        }

        await transporter.sendMail(mailOptions)
        res.status(200).json({ success: true, message: "Email sent successfully" })
    } catch (error) {
        console.error("Email error:", error)
        res.status(500).json({ success: false, message: "Failed to send email" })
    }
})

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})
