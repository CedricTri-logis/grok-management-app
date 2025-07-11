require('dotenv').config();
const { Octokit } = require('octokit');
const { createClient } = require('@supabase/supabase-js');

async function testMCP() {
  try {
    // Test GitHub (fetch un fichier exemple de ton repo)
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: 'ton-username-github',  // Remplace par ton username
      repo: 'ton-repo-existant',    // Remplace par un repo existant (e.g., ton management software)
      path: 'README.md'             // Un fichier simple pour test
    });
    console.log('GitHub fetch réussi :', Buffer.from(data.content, 'base64').toString());

    // Test Supabase (query une table exemple)
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data: dbData, error } = await supabase.from('users').select('*').limit(1);  // Remplace 'users' par une de tes tables
    if (error) throw error;
    console.log('Supabase query réussi :', dbData);

  } catch (error) {
    console.error('Erreur MCP:', error);
  }
}

testMCP();