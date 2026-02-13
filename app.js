/**
 * DollarQ Gesture Recognizer Web Demo
 * Interactive canvas application for real-time gesture recognition
 */

class DrawingCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentStroke = [];
        this.allStrokes = [];
        this.strokeId = 1;
        
        // DollarQ recognizer instance
        this.recognizer = new QDollarRecognizer();
        
        // UI elements
        this.resultDisplay = document.getElementById('resultDisplay');
        this.processingTimeElement = document.getElementById('processingTime');
        this.confidenceElement = document.getElementById('confidence');
        this.clearBtn = document.getElementById('clearBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.trainGestureBtn = document.getElementById('trainGestureBtn');
        this.resetGesturesBtn = document.getElementById('resetGesturesBtn');
        this.gestureGrid = document.getElementById('gestureGrid');
        this.gestureCount = document.getElementById('gestureCount');
        
        this.initializeCanvas();
        this.attachEventListeners();
        this.updateGestureGrid();
        
        // Configure canvas drawing style
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#2c3e50';
    }
    
    initializeCanvas() {
        // Set canvas resolution based on display size
        const rect = this.canvas.getBoundingClientRect();
        const scale = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * scale;
        this.canvas.height = rect.height * scale;
        
        this.ctx.scale(scale, scale);
        
        // Set display size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.clearCanvas();
    }
    
    attachEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events for mobile support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
        
        // Button events
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.undoBtn.addEventListener('click', () => this.undoLastStroke());
        this.trainGestureBtn.addEventListener('click', () => this.trainNewGesture());
        this.resetGesturesBtn.addEventListener('click', () => this.resetToDefaults());
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    getCanvasCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    
    startDrawing(event) {
        this.isDrawing = true;
        const coords = this.getCanvasCoordinates(event);
        
        this.currentStroke = [];
        
        // Add first point
        this.currentStroke.push(new Point(coords.x, coords.y, this.strokeId));
        
        // Begin path for visual drawing
        this.ctx.beginPath();
        this.ctx.moveTo(coords.x, coords.y);
    }
    
    draw(event) {
        if (!this.isDrawing) return;
        
        const coords = this.getCanvasCoordinates(event);
        
        // Add point to current stroke
        this.currentStroke.push(new Point(coords.x, coords.y, this.strokeId));
        
        // Draw line to new point
        this.ctx.lineTo(coords.x, coords.y);
        this.ctx.stroke();
    }
    
    stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        // Add completed stroke to collection
        if (this.currentStroke.length > 1) {
            this.allStrokes.push([...this.currentStroke]);
            this.strokeId++;
            
            // Perform recognition on all strokes
            this.performRecognition();
        }
        
        this.currentStroke = [];
    }
    
    performRecognition() {
        if (this.allStrokes.length === 0) {
            this.updateResultDisplay('Draw a gesture to see recognition', false);
            return;
        }
        
        // Flatten all strokes into a single point array for DollarQ
        const allPoints = [];
        for (const stroke of this.allStrokes) {
            allPoints.push(...stroke);
        }
        
        try {
            // Perform DollarQ recognition using enhanced interface
            const result = this.recognizer.recognize(allPoints);
            
            // Always show the best prediction (no confidence filtering)
            const isMatch = result.isRecognized(); // Use built-in method instead of threshold
            this.updateResultDisplay(result.getName(), isMatch, result.getScore(), result.getTimeMs());
            
            // Add visual feedback for any recognition
            if (isMatch) {
                this.showSuccessAnimation();
            }
            
        } catch (error) {
            console.error('Recognition error:', error);
            this.updateResultDisplay('Recognition error', false);
        }
    }
    
    updateResultDisplay(gestureName, isMatch, confidence = 0, processingTime = 0) {
        // Clear previous classes
        this.resultDisplay.classList.remove('no-match', 'recognized');
        
        // Always show DollarQ's best prediction
        if (gestureName === 'No match.' || gestureName === 'Recognition error') {
            this.resultDisplay.classList.add('no-match');
            this.resultDisplay.innerHTML = `<span class="no-result">${gestureName}</span>`;
            this.confidenceElement.textContent = '-';
        } else {
            this.resultDisplay.classList.add('recognized');
            
            // Special handling for specific gestures
            let displayText = gestureName;
            if (gestureName === 'line') {
                displayText = 'line! Creating underline!';
            } else if (['circle', 'rectangle', 'horizontal-ellipse', 'vertical-ellipse', 
                       'flat-horizontal-ellipse', 'flat-vertical-ellipse', 
                       'ultra-flat-horizontal-ellipse', 'ultra-flat-vertical-ellipse'].includes(gestureName)) {
                displayText = `${gestureName}! Creating outline!`;
            }
            
            this.resultDisplay.innerHTML = `<span class="gesture-result">${displayText}</span>`;
            this.confidenceElement.textContent = `${(confidence * 100).toFixed(1)}%`;
        }
        
        this.processingTimeElement.textContent = `${processingTime}ms`;
    }
    
    showSuccessAnimation() {
        this.resultDisplay.classList.add('success-animation');
        setTimeout(() => {
            this.resultDisplay.classList.remove('success-animation');
        }, 500);
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Book page background is now handled by CSS
        // No need for solid background or grid guides
    }
    
    drawCanvasGuides() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.ctx.strokeStyle = '#e9ecef';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 2]);
        
        // Draw center lines
        this.ctx.beginPath();
        this.ctx.moveTo(width / 2, 0);
        this.ctx.lineTo(width / 2, height);
        this.ctx.moveTo(0, height / 2);
        this.ctx.lineTo(width, height / 2);
        this.ctx.stroke();
        
        // Reset line style
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
    }
    
    clearAll() {
        this.allStrokes = [];
        this.currentStroke = [];
        this.strokeId = 1;
        this.clearCanvas();
        this.updateResultDisplay('Draw a gesture to see recognition', false);
    }
    
    undoLastStroke() {
        if (this.allStrokes.length > 0) {
            this.allStrokes.pop();
            this.redrawAllStrokes();
            
            // Re-run recognition on remaining strokes
            if (this.allStrokes.length > 0) {
                this.performRecognition();
            } else {
                this.updateResultDisplay('Draw a gesture to see recognition', false);
            }
        }
    }
    
    redrawAllStrokes() {
        this.clearCanvas();
        
        // Redraw all remaining strokes
        for (const stroke of this.allStrokes) {
            if (stroke.length > 1) {
                this.ctx.beginPath();
                this.ctx.moveTo(stroke[0].x, stroke[0].y);
                
                for (let i = 1; i < stroke.length; i++) {
                    this.ctx.lineTo(stroke[i].x, stroke[i].y);
                }
                
                this.ctx.stroke();
            }
        }
    }
    
    // Gesture Management Methods
    trainNewGesture() {
        if (this.allStrokes.length === 0) {
            alert('Draw a gesture first, then click "Save as New Gesture"');
            return;
        }
        
        const gestureName = prompt('Enter a name for this gesture:');
        if (!gestureName || gestureName.trim() === '') {
            return;
        }
        
        // Flatten all strokes into a single point array
        const allPoints = [];
        for (const stroke of this.allStrokes) {
            allPoints.push(...stroke);
        }
        
        try {
            // Add gesture to recognizer
            const variantCount = this.recognizer.addGesture(gestureName.trim(), allPoints);
            
            // Update UI
            this.updateGestureGrid();
            
            // Clear canvas and provide feedback
            this.clearAll();
            alert(`Gesture "${gestureName}" added successfully! (${variantCount} variant${variantCount > 1 ? 's' : ''} total)`);
            
        } catch (error) {
            console.error('Error adding gesture:', error);
            alert('Error adding gesture. Please try again.');
        }
    }
    
    resetToDefaults() {
        if (confirm('Reset to default gestures? This will remove all custom gestures.')) {
            const removedCount = this.recognizer.resetToDefaults();
            this.updateGestureGrid();
            this.clearAll();
            
            if (removedCount > 0) {
                alert(`Reset complete! Removed ${removedCount} custom gesture${removedCount > 1 ? 's' : ''}.`);
            }
        }
    }
    
    deleteGesture(gestureName) {
        if (confirm(`Delete all variants of gesture "${gestureName}"?`)) {
            const deletedCount = this.recognizer.deleteGesture(gestureName);
            this.updateGestureGrid();
            
            if (deletedCount > 0) {
                alert(`Deleted ${deletedCount} variant${deletedCount > 1 ? 's' : ''} of "${gestureName}"`);
            }
        }
    }
    
    updateGestureGrid() {
        const metadata = this.recognizer.getGestureMetadata();
        const gesturesByName = new Map();
        
        // Group gestures by name to show unique names with variant counts
        for (const gesture of metadata) {
            if (!gesturesByName.has(gesture.name)) {
                gesturesByName.set(gesture.name, {
                    name: gesture.name,
                    isDefault: gesture.isDefault,
                    variants: 1,
                    firstIndex: gesture.index
                });
            } else {
                gesturesByName.get(gesture.name).variants++;
            }
        }
        
        // Update gesture count
        this.gestureCount.textContent = `${this.recognizer.getGestureCount()} gestures`;
        
        // Clear and rebuild gesture grid
        this.gestureGrid.innerHTML = '';
        
        for (const [name, info] of gesturesByName) {
            const gestureItem = document.createElement('div');
            gestureItem.className = `gesture-item ${info.isDefault ? 'default' : 'custom'}`;
            
            // Gesture name
            const nameSpan = document.createElement('span');
            nameSpan.className = 'gesture-name';
            nameSpan.textContent = name;
            
            // Gesture description
            const descSpan = document.createElement('span');
            descSpan.className = 'gesture-desc';
            descSpan.textContent = info.isDefault ? 
                this.getDefaultDescription(name) : 
                `Custom (${info.variants} variant${info.variants > 1 ? 's' : ''})`;
            
            // Delete button (only for non-default gestures or if there are custom variants)
            if (!info.isDefault || info.variants > 1) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'gesture-delete';
                deleteBtn.innerHTML = '×';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteGesture(name);
                });
                gestureItem.appendChild(deleteBtn);
            }
            
            // Click to highlight
            gestureItem.addEventListener('click', () => {
                highlightGesture(name);
            });
            
            gestureItem.appendChild(nameSpan);
            gestureItem.appendChild(descSpan);
            this.gestureGrid.appendChild(gestureItem);
        }
    }
    
    getDefaultDescription(name) {
        const descriptions = {
            'X': 'Cross gesture',
            'line': 'Horizontal line',
            'asterisk': 'Multi-stroke star',
            'circle': 'Circular shape',
            'rectangle': 'Four-sided polygon',
            'horizontal-ellipse': 'Wide oval',
            'vertical-ellipse': 'Tall oval',
            'flat-horizontal-ellipse': 'Very wide (7:1)',
            'flat-vertical-ellipse': 'Very tall (7:1)',
            'ultra-flat-horizontal-ellipse': 'Extremely wide (15:1)',
            'ultra-flat-vertical-ellipse': 'Extremely tall (1:15)',
            'vertical-line': 'Vertical line',
            'right-slant': 'Right diagonal',
            'left-slant': 'Left diagonal',
            'slight-right-slant': 'Slight upward (+15°)',
            'slight-left-slant': 'Slight downward (-15°)'
        };
        return descriptions[name] || 'Default template';
    }
}

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the drawing canvas
    const drawingApp = new DrawingCanvas('drawingCanvas');
    
    // Add gesture examples interaction
    const gestureItems = document.querySelectorAll('.gesture-item');
    gestureItems.forEach(item => {
        item.addEventListener('click', function() {
            const gestureName = this.querySelector('.gesture-name').textContent;
            highlightGesture(gestureName);
        });
    });
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            drawingApp.initializeCanvas();
            drawingApp.redrawAllStrokes();
        }, 250);
    });
    
    console.log('Enhanced DollarQ Gesture Recognizer Demo initialized');
    console.log('Available gestures:', drawingApp.recognizer.getGestureNames());
    console.log('Recognizer statistics:', drawingApp.recognizer.getStatistics());
});

function highlightGesture(gestureName) {
    // Visual feedback for gesture selection
    const gestureItems = document.querySelectorAll('.gesture-item');
    gestureItems.forEach(item => {
        const nameElement = item.querySelector('.gesture-name');
        if (nameElement.textContent === gestureName) {
            item.style.background = '#e3f2fd';
            setTimeout(() => {
                item.style.background = '#f8f9fa';
            }, 1000);
        }
    });
}

// Utility function to prevent scrolling on touch devices while drawing
document.addEventListener('touchstart', function(e) {
    if (e.target.id === 'drawingCanvas') {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', function(e) {
    if (e.target.id === 'drawingCanvas') {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', function(e) {
    if (e.target.id === 'drawingCanvas') {
        e.preventDefault();
    }
}, { passive: false });
