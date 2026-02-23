/* ─── Netlify Function: /api/translate ─── */

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const { text } = JSON.parse(event.body || '{}');

    if (!text || text.trim().length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Please provide text to translate, darling.' }) };
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'The royal translator is on holiday. (GROQ_API_KEY not configured)' }),
        };
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: `You are a Regency-era English translator, inspired by the world of Bridgerton and the writing style of Lady Whistledown. 

Your task: Rewrite the user's modern English text into eloquent, witty Regency-era English (early 1800s style).

Rules:
- Use formal, flowery, dramatic language typical of the Regency period
- Add wit, charm, and subtle sass — as Lady Whistledown would
- Use period-appropriate vocabulary (e.g., "I dare say", "most vexing", "the ton", "pray tell", "one must confess")
- Keep the core meaning intact but make it delightfully dramatic
- Keep the response to 1-3 paragraphs max
- Do NOT add any modern language or explanations — stay fully in character
- If the text is a greeting, respond with an appropriately grand Regency greeting
- End with a flourish when appropriate`
                    },
                    {
                        role: 'user',
                        content: text,
                    },
                ],
                temperature: 0.8,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error('Groq API error:', errData);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'The royal translator encountered a most vexing error.' }),
            };
        }

        const data = await response.json();
        const translated = data.choices?.[0]?.message?.content || 'The translator is at a loss for words.';

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ translated }),
        };
    } catch (err) {
        console.error('Translation error:', err.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'A most unfortunate error has occurred: ' + err.message }),
        };
    }
};
