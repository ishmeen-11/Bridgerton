/* ─── Netlify Function: /api/teaspill ─── */
const store = require('./utils/store');

exports.handler = async (event) => {
    if (event.httpMethod === 'GET') {
        const entries = await store.getTeaSpills();
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entries: entries || [] }),
        };
    }

    if (event.httpMethod === 'POST') {
        const { content, alias } = JSON.parse(event.body || '{}');

        if (!content || content.trim().length === 0) {
            return { statusCode: 400, body: JSON.stringify({ error: 'One cannot spill empty tea, darling.' }) };
        }

        if (content.trim().length > 500) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Even Lady Whistledown keeps her columns under 500 characters.' }) };
        }

        const entry = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            content: content.trim(),
            alias: alias?.trim() || 'Anonymous Member of the Ton',
            created_at: new Date().toISOString(),
            likes: 0,
        };

        await store.addTeaSpill(entry);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, entry }),
        };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
