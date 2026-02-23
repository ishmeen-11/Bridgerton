/* ─── Netlify Function: /api/invite ─── */
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const store = require('./utils/store');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const { adminKey, email, guestName } = JSON.parse(event.body || '{}');
    const ADMIN_KEY = process.env.ADMIN_KEY || 'bridgerton2026';

    if (adminKey !== ADMIN_KEY) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Incorrect admin key, darling. The Queen does not approve.' }) };
    }

    if (!email) {
        return { statusCode: 400, body: JSON.stringify({ error: 'An email address is required to send a royal invitation.' }) };
    }

    const code = uuidv4().split('-')[0].toUpperCase();

    try {
        await store.createInvitation(code, email, guestName || '');
    } catch (err) {
        console.error('❌ Failed to create invitation:', err.message, err.stack);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to create invitation: ' + err.message }) };
    }

    // Try sending email via SMTP
    let emailSent = false;
    let emailError = null;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            const smtpPort = parseInt(process.env.SMTP_PORT || '587');
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 15000,
            });

            await transporter.sendMail({
                from: `"The Queen's Court 👑" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to: email,
                subject: '👑 You Are Cordially Invited to the Queen\'s Chamber — Bridgerton Watch Party',
                html: `
                    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0e1225; color: #faf6ef; padding: 40px; border-radius: 16px; border: 1px solid rgba(201,168,76,0.3);">
                        <h1 style="font-family: Georgia, serif; text-align: center; color: #d4af37; font-size: 28px;">✦ ❦ ✦</h1>
                        <h2 style="font-family: Georgia, serif; text-align: center; color: #faf6ef; font-size: 22px;">A Royal Invitation</h2>
                        <p style="text-align: center; color: #e8c4c8; font-style: italic; font-size: 14px;">From the Bridgerton Watch Party Court</p>
                        <hr style="border: none; border-top: 1px solid rgba(201,168,76,0.3); margin: 24px 0;" />
                        <p style="font-size: 16px; line-height: 1.8;">
                            Dearest <strong style="color: #d4af37;">${guestName || 'Esteemed Guest'}</strong>,
                        </p>
                        <p style="font-size: 16px; line-height: 1.8;">
                            You have been personally selected to join the most exclusive gathering in all the ton — 
                            <strong style="color: #d4af37;">The Queen's Chamber</strong>, a gossip room of the highest order.
                        </p>
                        <p style="font-size: 16px; line-height: 1.8;">
                            There shall be <em>wine</em>, there shall be <em>tea</em>, and most importantly — 
                            there shall be <strong>gossip</strong> that would make Lady Whistledown herself blush. 🍷
                        </p>
                        <div style="text-align: center; margin: 30px 0; padding: 20px; background: rgba(201,168,76,0.1); border-radius: 12px; border: 1px solid rgba(201,168,76,0.25);">
                            <p style="font-size: 14px; color: #c4b4d4; margin-bottom: 8px;">Your Royal Invitation Code</p>
                            <p style="font-size: 32px; font-weight: bold; color: #d4af37; letter-spacing: 0.15em; margin: 0;">${code}</p>
                        </div>
                        <p style="font-size: 16px; line-height: 1.8;">
                            Present this code at the gates of the Queen's Chamber to gain entry. 
                            Guard it with your life — only the chosen may enter.
                        </p>
                        <hr style="border: none; border-top: 1px solid rgba(201,168,76,0.3); margin: 24px 0;" />
                        <p style="text-align: center; font-style: italic; color: rgba(250,246,239,0.6); font-size: 14px;">
                            "One does not simply refuse a royal invitation." — The Queen 👑
                        </p>
                    </div>
                `,
            });
            emailSent = true;
        } catch (err) {
            console.error('❌ Email send FAILED:', err.message);
            emailError = err.message;
        }
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            success: true,
            code,
            emailSent,
            smtpDebug: {
                hasUser: !!process.env.SMTP_USER,
                hasPass: !!process.env.SMTP_PASS,
                host: process.env.SMTP_HOST || '(not set)',
                port: process.env.SMTP_PORT || '(not set)',
                error: emailError || null,
            },
            message: emailSent
                ? `Invitation sent to ${email} with code ${code}!`
                : `Invitation created with code ${code} (email not configured — share the code manually).`,
        }),
    };
};
