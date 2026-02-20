/* ========================================
   Bridgerton Watch Party — Express Server
   ======================================== */

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'bridgerton-admin-2026';

// ─── Middleware ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Email transporter ──────────────────────────────────
let transporter;
try {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
} catch (err) {
    console.warn('⚠  Email transporter not configured. Invitations will be created but emails won\'t send.');
}

// ─── Admin: Send Invitation ─────────────────────────────
app.post('/api/invite', async (req, res) => {
    const { adminKey, email, guestName } = req.body;

    if (adminKey !== ADMIN_KEY) {
        return res.status(403).json({ error: 'Incorrect admin key, darling. The Queen does not approve.' });
    }

    if (!email) {
        return res.status(400).json({ error: 'An email address is required to send a royal invitation.' });
    }

    const code = uuidv4().split('-')[0].toUpperCase();

    try {
        db.createInvitation(code, email, guestName || '');
    } catch (err) {
        return res.status(500).json({ error: 'Failed to create invitation.' });
    }

    // Try sending email
    let emailSent = false;
    if (transporter && process.env.SMTP_USER && process.env.SMTP_PASS !== 'your-gmail-app-password') {
        try {
            await transporter.sendMail({
                from: `"The Queen's Court 👑" <${process.env.SMTP_USER}>`,
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
            console.error('Email send error:', err.message);
        }
    }

    res.json({
        success: true,
        code,
        emailSent,
        message: emailSent
            ? `Invitation sent to ${email} with code ${code}!`
            : `Invitation created with code ${code} (email not configured — share the code manually).`,
    });
});

// ─── Get all invitations (admin) ─────────────────────────
app.post('/api/invitations', (req, res) => {
    const { adminKey } = req.body;
    if (adminKey !== ADMIN_KEY) {
        return res.status(403).json({ error: 'Unauthorized.' });
    }
    const invitations = db.getAllInvitations();
    res.json({ invitations });
});

// ─── Validate invitation code ────────────────────────────
app.post('/api/validate-code', (req, res) => {
    const { code, name } = req.body;

    if (!code || !name) {
        return res.status(400).json({ error: 'Both your name and invitation code are required.' });
    }

    const invitation = db.findInvitationByCode(code.toUpperCase().trim());

    if (!invitation) {
        return res.status(404).json({ error: 'This invitation code is not recognized by the court. Check your letter again, darling.' });
    }

    // Mark as used if first time
    if (!invitation.used) {
        db.markInvitationUsed(code.toUpperCase().trim());
    }

    res.json({
        success: true,
        name,
        code: invitation.code,
        message: `Welcome to the Queen\'s Chamber, ${name}! 👑`,
    });
});

// ─── Chat history ────────────────────────────────────────
app.post('/api/messages', (req, res) => {
    const { code } = req.body;
    const invitation = db.findInvitationByCode((code || '').toUpperCase().trim());
    if (!invitation) {
        return res.status(403).json({ error: 'Invalid code.' });
    }
    const messages = db.getRecentMessages(100);
    res.json({ messages });
});

// ─── Socket.io — Real-time Chat ─────────────────────────
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);

    socket.on('join-chamber', ({ name, code }) => {
        const invitation = db.findInvitationByCode((code || '').toUpperCase().trim());
        if (!invitation) {
            socket.emit('error-msg', 'Invalid invitation code.');
            return;
        }

        socket.data.name = name;
        socket.data.code = code;
        onlineUsers.set(socket.id, name);

        socket.join('queens-chamber');

        // Broadcast updated online list
        io.to('queens-chamber').emit('online-users', Array.from(onlineUsers.values()));

        // System message
        io.to('queens-chamber').emit('chat-message', {
            sender_name: '👑 The Court Herald',
            content: `${name} has entered the Queen's Chamber. Let the gossip commence! 🍷`,
            created_at: new Date().toISOString(),
            system: true,
        });
    });

    socket.on('send-message', ({ content }) => {
        if (!socket.data.name || !socket.data.code) return;

        const msg = {
            sender_name: socket.data.name,
            invite_code: socket.data.code,
            content,
            created_at: new Date().toISOString(),
        };

        db.saveMessage(msg.sender_name, msg.invite_code, msg.content);
        io.to('queens-chamber').emit('chat-message', msg);
    });

    socket.on('disconnect', () => {
        const name = onlineUsers.get(socket.id);
        onlineUsers.delete(socket.id);

        if (name) {
            io.to('queens-chamber').emit('online-users', Array.from(onlineUsers.values()));
            io.to('queens-chamber').emit('chat-message', {
                sender_name: '👑 The Court Herald',
                content: `${name} has departed the Queen's Chamber. How mysterious... 👀`,
                created_at: new Date().toISOString(),
                system: true,
            });
        }
    });
});

// ─── Start ───────────────────────────────────────────────
// Initialize db on startup
db.getDb();

server.listen(PORT, () => {
    console.log(`\n  👑 Bridgerton Watch Party Server\n`);
    console.log(`  🏰 Home:           http://localhost:${PORT}`);
    console.log(`  🔑 Admin Panel:    http://localhost:${PORT}/admin.html`);
    console.log(`  💬 Queen's Chamber: http://localhost:${PORT}/chamber.html`);
    console.log(`  🔐 Admin Key:      ${ADMIN_KEY}\n`);
});
