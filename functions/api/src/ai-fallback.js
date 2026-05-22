export const handleAiFallback = async (messages, env, language) => {
    const apiKey = env.GEMINI_API_KEY;
    const isBengali = language === 'Bengali';

    if (!apiKey) {
        console.error("AI not configured. Missing GEMINI_API_KEY environment variable.");
        const reply = isBengali ? "দুঃখিত, এআই সঠিকভাবে কনফিগার করা হয়নি।" : "Sorry, the AI is not configured correctly.";
        return { content: reply, source: "error" };
    }

    try {
        const primer = `You are rkInfinity\'s friendly AI assistant. Be warm, concise, and helpful. Keep replies short. The user is communicating in ${language}. YOU MUST respond in ${language}.`;

        const historyForApi = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const body = {
            contents: historyForApi,
            system_instruction: {
                parts: [{ text: primer }]
            }
        };

        const apiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            }
        );

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error("Gemini API request failed:", apiResponse.status, errorBody);
            const reply = isBengali
                ? `দুঃখিত, আমি এআই এর সাথে সংযোগ করতে পারছি না। (ত্রুটি: ${apiResponse.status})`
                : `Sorry, I'm having trouble connecting to the AI. (Error: ${apiResponse.status})`;
            return { content: reply, source: "error" };
        }

        const data = await apiResponse.json();

        if (!data.candidates || data.candidates.length === 0) {
            console.error("Gemini API Error: No candidates in response", JSON.stringify(data));
            if (data.promptFeedback && data.promptFeedback.blockReason) {
                const reply = isBengali
                    ? `আমার প্রতিক্রিয়া ব্লক করা হয়েছে কারণ: ${data.promptFeedback.blockReason}। অনুগ্রহ করে অন্যভাবে চেষ্টা করুন।`
                    : `My response was blocked because: ${data.promptFeedback.blockReason}. Please try rephrasing.`;
                return { content: reply, source: "error" };
            }
            const reply = isBengali ? "দুঃখিত, আমি এআই থেকে কোনো উত্তর পাইনি। অনুগ্রহ করে আবার চেষ্টা করুন।" : "Sorry, I received an empty response from the AI. Please try again.";
            return { content: reply, source: "error" };
        }

        const responseText = data.candidates[0]?.content?.parts?.[0]?.text || (isBengali ? "দুঃখিত, আমি একটি উত্তর তৈরি করতে পারিনি।" : "Sorry, I couldn\'t come up with a response.");
        return { content: responseText, source: "ai" };

    } catch (e) {
        console.error("Error during AI generation:", e.message);
        const reply = isBengali ? "দুঃখিত, উত্তর তৈরি করার সময় একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" : "Sorry, I had trouble generating a response. Please try again.";
        return { content: reply, source: "error" };
    }
};