const kattisImportService = require('../services/kattisImportService');

// Import problem from Kattis URL
const importFromKattis = async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validate input
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }
    
    // Validate URL format
    if (!url.includes('kattis.com/problems/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL. Please provide a valid Kattis problem URL (e.g., https://open.kattis.com/problems/hello)'
      });
    }
    
    console.log(`Importing Kattis problem from URL: ${url}`);
    
    // Scrape problem data
    const problemData = await kattisImportService.scrapeKattisProblem(url);
    
    // Import to database
    const result = await kattisImportService.importProblem(problemData);
    
    if (!result.success) {
      return res.status(409).json(result); // 409 Conflict for existing problem
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error importing from Kattis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import problem',
      error: error.message
    });
  }
};

// Get import history (optional feature)
const getImportHistory = async (req, res) => {
  try {
    const Problem = require('../models/Problem');
    const importedProblems = await Problem.find({ 
      source: 'kattis',
      'metadata.importedAt': { $exists: true }
    })
    .select('title slug source metadata.originalUrl metadata.importedAt')
    .sort({ 'metadata.importedAt': -1 })
    .limit(20);
    
    res.json({
      success: true,
      data: {
        problems: importedProblems,
        total: importedProblems.length
      }
    });
  } catch (error) {
    console.error('Error fetching import history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch import history',
      error: error.message
    });
  }
};

module.exports = {
  importFromKattis,
  getImportHistory
};