/* ========================================
   Netlify Blobs — Data Store
   Handles invitations, messages, polls, tea spills, predictions
   ======================================== */

const { getStore } = require('@netlify/blobs');

const INVITATIONS_KEY = 'invitations';
const MESSAGES_KEY = 'messages';
const POLLS_KEY = 'polls';
const TEASPILLS_KEY = 'teaspills';
const PREDICTIONS_KEY = 'predictions';

// Get a configured blob store
function getBlobStore() {
    const config = { name: 'bridgerton-data' };
    if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_TOKEN) {
        config.siteID = process.env.NETLIFY_SITE_ID;
        config.token = process.env.NETLIFY_TOKEN;
    }
    return getStore(config);
}

// ─── Invitation helpers ──────────────────────────────────

async function getAllInvitations() {
    const store = getBlobStore();
    const data = await store.get(INVITATIONS_KEY);
    return data ? JSON.parse(data) : [];
}

async function saveAllInvitations(invitations) {
    const store = getBlobStore();
    await store.set(INVITATIONS_KEY, JSON.stringify(invitations));
}

async function createInvitation(code, email, name) {
    const invitations = await getAllInvitations();
    invitations.unshift({ code, email, name: name || '', used: 0, created_at: new Date().toISOString() });
    await saveAllInvitations(invitations);
}

async function findInvitationByCode(code) {
    const invitations = await getAllInvitations();
    return invitations.find(inv => inv.code === code) || null;
}

async function markInvitationUsed(code) {
    const invitations = await getAllInvitations();
    const inv = invitations.find(i => i.code === code);
    if (inv) { inv.used = 1; await saveAllInvitations(invitations); }
}

// ─── Message helpers ─────────────────────────────────────

async function getRecentMessages(limit = 100) {
    const store = getBlobStore();
    const data = await store.get(MESSAGES_KEY);
    const messages = data ? JSON.parse(data) : [];
    return messages.slice(-limit);
}

async function saveMessage(senderName, inviteCode, content) {
    const store = getBlobStore();
    const data = await store.get(MESSAGES_KEY);
    const messages = data ? JSON.parse(data) : [];
    messages.push({ sender_name: senderName, invite_code: inviteCode, content, created_at: new Date().toISOString() });
    if (messages.length > 500) messages.splice(0, messages.length - 500);
    await store.set(MESSAGES_KEY, JSON.stringify(messages));
}

// ─── Polls helpers ───────────────────────────────────────

async function getPolls() {
    const store = getBlobStore();
    const data = await store.get(POLLS_KEY);
    return data ? JSON.parse(data) : null;
}

async function savePolls(polls) {
    const store = getBlobStore();
    await store.set(POLLS_KEY, JSON.stringify(polls));
}

// ─── Tea Spill helpers ───────────────────────────────────

async function getTeaSpills() {
    const store = getBlobStore();
    const data = await store.get(TEASPILLS_KEY);
    return data ? JSON.parse(data) : [];
}

async function addTeaSpill(entry) {
    const entries = await getTeaSpills();
    entries.unshift(entry);
    if (entries.length > 200) entries.splice(200);
    const store = getBlobStore();
    await store.set(TEASPILLS_KEY, JSON.stringify(entries));
}

// ─── Prediction helpers ──────────────────────────────────

async function getPredictions() {
    const store = getBlobStore();
    const data = await store.get(PREDICTIONS_KEY);
    return data ? JSON.parse(data) : [];
}

async function addPrediction(entry) {
    const predictions = await getPredictions();
    predictions.unshift(entry);
    if (predictions.length > 200) predictions.splice(200);
    const store = getBlobStore();
    await store.set(PREDICTIONS_KEY, JSON.stringify(predictions));
}

module.exports = {
    getAllInvitations, createInvitation, findInvitationByCode, markInvitationUsed,
    getRecentMessages, saveMessage,
    getPolls, savePolls,
    getTeaSpills, addTeaSpill,
    getPredictions, addPrediction,
};
