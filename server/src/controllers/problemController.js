const Problem = require('../models/Problem');
const { generateProblemAnalysis } = require('../services/aiService');

// Get all problems
const getAllProblems = async (req, res) => {
  try {
    const { difficulty, topic, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topics = { $in: [topic] };
    
    const skip = (page - 1) * limit;
    
    const problems = await Problem.find(query)
      .select('title difficulty topics description constraints')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Problem.countDocuments(query);
    
    res.json({
      success: true,
      message: 'Problems retrieved successfully',
      data: {
        problems,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProblems: total,
          hasNext: skip + problems.length < total,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get problems',
      error: error.message
    });
  }
};

// Get problem by ID
const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Problem retrieved successfully',
      data: {
        problem
      }
    });
    
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get problem',
      error: error.message
    });
  }
};

// Generate AI analysis and optimal solution for a problem
const generateAIAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.body;
    
    if (!language) {
      return res.status(400).json({
        success: false,
        message: 'Language is required'
      });
    }
    
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Generate AI analysis and optimal solution
    let analysis = null;
    let optimalSolution = null;
    
    try {
      const { generateProblemAnalysis, generateOptimalSolution } = require('../services/aiService');
      
      // Generate problem analysis
      console.log(`🔍 Generating AI analysis for problem: ${id}`);
      analysis = await generateProblemAnalysis({
        problemTitle: problem.title,
        problemDescription: problem.description,
        difficulty: problem.difficulty,
        primaryTopic: problem.primaryTopic,
        subTopics: problem.subTopics || [],
        testCases: problem.testCases || []
      });
      console.log(`✅ AI analysis generated: ${analysis ? 'Success' : 'Failed'}`);
      
      // Generate optimal solution
      console.log(`🔍 Generating optimal solution for language: ${language}`);
      optimalSolution = await generateOptimalSolution(problem.description, language);
      console.log(`✅ Optimal solution generated: ${optimalSolution ? 'Success' : 'Failed'}`);
      
    } catch (error) {
      console.error('❌ AI analysis generation failed:', error);
      // Continue without AI analysis if generation fails
    }
    
    res.json({
      success: true,
      message: 'AI analysis generated successfully',
      data: {
        analysis,
        optimalSolution
      }
    });
    
  } catch (error) {
    console.error('Generate AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI analysis',
      error: error.message
    });
  }
};

// Add sample problems to the database
const addSampleProblems = async (req, res) => {
  try {
    // Check if problems already exist
    const existingProblems = await Problem.find();
    if (existingProblems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Sample problems already exist in the database'
      });
    }

    const sampleProblems = [
      {
        title: "Binary Tree Inorder Traversal",
        description: `Given the root of a binary tree, return the inorder traversal of its nodes' values.

Example 1:
Input: root = [1,null,2,3]
Output: [1,3,2]

Example 2:
Input: root = []
Output: []

Example 3:
Input: root = [1]
Output: [1]`,
        difficulty: "easy",
        primaryTopic: "tree",
        subTopics: ["depth-first-search", "binary-tree"],
        allTags: ["tree", "depth-first-search", "binary-tree", "traversal"],
        source: "custom",
        externalId: "",
        testCases: [
          {
            input: "root = [1, null, 2, 3]",
            output: "[1, 3, 2]",
            isHidden: false,
            description: "Inorder: left -> root -> right"
          },
          {
            input: "root = []",
            output: "[]",
            isHidden: false,
            description: "Empty tree"
          },
          {
            input: "root = [1]",
            output: "[1]",
            isHidden: false,
            description: "Single node tree"
          }
        ],
        constraints: {
          timeLimit: 1000,
          memoryLimit: 256,
          inputFormat: "root: binary tree node",
          outputFormat: "array of integers"
        },
        solution: {
          approach: "Recursive or iterative approach using stack",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          code: `// Binary Tree Inorder Traversal - Working Solution
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function inorderTraversal(root) {
    const result = [];
    
    function inorder(node) {
        if (!node) return;
        inorder(node.left);
        result.push(node.val);
        inorder(node.right);
    }
    
    inorder(root);
    return result;
}

function parseBinaryTree(input) {
    // Extract array from input like "root = [1, null, 2, 3]"
    const match = input.match(/\\[(.*)\\]/);
    if (!match) return null;
    
    const values = match[1].split(',').map(v => v.trim());
    if (values.length === 0 || values[0] === '') return null;
    
    const nodes = values.map(v => v === 'null' ? null : parseInt(v));
    
    if (nodes.length === 0) return null;
    
    const root = { val: nodes[0], left: null, right: null };
    const queue = [root];
    let i = 1;
    
    while (queue.length > 0 && i < nodes.length) {
        const current = queue.shift();
        
        if (i < nodes.length && nodes[i] !== null) {
            current.left = { val: nodes[i], left: null, right: null };
            queue.push(current.left);
        }
        i++;
        
        if (i < nodes.length && nodes[i] !== null) {
            current.right = { val: nodes[i], left: null, right: null };
            queue.push(current.right);
        }
        i++;
    }
    
    return root;
}

rl.on('line', (input) => {
    const root = parseBinaryTree(input);
    const result = inorderTraversal(root);
    // Output exactly as expected
    console.log('[' + result.join(', ') + ']');
    rl.close();
});`,
          explanation: "We traverse the tree in inorder fashion: left subtree, then root, then right subtree. This can be done recursively or iteratively using a stack."
        },
        isActive: true,
        isPremium: false
      }
    ];

    const createdProblems = await Problem.insertMany(sampleProblems);

    res.status(201).json({
      success: true,
      message: 'Sample problems added successfully',
      data: {
        count: createdProblems.length,
        problems: createdProblems
      }
    });
  } catch (error) {
    console.error('Error adding sample problems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add sample problems',
      error: error.message
    });
  }
};

// Get problem analysis
const getProblemAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Generate AI analysis
    const analysis = await generateProblemAnalysis({
      problemTitle: problem.title,
      problemDescription: problem.description,
      difficulty: problem.difficulty,
      primaryTopic: problem.primaryTopic,
      subTopics: problem.subTopics,
      testCases: problem.testCases
    });

    res.json({
      success: true,
      message: 'Problem analysis generated successfully',
      data: analysis
    });
    
  } catch (error) {
    console.error('Get problem analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate problem analysis',
      error: error.message
    });
  }
};

module.exports = {
  getAllProblems,
  getProblemById,
  generateAIAnalysis,
  addSampleProblems,
  getProblemAnalysis
}; 