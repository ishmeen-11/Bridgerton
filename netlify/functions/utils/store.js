/* ========================================
   Netlify Blobs — Data Store for Invitations & Messages
   Uses @netlify/blobs for persistent serverless storage
   ======================================== */

const { getStore } = require('@netlify/blobs');

const INVITATIONS_KEY = 'invitations';
const MESSAGES_KEY = 'messages';

// ─── Invitation helpers ──────────────────────────────────

async function getAllInvitations() {
    const store = getStore('bridgerton-data');
    const data = await store.get(INVITATIONS_KEY);
    return data ? JSON.parse(data) : [];
}

async function saveAllInvitations(invitations) {
    const store = getStore('bridgerton-data');
    await store.set(INVITATIONS_KEY, JSON.stringify(invitations));
}

async function createInvitation(code, email, name) {
    const invitations = await getAllInvitations();
    invitations.unshift({
        code,
        email,
        name: name || '',
        used: 0,
        created_at: new Date().toISOString(),
    });
    await saveAllInvitations(invitations);
}

async function findInvitationByCode(code) {
    const invitations = await getAllInvitations();
    return invitations.find(inv => inv.code === code) || null;
}

async function markInvitationUsed(code) {
    const invitations = await getAllInvitations();
    const inv = invitations.find(i => i.code === code);
    if (inv) {
        inv.used = 1;
        await saveAllInvitations(invitations);
    }
}

// ─── Message helpers ─────────────────────────────────────

async function getRecentMessages(limit = 100) {
    const store = getStore('bridgerton-data');
    const data = await store.get(MESSAGES_KEY);
    const messages = data ? JSON.parse(data) : [];
    return messages.slice(-limit);
}

async function saveMessage(senderName, inviteCode, content) {
    const store = getStore('bridgerton-data');
    const data = await store.get(MESSAGES_KEY);
    const messages = data ? JSON.parse(data) : [];
    messages.push({
        sender_name: senderName,
        invite_code: inviteCode,
        content,
        created_at: new Date().toISOString(),
    });
    // Keep only the last 500 messages
    if (messages.length > 500) {
        messages.splice(0, messages.length - 500);
    }
    await store.set(MESSAGES_KEY, JSON.stringify(messages));
}

module.exports = {
    getAllInvitations,
    createInvitation,
    findInvitationByCode,
    markInvitationUsed,
    getRecentMessages,
    saveMessage,
};
