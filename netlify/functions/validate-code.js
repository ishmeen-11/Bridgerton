/* ─── Netlify Function: /api/validate-code ─── */
const store = require('./utils/store');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const { code, name } = JSON.parse(event.body || '{}');

    if (!code || !name) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Both your name and invitation code are required.' }) };
    }

    const invitation = await store.findInvitationByCode(code.toUpperCase().trim());

    if (!invitation) {
        return { statusCode: 404, body: JSON.stringify({ error: 'This invitation code is not recognized by the court. Check your letter again, darling.' }) };
    }

    // Mark as used if first time
    if (!invitation.used) {
        await store.markInvitationUsed(code.toUpperCase().trim());
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            success: true,
            name,
            code: invitation.code,
            message: `Welcome to the Queen's Chamber, ${name}! 👑`,
        }),
    };
};
