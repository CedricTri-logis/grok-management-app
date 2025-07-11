require('dotenv').config();
const { Octokit } = require('octokit');
const { createClient } = require('@supabase/supabase-js');

async function testGitHub() {
  try {
    console.log('Vérification token GitHub...');
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    
    // Test basique : Fetch user pour confirmer token valide
    const user = await octokit.rest.users.getAuthenticated();
    console.log('Token valide pour user :', user.data.login);

    // Test repo content sur repo privé
    const { data } = await octokit.rest.repos.getContent({
      owner: 'CedricTri-logis',
      repo: 'grok-management-app',
      path: 'package.json'  // Fichier qui existe (comme dans ton curl)
    });
    console.log('GitHub fetch réussi (extrait) :', Buffer.from(data.content, 'base64').toString().substring(0, 100) + '...');
  } catch (error) {
    console.error('Erreur GitHub complète:', error);
    if (error.status === 401) {
      console.log('Astuce : Assure-toi que le token dans .env est EXACTEMENT celui qui marche dans curl, avec scope "repo". Teste avec curl pour confirmer.');
    }
  }
}

async function testSupabase() {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data: dbData, error } = await supabase.from('users').select('*').limit(1);  // Si "users" n'existe pas, remplace par une table réelle (e.g., 'auth.users' ou 'projects')
    if (error) throw error;
    console.log('Supabase query réussi :', dbData);
  } catch (error) {
    console.error('Erreur Supabase:', error.message);
    console.log('Astuce : Vérifie le nom de la table dans ton dashboard Supabase.');
  }
}

async function testMCP() {
  await testGitHub();
  await testSupabase();
}

testMCP();