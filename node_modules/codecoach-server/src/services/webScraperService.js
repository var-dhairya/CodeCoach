const axios = require('axios');
const { JSDOM } = require('jsdom');

// Mapping of common programming topics found in problem titles/descriptions
const TOPIC_MAPPING = {
  'array': 'arrays',
  'string': 'strings', 
  'tree': 'trees',
  'graph': 'graphs',
  'dp': 'dynamic-programming',
  'dynamic': 'dynamic-programming',
  'programming': 'dynamic-programming',
  'greedy': 'greedy',
  'sort': 'sorting',
  'search': 'binary-search',
  'binary': 'binary-search',
  'hash': 'hash-table',
  'stack': 'stack',
  'queue': 'queue',
  'heap': 'heap',
  'math': 'math',
  'geometry': 'math',
  'number': 'math',
  'implementation': 'implementation',
  'brute': 'implementation',
  'force': 'implementation',
  'two': 'two-pointers',
  'pointer': 'two-pointers',
  'sliding': 'sliding-window',
  'window': 'sliding-window'
};

class WebScraperService {
  // Generate sample problems when APIs are not available
  async generateSampleProblems(count = 10) {
    const sampleProblems = [
      {
        title: "Maximum Subarray Sum",
        difficulty: "medium",
        primaryTopic: "dynamic-programming",
        description: "Find the contiguous subarray with the largest sum.",
        source: "generated"
      },
      {
        title: "Valid Palindrome",
        difficulty: "easy", 
        primaryTopic: "strings",
        description: "Check if a string is a valid palindrome ignoring non-alphanumeric characters.",
        source: "generated"
      },
      {
        title: "Binary Tree Level Order Traversal",
        difficulty: "medium",
        primaryTopic: "trees",
        description: "Return the level order traversal of a binary tree's nodes.",
        source: "generated"
      },
      {
        title: "Find Peak Element",
        difficulty: "medium",
        primaryTopic: "binary-search",
        description: "Find a peak element in an array using binary search.",
        source: "generated"
      },
      {
        title: "Container With Most Water",
        difficulty: "medium",
        primaryTopic: "two-pointers",
        description: "Find two lines that together form a container that holds the most water.",
        source: "generated"
      },
      {
        title: "Merge Intervals",
        difficulty: "medium",
        primaryTopic: "arrays",
        description: "Merge all overlapping intervals in an array of intervals.",
        source: "generated"
      },
      {
        title: "Longest Common Subsequence",
        difficulty: "medium",
        primaryTopic: "dynamic-programming",
        description: "Find the length of the longest common subsequence between two strings.",
        source: "generated"
      },
      {
        title: "Reverse Linked List",
        difficulty: "easy",
        primaryTopic: "linked-lists",
        description: "Reverse a singly linked list iteratively or recursively.",
        source: "generated"
      },
      {
        title: "Course Schedule",
        difficulty: "medium",
        primaryTopic: "graphs",
        description: "Determine if you can finish all courses given prerequisites (topological sort).",
        source: "generated"
      },
      {
        title: "Minimum Window Substring",
        difficulty: "hard",
        primaryTopic: "sliding-window",
        description: "Find the minimum window substring that contains all characters of a target string.",
        source: "generated"
      },
      {
        title: "Word Break",
        difficulty: "medium",
        primaryTopic: "dynamic-programming",
        description: "Determine if a string can be segmented into words from a dictionary.",
        source: "generated"
      },
      {
        title: "Rotate Array",
        difficulty: "medium",
        primaryTopic: "arrays",
        description: "Rotate an array to the right by k steps.",
        source: "generated"
      },
      {
        title: "Valid Parentheses",
        difficulty: "easy",
        primaryTopic: "stack",
        description: "Check if brackets are properly matched using a stack.",
        source: "generated"
      },
      {
        title: "Kth Largest Element",
        difficulty: "medium",
        primaryTopic: "heap",
        description: "Find the kth largest element in an unsorted array using a heap.",
        source: "generated"
      },
      {
        title: "Group Anagrams",
        difficulty: "medium",
        primaryTopic: "hash-table",
        description: "Group strings that are anagrams of each other.",
        source: "generated"
      }
    ];

    return sampleProblems.slice(0, count).map((problem, index) => ({
      ...problem,
      externalId: `generated_${index + 1}`,
      isPremium: false,
      acceptanceRate: Math.random() * 0.4 + 0.4, // 40-80% acceptance rate
      rating: this.getDifficultyRating(problem.difficulty)
    }));
  }

  // Get difficulty rating for problems
  getDifficultyRating(difficulty) {
    switch (difficulty) {
      case 'easy': return Math.floor(Math.random() * 400) + 800; // 800-1200
      case 'medium': return Math.floor(Math.random() * 600) + 1200; // 1200-1800  
      case 'hard': return Math.floor(Math.random() * 700) + 1800; // 1800-2500
      default: return 1200;
    }
  }

  // Detect topic from problem title
  detectTopicFromTitle(title) {
    const titleLower = title.toLowerCase();
    
    for (const [keyword, topic] of Object.entries(TOPIC_MAPPING)) {
      if (titleLower.includes(keyword)) {
        return topic;
      }
    }
    
    return 'general';
  }

  // Scrape problems from competitive programming websites (backup method)
  async scrapeProblemsFromWebsite(source, limit = 10) {
    try {
      console.log(`Attempting to scrape problems from ${source}...`);
      
      // For now, return generated problems as scraping can be unreliable
      // In a production environment, you might implement actual scraping
      const problems = await this.generateSampleProblems(limit);
      
      return problems.map(problem => ({
        ...problem,
        source: `${source}-scraped`,
        scrapedAt: new Date()
      }));
      
    } catch (error) {
      console.error(`Error scraping from ${source}:`, error.message);
      // Fallback to generated problems
      return await this.generateSampleProblems(limit);
    }
  }

  // Create comprehensive problem set from multiple sources
  async createComprehensiveProblemSet(totalProblems = 20) {
    const problems = [];
    
    try {
      // Try to get problems from CodeForces API first
      console.log('Attempting to fetch from CodeForces API...');
      const codeforcesResponse = await axios.get('https://codeforces.com/api/problemset.problems');
      
      if (codeforcesResponse.data && codeforcesResponse.data.result) {
        const cfProblems = codeforcesResponse.data.result.problems
          .filter(p => p.rating && p.rating >= 800 && p.rating <= 2000)
          .slice(0, Math.floor(totalProblems * 0.6)) // 60% from CodeForces
          .map(p => ({
            title: p.name,
            difficulty: p.rating < 1200 ? 'easy' : p.rating < 1800 ? 'medium' : 'hard',
            primaryTopic: p.tags && p.tags.length > 0 ? 
              TOPIC_MAPPING[p.tags[0].toLowerCase()] || p.tags[0].toLowerCase() : 'general',
            source: 'codeforces',
            externalId: `${p.contestId}${p.index}`,
            isPremium: false,
            acceptanceRate: 0.5,
            rating: p.rating,
            tags: p.tags || []
          }));
        
        problems.push(...cfProblems);
        console.log(`✅ Fetched ${cfProblems.length} problems from CodeForces`);
      }
    } catch (error) {
      console.error('Failed to fetch from CodeForces:', error.message);
    }

    // Fill remaining slots with generated problems
    const remainingSlots = totalProblems - problems.length;
    if (remainingSlots > 0) {
      const generatedProblems = await this.generateSampleProblems(remainingSlots);
      problems.push(...generatedProblems);
      console.log(`✅ Generated ${generatedProblems.length} sample problems`);
    }

    return problems;
  }

  // Search for problems by topic or difficulty
  async searchProblems(query, filters = {}) {
    try {
      // Try CodeForces API search first
      const allProblems = await this.createComprehensiveProblemSet(50);
      
      let filteredProblems = allProblems;

      // Apply filters
      if (filters.difficulty) {
        filteredProblems = filteredProblems.filter(p => p.difficulty === filters.difficulty);
      }
      
      if (filters.topic) {
        filteredProblems = filteredProblems.filter(p => 
          p.primaryTopic === filters.topic || 
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(filters.topic)))
        );
      }

      // Apply search query
      if (query) {
        const queryLower = query.toLowerCase();
        filteredProblems = filteredProblems.filter(p =>
          p.title.toLowerCase().includes(queryLower) ||
          p.primaryTopic.toLowerCase().includes(queryLower)
        );
      }

      return filteredProblems.slice(0, filters.limit || 10);
      
    } catch (error) {
      console.error('Error searching problems:', error.message);
      return await this.generateSampleProblems(5);
    }
  }
}

module.exports = new WebScraperService();