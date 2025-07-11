require('dotenv').config();
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { Octokit } = require('octokit');
const { createClient } = require('@supabase/supabase-js');

async function fetchContext() {
  try {
    console.log('Fetching GitHub...');
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const { data } = await octokit.rest.repos.getContent({
      owner: 'CedricTri-logis',
      repo: 'grok-management-app',
      path: 'package.json'
    });
    const gitContent = Buffer.from(data.content, 'base64').toString();

    console.log('Fetching Supabase...');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data: dbData } = await supabase.from('auth.users').select('*').limit(1);  // Adapte si besoin
    const dbContent = JSON.stringify(dbData, null, 2);

    return { gitContent, dbContent };
  } catch (error) {
    console.error('Erreur fetch:', error.message);
    return null;
  }
}

async function storeInPinecone(content) {
  try {
    console.log('Storing in Pinecone...');
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
    const embedding = await embeddings.embedQuery(content);

    await index.upsert([{
      id: 'context-test',
      values: embedding,
      metadata: { text: content }
    }]);
    console.log('Stocké en Pinecone !');
  } catch (error) {
    console.error('Erreur Pinecone:', error.message);
  }
}

async function analyzeWithGrok(context) {
  try {
    console.log('Appel à Grok-4... BaseURL:', 'https://api.x.ai/v1', 'Model:', 'grok-4-0709');
    const client = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: 'https://api.x.ai/v1'
    });

    const prompt = `Analyse ce contexte de projet (GitHub et Supabase) avec vérification zéro-hallucination : \nGit : ${context.gitContent.substring(0, 200)}...\nDB : ${context.dbContent}\nVérifie syntaxe, imports, et donne un summary. Confidence : 100%.`;

    const response = await client.chat.completions.create({
      model: 'grok-4-0709',
      messages: [{ role: 'user', content: prompt }]
    });
    console.log('Analyse Grok-4 :', response.choices[0].message.content);
  } catch (error) {
    console.error('Erreur Grok-4 complète:', error.message, '\nStack:', error.stack);
    if (error.response) {
      console.log('Réponse API:', error.response.data);
    }
  }
}

async function main() {
  const context = await fetchContext();
  if (context) {
    await storeInPinecone(JSON.stringify(context));
    await analyzeWithGrok(context);
  }
}

main();