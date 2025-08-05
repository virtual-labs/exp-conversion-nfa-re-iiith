/**
 * Helper functions for NFA visualization and Regular Expression operations
 */

// Canvas and SVG helper functions
const canvasHelper = {
  // Calculate vertical offset to center the diagram
  getVerticalOffset: function() {
    // SVG height is 400px, typical diagram uses y-coordinates from 120-280 (160px range)
    // The diagram is naturally centered at Y=200 (middle of 120-280)
    // Canvas center is also at Y=200 (400px / 2)
    // So theoretically no offset is needed, but we need clearance for:
    // - Self-loops that extend 45px above states
    // - Start arrows that extend 40px to the left
    // We'll use a small offset to ensure good visual centering
    return 10; // Minimal offset for optimal visual centering
  },
  
  // Calculate horizontal offset to center the diagram
  getHorizontalOffset: function() {
    // SVG width is 600px, typical diagram uses x-coordinates from 80-480 (400px range)
    // We want to center this 400px range in the 600px canvas
    // Adding 100px will center the diagram horizontally
    return 100; // Offset to move diagram right by 100px to center it
  },
  
  // Clear SVG canvas
  clearCanvas: function(svgElement) {
    if (svgElement) {
      svgElement.innerHTML = '';
    }
  },
  
  // Create SVG element with attributes
  createElement: function(tag, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  },
  
  // Draw a state circle
  drawState: function(svg, state, isHighlighted = false, isEliminated = false) {
    const verticalOffset = this.getVerticalOffset();
    const horizontalOffset = this.getHorizontalOffset();
    const adjustedX = state.x + horizontalOffset;
    const adjustedY = state.y + verticalOffset;
    
    const group = this.createElement('g', {
      class: `state-group ${isHighlighted ? 'state-highlight' : ''} ${isEliminated ? 'eliminated-state' : ''}`,
      'data-state-id': state.id
    });
    
    // Outer circle for accept states
    if (state.isAccept) {
      const outerCircle = this.createElement('circle', {
        cx: adjustedX,
        cy: adjustedY,
        r: 30,
        fill: 'none',
        stroke: '#374151',
        'stroke-width': '2'
      });
      group.appendChild(outerCircle);
    }
    
    // Main state circle
    const circle = this.createElement('circle', {
      cx: adjustedX,
      cy: adjustedY,
      r: 25,
      fill: state.isStart ? '#dbeafe' : (state.isAccept ? '#dcfce7' : '#f9fafb'),
      stroke: '#374151',
      'stroke-width': '2'
    });
    
    if (!isEliminated) {
      circle.classList.add('eliminable-state');
      circle.addEventListener('click', () => selectStateForElimination(state.id));
    }
    
    if (isHighlighted) {
      circle.classList.add('selected-state');
    }
    
    group.appendChild(circle);
    
    // State label
    const text = this.createElement('text', {
      x: adjustedX,
      y: adjustedY,
      class: 'state-label'
    });
    text.textContent = state.id;
    group.appendChild(text);
    
    // Start arrow for start state
    if (state.isStart) {
      const startArrow = this.drawStartArrow(adjustedX - 40, adjustedY, adjustedX - 25, adjustedY);
      group.appendChild(startArrow);
    }
    
    svg.appendChild(group);
    return group;
  },
  
  // Draw start arrow
  drawStartArrow: function(x1, y1, x2, y2) {
    const group = this.createElement('g');
    
    // Arrow line
    const line = this.createElement('line', {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      stroke: '#374151',
      'stroke-width': '2'
    });
    group.appendChild(line);
    
    // Arrow head
    const arrowHead = this.createElement('polygon', {
      points: `${x2},${y2} ${x2-8},${y2-4} ${x2-8},${y2+4}`,
      fill: '#374151'
    });
    group.appendChild(arrowHead);
    
    return group;
  },
  
  // Draw transition arrow
  drawTransition: function(svg, transition, states, isHighlighted = false, highlightType = '') {
    const fromState = states.find(s => s.id === transition.from);
    const toState = states.find(s => s.id === transition.to);
    
    if (!fromState || !toState) return;
    
    const group = this.createElement('g', {
      class: `transition-group ${isHighlighted ? `${highlightType}-edge transition-highlight` : ''}`,
      'data-from': transition.from,
      'data-to': transition.to
    });
    
    if (transition.type === 'self') {
      // Self loop
      const loopGroup = this.drawSelfLoop(fromState, transition.label, isHighlighted, highlightType);
      group.appendChild(loopGroup);
    } else {
      // Regular transition
      const arrowGroup = this.drawArrow(fromState, toState, transition.label, isHighlighted, highlightType);
      group.appendChild(arrowGroup);
    }
    
    svg.appendChild(group);
    return group;
  },
  
  // Draw self loop
  drawSelfLoop: function(state, label, isHighlighted = false, highlightType = '') {
    const verticalOffset = this.getVerticalOffset();
    const horizontalOffset = this.getHorizontalOffset();
    const adjustedX = state.x + horizontalOffset;
    const adjustedY = state.y + verticalOffset;
    
    const group = this.createElement('g');
    
    // Self loop arc
    const path = this.createElement('path', {
      d: `M ${adjustedX-15} ${adjustedY-20} Q ${adjustedX} ${adjustedY-45} ${adjustedX+15} ${adjustedY-20}`,
      fill: 'none',
      stroke: isHighlighted ? this.getHighlightColor(highlightType) : '#374151',
      'stroke-width': isHighlighted ? '3' : '2'
    });
    group.appendChild(path);
    
    // Arrow head
    const arrowHead = this.createElement('polygon', {
      points: `${adjustedX+15},${adjustedY-20} ${adjustedX+20},${adjustedY-15} ${adjustedX+10},${adjustedY-15}`,
      fill: isHighlighted ? this.getHighlightColor(highlightType) : '#374151'
    });
    group.appendChild(arrowHead);
    
    // Label
    const text = this.createElement('text', {
      x: adjustedX,
      y: adjustedY - 35,
      class: 'transition-label'
    });
    text.textContent = label;
    group.appendChild(text);
    
    return group;
  },
  
  // Draw arrow between states
  drawArrow: function(fromState, toState, label, isHighlighted = false, highlightType = '') {
    const verticalOffset = this.getVerticalOffset();
    const horizontalOffset = this.getHorizontalOffset();
    const fromX = fromState.x + horizontalOffset;
    const fromY = fromState.y + verticalOffset;
    const toX = toState.x + horizontalOffset;
    const toY = toState.y + verticalOffset;
    
    const group = this.createElement('g');
    
    // Calculate arrow position
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    const startX = fromX + unitX * 25;
    const startY = fromY + unitY * 25;
    const endX = toX - unitX * 25;
    const endY = toY - unitY * 25;
    
    // Arrow line
    const line = this.createElement('line', {
      x1: startX,
      y1: startY,
      x2: endX,
      y2: endY,
      stroke: isHighlighted ? this.getHighlightColor(highlightType) : '#374151',
      'stroke-width': isHighlighted ? '3' : '2'
    });
    group.appendChild(line);
    
    // Arrow head
    const arrowHeadX = endX - unitX * 8;
    const arrowHeadY = endY - unitY * 8;
    const perpX = -unitY * 4;
    const perpY = unitX * 4;
    
    const arrowHead = this.createElement('polygon', {
      points: `${endX},${endY} ${arrowHeadX + perpX},${arrowHeadY + perpY} ${arrowHeadX - perpX},${arrowHeadY - perpY}`,
      fill: isHighlighted ? this.getHighlightColor(highlightType) : '#374151'
    });
    group.appendChild(arrowHead);
    
    // Label
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2 - 10;
    
    const text = this.createElement('text', {
      x: midX,
      y: midY,
      class: 'transition-label'
    });
    text.textContent = label;
    group.appendChild(text);
    
    return group;
  },
  
  // Get highlight color based on type
  getHighlightColor: function(type) {
    switch (type) {
      case 'incoming': return '#10b981';
      case 'outgoing': return '#f59e0b';
      case 'self-loop': return '#8b5cf6';
      case 'new': return '#ef4444';
      default: return '#374151';
    }
  }
};

// Regular expression validation and testing
const regexValidator = {
  // Convert simplified regex to JavaScript regex
  toJavaScriptRegex: function(regexString) {
    if (!regexString || regexString === regexOperators.EMPTY) return null;
    
    // Replace custom operators with JavaScript equivalents
    let jsRegex = regexString
      .replace(/·/g, '')  // Remove explicit concatenation
      .replace(/ε/g, '')  // Replace epsilon with empty string
      .replace(/∅/g, '(?!.*)')  // Replace empty set with negative lookahead
      .replace(/\|/g, '|');  // Union remains the same
    
    try {
      return new RegExp(`^${jsRegex}$`);
    } catch (e) {
      console.error('Invalid regex:', jsRegex, e);
      return null;
    }
  },
  
  // Test string against regex
  testString: function(regexString, testString) {
    const jsRegex = this.toJavaScriptRegex(regexString);
    if (!jsRegex) return { valid: false, error: 'Invalid regex' };
    
    try {
      const result = jsRegex.test(testString);
      return { valid: true, accepted: result };
    } catch (e) {
      return { valid: false, error: e.message };
    }
  },
  
  // Test against NFA directly (for validation)
  testAgainstNFA: function(nfa, testString) {
    // Simple NFA simulation for validation
    let currentStates = new Set([nfa.states.find(s => s.isStart)?.id]);
    
    for (const symbol of testString) {
      const nextStates = new Set();
      
      currentStates.forEach(stateId => {
        nfa.transitions
          .filter(t => t.from === stateId && t.label.split(',').includes(symbol))
          .forEach(t => nextStates.add(t.to));
      });
      
      currentStates = nextStates;
      if (currentStates.size === 0) break;
    }
    
    // Check if any current state is accepting
    return Array.from(currentStates).some(stateId => 
      nfa.states.find(s => s.id === stateId)?.isAccept
    );
  }
};

// UI helper functions
const uiHelper = {
  // Show feedback message
  showFeedback: function(message, type = 'info') {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `feedback-${type}`;
    feedbackDiv.textContent = message;
    
    // Show feedback in the current regex display area instead
    const container = document.getElementById('current-regex');
    if (container) {
      const originalContent = container.textContent;
      container.textContent = message;
      
      // Auto-restore original content after 3 seconds
      setTimeout(() => {
        if (container.textContent === message) {
          container.textContent = originalContent;
        }
      }, 3000);
    }
    
    // Auto-hide after 3 seconds for positive/negative feedback
    if (type !== 'info') {
      setTimeout(() => {
        if (container.contains(feedbackDiv)) {
          container.innerHTML = '<p>Select a state to see elimination preview</p>';
        }
      }, 3000);
    }
  },
  
  // Update progress bar
  updateProgress: function(current, total) {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      const percentage = (current / total) * 100;
      progressBar.style.width = `${percentage}%`;
    }
  },
  
  // Add step to steps list
  addStep: function(stepNumber, title, content, regex = null) {
    const stepsList = document.getElementById('steps-list');
    
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-item conversion-step';
    stepDiv.id = `step-${stepNumber}`;
    
    stepDiv.innerHTML = `
      <div class="step-header">
        <span class="step-number">${stepNumber}</span>
        <span class="step-title">${title}</span>
      </div>
      <div class="step-content">${content}</div>
      ${regex ? `<div class="step-regex">${regex}</div>` : ''}
    `;
    
    stepsList.appendChild(stepDiv);
    
    // Scroll to the new step
    stepDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  
  // Mark step as current
  markStepAsCurrent: function(stepNumber) {
    // Remove current class from all steps
    document.querySelectorAll('.step-item').forEach(step => {
      step.classList.remove('current', 'active');
    });
    
    // Add current class to specified step
    const currentStep = document.getElementById(`step-${stepNumber}`);
    if (currentStep) {
      currentStep.classList.add('current', 'active');
    }
  },
  
  // Mark step as completed
  markStepAsCompleted: function(stepNumber) {
    const step = document.getElementById(`step-${stepNumber}`);
    if (step) {
      step.classList.remove('current', 'active');
      step.classList.add('completed');
    }
  },
  
  // Remove last step from the list
  removeLastStep: function() {
    const stepsList = document.getElementById('steps-list');
    const steps = stepsList.querySelectorAll('.step-item:not(.initial)');
    
    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      lastStep.remove();
      
      // Mark the new last step as current if it exists
      const remainingSteps = stepsList.querySelectorAll('.step-item:not(.initial)');
      if (remainingSteps.length > 0) {
        const newLastStep = remainingSteps[remainingSteps.length - 1];
        newLastStep.classList.remove('completed');
        newLastStep.classList.add('current', 'active');
      }
    }
  },
  
  // Clear all steps
  clearSteps: function() {
    const stepsList = document.getElementById('steps-list');
    stepsList.innerHTML = `
      <div class="step-item initial">
        <div class="step-header">
          <span class="step-number">0</span>
          <span class="step-title">Initial NFA</span>
        </div>
        <div class="step-content">
          Original NFA ready for conversion
        </div>
      </div>
    `;
  },
  
  // Enable/disable buttons
  updateButtons: function(state) {
    document.getElementById('startBtn').disabled = state.isConverting;
    document.getElementById('eliminateBtn').disabled = !state.canEliminate;
    document.getElementById('stepBackBtn').disabled = !state.isConverting || (state.history && state.history.length <= 1);
    document.getElementById('resetBtn').disabled = !state.isConverting && state.currentStep === 0;
  },
  
  // Show loading state
  showLoading: function(message = 'Processing...') {
    // Show loading message in the current regex display area instead
    const container = document.getElementById('current-regex');
    if (container) {
      container.textContent = message;
    }
  }
};

// Animation helper functions
const animationHelper = {
  // Highlight states and transitions for elimination
  highlightElimination: function(stateId, nfa) {
    // Clear previous highlights
    this.clearHighlights();
    
    // Highlight the state to be eliminated
    const stateElement = document.querySelector(`[data-state-id="${stateId}"]`);
    if (stateElement) {
      stateElement.classList.add('selected-state');
    }
    
    // Highlight incoming, outgoing, and self-loop transitions
    nfa.transitions.forEach(transition => {
      const transitionElement = document.querySelector(
        `[data-from="${transition.from}"][data-to="${transition.to}"]`
      );
      
      if (transitionElement) {
        if (transition.to === stateId && transition.from !== stateId) {
          transitionElement.classList.add('incoming-edge');
        } else if (transition.from === stateId && transition.to !== stateId) {
          transitionElement.classList.add('outgoing-edge');
        } else if (transition.from === stateId && transition.to === stateId) {
          transitionElement.classList.add('self-loop');
        }
      }
    });
  },
  
  // Clear all highlights
  clearHighlights: function() {
    document.querySelectorAll('.selected-state, .incoming-edge, .outgoing-edge, .self-loop, .new-edge')
      .forEach(element => {
        element.classList.remove('selected-state', 'incoming-edge', 'outgoing-edge', 'self-loop', 'new-edge');
      });
  },
  
  // Animate state elimination
  animateElimination: function(stateId, callback) {
    const stateElement = document.querySelector(`[data-state-id="${stateId}"]`);
    if (stateElement) {
      stateElement.style.transition = 'all 0.5s ease';
      stateElement.style.opacity = '0';
      stateElement.style.transform = 'scale(0)';
      
      setTimeout(() => {
        stateElement.classList.add('eliminated-state');
        if (callback) callback();
      }, 500);
    } else if (callback) {
      callback();
    }
  }
};
