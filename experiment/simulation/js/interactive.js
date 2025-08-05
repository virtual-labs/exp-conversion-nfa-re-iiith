/**
 * Interactive functionality for NFA to Regular Expression conversion
 * Handles user interactions, animations, and advanced features
 */

// Interactive state management
const interactiveState = {
  selectedState: null,
  previewMode: false,
  animationSpeed: 1000,
  showHints: true,
  highlightedElements: new Set()
};

/**
 * Enhanced state selection with visual feedback
 */
function enhancedStateSelection() {
  // Add click handlers to all states
  document.addEventListener('click', function(event) {
    const stateGroup = event.target.closest('.state-group');
    if (!stateGroup || !conversionInProgress) return;
    
    const stateId = stateGroup.getAttribute('data-state-id');
    const state = currentNFA.states.find(s => s.id === stateId);
    
    if (!state || state.isStart || state.isAccept || conversionState.eliminatedStates.has(stateId)) {
      showStateSelectionFeedback(stateId, false);
      return;
    }
    
    selectStateForElimination(stateId);
    showStateSelectionFeedback(stateId, true);
  });
}

/**
 * Show feedback for state selection
 */
function showStateSelectionFeedback(stateId, isValid) {
  const state = currentNFA.states.find(s => s.id === stateId);
  
  if (!isValid) {
    let reason = 'Unknown reason';
    if (state) {
      if (state.isStart) reason = 'Cannot eliminate start state';
      else if (state.isAccept) reason = 'Cannot eliminate accept state';
      else if (conversionState.eliminatedStates.has(stateId)) reason = 'State already eliminated';
    }
    
    uiHelper.showFeedback(`Cannot select ${stateId}: ${reason}`, 'negative');
  } else {
    uiHelper.showFeedback(`Selected ${stateId} for elimination`, 'positive');
  }
}

/**
 * Preview mode for showing elimination effects
 */
function togglePreviewMode() {
  interactiveState.previewMode = !interactiveState.previewMode;
  
  if (interactiveState.previewMode && selectedStateId) {
    showEliminationAnimation();
  } else {
    clearPreviewEffects();
  }
}

/**
 * Show elimination animation preview
 */
function showEliminationAnimation() {
  if (!selectedStateId) return;
  
  // Simplified animation - just highlight the selected state
  animationHelper.highlightState(selectedStateId, 'selected');
}

/**
 * Highlight transitions affected by elimination
 */
function highlightAffectedTransitions(preview) {
  // Simplified highlighting - no preview functionality
  animationHelper.clearHighlights();
}

/**
 * Show preview of new transitions that would be created
 */
function showNewTransitionPreviews(newTransitions) {
  const canvas = document.getElementById('nfa-canvas');
  
  newTransitions.forEach(trans => {
    const fromState = currentNFA.states.find(s => s.id === trans.from);
    const toState = currentNFA.states.find(s => s.id === trans.to);
    
    if (fromState && toState) {
      // Create a preview transition element
      const previewGroup = canvasHelper.drawTransition(
        canvas, 
        { from: trans.from, to: trans.to, label: trans.label, type: 'normal' },
        currentNFA.states,
        true,
        'new'
      );
      
      previewGroup.classList.add('new-transition-preview');
      interactiveState.highlightedElements.add(previewGroup);
    }
  });
}

/**
 * Clear preview effects
 */
function clearPreviewEffects() {
  // Remove preview elements
  document.querySelectorAll('.new-transition-preview').forEach(element => {
    element.remove();
  });
  
  // Clear highlights
  interactiveState.highlightedElements.forEach(element => {
    element.classList.remove('incoming-edge', 'outgoing-edge', 'self-loop', 'new-edge');
  });
  
  interactiveState.highlightedElements.clear();
  animationHelper.clearHighlights();
}

/**
 * Show hints for the user - more exploratory and less prescriptive
 */
function showHints() {
  if (!conversionInProgress) {
    uiHelper.showFeedback('Start conversion first to explore different paths', 'info');
    return;
  }
  
  const availableStates = currentNFA.states.filter(
    s => !s.isStart && !s.isAccept && !conversionState.eliminatedStates.has(s.id)
  );
  
  if (availableStates.length === 0) {
    uiHelper.showFeedback('No more states to eliminate - see what regex you created!', 'positive');
    return;
  }
  
  // Give general hints about strategy rather than specific suggestions
  const hints = [
    'Try eliminating states with fewer connections first',
    'States with self-loops create more complex regex patterns',
    'Different elimination orders can lead to different regex forms',
    'Look for states that are "bottlenecks" in the NFA',
    'Consider which elimination might simplify the overall structure'
  ];
  
  const randomHint = hints[Math.floor(Math.random() * hints.length)];
  uiHelper.showFeedback(`💡 Hint: ${randomHint}`, 'info');
}

/**
 * Calculate elimination complexity for a state
 */
function calculateEliminationComplexity(stateId) {
  const incoming = currentNFA.transitions.filter(t => t.to === stateId && t.from !== stateId);
  const outgoing = currentNFA.transitions.filter(t => t.from === stateId && t.to !== stateId);
  const selfLoop = currentNFA.transitions.find(t => t.from === stateId && t.to === stateId);
  
  // Complexity is roughly the number of new transitions that would be created
  let complexity = incoming.length * outgoing.length;
  
  // Add penalty for self-loops (makes regex more complex)
  if (selfLoop) complexity += 2;
  
  // Add penalty for long labels
  incoming.forEach(t => complexity += t.label.length);
  outgoing.forEach(t => complexity += t.label.length);
  
  return complexity;
}

/**
 * Apply best move automatically - now more exploratory
 */
function applyBestMove() {
  if (!conversionInProgress) {
    uiHelper.showFeedback('Start conversion first', 'negative');
    return;
  }
  
  const availableStates = currentNFA.states.filter(
    s => !s.isStart && !s.isAccept && !conversionState.eliminatedStates.has(s.id)
  );
  
  if (availableStates.length === 0) {
    uiHelper.showFeedback('No states available to eliminate', 'info');
    return;
  }
  
  // Pick a random available state to encourage exploration
  const randomIndex = Math.floor(Math.random() * availableStates.length);
  const selectedState = availableStates[randomIndex];
  
  selectedStateId = selectedState.id;
  
  uiHelper.showFeedback(`Selected ${selectedState.id} for elimination!`, 'info');
  updateUI();
}

/**
 * Enhanced regex validation with educational feedback (implicit validation)
 */
function enhancedValidation() {
  // String validation functionality has been removed
  uiHelper.showFeedback('String validation functionality has been removed', 'info');
}

/**
 * Show example strings to encourage experimentation
 */
function showExampleStrings() {
  const container = document.getElementById('validation-result');
  const currentNFAData = nfaData[currentNFAIndex];
  
  let examplesHTML = container.innerHTML + '<br><br><strong>Try these examples:</strong><br>';
  
  // Mix some accepting and rejecting strings without labeling them
  const allExamples = [
    ...currentNFAData.testStrings.accepting.slice(0, 3),
    ...currentNFAData.testStrings.rejecting.slice(0, 3)
  ].sort(() => Math.random() - 0.5); // Shuffle them
  
  examplesHTML += '<div style="margin-top: 8px;">';
  allExamples.forEach(str => {
    examplesHTML += `<span style="background: #f3f4f6; padding: 2px 6px; margin: 2px; border-radius: 3px; cursor: pointer; font-family: monospace;" onclick="document.getElementById('testString').value='${str}'; validateString();">"${str}"</span> `;
  });
  examplesHTML += '</div>';
  
  container.innerHTML = examplesHTML;
}

/**
 * Keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          if (!conversionInProgress) startConversion();
          break;
        case 'e':
          event.preventDefault();
          if (selectedStateId) eliminateState();
          break;
        case 'r':
          event.preventDefault();
          resetConversion();
          break;
        case 'h':
          event.preventDefault();
          showHints();
          break;
        case 'b':
          event.preventDefault();
          applyBestMove();
          break;
        case 'z':
          event.preventDefault();
          stepBack();
          break;
      }
    }
  });
}

/**
 * Export conversion results
 */
function exportResults() {
  if (!conversionState.finalRegex) {
    uiHelper.showFeedback('Complete conversion first to export results', 'negative');
    return;
  }
  
  const results = {
    originalNFA: nfaData[currentNFAIndex],
    finalRegex: conversionState.finalRegex,
    steps: conversionState.steps,
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `nfa-to-regex-conversion-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
  
  uiHelper.showFeedback('Results exported successfully!', 'positive');
}

// Initialize interactive features
document.addEventListener('DOMContentLoaded', function() {
  enhancedStateSelection();
  setupKeyboardShortcuts();
  
  // Add buttons for enhanced features
  const controlSection = document.querySelector('.control-section');
  if (controlSection) {
    const enhancedButtons = document.createElement('div');
    enhancedButtons.className = 'enhanced-controls';
    enhancedButtons.innerHTML = `
      <button onclick="showHints()" class="btn info" style="margin-top: 8px;">💡 Strategy Hint</button>
      <button onclick="applyBestMove()" class="btn secondary" style="margin-top: 4px;">🎲 Explore Random</button>
      <button onclick="exportResults()" class="btn info" style="margin-top: 4px;">📤 Export Results</button>
    `;
    controlSection.appendChild(enhancedButtons);
  }
  
  // Override the original validateString function
  window.validateString = enhancedValidation;
});
