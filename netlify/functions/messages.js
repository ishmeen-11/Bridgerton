/* ─── Netlify Function: /api/messages ─── */
const store = require('./utils/store');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const { code } = JSON.parse(event.body || '{}');
    const invitation = await store.findInvitationByCode((code || '').toUpperCase().trim());

    if (!invitation) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Invalid code.' }) };
    }

    const messages = await store.getRecentMessages(100);

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
    };
};
