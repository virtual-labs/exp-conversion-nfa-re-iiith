/**
 * Data file containing sample NFAs for conversion to Regular Expressions
 * Each NFA includes states, transitions, start state, accept states, and description
 */

// Sample NFA data structures - Complex NFAs for meaningful learning
const nfaData = [
  {
    id: 0,
    name: "Complex NFA 1",
    description: "NFA with multiple intermediate states and branching paths",
    states: [
      { id: "q0", x: 80, y: 200, isStart: true, isAccept: false },
      { id: "q1", x: 200, y: 120, isStart: false, isAccept: false },
      { id: "q2", x: 200, y: 280, isStart: false, isAccept: false },
      { id: "q3", x: 320, y: 120, isStart: false, isAccept: false },
      { id: "q4", x: 320, y: 200, isStart: false, isAccept: false },
      { id: "q5", x: 320, y: 280, isStart: false, isAccept: false },
      { id: "q6", x: 480, y: 200, isStart: false, isAccept: true }
    ],
    transitions: [
      { from: "q0", to: "q1", label: "a", type: "normal" },
      { from: "q0", to: "q2", label: "b", type: "normal" },
      { from: "q1", to: "q3", label: "a", type: "normal" },
      { from: "q1", to: "q4", label: "b", type: "normal" },
      { from: "q2", to: "q4", label: "a", type: "normal" },
      { from: "q2", to: "q5", label: "b", type: "normal" },
      { from: "q3", to: "q6", label: "a,b", type: "normal" },
      { from: "q4", to: "q4", label: "a", type: "self" },
      { from: "q4", to: "q6", label: "b", type: "normal" },
      { from: "q5", to: "q6", label: "a,b", type: "normal" }
    ],
    alphabet: ["a", "b"],
    testStrings: {
      accepting: ["aaa", "aab", "abb", "bab", "baa", "bbb"],
      rejecting: ["", "a", "b", "ab", "ba"]
    }
  },
  
  {
    id: 1,
    name: "Complex NFA 2", 
    description: "NFA with loops and multiple elimination options",
    states: [
      { id: "q0", x: 80, y: 200, isStart: true, isAccept: false },
      { id: "q1", x: 200, y: 140, isStart: false, isAccept: false },
      { id: "q2", x: 200, y: 260, isStart: false, isAccept: false },
      { id: "q3", x: 320, y: 140, isStart: false, isAccept: false },
      { id: "q4", x: 320, y: 260, isStart: false, isAccept: false },
      { id: "q5", x: 440, y: 200, isStart: false, isAccept: true }
    ],
    transitions: [
      { from: "q0", to: "q0", label: "a", type: "self" },
      { from: "q0", to: "q1", label: "b", type: "normal" },
      { from: "q0", to: "q2", label: "a", type: "normal" },
      { from: "q1", to: "q1", label: "b", type: "self" },
      { from: "q1", to: "q3", label: "a", type: "normal" },
      { from: "q2", to: "q4", label: "b", type: "normal" },
      { from: "q2", to: "q2", label: "a", type: "self" },
      { from: "q3", to: "q5", label: "a", type: "normal" },
      { from: "q4", to: "q5", label: "b", type: "normal" },
      { from: "q4", to: "q3", label: "a", type: "normal" }
    ],
    alphabet: ["a", "b"],
    testStrings: {
      accepting: ["ba", "abb", "aab", "abba", "aaba"],
      rejecting: ["", "a", "b", "aa", "bb"]
    }
  },
  
  {
    id: 2,
    name: "Complex NFA 3",
    description: "NFA with diamond structure and multiple convergent paths",
    states: [
      { id: "q0", x: 80, y: 200, isStart: true, isAccept: false },
      { id: "q1", x: 200, y: 100, isStart: false, isAccept: false },
      { id: "q2", x: 200, y: 180, isStart: false, isAccept: false },
      { id: "q3", x: 200, y: 260, isStart: false, isAccept: false },
      { id: "q4", x: 320, y: 140, isStart: false, isAccept: false },
      { id: "q5", x: 320, y: 220, isStart: false, isAccept: false },
      { id: "q6", x: 440, y: 180, isStart: false, isAccept: false },
      { id: "q7", x: 560, y: 180, isStart: false, isAccept: true }
    ],
    transitions: [
      { from: "q0", to: "q1", label: "a", type: "normal" },
      { from: "q0", to: "q2", label: "b", type: "normal" },
      { from: "q0", to: "q3", label: "a", type: "normal" },
      { from: "q1", to: "q4", label: "b", type: "normal" },
      { from: "q2", to: "q4", label: "a", type: "normal" },
      { from: "q2", to: "q5", label: "b", type: "normal" },
      { from: "q3", to: "q5", label: "a", type: "normal" },
      { from: "q4", to: "q6", label: "a", type: "normal" },
      { from: "q4", to: "q4", label: "b", type: "self" },
      { from: "q5", to: "q6", label: "b", type: "normal" },
      { from: "q5", to: "q5", label: "a", type: "self" },
      { from: "q6", to: "q7", label: "a,b", type: "normal" }
    ],
    alphabet: ["a", "b"],
    testStrings: {
      accepting: ["aba", "baa", "aab", "abba", "baab", "aaab"],
      rejecting: ["", "a", "b", "ab", "ba", "aa"]
    }
  },
  
  {
    id: 3,
    name: "Challenging NFA",
    description: "Advanced NFA with intricate state relationships and elimination challenges",
    states: [
      { id: "q0", x: 80, y: 200, isStart: true, isAccept: false },
      { id: "q1", x: 180, y: 120, isStart: false, isAccept: false },
      { id: "q2", x: 180, y: 200, isStart: false, isAccept: false },
      { id: "q3", x: 180, y: 280, isStart: false, isAccept: false },
      { id: "q4", x: 300, y: 120, isStart: false, isAccept: false },
      { id: "q5", x: 300, y: 200, isStart: false, isAccept: false },
      { id: "q6", x: 300, y: 280, isStart: false, isAccept: false },
      { id: "q7", x: 420, y: 160, isStart: false, isAccept: false },
      { id: "q8", x: 520, y: 200, isStart: false, isAccept: true }
    ],
    transitions: [
      { from: "q0", to: "q1", label: "a", type: "normal" },
      { from: "q0", to: "q2", label: "b", type: "normal" },
      { from: "q1", to: "q4", label: "a", type: "normal" },
      { from: "q1", to: "q2", label: "b", type: "normal" },
      { from: "q2", to: "q2", label: "a", type: "self" },
      { from: "q2", to: "q3", label: "b", type: "normal" },
      { from: "q2", to: "q5", label: "a", type: "normal" },
      { from: "q3", to: "q6", label: "a", type: "normal" },
      { from: "q4", to: "q7", label: "b", type: "normal" },
      { from: "q4", to: "q4", label: "a", type: "self" },
      { from: "q5", to: "q7", label: "a", type: "normal" },
      { from: "q5", to: "q6", label: "b", type: "normal" },
      { from: "q6", to: "q7", label: "b", type: "normal" },
      { from: "q6", to: "q6", label: "a", type: "self" },
      { from: "q7", to: "q8", label: "a,b", type: "normal" }
    ],
    alphabet: ["a", "b"],
    testStrings: {
      accepting: ["aab", "bab", "bbab", "baab", "aaab", "bbaab"],
      rejecting: ["", "a", "b", "aa", "bb", "ab"]
    }
  }
];

// Regular expression operators and their precedence
const regexOperators = {
  UNION: '|',
  CONCAT: '·',  // or implicit concatenation
  STAR: '*',
  PLUS: '+',
  OPTIONAL: '?',
  EPSILON: 'ε',
  EMPTY: '∅'
};

// Operator precedence (higher number = higher precedence)
const operatorPrecedence = {
  '|': 1,
  '·': 2,
  '*': 3,
  '+': 3,
  '?': 3
};

// Helper functions for regex construction
const regexHelpers = {
  // Add parentheses if needed based on precedence
  parenthesize: function(expr, parentOp, isLeft = true) {
    if (!expr || expr === regexOperators.EPSILON || expr === regexOperators.EMPTY) {
      return expr;
    }
    
    // Extract the main operator of the expression
    const mainOp = this.getMainOperator(expr);
    
    if (mainOp && operatorPrecedence[mainOp] < operatorPrecedence[parentOp]) {
      return `(${expr})`;
    }
    
    return expr;
  },
  
  // Get the main operator of an expression (rightmost, lowest precedence)
  getMainOperator: function(expr) {
    let depth = 0;
    let mainOp = null;
    let minPrecedence = Infinity;
    
    for (let i = expr.length - 1; i >= 0; i--) {
      const char = expr[i];
      
      if (char === ')') depth++;
      else if (char === '(') depth--;
      else if (depth === 0 && operatorPrecedence[char]) {
        if (operatorPrecedence[char] <= minPrecedence) {
          minPrecedence = operatorPrecedence[char];
          mainOp = char;
        }
      }
    }
    
    return mainOp;
  },
  
  // Simplify regex expressions
  simplify: function(expr) {
    if (!expr) return regexOperators.EMPTY;
    
    // Remove unnecessary parentheses
    expr = expr.replace(/\(([^()]*)\)/g, (match, inner) => {
      if (this.needsParentheses(inner)) {
        return match;
      }
      return inner;
    });
    
    // Simplify common patterns
    expr = expr.replace(/ε\|/g, ''); // ε| -> empty
    expr = expr.replace(/\|ε/g, ''); // |ε -> empty
    expr = expr.replace(/ε·/g, ''); // ε· -> empty
    expr = expr.replace(/·ε/g, ''); // ·ε -> empty
    expr = expr.replace(/∅\|/g, ''); // ∅| -> empty
    expr = expr.replace(/\|∅/g, ''); // |∅ -> empty
    expr = expr.replace(/∅·/g, '∅'); // ∅· -> ∅
    expr = expr.replace(/·∅/g, '∅'); // ·∅ -> ∅
    expr = expr.replace(/ε\*/g, 'ε'); // ε* -> ε
    expr = expr.replace(/∅\*/g, 'ε'); // ∅* -> ε
    
    return expr || regexOperators.EPSILON;
  },
  
  // Check if expression needs parentheses
  needsParentheses: function(expr) {
    return expr.includes('|') || expr.includes('·');
  },
  
  // Create union of two expressions
  union: function(expr1, expr2) {
    if (!expr1 || expr1 === regexOperators.EMPTY) return expr2;
    if (!expr2 || expr2 === regexOperators.EMPTY) return expr1;
    if (expr1 === expr2) return expr1;
    
    return `${expr1}|${expr2}`;
  },
  
  // Create concatenation of two expressions
  concat: function(expr1, expr2) {
    if (!expr1 || expr1 === regexOperators.EPSILON) return expr2;
    if (!expr2 || expr2 === regexOperators.EPSILON) return expr1;
    if (expr1 === regexOperators.EMPTY || expr2 === regexOperators.EMPTY) {
      return regexOperators.EMPTY;
    }
    
    const left = this.parenthesize(expr1, '·', true);
    const right = this.parenthesize(expr2, '·', false);
    
    return `${left}·${right}`;
  },
  
  // Create Kleene star of expression
  star: function(expr) {
    if (!expr || expr === regexOperators.EPSILON || expr === regexOperators.EMPTY) {
      return regexOperators.EPSILON;
    }
    
    // If already has star, don't add another
    if (expr.endsWith('*')) return expr;
    
    const parenthesized = this.parenthesize(expr, '*');
    return `${parenthesized}*`;
  }
};

// State elimination algorithm data
const eliminationSteps = [];

// Current conversion state
let conversionState = {
  currentNFA: null,
  eliminatedStates: new Set(),
  currentStep: 0,
  isConverting: false,
  steps: [],
  finalRegex: null,
  history: [] // Store history for step back functionality
};
