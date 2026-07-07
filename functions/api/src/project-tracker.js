const PROJECT_RX = /\b([A-Z]{2,5}-[A-Z0-9]{3,10})\b/i;
// This regex is improved to handle Bengali word suffixes and includes more keywords.
const PROJECT_TRACKING_RX =
  /\b(track|status|progress|update)\b|kaj|kototok|amader|কাজ|কতটুক|koto|dur|kivabe|cholche|obostha|খবর/i;

export const handleProjectTracking = async (message, supabase, isBengali) => {
  const pid = message.match(PROJECT_RX)?.[1].toUpperCase();

  // Test the regex first. If it doesn't match, and there's no PID, it's not a tracking query.
  if (!pid && !PROJECT_TRACKING_RX.test(message)) {
    return null; // Not a project tracking query
  }

  if (pid) {
    const { data: proj } = await supabase
      .from("projects")
      .select("project_id, client_name, status, progress, tracking_url")
      .ilike("project_id", pid)
      .maybeSingle();

    if (proj) {
      const reply = isBengali
        ? `পেয়েছি। ${proj.client_name} এর জন্য ${proj.project_id} প্রকল্পটি বর্তমানে ${proj.status} (${proj.progress}% সম্পন্ন)। আপনি এখানে বিস্তারিত দেখতে পারেন: ${proj.tracking_url}`
        : `Got it. Project ${proj.project_id} for ${proj.client_name} is currently ${proj.status} (${proj.progress}% complete). You can view details here: ${proj.tracking_url}`;
      return { content: reply, source: "project" };
    } else {
      const reply = isBengali
        ? `দুঃখিত, আমি ${pid} আইডি সহ একটি প্রকল্প খুঁজে পাইনি। আইডি আবার পরীক্ষা করুন।`
        : `Sorry, I couldn\'t find a project with the ID ${pid}. Please double-check the ID.`;
      return { content: reply, source: "project" };
    }
  } else {
    // This block is now reachable because the regex test passed.
    const reply = isBengali
      ? "আমি সাহায্য করতে পারি। আপনার প্রকল্প আইডি কি?"
      : "I can help with that. What is your project ID?";
    return { content: reply, source: "project" };
  }
};
