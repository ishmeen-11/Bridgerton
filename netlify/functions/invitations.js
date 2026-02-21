/* ─── Netlify Function: /api/invitations ─── */
const store = require('./utils/store');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const { adminKey } = JSON.parse(event.body || '{}');
    const ADMIN_KEY = process.env.ADMIN_KEY || 'bridgerton-admin-2026';

    if (adminKey !== ADMIN_KEY) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Unauthorized.' }) };
    }

    const invitations = await store.getAllInvitations();

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitations }),
    };
};
