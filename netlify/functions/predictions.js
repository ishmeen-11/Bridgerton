/* ─── Netlify Function: /api/predictions ─── */
const store = require('./utils/store');

exports.handler = async (event) => {
    if (event.httpMethod === 'GET') {
        const predictions = await store.getPredictions();
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ predictions: predictions || [] }),
        };
    }

    if (event.httpMethod === 'POST') {
        const { name, prediction, category } = JSON.parse(event.body || '{}');

        if (!prediction || prediction.trim().length === 0) {
            return { statusCode: 400, body: JSON.stringify({ error: 'A prediction is required, Your Grace.' }) };
        }

        const entry = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            name: name?.trim() || 'Anonymous Oracle',
            prediction: prediction.trim(),
            category: category || 'general',
            created_at: new Date().toISOString(),
            correct: null, // null = pending, true = correct, false = wrong
        };

        await store.addPrediction(entry);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, entry }),
        };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
