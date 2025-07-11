import { NextResponse } from 'next/server';
import OpenAI from 'openai/index.js';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Octokit } from 'octokit';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const { message } = await request.json();

    // Fetch context (comme dans le script)
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const { data } = await octokit.rest.repos.getContent({
      owner: 'CedricTri-logis',
      repo: 'grok-management-app',
      path: 'package.json'
    });
    const gitContent = Buffer.from(data.content, 'base64').toString();

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data: dbData } = await supabase.from('auth.users').select('*').limit(1);
    const dbContent = JSON.stringify(dbData);

    const context = { gitContent, dbContent };

    // Store in Pinecone (optionnel ici)
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
    const embedding = await embeddings.embedQuery(JSON.stringify(context));
    await index.upsert([{ id: 'chat-context', values: embedding, metadata: { text: JSON.stringify(context) } }]);

    // Call Grok-4
    const client = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: 'https://api.x.ai/v1'
    });

    const prompt = `Analyse : ${message}\nContexte : ${JSON.stringify(context)}\nAvec zéro-hallucination.`;

    const response = await client.chat.completions.create({
      model: 'grok-4-0709',
      messages: [{ role: 'user', content: prompt }]
    });

    return NextResponse.json({ reply: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}