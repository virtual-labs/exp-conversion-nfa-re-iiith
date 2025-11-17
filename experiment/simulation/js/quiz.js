/**
 * Quiz functionality for NFA to Regular Expression conversion
 * Interactive quiz system with configurable probability
 */

// Quiz configuration constants (change these to modify quiz behavior)
const QUIZ_PROBABILITY = 1; // 40% chance of showing quiz
const QUIZ_DIFFICULTY = 'medium'; // easy, medium, hard
const SHOW_CORRECT_ANSWER = true;
const QUIZ_TIME_LIMIT = null; // No time limit by default

// Quiz configuration (only enabled/disabled is user-configurable)
let quizConfig = {
  enabled: true
};

// Quiz statistics
let quizStats = {
  totalQuestions: 0,
  correctAnswers: 0,
  streak: 0,
  maxStreak: 0
};

// Current quiz state
let currentQuiz = {
  isActive: false,
  question: null,
  selectedOption: null,
  isAnswered: false,
  correctOption: null,
  elimination: null,
  continueCallback: null
};

/**
 * Initialize quiz system
 */
function initializeQuiz() {
  createQuizModal();
  createQuizSettings();
  loadQuizConfig();
  loadQuizStats();
}

/**
 * Create quiz modal HTML
 */
function createQuizModal() {
  const quizHTML = `
    <div id="quiz-overlay" class="quiz-overlay">
      <div class="quiz-container">
        <!-- NFA Spotlight Panel -->
        <div id="nfa-spotlight" class="nfa-spotlight">
          <h4>🎯 Current NFA State</h4>
          <div class="nfa-spotlight-content">
            <canvas id="nfa-mini-canvas" class="nfa-mini-canvas" width="480" height="300"></canvas>
            <div id="nfa-state-info" class="state-info">
              <h5>State Being Eliminated:</h5>
              <div id="elimination-state-details">
                <!-- Details will be populated dynamically -->
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quiz Modal -->
        <div id="quiz-modal" class="quiz-modal">
          <div class="quiz-header">
            <h3><span class="quiz-icon">🧠</span> Regex Prediction Quiz</h3>
            <p class="quiz-subtitle">What will be the resulting regex after this elimination?</p>
            <div class="quiz-progress">
              <span id="quiz-streak">Streak: <span class="quiz-score">0</span></span>
              <span id="quiz-accuracy">Accuracy: <span class="quiz-score">0%</span></span>
            </div>
          </div>
          
          <div class="quiz-question">
            <h4>Eliminating State:</h4>
            <div id="elimination-context" class="elimination-context">
              <!-- Context will be populated dynamically -->
            </div>
            
            <h4>Which regex will result from this elimination?</h4>
            <div id="quiz-options" class="quiz-options">
              <!-- Options will be populated dynamically -->
            </div>
          </div>
          
          <div id="quiz-feedback" class="quiz-feedback">
            <!-- Feedback will be shown here -->
          </div>
          
          <div class="quiz-actions">
            <div class="quiz-hint" id="quiz-hint">
              💡 Consider the formula: (incoming)(self-loop)*(outgoing)
            </div>
            <div class="quiz-buttons">
              <button id="quiz-submit" class="quiz-btn primary" disabled>Submit Answer</button>
              <button id="quiz-skip" class="quiz-btn secondary">Skip Quiz</button>
              <button id="quiz-continue" class="quiz-btn success" style="display: none;">Continue</button>
            </div>
          </div>
          
          <div class="quiz-stats">
            <div class="stat-item">
              <div class="stat-value" id="total-questions">0</div>
              <div class="stat-label">Questions</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" id="correct-answers">0</div>
              <div class="stat-label">Correct</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" id="max-streak">0</div>
              <div class="stat-label">Best Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', quizHTML);
  
  // Add event listeners
  setupQuizEventListeners();
}

/**
 * Create quiz settings panel
 */
function createQuizSettings() {
  const settingsHTML = `
    <div class="quiz-settings">
      <button id="quiz-settings-btn" class="quiz-settings-btn" title="Quiz Settings">
        ⚙️
      </button>
      <div id="quiz-settings-panel" class="quiz-settings-panel">
        <div class="settings-item">
          <label class="settings-label">Quiz Enabled</label>
          <input type="checkbox" id="quiz-enabled" ${quizConfig.enabled ? 'checked' : ''}>
        </div>
        <div class="settings-info">
          <small>Quiz appears ${Math.round(QUIZ_PROBABILITY * 100)}% of the time when enabled</small>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', settingsHTML);
  
  // Add settings event listeners
  setupSettingsEventListeners();
}

/**
 * Setup quiz event listeners
 */
function setupQuizEventListeners() {
  // Option selection
  document.addEventListener('click', function(e) {
    if (e.target.closest('.quiz-option') && !currentQuiz.isAnswered) {
      selectQuizOption(e.target.closest('.quiz-option'));
    }
  });
  
  // Submit answer
  document.getElementById('quiz-submit').addEventListener('click', submitQuizAnswer);
  
  // Skip quiz
  document.getElementById('quiz-skip').addEventListener('click', skipQuiz);
  
  // Continue after quiz
  document.getElementById('quiz-continue').addEventListener('click', continueAfterQuiz);
  
  // Close quiz on overlay click
  document.getElementById('quiz-overlay').addEventListener('click', function(e) {
    if (e.target === this) {
      skipQuiz();
    }
  });
}

/**
 * Setup settings event listeners
 */
function setupSettingsEventListeners() {
  const settingsBtn = document.getElementById('quiz-settings-btn');
  const settingsPanel = document.getElementById('quiz-settings-panel');
  
  settingsBtn.addEventListener('click', function() {
    settingsPanel.classList.toggle('visible');
  });
  
  // Close settings when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.quiz-settings')) {
      settingsPanel.classList.remove('visible');
    }
  });
  
  // Settings changes
  document.getElementById('quiz-enabled').addEventListener('change', function() {
    quizConfig.enabled = this.checked;
    saveQuizConfig();
  });
}

/**
 * Check if quiz should be shown based on probability
 */
function shouldShowQuiz() {
  return quizConfig.enabled && Math.random() < QUIZ_PROBABILITY;
}

/**
 * Show quiz before state elimination
 */
function showQuizForElimination(stateId, eliminationPreview, continueCallback) {
  currentQuiz.isActive = true;
  currentQuiz.elimination = eliminationPreview;
  currentQuiz.continueCallback = continueCallback;
  currentQuiz.isAnswered = false;
  currentQuiz.selectedOption = null;
  
  // Generate quiz question
  generateQuizQuestion(stateId, eliminationPreview);
  
  // Show modal
  const overlay = document.getElementById('quiz-overlay');
  overlay.classList.add('visible');
  
  // Update stats display
  updateQuizStatsDisplay();
  
  return true; // Quiz is shown, pause elimination
}

/**
 * Draw mini NFA in the spotlight canvas
 */
function drawMiniNFA(eliminatingStateId, preview) {
  const canvas = document.getElementById('nfa-mini-canvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Add a visible border for debugging
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  
  // Try multiple ways to get NFA data
  let nfa = null;
  if (window.currentNFA) {
    nfa = window.currentNFA;
  } else if (window.nfaData && window.currentNFA !== undefined) {
    nfa = window.nfaData[window.currentNFA];
  } else if (preview && preview.incoming && preview.outgoing) {
    // Reconstruct NFA from preview data
    const allStates = new Set();
    preview.incoming.forEach(t => { allStates.add(t.from); allStates.add(t.to); });
    preview.outgoing.forEach(t => { allStates.add(t.from); allStates.add(t.to); });
    allStates.add(eliminatingStateId);
    
    nfa = {
      states: Array.from(allStates),
      transitions: [...preview.incoming, ...preview.outgoing],
      startState: preview.incoming[0]?.from || eliminatingStateId,
      finalStates: [preview.outgoing[0]?.to || eliminatingStateId]
    };
    
    if (preview.selfLoop) {
      nfa.transitions.push(preview.selfLoop);
    }
  }
  
  if (!nfa || !nfa.states || nfa.states.length === 0) {
    // Draw error message
    ctx.fillStyle = '#e74c3c';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NFA data not available', canvas.width / 2, canvas.height / 2);
    console.error('NFA data not available', { window: window.currentNFA, preview });
    return;
  }
  
  const states = nfa.states;
  const transitions = nfa.transitions || [];
  
  // Calculate layout positions
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.3;
  const stateRadius = 25;
  
  // Position states in a circle
  const statePositions = {};
  states.forEach((state, index) => {
    const angle = (index / states.length) * 2 * Math.PI - Math.PI / 2;
    statePositions[state] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  // Draw transitions
  transitions.forEach(transition => {
    const from = statePositions[transition.from];
    const to = statePositions[transition.to];
    
    if (from && to) {
      // Highlight transitions involving the eliminating state
      if (transition.from === eliminatingStateId || transition.to === eliminatingStateId) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 2;
      }
      
      if (transition.from === transition.to) {
        // Self-loop
        ctx.beginPath();
        ctx.arc(from.x, from.y - stateRadius - 20, 15, 0, Math.PI * 2);
        ctx.stroke();
        
        // Label for self-loop
        ctx.fillStyle = '#2c3e50';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(transition.label || transition.symbol, from.x, from.y - stateRadius - 40);
      } else {
        // Regular transition
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / distance;
        const unitY = dy / distance;
        
        // Adjust start and end points to not overlap with circles
        const startX = from.x + unitX * stateRadius;
        const startY = from.y + unitY * stateRadius;
        const endX = to.x - unitX * stateRadius;
        const endY = to.y - unitY * stateRadius;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Arrow head
        const arrowLength = 12;
        const arrowAngle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(endX - arrowLength * Math.cos(arrowAngle - 0.3), endY - arrowLength * Math.sin(arrowAngle - 0.3));
        ctx.lineTo(endX, endY);
        ctx.lineTo(endX - arrowLength * Math.cos(arrowAngle + 0.3), endY - arrowLength * Math.sin(arrowAngle + 0.3));
        ctx.stroke();
        
        // Label
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        ctx.fillStyle = '#2c3e50';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(transition.label || transition.symbol, midX, midY - 8);
      }
    }
  });
  
  // Draw states
  states.forEach(state => {
    const pos = statePositions[state];
    if (!pos) return;
    
    // State circle
    if (state === eliminatingStateId) {
      // Highlight the state being eliminated
      ctx.fillStyle = '#e74c3c';
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 4;
    } else if (state === nfa.startState) {
      // Start state
      ctx.fillStyle = '#27ae60';
      ctx.strokeStyle = '#229954';
      ctx.lineWidth = 3;
    } else if (nfa.finalStates && nfa.finalStates.includes(state)) {
      // Final state
      ctx.fillStyle = '#f39c12';
      ctx.strokeStyle = '#d68910';
      ctx.lineWidth = 3;
    } else {
      // Regular state
      ctx.fillStyle = '#3498db';
      ctx.strokeStyle = '#2980b9';
      ctx.lineWidth = 2;
    }
    
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, stateRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // State label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state, pos.x, pos.y);
  });
  
  // Add legend
  ctx.fillStyle = '#2c3e50';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('🔴 Eliminating', 10, 25);
  ctx.fillText('🟢 Start', 10, 45);
  ctx.fillText('🟠 Final', 10, 65);
  ctx.fillText('🔵 Regular', 10, 85);
}

/**
 * Generate quiz question and options
 */
function generateQuizQuestion(stateId, preview) {
  // Build context for quiz panel
  const contextHTML = `
    <h5>State to Eliminate: ${stateId}</h5>
    <div class="context-item"><strong>Incoming:</strong> ${preview.incoming.map(t => `${t.from}→${t.to} (${t.label})`).join(', ')}</div>
    <div class="context-item"><strong>Outgoing:</strong> ${preview.outgoing.map(t => `${t.from}→${t.to} (${t.label})`).join(', ')}</div>
    ${preview.selfLoop ? `<div class="context-item"><strong>Self-loop:</strong> ${preview.selfLoop.label}</div>` : ''}
  `;
  
  document.getElementById('elimination-context').innerHTML = contextHTML;
  
  // Build detailed state info for NFA spotlight
  const stateDetailsHTML = `
    <div class="info-item"><strong>State ID:</strong> ${stateId}</div>
    <div class="info-item"><strong>Incoming Transitions:</strong> ${preview.incoming.length}</div>
    <div class="info-item"><strong>Outgoing Transitions:</strong> ${preview.outgoing.length}</div>
    ${preview.selfLoop ? `<div class="info-item"><strong>Self-loop:</strong> ${preview.selfLoop.label}</div>` : '<div class="info-item"><strong>Self-loop:</strong> None</div>'}
    <div class="info-item"><strong>New Transitions:</strong> ${preview.newTransitions.length}</div>
  `;
  
  document.getElementById('elimination-state-details').innerHTML = stateDetailsHTML;
  
  // Draw mini NFA in spotlight
  drawMiniNFA(stateId, preview);
  
  // Generate options
  const correctOptions = preview.newTransitions.map(t => t.label);
  const options = generateQuizOptions(correctOptions);
  
  // Render options
  const optionsHTML = options.map((option, index) => `
    <div class="quiz-option" data-index="${index}">
      <div class="option-letter">${String.fromCharCode(65 + index)}</div>
      <div class="option-text">${option.text}</div>
      <div class="option-feedback">${option.isCorrect ? '✓' : '✗'}</div>
    </div>
  `).join('');
  
  document.getElementById('quiz-options').innerHTML = optionsHTML;
  
  // Store correct option
  currentQuiz.correctOption = options.findIndex(opt => opt.isCorrect);
}

/**
 * Generate quiz options with distractors
 */
function generateQuizOptions(correctAnswers) {
  const options = [];
  
  // Add correct answer(s)
  const correctText = correctAnswers.length === 1 ? 
    correctAnswers[0] : 
    correctAnswers.join(', ');
    
  options.push({
    text: correctText,
    isCorrect: true,
    explanation: "This is the correct result of the state elimination."
  });
  
  // Generate distractors based on difficulty
  const distractors = generateDistractors(correctAnswers, QUIZ_DIFFICULTY);
  options.push(...distractors);
  
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  // Update correct option index after shuffle
  const correctIndex = options.findIndex(opt => opt.isCorrect);
  currentQuiz.correctOption = correctIndex;
  
  return options;
}

/**
 * Generate distractor options
 */
function generateDistractors(correctAnswers, difficulty = 'medium') {
  const distractors = [];
  
  // Common mistake patterns
  const mistakes = [
    // Missing parentheses
    correctAnswers[0]?.replace(/\(/g, '').replace(/\)/g, ''),
    // Wrong operator precedence
    correctAnswers[0]?.replace(/\|/g, '·').replace(/·/g, '|'),
    // Missing Kleene star
    correctAnswers[0]?.replace(/\*/g, ''),
    // Extra parentheses
    `(${correctAnswers[0]})`,
    // Union instead of concatenation
    correctAnswers[0]?.replace(/·/g, '|'),
    // Concatenation instead of union
    correctAnswers[0]?.replace(/\|/g, '·')
  ].filter(d => d && d !== correctAnswers[0]);
  
  // Add unique distractors
  const uniqueDistractors = [...new Set(mistakes)].slice(0, 3);
  
  uniqueDistractors.forEach((distractor, index) => {
    distractors.push({
      text: distractor,
      isCorrect: false,
      explanation: getDistractorExplanation(distractor, correctAnswers[0])
    });
  });
  
  // Ensure we have exactly 3 distractors
  while (distractors.length < 3) {
    distractors.push({
      text: generateRandomRegex(),
      isCorrect: false,
      explanation: "This is not the correct result of the elimination."
    });
  }
  
  return distractors.slice(0, 3);
}

/**
 * Generate random regex for distractors
 */
function generateRandomRegex() {
  const symbols = ['a', 'b'];
  const operators = ['|', '·', '*'];
  const patterns = [
    `${symbols[Math.floor(Math.random() * symbols.length)]}*`,
    `${symbols[Math.floor(Math.random() * symbols.length)]}${operators[Math.floor(Math.random() * 2)]}${symbols[Math.floor(Math.random() * symbols.length)]}`,
    `(${symbols[Math.floor(Math.random() * symbols.length)]}|${symbols[Math.floor(Math.random() * symbols.length)]})*`
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
}

/**
 * Get explanation for distractor
 */
function getDistractorExplanation(distractor, correct) {
  if (distractor.length < correct.length) {
    return "This option is missing some components from the elimination formula.";
  } else if (distractor.includes('|') && !correct.includes('|')) {
    return "This uses union (|) instead of concatenation (·).";
  } else if (!distractor.includes('*') && correct.includes('*')) {
    return "This is missing the Kleene star (*) for the self-loop.";
  }
  return "This is not the correct result of the elimination.";
}

/**
 * Select quiz option
 */
function selectQuizOption(optionElement) {
  // Clear previous selections
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Select new option
  optionElement.classList.add('selected');
  currentQuiz.selectedOption = parseInt(optionElement.dataset.index);
  
  // Enable submit button
  document.getElementById('quiz-submit').disabled = false;
}

/**
 * Submit quiz answer
 */
function submitQuizAnswer() {
  if (currentQuiz.selectedOption === null) return;
  
  currentQuiz.isAnswered = true;
  quizStats.totalQuestions++;
  
  const isCorrect = currentQuiz.selectedOption === currentQuiz.correctOption;
  
  // Update stats
  if (isCorrect) {
    quizStats.correctAnswers++;
    quizStats.streak++;
    quizStats.maxStreak = Math.max(quizStats.maxStreak, quizStats.streak);
  } else {
    quizStats.streak = 0;
  }
  
  // Show feedback
  showQuizFeedback(isCorrect);
  
  // Update options display
  updateOptionsAfterAnswer();
  
  // Update UI
  document.getElementById('quiz-submit').style.display = 'none';
  document.getElementById('quiz-skip').style.display = 'none';
  document.getElementById('quiz-continue').style.display = 'inline-block';
  
  // Save stats
  saveQuizStats();
  updateQuizStatsDisplay();
}

/**
 * Show quiz feedback
 */
function showQuizFeedback(isCorrect) {
  const feedback = document.getElementById('quiz-feedback');
  const options = document.querySelectorAll('.quiz-option');
  
  feedback.className = `quiz-feedback visible ${isCorrect ? 'correct' : 'incorrect'}`;
  feedback.innerHTML = `
    <div class="feedback-title">${isCorrect ? '🎉 Correct!' : '❌ Incorrect'}</div>
    <div class="feedback-explanation">
      ${isCorrect ? 
        'Great job! You correctly predicted the resulting regex.' : 
        SHOW_CORRECT_ANSWER ? 
          `The correct answer was option ${String.fromCharCode(65 + currentQuiz.correctOption)}.` :
          'Try to think about the state elimination formula: (incoming)(self-loop)*(outgoing)'}
    </div>
  `;
}

/**
 * Update options display after answer
 */
function updateOptionsAfterAnswer() {
  const options = document.querySelectorAll('.quiz-option');
  
  options.forEach((option, index) => {
    option.classList.add('disabled');
    
    if (index === currentQuiz.correctOption) {
      option.classList.add('correct');
    } else if (index === currentQuiz.selectedOption) {
      option.classList.add('incorrect');
    }
  });
}

/**
 * Skip quiz
 */
function skipQuiz() {
  closeQuiz();
  // Continue with elimination without quiz
  if (currentQuiz.continueCallback) {
    currentQuiz.continueCallback();
  }
  return true;
}

/**
 * Continue after quiz
 */
function continueAfterQuiz() {
  closeQuiz();
  // Continue with elimination after quiz
  if (currentQuiz.continueCallback) {
    currentQuiz.continueCallback();
  }
  return true;
}

/**
 * Close quiz modal
 */
function closeQuiz() {
  document.getElementById('quiz-overlay').classList.remove('visible');
  currentQuiz.isActive = false;
  
  // Reset quiz state
  setTimeout(() => {
    resetQuizState();
  }, 300);
}

/**
 * Reset quiz state
 */
function resetQuizState() {
  currentQuiz.question = null;
  currentQuiz.selectedOption = null;
  currentQuiz.isAnswered = false;
  currentQuiz.correctOption = null;
  currentQuiz.elimination = null;
  currentQuiz.continueCallback = null;
  
  // Reset UI
  document.getElementById('quiz-submit').style.display = 'inline-block';
  document.getElementById('quiz-submit').disabled = true;
  document.getElementById('quiz-skip').style.display = 'inline-block';
  document.getElementById('quiz-continue').style.display = 'none';
  document.getElementById('quiz-feedback').classList.remove('visible');
}

/**
 * Update quiz stats display
 */
function updateQuizStatsDisplay() {
  document.getElementById('total-questions').textContent = quizStats.totalQuestions;
  document.getElementById('correct-answers').textContent = quizStats.correctAnswers;
  document.getElementById('max-streak').textContent = quizStats.maxStreak;
  
  const accuracy = quizStats.totalQuestions > 0 ? 
    Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100) : 0;
  document.getElementById('quiz-accuracy').innerHTML = `Accuracy: <span class="quiz-score">${accuracy}%</span>`;
  document.getElementById('quiz-streak').innerHTML = `Streak: <span class="quiz-score">${quizStats.streak}</span>`;
}

/**
 * Save quiz configuration
 */
function saveQuizConfig() {
  localStorage.setItem('nfa-quiz-config', JSON.stringify(quizConfig));
}

/**
 * Load quiz configuration
 */
function loadQuizConfig() {
  const saved = localStorage.getItem('nfa-quiz-config');
  if (saved) {
    quizConfig = { ...quizConfig, ...JSON.parse(saved) };
    
    // Update UI elements
    document.getElementById('quiz-enabled').checked = quizConfig.enabled;
  }
}

/**
 * Save quiz statistics
 */
function saveQuizStats() {
  localStorage.setItem('nfa-quiz-stats', JSON.stringify(quizStats));
}

/**
 * Load quiz statistics
 */
function loadQuizStats() {
  const saved = localStorage.getItem('nfa-quiz-stats');
  if (saved) {
    quizStats = { ...quizStats, ...JSON.parse(saved) };
  }
}

/**
 * Reset quiz statistics
 */
function resetQuizStats() {
  quizStats = {
    totalQuestions: 0,
    correctAnswers: 0,
    streak: 0,
    maxStreak: 0
  };
  saveQuizStats();
  updateQuizStatsDisplay();
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Small delay to ensure other components are loaded
  setTimeout(initializeQuiz, 100);
});
