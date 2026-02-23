/* ─── Netlify Function: /api/chat-send ─── */
const store = require('./utils/store');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const { code, name, content } = JSON.parse(event.body || '{}');

    if (!code || !name || !content) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields.' }) };
    }

    // Validate invitation code
    const invitation = await store.findInvitationByCode(code.toUpperCase().trim());
    if (!invitation) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Invalid invitation code.' }) };
    }

    // Save message
    await store.saveMessage(name, code.toUpperCase().trim(), content);

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true }),
    };
};
