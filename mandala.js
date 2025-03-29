// Mandala Flow - Core drawing logic

// Configuration options - will be controlled via controls.js
const config = {
    symmetry: 8,           // Number of reflections
    lineWidth: 2,          // Width of the lines
    rotationSpeed: 0.001,  // Speed of automatic rotation
    color: '#ffffff',      // Line color
    backgroundColor: '#121212', // Background color
    opacity: 0.7,          // Line opacity
    autoRotate: true,      // Auto-rotate the mandala
    randomSeed: Math.random() * 1000, // Random seed for patterns
    complexity: 0.5,       // Affects pattern complexity
    animate: true,         // Enable animation
    useGradient: true,     // Use color gradients
    colorMode: 'monochrome', // Color mode: monochrome, rainbow, complementary
    layers: 3,             // Number of pattern layers
    pulseEffect: true,     // Add pulsing effect
    algorithm: 'flower'    // Which algorithm to use for drawing
};

// Available algorithms (reference to window.algorithms)
const algorithms = {};

// Color palettes
const colorPalettes = {
    monochrome: ['#ffffff', '#cccccc', '#999999', '#666666', '#333333'],
    rainbow: ['#ff3366', '#ff6633', '#ffcc33', '#33cc33', '#3366ff', '#cc33ff'],
    complementary: ['#ff3366', '#33ccff', '#ffcc33', '#33ff99', '#cc33ff', '#ff9933'],
    earth: ['#996633', '#cc9966', '#ffcc99', '#669933', '#336633', '#003300'],
    ocean: ['#003366', '#0066cc', '#3399ff', '#66ccff', '#99ffff', '#ccffff']
};

// Core variables
let canvas, ctx;
let centerX, centerY;
let radius;
let noise;
let angle = 0;
let animationId;
let pulsePhase = 0;

// Initialize the mandala canvas and setup
function initMandala() {
    // Setup canvas
    canvas = document.getElementById('mandalaCanvas');
    ctx = canvas.getContext('2d');
    
    // Initialize simplex noise
    noise = new SimplexNoise();
    
    // Reference the shared algorithms object
    loadAlgorithms();
    
    // Set canvas dimensions
    resizeCanvas();

    // Start animation loop
    if (config.animate) {
        animate();
    } else {
        drawMandala();
    }
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('click', randomizeMandala);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);
}

// Load all mandala drawing algorithms from window.algorithms
function loadAlgorithms() {
    // Copy all algorithms from the global algorithms object
    Object.assign(algorithms, window.algorithms);
    
    // If no algorithms are loaded, create a fallback
    if (Object.keys(algorithms).length === 0) {
        console.warn('No algorithms found in window.algorithms. Using fallback.');
        algorithms['simple'] = {
            name: "Fallback Algorithm",
            draw: function(ctx, params) {
                const { centerX, centerY, radius, config } = params;
                // Simple fallback drawing
                ctx.fillStyle = config.backgroundColor;
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                
                ctx.strokeStyle = config.color;
                ctx.lineWidth = config.lineWidth;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
                ctx.stroke();
            }
        };
    }
}

// Handle canvas resizing
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    radius = Math.min(canvas.width, canvas.height) * 0.4;
    
    if (!config.animate) {
        drawMandala();
    }
}

// Main draw function
function drawMandala() {
    // Get the current algorithm
    const algorithm = algorithms[config.algorithm] || algorithms.simple;
    
    // Create params object for the algorithm
    const params = {
        centerX,
        centerY,
        radius,
        config,
        angle,
        pulsePhase,
        noise,
        colorPalettes
    };
    
    // Call the algorithm's draw function
    algorithm.draw(ctx, params);
}

// Animation loop
function animate() {
    if (config.autoRotate) {
        angle += config.rotationSpeed;
    }
    
    if (config.pulseEffect) {
        pulsePhase += 0.03;
    }
    
    drawMandala();
    animationId = requestAnimationFrame(animate);
}

// Generate a new random mandala
function randomizeMandala() {
    config.randomSeed = Math.random() * 1000;
    if (!config.animate) {
        drawMandala();
    }
}

// Handle mouse movement interaction
function handleMouseMove(event) {
    if (event.buttons === 1) { // If mouse button is pressed
        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < radius * 1.5) {
            // Affect the mandala based on mouse position
            config.complexity = Math.max(0.1, Math.min(1, distance / (radius * 1.5)));
        }
    }
}

// Handle touch movement interaction
function handleTouchMove(event) {
    event.preventDefault();
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < radius * 1.5) {
            // Affect the mandala based on touch position
            config.complexity = Math.max(0.1, Math.min(1, distance / (radius * 1.5)));
        }
    }
}

// Toggle animation on/off
function toggleAnimation() {
    if (config.animate) {
        animate();
    } else {
        cancelAnimationFrame(animationId);
        drawMandala();
    }
}

// Update the mandala when controls change
function updateMandala() {
    if (!config.animate) {
        drawMandala();
    }
}

// Allow selecting a different algorithm
function setAlgorithm(algorithmName) {
    if (algorithms[algorithmName]) {
        config.algorithm = algorithmName;
        updateMandala();
    }
}

// Get a list of available algorithm names
function getAvailableAlgorithms() {
    return Object.keys(algorithms).map(key => ({
        id: key,
        name: algorithms[key].name
    }));
}

// Expose methods and config for controls.js to access
window.MandalaApp = {
    config: config,
    colorPalettes: colorPalettes,
    updateMandala: updateMandala,
    randomizeMandala: randomizeMandala,
    toggleAnimation: toggleAnimation,
    setAlgorithm: setAlgorithm,
    getAvailableAlgorithms: getAvailableAlgorithms
}; 