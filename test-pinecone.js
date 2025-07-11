require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAIEmbeddings } = require('@langchain/openai');

async function testPinecone() {
  try {
    // Init Pinecone (nouvelle syntaxe 2025)
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

    // Test Embedding
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-ada-002'  // Modèle gratuit pour test
    });
    const embedding = await embeddings.embedQuery('Test context for management software');

    // Upsert un vecteur test
    await index.upsert([
      {
        id: 'test1',
        values: embedding,
        metadata: { text: 'Test context' }
      }
    ]);

    console.log('Pinecone setup et test upsert réussi !');
  } catch (error) {
    console.error('Erreur Pinecone:', error);
  }
}

testPinecone();