// /api/contact.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Installare dipendenza: npm i resend
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO = "info@lkr.mc"; // destinatario principale
const FROM = "LKR Website <onboarding@resend.dev>"; // mittente Resend di test

export default async function handler(req: VercelRequest, res: VercelResponse) {
if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

try {
const { name, email, phone = "", projectType = "", message } = req.body || {};

// Honeypot lato server (campo inesistente lato client, ma spazio per future estensioni)
if (typeof req.body?.company === "string" && req.body.company.trim() !== "") {
return res.status(200).json({ ok: true }); // Silenziosamente OK per i bot
}

if (!name || !email || !message) {
return res.status(400).json({ error: "Missing required fields" });
}

const subject = `Demande d'information • ${projectType || 'Projet'} • ${name}`;

const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
<h2 style="margin:0 0 8px;color:#dc3545">Nouveau message depuis le site lkr.mc</h2>
<p style="margin:0 0 8px"><strong>Nom:</strong> ${escapeHtml(name)}</p>
<p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(email)}</p>
<p style="margin:0 0 8px"><strong>Téléphone:</strong> ${escapeHtml(phone)}</p>
<p style="margin:0 0 8px"><strong>Projet:</strong> ${escapeHtml(projectType)}</p>
<hr style="border:none;border-top:1px solid #eee;margin:12px 0"/>
<p style="white-space:pre-wrap">${escapeHtml(message)}</p>
</div>
`;

const text = `Nouveau message depuis le site lkr.mc\n\n`+
`Nom: ${name}\n`+
`Email: ${email}\n`+
`Téléphone: ${phone}\n`+
`Projet: ${projectType}\n\n`+
`${message}`;

// Invio email
const result = await resend.emails.send({
from: FROM,
to: [TO],
reply_to: email,
subject,
html,
text,
});

if (result.error) {
console.error(result.error);
return res.status(500).json({ error: "Mail provider error" });
}

return res.status(200).json({ ok: true });
} catch (err) {
console.error(err);
return res.status(500).json({ error: "Server error" });
}
}

function escapeHtml(input: string = ""): string {
return input
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}