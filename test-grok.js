require('dotenv').config();
const { OpenAI } = require('openai');

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'  // URL pour xAI API (compatible)
});

async function testGrok() {
  try {
    const response = await client.chat.completions.create({
      model: 'grok-4-0709',
      messages: [{ role: 'user', content: 'Hello Grok-4 Heavy! Confirme que tu es prêt pour build une web app de management software avec zéro hallucination.' }]
    });
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

testGrok();