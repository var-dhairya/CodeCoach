const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
require('dotenv').config({ path: './.env' });

// Sample problems with different topics and difficulties
const sampleProblems = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "easy",
    primaryTopic: "arrays",
    subTopics: ["hash-table", "two-pointers"],
    allTags: ["arrays", "hash-table", "two-pointers"],
    source: "leetcode",
    externalId: "1",
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        output: "[0,1]",
        isHidden: false,
        description: "Basic test case"
      },
      {
        input: "[3,2,4]\n6",
        output: "[1,2]",
        isHidden: false,
        description: "Another test case"
      }
    ],
    constraints: {
      timeLimit: 1000,
      memoryLimit: 256,
      inputFormat: "nums: List[int], target: int",
      outputFormat: "List[int]"
    },
    solution: {
      approach: "Use a hash table to store complements",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      code: "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
      explanation: "We use a hash table to store each number and its index. For each number, we check if its complement (target - num) exists in the hash table."
    },
    metadata: {
      popularity: 0.95,
      successRate: 0.85,
      totalSubmissions: 1000,
      totalSolved: 850
    }
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
    difficulty: "easy",
    primaryTopic: "stack",
    subTopics: ["string"],
    allTags: ["stack", "string"],
    source: "leetcode",
    externalId: "20",
    testCases: [
      {
        input: "()",
        output: "true",
        isHidden: false,
        description: "Simple parentheses"
      },
      {
        input: "()[]{}",
        output: "true",
        isHidden: false,
        description: "Multiple brackets"
      }
    ],
    constraints: {
      timeLimit: 1000,
      memoryLimit: 256,
      inputFormat: "s: str",
      outputFormat: "bool"
    },
    solution: {
      approach: "Use a stack to track opening brackets",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      code: "def isValid(s):\n    stack = []\n    brackets = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in '({[':\n            stack.append(char)\n        elif char in ')}]':\n            if not stack or stack.pop() != brackets[char]:\n                return False\n    return len(stack) == 0",
      explanation: "We use a stack to keep track of opening brackets. When we encounter a closing bracket, we check if it matches the most recent opening bracket."
    },
    metadata: {
      popularity: 0.90,
      successRate: 0.80,
      totalSubmissions: 800,
      totalSolved: 640
    }
  },
  {
    title: "Binary Tree Inorder Traversal",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    difficulty: "easy",
    primaryTopic: "trees",
    subTopics: ["binary-tree", "recursion"],
    allTags: ["trees", "binary-tree", "recursion"],
    source: "leetcode",
    externalId: "94",
    testCases: [
      {
        input: "[1,null,2,3]",
        output: "[1,3,2]",
        isHidden: false,
        description: "Basic tree traversal"
      }
    ],
    constraints: {
      timeLimit: 1000,
      memoryLimit: 256,
      inputFormat: "root: TreeNode",
      outputFormat: "List[int]"
    },
    solution: {
      approach: "Recursive inorder traversal",
      timeComplexity: "O(n)",
      spaceComplexity: "O(h)",
      code: "def inorderTraversal(root):\n    result = []\n    def inorder(node):\n        if node:\n            inorder(node.left)\n            result.append(node.val)\n            inorder(node.right)\n    inorder(root)\n    return result",
      explanation: "We use recursion to traverse the tree in inorder fashion: left subtree, root, right subtree."
    },
    metadata: {
      popularity: 0.85,
      successRate: 0.75,
      totalSubmissions: 600,
      totalSolved: 450
    }
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "medium",
    primaryTopic: "sliding-window",
    subTopics: ["string", "hash-table"],
    allTags: ["sliding-window", "string", "hash-table"],
    source: "leetcode",
    externalId: "3",
    testCases: [
      {
        input: "abcabcbb",
        output: "3",
        isHidden: false,
        description: "Longest substring is 'abc'"
      },
      {
        input: "bbbbb",
        output: "1",
        isHidden: false,
        description: "Longest substring is 'b'"
      }
    ],
    constraints: {
      timeLimit: 1000,
      memoryLimit: 256,
      inputFormat: "s: str",
      outputFormat: "int"
    },
    solution: {
      approach: "Sliding window with hash set",
      timeComplexity: "O(n)",
      spaceComplexity: "O(min(m,n))",
      code: "def lengthOfLongestSubstring(s):\n    char_set = set()\n    left = 0\n    max_length = 0\n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n        char_set.add(s[right])\n        max_length = max(max_length, right - left + 1)\n    return max_length",
      explanation: "We use a sliding window approach with a hash set to track unique characters in the current window."
    },
    metadata: {
      popularity: 0.92,
      successRate: 0.70,
      totalSubmissions: 900,
      totalSolved: 630
    }
  },
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "easy",
    primaryTopic: "dynamic-programming",
    subTopics: ["math"],
    allTags: ["dynamic-programming", "math"],
    source: "leetcode",
    externalId: "70",
    testCases: [
      {
        input: "2",
        output: "2",
        isHidden: false,
        description: "Two ways: 1+1 or 2"
      },
      {
        input: "3",
        output: "3",
        isHidden: false,
        description: "Three ways: 1+1+1, 1+2, or 2+1"
      }
    ],
    constraints: {
      timeLimit: 1000,
      memoryLimit: 256,
      inputFormat: "n: int",
      outputFormat: "int"
    },
    solution: {
      approach: "Dynamic programming with Fibonacci sequence",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      code: "def climbStairs(n):\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b",
      explanation: "This is essentially the Fibonacci sequence. The number of ways to climb n stairs is the sum of ways to climb (n-1) and (n-2) stairs."
    },
    metadata: {
      popularity: 0.88,
      successRate: 0.82,
      totalSubmissions: 700,
      totalSolved: 574
    }
  }
];

async function seedProblems() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI environment variable is required');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('🗑️  Cleared existing problems');

    // Insert sample problems
    const insertedProblems = await Problem.insertMany(sampleProblems);
    console.log(`✅ Inserted ${insertedProblems.length} sample problems`);

    // Display inserted problems
    console.log('\n📋 Inserted Problems:');
    insertedProblems.forEach((problem, index) => {
      console.log(`${index + 1}. ${problem.title} (${problem.difficulty}) - ${problem.primaryTopic}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedProblems(); 