import { handleAiFallback } from './ai-fallback.js';

// Mock the global fetch function
global.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    const primer = body.system_instruction.parts[0].text;
    const lang = primer.includes('Bengali') ? 'Bengali' : 'English';

    // Simulate a successful API response
    if (url.includes('generateContent')) {
        return {
            ok: true,
            json: async () => ({
                candidates: [
                    {
                        content: {
                            parts: [
                                {
                                    text: lang === 'Bengali' ? 'এটি একটি পরীক্ষামূলক উত্তর।' : 'This is a test response.'
                                }
                            ]
                        }
                    }
                ]
            })
        };
    }

    // Simulate an API error
    return {
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
    };
};

const testCases = [
    {
        description: '[EN] Should get a successful English response from AI',
        messages: [{ role: 'user', content: 'Hello, how are you?' }],
        env: { GEMINI_API_KEY: 'fake_key' },
        language: 'English',
        expected: { content: 'This is a test response.', source: 'ai' },
    },
    {
        description: '[BN] Should get a successful Bengali response from AI',
        messages: [{ role: 'user', content: 'কেমন আছেন?', }],
        env: { GEMINI_API_KEY: 'fake_key' },
        language: 'Bengali',
        expected: { content: 'এটি একটি পরীক্ষামূলক উত্তর।', source: 'ai' },
    },
    {
        description: 'Should handle missing API key gracefully',
        messages: [{ role: 'user', content: 'Test' }],
        env: {}, // No API Key
        language: 'English',
        expected: { content: 'Sorry, the AI is not configured correctly.', source: 'error' },
    }
];

let passed = 0;
let failed = 0;

(async () => {
    console.log('Running tests for ai-fallback.js...');
    for (const test of testCases) {
        const result = await handleAiFallback(test.messages, test.env, test.language);

        if (result.content === test.expected.content && result.source === test.expected.source) {
            console.log(`PASS: ${test.description}`);
            passed++;
        } else {
            console.error(`FAIL: ${test.description}`);
            console.error(`  - Expected: ${JSON.stringify(test.expected)}`);
            console.error(`  - Got:      ${JSON.stringify(result)}`);
            failed++;
        }
    }

    console.log(`\nTest Summary: ${passed} passed, ${failed} failed.`);
})();
