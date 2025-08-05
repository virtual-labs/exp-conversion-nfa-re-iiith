/**
 * Main JavaScript file for NFA to Regular Expression conversion simulation
 * Handles the core logic for state elimination algorithm
 */

// Global variables
let currentNFAIndex = 0;
let currentNFA = null;
let conversionInProgress = false;
let selectedStateId = null;

/**
 * Initialize the application
 */
function initializeApp() {
  currentNFA = JSON.parse(JSON.stringify(nfaData[currentNFAIndex])); // Deep copy
  setupEventListeners();
  updateNFAButtonText();
  renderNFA();
  updateUI();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // State selection is now handled by clicking directly on states in the canvas
  // Individual state click handlers are attached in canvasHelper.drawState()
}

/**
 * Change the current NFA (cycle through NFAs)
 */
function changeNFA() {
  // Cycle to the next NFA
  currentNFAIndex = (currentNFAIndex + 1) % nfaData.length;
  currentNFA = JSON.parse(JSON.stringify(nfaData[currentNFAIndex])); // Deep copy
  
  // Update the button text to show current NFA
  updateNFAButtonText();
  
  resetConversion();
  renderNFA();
  updateUI();
}

/**
 * Update the NFA button text to show current NFA
 */
function updateNFAButtonText() {
  const button = document.getElementById('changeNfaBtn');
  const titleElement = document.getElementById('current-nfa-title');
  const nfaNames = [
    'Complex NFA 1: Multi-branch',
    'Complex NFA 2: Loops & Choices', 
    'Complex NFA 3: Diamond Structure',
    'Challenging NFA: Advanced'
  ];
  
  if (button) {
    // Keep the SVG icon and update the text
    const svg = button.querySelector('svg');
    button.innerHTML = '';
    if (svg) {
      button.appendChild(svg);
    }
    button.appendChild(document.createTextNode(' Change NFA (' + (currentNFAIndex + 1) + '/4)'));
  }
  
  // Update the NFA description title
  if (titleElement) {
    titleElement.textContent = nfaNames[currentNFAIndex];
  }
}

/**
 * Render the current NFA on the canvas
 */
function renderNFA() {
  const canvas = document.getElementById('nfa-canvas');
  canvasHelper.clearCanvas(canvas);
  
  if (!currentNFA) return;
  
  // Draw states
  currentNFA.states.forEach(state => {
    const isEliminated = conversionState.eliminatedStates.has(state.id);
    const isHighlighted = state.id === selectedStateId;
    canvasHelper.drawState(canvas, state, isHighlighted, isEliminated);
  });
  
  // Draw transitions
  currentNFA.transitions.forEach(transition => {
    const isFromEliminated = conversionState.eliminatedStates.has(transition.from);
    const isToEliminated = conversionState.eliminatedStates.has(transition.to);
    
    if (!isFromEliminated && !isToEliminated) {
      canvasHelper.drawTransition(canvas, transition, currentNFA.states);
    }
  });
  
  // Update regex display
  updateRegexDisplay();
}

/**
 * Update available states for elimination (now handled by clicking)
 */
/**
 * Start the conversion process
 */
function startConversion() {
  conversionInProgress = true;
  conversionState.isConverting = true;
  conversionState.currentNFA = JSON.parse(JSON.stringify(currentNFA));
  
  // Initialize history with the starting state
  conversionState.history = [{
    nfa: JSON.parse(JSON.stringify(currentNFA)),
    eliminatedStates: new Set(),
    step: 0,
    description: 'Initial NFA state'
  }];
  
  uiHelper.showFeedback('Conversion started! Click on intermediate states to eliminate them.', 'info');
  uiHelper.addStep(1, 'Conversion Started', 'Ready to eliminate intermediate states by clicking');
  uiHelper.markStepAsCurrent(1);
  
  updateUI();
  renderNFA();
}

/**
 * Eliminate the selected state
 */
/**
 * Calculate what the elimination would produce without actually doing it
 */
function calculateEliminationPreview(stateId) {
  const incoming = currentNFA.transitions.filter(t => t.to === stateId && t.from !== stateId);
  const outgoing = currentNFA.transitions.filter(t => t.from === stateId && t.to !== stateId);
  const selfLoop = currentNFA.transitions.find(t => t.from === stateId && t.to === stateId);
  
  const newTransitions = [];
  
  // For each combination of incoming and outgoing transitions
  incoming.forEach(inTrans => {
    outgoing.forEach(outTrans => {
      // Construct the new regex: (incoming)(self-loop)*(outgoing)
      let newRegex = inTrans.label;
      
      if (selfLoop) {
        const selfRegex = regexHelpers.star(selfLoop.label);
        newRegex = regexHelpers.concat(newRegex, selfRegex);
      }
      
      newRegex = regexHelpers.concat(newRegex, outTrans.label);
      
      // Check if there's already a transition between these states
      const existingTransition = currentNFA.transitions.find(
        t => t.from === inTrans.from && t.to === outTrans.to && 
             !conversionState.eliminatedStates.has(t.from) && 
             !conversionState.eliminatedStates.has(t.to)
      );
      
      if (existingTransition) {
        // Union with existing transition
        newRegex = regexHelpers.union(existingTransition.label, newRegex);
      }
      
      newTransitions.push({
        from: inTrans.from,
        to: outTrans.to,
        label: regexHelpers.simplify(newRegex),
        isNew: !existingTransition
      });
    });
  });
  
  return {
    stateId,
    incoming,
    outgoing,
    selfLoop,
    newTransitions
  };
}

function eliminateState() {
  if (!selectedStateId || !conversionInProgress) return;
  
  // Check if quiz should be shown before proceeding
  if (window.shouldShowQuiz && window.showQuizForElimination) {
    if (window.shouldShowQuiz()) {
      // Generate elimination preview for the quiz
      const preview = calculateEliminationPreview(selectedStateId);
      
      // Show quiz and let it handle the elimination
      window.showQuizForElimination(selectedStateId, preview, proceedWithElimination);
      return;
    }
  }

  // Proceed with elimination immediately if no quiz
  proceedWithElimination();
}

function proceedWithElimination() {
  if (!selectedStateId || !conversionInProgress) return;
  
  uiHelper.showLoading('Eliminating state...');
  
  setTimeout(() => {
    // Calculate elimination inline
    const stateId = selectedStateId;
    const incoming = currentNFA.transitions.filter(t => t.to === stateId && t.from !== stateId);
    const outgoing = currentNFA.transitions.filter(t => t.from === stateId && t.to !== stateId);
    const selfLoop = currentNFA.transitions.find(t => t.from === stateId && t.to === stateId);
    
    const newTransitions = [];
    
    // For each combination of incoming and outgoing transitions
    incoming.forEach(inTrans => {
      outgoing.forEach(outTrans => {
        // Construct the new regex: (incoming)(self-loop)*(outgoing)
        let newRegex = inTrans.label;
        
        if (selfLoop) {
          const selfRegex = regexHelpers.star(selfLoop.label);
          newRegex = regexHelpers.concat(newRegex, selfRegex);
        }
        
        newRegex = regexHelpers.concat(newRegex, outTrans.label);
        
        // Check if there's already a transition between these states
        const existingTransition = currentNFA.transitions.find(
          t => t.from === inTrans.from && t.to === outTrans.to && 
               !conversionState.eliminatedStates.has(t.from) && 
               !conversionState.eliminatedStates.has(t.to)
        );
        
        if (existingTransition) {
          // Union with existing transition
          newRegex = regexHelpers.union(existingTransition.label, newRegex);
        }
        
        newTransitions.push({
          from: inTrans.from,
          to: outTrans.to,
          label: regexHelpers.simplify(newRegex),
          isNew: !existingTransition
        });
      });
    });
    
    const eliminationData = {
      stateId,
      incoming,
      outgoing,
      selfLoop,
      newTransitions
    };
    
    // Save current state to history before making changes
    saveCurrentStateToHistory(selectedStateId);
    
    // Apply the elimination
    applyStateElimination(eliminationData);
    
    // Update the visualization
    conversionState.eliminatedStates.add(selectedStateId);
    conversionState.currentStep++;
    
    // Add step to the log
    const stepTitle = `Eliminated state ${selectedStateId}`;
    const stepContent = `Removed ${selectedStateId} and updated transitions`;
    uiHelper.addStep(conversionState.currentStep + 1, stepTitle, stepContent);
    uiHelper.markStepAsCompleted(conversionState.currentStep);
    uiHelper.markStepAsCurrent(conversionState.currentStep + 1);
    
    // Clear selection
    selectedStateId = null;
    
    // Update UI
    renderNFA();
    updateUI();
    animationHelper.clearHighlights();
    
    // Check if conversion is complete
    checkConversionComplete();
    
    uiHelper.showFeedback(`State eliminated successfully!`, 'positive');
  }, 1000);
}

/**
 * Apply the state elimination to the NFA
 */
function applyStateElimination(preview) {
  // Remove transitions involving the eliminated state
  currentNFA.transitions = currentNFA.transitions.filter(
    t => t.from !== preview.stateId && t.to !== preview.stateId
  );
  
  // Add new transitions
  preview.newTransitions.forEach(newTrans => {
    // Remove existing transition if it exists
    currentNFA.transitions = currentNFA.transitions.filter(
      t => !(t.from === newTrans.from && t.to === newTrans.to)
    );
    
    // Add the new transition
    currentNFA.transitions.push({
      from: newTrans.from,
      to: newTrans.to,
      label: newTrans.label,
      type: 'normal'
    });
  });
}

/**
 * Check if conversion is complete
 */
function checkConversionComplete() {
  const remainingStates = currentNFA.states.filter(
    s => !conversionState.eliminatedStates.has(s.id)
  );
  
  const intermediateStates = remainingStates.filter(s => !s.isStart && !s.isAccept);
  
  if (intermediateStates.length === 0) {
    // Conversion is complete
    completeConversion();
  }
}

/**
 * Complete the conversion process
 */
function completeConversion() {
  // Find the final transition from start to accept state
  const startState = currentNFA.states.find(s => s.isStart);
  const acceptStates = currentNFA.states.filter(s => s.isAccept);
  
  let finalRegex = regexOperators.EMPTY;
  
  acceptStates.forEach(acceptState => {
    const finalTransition = currentNFA.transitions.find(
      t => t.from === startState.id && t.to === acceptState.id
    );
    
    if (finalTransition) {
      finalRegex = regexHelpers.union(finalRegex, finalTransition.label);
    }
  });
  
  finalRegex = regexHelpers.simplify(finalRegex);
  conversionState.finalRegex = finalRegex;
  
  // Update UI
  document.getElementById('final-regex').textContent = finalRegex;
  document.getElementById('current-regex').textContent = finalRegex;
  
  uiHelper.addStep(conversionState.currentStep + 1, 'Conversion Complete!', 
    `Final regular expression: ${finalRegex}`, finalRegex);
  uiHelper.markStepAsCurrent(conversionState.currentStep + 1);
  
  uiHelper.showFeedback('Conversion completed successfully!', 'positive');
  
  updateUI();
}

/**
 * Step back in the conversion
 */
function stepBack() {
  if (!conversionInProgress || conversionState.history.length <= 1) {
    uiHelper.showFeedback('Cannot step back - no previous states available', 'negative');
    return;
  }
  
  uiHelper.showLoading('Stepping back...');
  
  setTimeout(() => {
    // Remove current state from history
    conversionState.history.pop();
    
    // Get the previous state
    const previousState = conversionState.history[conversionState.history.length - 1];
    
    // Get the state that was just restored (if any)
    const restoredStateId = previousState.eliminatedStateId || null;
    
    // Restore the previous state
    restoreStateFromHistory(previousState);
    
    // Show visual feedback for the restored state
    if (restoredStateId) {
      const restoredStateElement = document.querySelector(`[data-state-id="${restoredStateId}"]`);
      if (restoredStateElement) {
        restoredStateElement.classList.add('state-highlight');
        setTimeout(() => {
          restoredStateElement.classList.remove('state-highlight');
        }, 2000);
      }
      uiHelper.showFeedback(`Stepped back - restored state ${restoredStateId}`, 'info');
    } else {
      uiHelper.showFeedback(`Stepped back to previous state`, 'info');
    }
    
    renderNFA();
    updateUI();
    animationHelper.clearHighlights();
    
    // Clear any selections
    selectedStateId = null;
    
    // Remove the last step from the UI
    uiHelper.removeLastStep();
    
  }, 500);
}

/**
 * Save current state to history before making changes
 */
function saveCurrentStateToHistory(eliminatedStateId) {
  const currentStateSnapshot = {
    nfa: JSON.parse(JSON.stringify(currentNFA)),
    eliminatedStates: new Set(conversionState.eliminatedStates),
    step: conversionState.currentStep,
    description: `Before eliminating ${eliminatedStateId}`,
    eliminatedStateId: eliminatedStateId
  };
  
  conversionState.history.push(currentStateSnapshot);
}

/**
 * Restore state from history
 */
function restoreStateFromHistory(historyState) {
  // Restore NFA
  currentNFA = JSON.parse(JSON.stringify(historyState.nfa));
  conversionState.currentNFA = JSON.parse(JSON.stringify(historyState.nfa));
  
  // Restore eliminated states
  conversionState.eliminatedStates = new Set(historyState.eliminatedStates);
  
  // Restore step counter
  conversionState.currentStep = historyState.step;
  
  // Clear final regex if we stepped back
  if (conversionState.currentStep < conversionState.steps.length) {
    conversionState.finalRegex = null;
    document.getElementById('final-regex').textContent = 'Conversion in progress...';
    document.getElementById('current-regex').textContent = 'Conversion in progress...';
  }
}

/**
 * Reset the conversion
 */
function resetConversion() {
  conversionInProgress = false;
  conversionState.isConverting = false;
  conversionState.eliminatedStates.clear();
  conversionState.currentStep = 0;
  conversionState.finalRegex = null;
  conversionState.history = []; // Clear history
  selectedStateId = null;
  
  // Reset NFA to original state
  currentNFA = JSON.parse(JSON.stringify(nfaData[currentNFAIndex]));
  
  // Clear UI
  selectedStateId = null; // Clear selected state instead of dropdown
  document.getElementById('current-regex').textContent = 'Click "Start Conversion" to begin';
  document.getElementById('final-regex').textContent = 'Conversion not started';
  
  uiHelper.clearSteps();
  animationHelper.clearHighlights();
  
  renderNFA();
  updateUI();
}

/**
 * Update regex display
 */
function updateRegexDisplay() {
  const regexDisplay = document.getElementById('current-regex');
  
  if (!conversionInProgress) {
    regexDisplay.textContent = 'Click "Start Conversion" to begin';
  } else if (conversionState.finalRegex) {
    regexDisplay.textContent = conversionState.finalRegex;
  } else {
    regexDisplay.textContent = 'Conversion in progress...';
  }
}

/**
 * Update UI button states
 */
function updateUI() {
  const canEliminate = selectedStateId && conversionInProgress;
  
  uiHelper.updateButtons({
    isConverting: conversionInProgress,
    canEliminate: canEliminate,
    currentStep: conversionState.currentStep,
    history: conversionState.history
  });
}

/**
 * Select a state for elimination (called from UI)
 */
function selectStateForElimination(stateId) {
  if (!conversionInProgress) return;
  
  const state = currentNFA.states.find(s => s.id === stateId);
  if (!state || state.isStart || state.isAccept || conversionState.eliminatedStates.has(stateId)) {
    return;
  }
  
  selectedStateId = stateId;
  renderNFA(); // Re-render to show highlight
  updateUI();
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Toggle algorithm information modal
 */
function toggleAlgorithmInfo() {
  const modal = document.getElementById('algorithmModal');
  if (modal) {
    modal.classList.toggle('hidden');
  }
}

// Close modal when clicking outside of it
document.addEventListener('click', function(event) {
  const modal = document.getElementById('algorithmModal');
  const modalContent = modal?.querySelector('.modal-content');
  
  if (modal && !modal.classList.contains('hidden') && 
      !modalContent?.contains(event.target) && 
      !event.target.closest('#algorithmBtn')) {
    modal.classList.add('hidden');
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const modal = document.getElementById('algorithmModal');
    if (modal && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
    }
  }
});
