import 'dotenv/config';
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY is missing in environment.');
  process.exit(1);
}

const run = async () => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    const data = await response.json();
    const entries = (data.models || [])
      .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
      .map((model) => model.name)
      .sort();

    console.log('Models that support generateContent:');
    entries.forEach((name) => console.log(`- ${name}`));
  } catch (error) {
    console.error('Failed to list models:', error.message || error);
    process.exit(1);
  }
};

run();
