/* ─── Netlify Function: /api/polls ─── */
const store = require('./utils/store');

// Default polls data
const DEFAULT_POLLS = [
    {
        id: 'diamond',
        question: '💎 Who shall be declared the Diamond of this Season?',
        options: ['Daphne Bridgerton', 'Kate Sharma', 'Penelope Featherington', 'Queen Charlotte', 'Eloise Bridgerton'],
        votes: [0, 0, 0, 0, 0],
    },
    {
        id: 'couple',
        question: '💕 Which couple reigns supreme?',
        options: ['Anthony & Kate', 'Benedict & Sophie', 'Colin & Penelope', 'Daphne & Simon', 'Eloise & Theo'],
        votes: [0, 0, 0, 0, 0],
    },
    {
        id: 'scandal',
        question: '🫖 What shall be the biggest scandal of Part Two?',
        options: ['A secret wedding', 'A duel at dawn', 'An unexpected heir', 'A ruined reputation', 'A stolen kiss at the ball'],
        votes: [0, 0, 0, 0, 0],
    },
    {
        id: 'cry',
        question: '😭 Who shall cry first during the finale?',
        options: ['Ishmeen', 'Khushi', 'Vishal', 'Rishika', 'Everyone simultaneously'],
        votes: [0, 0, 0, 0, 0],
    },
];

exports.handler = async (event) => {
    if (event.httpMethod === 'GET') {
        const polls = await store.getPolls();
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ polls: polls || DEFAULT_POLLS }),
        };
    }

    if (event.httpMethod === 'POST') {
        const { pollId, optionIndex } = JSON.parse(event.body || '{}');

        if (!pollId || optionIndex === undefined) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing pollId or optionIndex.' }) };
        }

        let polls = await store.getPolls();
        if (!polls) polls = DEFAULT_POLLS;

        const poll = polls.find(p => p.id === pollId);
        if (!poll || optionIndex < 0 || optionIndex >= poll.options.length) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid poll or option.' }) };
        }

        poll.votes[optionIndex]++;
        await store.savePolls(polls);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, polls }),
        };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
