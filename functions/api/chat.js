import { GoogleGenerativeAI } from "@google/generative-ai";

// This is a placeholder for a real Supabase client, which you would initialize properly.
const supabaseAdmin = {
    from: (tableName) => ({
        select: (...args) => ({
            ilike: () => ({ maybeSingle: async () => ({ data: null }) }),
            order: () => ({ limit: async () => ({ data: [] }) }),
            limit: async () => ({ data: [] })
        }),
        insert: async () => ({}),
    })
};

async function runChatUnsafe({ messages, session_id, user_name }, env) {
    const lastUserMessage = messages[messages.length - 1]?.content ?? "";

    // In a real application, you would persist the message to your database here.

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("AI not configured. Missing GEMINI_API_KEY environment variable.");
        return { content: "Sorry, the AI is not configured correctly.", source: "error" };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const primer = `You are rkInfinity's friendly AI assistant. Be warm, concise, and helpful. Keep replies short.`;
        
        const history = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const result = await model.generateContent({ contents: history });
        const responseText = result.response.text();
        return { content: responseText, source: "ai" };

    } catch (e) {
        console.error("Error during AI generation:", e.message);
        return { content: "Sorry, I had trouble generating a response. Please try again.", source: "error" };
    }
}

export const onRequestPost = async ({ request, env }) => {
    try {
        const input = await request.json();
        
        if (!input || !Array.isArray(input.messages)) {
            return new Response(JSON.stringify({ content: "Invalid request format.", source: "error" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await runChatUnsafe(input, env);

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error("Unhandled error in onRequestPost:", e.message);
        const errorResult = {
            content: "Sorry, a server error occurred. Please try again later.",
            source: "error",
        };
        return new Response(JSON.stringify(errorResult), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};