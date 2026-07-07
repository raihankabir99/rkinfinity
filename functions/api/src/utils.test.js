import { isBengali } from "./utils.js";

const testCases = [
  // Bengali keywords
  { input: "আমাদের কাজ কতদূর?", expected: true, description: 'Bengali keyword "amader"' },
  {
    input: "প্রজেক্টের কাজ কী অবস্থায় আছে?",
    expected: true,
    description: 'Bengali keyword "kaj"',
  },
  { input: "কাজের কতটুক বাকি?", expected: true, description: 'Bengali keyword "kototuk"' },
  { input: "কীভাবে চলছে?", expected: true, description: 'Bengali keyword "kivabe cholche"' },

  // Bengali unicode characters
  { input: "আমি বাংলায় কথা বলি", expected: true, description: "Bengali unicode characters" },
  { input: "আমার সোনার বাংলা", expected: true, description: "More Bengali unicode" },

  // English text
  {
    input: "What is the status of my project?",
    expected: false,
    description: "Standard English query",
  },
  {
    input: "Can you track my order?",
    expected: false,
    description: 'English with keyword "track"',
  }, // Note: 'track' is not a Bengali keyword
  { input: "hello world", expected: false, description: "Simple English" },

  // Mixed language (should detect Bengali if present)
  {
    input: "Hello, আমাদের কাজ কেমন চলছে?",
    expected: true,
    description: "Mixed English and Bengali",
  },

  // Edge cases
  { input: "", expected: false, description: "Empty string" },
  { input: "12345", expected: false, description: "Numbers only" },
  { input: "!@#$%^", expected: false, description: "Special characters only" },
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = isBengali(test.input);
  if (result === test.expected) {
    console.log(`Test #${index + 1}: Passed - ${test.description}`);
    passed++;
  } else {
    console.error(`Test #${index + 1}: Failed - ${test.description}`);
    console.error(`  - Input: "${test.input}"`);
    console.error(`  - Expected: ${test.expected}, Got: ${result}`);
    failed++;
  }
});

console.log(`\nTest Summary: ${passed} passed, ${failed} failed.`);

// To run this test, you would typically use a test runner like Vitest or Jest.
// For example: `npx vitest functions/api/src/utils.test.js`
