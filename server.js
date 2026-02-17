import express from "express";
import cors from "cors";
import { Resend } from "resend";
import rateLimit from "express-rate-limit";
import validator from "validator";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

// Permissive CORS to allow frontend to communicate with backend
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

// --- ANTI-SPAM LAYER 1: RATE LIMITING ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // max 5 submissions per IP per 15 min
    message: { ok: false, error: "TOO_MANY_REQUESTS" }
});

// Apply rate limiting to the ignition route
app.use("/ignition", limiter);

// --- RESEND SETUP ---
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ name, email, plan, message }) {
    return await resend.emails.send({
        from: "BKeeprs Labs <onboarding@resend.dev>",
        to: ["contact.bkeeprslabs@gmail.com"],
        reply_to: email,
        subject: `New ENGAGE: ${name} (${plan})`,
        text: `New ENGAGE submission

Name: ${name}
Email: ${email}
Plan: ${plan}

Message:
${message}
`
    });
}

// --- HEALTH CHECK (for uptime monitoring) ---
app.get("/health", (req, res) => {
    return res.status(200).send("ok");
});

// --- MAIN EMAIL ENDPOINT ---
app.post("/ignition", async (req, res) => {
    try {
        const { name, email, plan, message, company, phone } = req.body;

        // --- ANTI-SPAM LAYER 2: HONEYPOT ---
        // Bots usually fill hidden fields. Real users don't.
        if (company && company.trim() !== "") {
            console.warn("Spam detected via honeypot (company field).");
            return res.status(400).json({ ok: false, error: "SPAM_DETECTED" });
        }

        // Field validation
        if (!name || !email || !plan || !message) {
            return res.status(400).json({ ok: false, error: "MISSING_FIELDS" });
        }

        // Email validation
        if (!validator.isEmail(email)) {
            return res.status(400).json({ ok: false, error: "INVALID_EMAIL" });
        }

        // Send email in the background (Fast Response)
        sendEmail({
            name,
            email,
            plan,
            message: message + (phone ? `\n\nPhone: ${phone}` : "")
        }).then(result => {
            if (result.error) {
                console.error("Delayed Resend error:", result.error);
            } else {
                console.log("Email sent successfully in background");
            }
        }).catch(err => {
            console.error("Background Email Exception:", err);
        });

        // Respond to user immediately
        return res.status(200).json({ ok: true });

    } catch (err) {
        console.error("SERVER ERROR:", err);
        return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
    }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Resend Backend running on port ${PORT}`);
});
