import { handleProjectTracking } from "./project-tracker.js";

// Mock Supabase client
const createMockSupabase = (projectData) => ({
  from: () => ({
    select: () => ({
      ilike: () => ({
        maybeSingle: async () => ({ data: projectData }),
      }),
    }),
  }),
});

const mockProject = {
  project_id: "RKF-1234",
  client_name: "Test Client",
  status: "In Progress",
  progress: 50,
  tracking_url: "https://example.com/track/RKF-1234",
};

const testCases = [
  // --- English Test Cases ---
  {
    description: "[EN] Should return project status for a valid ID",
    message: "What is the status of RKF-1234?",
    isBengali: false,
    mockData: mockProject,
    expected: `Got it. Project ${mockProject.project_id} for ${mockProject.client_name} is currently ${mockProject.status} (${mockProject.progress}% complete). You can view details here: ${mockProject.tracking_url}`,
  },
  {
    description: "[EN] Should return not found for an invalid ID",
    message: "Status for RKF-9999",
    isBengali: false,
    mockData: null,
    expected: `Sorry, I couldn\'t find a project with the ID RKF-9999. Please double-check the ID.`,
  },
  {
    description: "[EN] Should ask for ID when a tracking keyword is present",
    message: "What is the status of my project?",
    isBengali: false,
    mockData: null,
    expected: "I can help with that. What is your project ID?",
  },
  {
    description: "[EN] Should return null when no tracking keyword or ID is present",
    message: "Hello, how are you?",
    isBengali: false,
    mockData: null,
    expected: null,
  },

  // --- Bengali Test Cases ---
  {
    description: "[BN] Should return project status for a valid ID",
    message: "আমার প্রজেক্ট RKF-1234 এর কাজ কতদূর?",
    isBengali: true,
    mockData: mockProject,
    expected: `পেয়েছি। ${mockProject.client_name} এর জন্য ${mockProject.project_id} প্রকল্পটি বর্তমানে ${mockProject.status} (${mockProject.progress}% সম্পন্ন)। আপনি এখানে বিস্তারিত দেখতে পারেন: ${mockProject.tracking_url}`,
  },
  {
    description: "[BN] Should return not found for an invalid ID",
    message: "প্রজেক্ট RKF-9999 এর কী অবস্থা?",
    isBengali: true,
    mockData: null,
    expected: `দুঃখিত, আমি RKF-9999 আইডি সহ একটি প্রকল্প খুঁজে পাইনি। আইডি আবার পরীক্ষা করুন।`,
  },
  {
    description: "[BN] Should ask for ID when a tracking keyword is present",
    message: "আমাদের কাজের কী খবর?",
    isBengali: true,
    mockData: null,
    expected: "আমি সাহায্য করতে পারি। আপনার প্রকল্প আইডি কি?",
  },
];

let passed = 0;
let failed = 0;

(async () => {
  for (const test of testCases) {
    const mockSupabase = createMockSupabase(test.mockData);
    const result = await handleProjectTracking(test.message, mockSupabase, test.isBengali);

    // Handle the two types of expected outcomes: a string content or null
    const actual = result ? result.content : null;

    if (actual === test.expected) {
      console.log(`PASS: ${test.description}`);
      passed++;
    } else {
      console.error(`FAIL: ${test.description}`);
      console.error(`  - Input Message: "${test.message}"`);
      console.error(`  - Expected: "${test.expected}"`);
      console.error(`  - Got:      "${actual}"`);
      failed++;
    }
  }

  console.log(`\nTest Summary: ${passed} passed, ${failed} failed.`);
})();
