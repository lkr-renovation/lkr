/**
 * LKR ADMIN PANEL - API GITHUB COMMIT
 * Vercel Serverless Function
 * 
 * Endpoint: POST /api/github
 * Body: { 
 *   action: "getFile" | "commit",
 *   filePath: "index.html",
 *   content: "...",  // solo per commit
 *   sha: "...",      // solo per commit
 *   message: "..."   // solo per commit
 * }
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, filePath, content, sha, message } = req.body;

    // Validazione
    if (!action || !filePath) {
      return res.status(400).json({ error: 'Missing action or filePath' });
    }

    // Verifica environment variables
    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).json({ error: 'GITHUB_TOKEN not configured in Vercel' });
    }

    const owner = process.env.GITHUB_OWNER || 'lkr-renovation';
    const repo = process.env.GITHUB_REPO || 'lkr';
    const branch = process.env.GITHUB_BRANCH || 'main';

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // ============================================
    // ACTION: GET FILE
    // ============================================
    if (action === 'getFile') {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LKR-Admin-Panel'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ 
          error: `GitHub API error: ${error.message}` 
        });
      }

      const data = await response.json();
      
      // Decodifica contenuto da base64
      const fileContent = Buffer.from(data.content, 'base64').toString('utf-8');

      return res.status(200).json({
        content: fileContent,
        sha: data.sha
      });
    }

    // ============================================
    // ACTION: COMMIT
    // ============================================
    if (action === 'commit') {
      if (!content || !sha || !message) {
        return res.status(400).json({ 
          error: 'Missing content, sha, or message for commit' 
        });
      }

      // Codifica contenuto in base64
      const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'LKR-Admin-Panel'
        },
        body: JSON.stringify({
          message: message,
          content: encodedContent,
          sha: sha,
          branch: branch
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ 
          error: `GitHub commit error: ${error.message}` 
        });
      }

      const data = await response.json();

      return res.status(200).json({
        success: true,
        commit: data.commit
      });
    }


    // ============================================
    // ACTION: UPDATE JSON
    // ============================================
    if (action === 'updateJSON') {
      if (!content) {
        return res.status(400).json({ 
          error: 'Missing content for updateJSON' 
        });
      }

      // Get file esistente per ottenere SHA
      const getResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LKR-Admin-Panel'
        }
      });

      if (!getResponse.ok) {
        return res.status(getResponse.status).json({ 
          error: 'File not found on GitHub' 
        });
      }

      const fileData = await getResponse.json();

      // Codifica nuovo contenuto in base64
      const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

      // Commit modifiche
      const updateResponse = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'LKR-Admin-Panel'
        },
        body: JSON.stringify({
          message: message || 'Admin panel: aggiornamento progetti.json',
          content: encodedContent,
          sha: fileData.sha,
          branch: branch
        })
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        return res.status(updateResponse.status).json({ 
          error: `GitHub update error: ${error.message}` 
        });
      }

      const updateData = await updateResponse.json();

      return res.status(200).json({
        success: true,
        commit: updateData.commit
      });
    }

    // Azione non riconosciuta
    return res.status(400).json({ error: `Unknown action: ${action}` });

  } catch (error) {
    console.error('GitHub API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}
