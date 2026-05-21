
'use server';

/**
 * Service to interact with the user's GitHub repository for buoy analysis.
 * Uses environment variables for security.
 */
export async function fetchBuoyAnalysis(stationId: string) {
  const GITHUB_PAT = process.env.GITHUB_PAT; 
  const owner = "Fleabyte26";
  const repo = "Half-Moon-Bay-Buoy-46012-analysis";
  
  const path = `data/buoy_${stationId}_cleaned.csv`; 
  
  if (!GITHUB_PAT) {
    return { error: "GITHUB_PAT environment variable is not set.", data: null };
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3.raw',
        'User-Agent': 'WaveCast-AI-Agent'
      }
    });

    if (!response.ok) {
      const dirResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data`, {
        headers: { 
          'Authorization': `token ${GITHUB_PAT}`,
          'User-Agent': 'WaveCast-AI-Agent'
        }
      });
      
      if (dirResponse.ok) {
        const files = await dirResponse.json();
        const fileList = Array.isArray(files) ? files.map((f: any) => f.name).join(', ') : 'none';
        return { 
          error: `Dataset for buoy ${stationId} not found in /data. Available: ${fileList}`,
          data: null 
        };
      }
      
      return { error: `GitHub repository access failed for buoy ${stationId}.`, data: null };
    }

    const text = await response.text();
    return { data: text, error: null };
  } catch (error: any) {
    return { error: error.message, data: null };
  }
}
