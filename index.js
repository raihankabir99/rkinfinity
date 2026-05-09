export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Chatbot API Route
    if (url.pathname === "/api/chat") {
      return new Response(JSON.stringify({ 
        reply: "RK-Infinity AI চ্যাটবটে স্বাগতম! আমি আপনাকে কীভাবে সাহায্য করতে পারি? 🤖" 
      }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }

    return new Response("RK Worker is Live! Use /api/chat", { status: 200 });
  }
};
