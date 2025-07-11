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

    // Test repo content (sur un repo privé ou public existant)
    const { data } = await octokit.rest.repos.getContent({
      owner: 'CedricTri-logis',  // Ton username exact
      repo: 'grok-management-app',  // Ce repo actuel (assure-toi qu'il a un README.md ou change path)
      path: 'package.json'  // Un fichier qui existe SÛR (e.g., package.json au lieu de README si absent)
    });
    console.log('GitHub fetch réussi :', Buffer.from(data.content, 'base64').toString().substring(0, 100) + '...');  // Affiche un extrait
  } catch (error) {
    console.error('Erreur GitHub complète:', error);
    if (error.status === 401) {
      console.log('Astuce : Vérifie que le token a le scope "repo" pour repos privés. Docs : https://docs.github.com/rest/overview/permissions-required-for-personal-access-tokens');
    }
  }
}

async function testSupabase() {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    // Remplace 'ma_table_reelle' par une table QUI EXISTE dans ton Supabase (va sur ton dashboard Supabase > Table Editor pour voir les tables, e.g., 'auth.users' si default, ou une custom comme 'projects')
    const { data: dbData, error } = await supabase.from('user_profiles').select('*').limit(1);
    if (error) throw error;
    console.log('Supabase query réussi :', dbData);
  } catch (error) {
    console.error('Erreur Supabase:', error.message);
    console.log('Astuce : Vérifie le nom de la table (case-sensitive) et que SUPABASE_URL/KEY sont corrects. Si table n\'existe pas, remplace par une réelle de ton DB.');
  }
}

async function testMCP() {
  await testGitHub();
  await testSupabase();
}

testMCP();