// Mandala Flow - Controls handling

// Global variables
let gui;

// Initialize controls
function initControls() {
    // Make sure the mandala app is initialized
    if (!window.MandalaApp) {
        console.error('MandalaApp not found. Please load mandala.js before controls.js');
        return;
    }

    // Get config and methods from the MandalaApp
    const config = window.MandalaApp.config;
    const colorPalettes = window.MandalaApp.colorPalettes;
    
    // Setup dat.GUI controls
    setupGUI(config);
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
}

// Setup dat.GUI controls
function setupGUI(config) {
    gui = new dat.GUI({ autoPlace: false });
    document.getElementById('gui-container').appendChild(gui.domElement);
    
    // Algorithm selection
    const algorithmOptions = {};
    const availableAlgorithms = window.MandalaApp.getAvailableAlgorithms();
    
    availableAlgorithms.forEach(algo => {
        algorithmOptions[algo.name] = algo.id;
    });
    
    gui.add({ 
        algorithm: availableAlgorithms.find(a => a.id === config.algorithm)?.name || 'Simple Algorithm'
    }, 'algorithm', algorithmOptions)
        .name('Algorithm')
        .onChange(function(value) {
            window.MandalaApp.setAlgorithm(value);
        });
    
    // Basic controls
    const basicFolder = gui.addFolder('Basic Controls');
    basicFolder.add(config, 'symmetry', 2, 32).step(1).onChange(window.MandalaApp.updateMandala);
    basicFolder.add(config, 'lineWidth', 0.1, 5).onChange(window.MandalaApp.updateMandala);
    basicFolder.add(config, 'opacity', 0, 1).onChange(window.MandalaApp.updateMandala);
    basicFolder.add(config, 'complexity', 0, 1).onChange(window.MandalaApp.updateMandala);
    basicFolder.add(config, 'layers', 1, 5).step(1).onChange(window.MandalaApp.updateMandala);
    basicFolder.open();
    
    // Color controls
    const colorFolder = gui.addFolder('Colors');
    colorFolder.addColor(config, 'color').onChange(window.MandalaApp.updateMandala);
    colorFolder.add(config, 'useGradient').onChange(window.MandalaApp.updateMandala);
    colorFolder.add(config, 'colorMode', ['monochrome', 'rainbow', 'complementary', 'earth', 'ocean']).onChange(window.MandalaApp.updateMandala);
    colorFolder.addColor(config, 'backgroundColor').onChange(window.MandalaApp.updateMandala);
    
    // Animation controls
    const animationFolder = gui.addFolder('Animation');
    animationFolder.add(config, 'animate').onChange(window.MandalaApp.toggleAnimation);
    animationFolder.add(config, 'autoRotate');
    animationFolder.add(config, 'rotationSpeed', 0, 0.02).step(0.001);
    animationFolder.add(config, 'pulseEffect');
    
    // Parameter Animation controls
    animationFolder.add(config, 'parameterAnimation').name('Animate Parameters');
    animationFolder.add(config, 'animationSpeed', 0.001, 0.05).step(0.001).name('Base Anim Speed');
    
    // Create subfolder for which parameters to animate
    const paramAnimFolder = animationFolder.addFolder('Animated Parameters');
    paramAnimFolder.add(config.animationParameters, 'symmetry').name('Symmetry');
    paramAnimFolder.add(config.animationParameters, 'lineWidth').name('Line Width');
    paramAnimFolder.add(config.animationParameters, 'opacity').name('Opacity');
    paramAnimFolder.add(config.animationParameters, 'complexity').name('Complexity');
    
    // Create subfolder for animation speeds
    const speedAnimFolder = animationFolder.addFolder('Animation Speeds');
    speedAnimFolder.add(config.animationSpeeds, 'symmetry', 0.1, 3).step(0.1).name('Symmetry Speed');
    speedAnimFolder.add(config.animationSpeeds, 'lineWidth', 0.1, 3).step(0.1).name('Line Width Speed');
    speedAnimFolder.add(config.animationSpeeds, 'opacity', 0.1, 3).step(0.1).name('Opacity Speed');
    speedAnimFolder.add(config.animationSpeeds, 'complexity', 0.1, 3).step(0.1).name('Complexity Speed');
    
    // Create subfolder for animation ranges
    const rangeAnimFolder = animationFolder.addFolder('Animation Ranges');
    rangeAnimFolder.add(config.animationRanges.symmetry, 'min', 2, 16).step(1).name('Symmetry Min');
    rangeAnimFolder.add(config.animationRanges.symmetry, 'max', 3, 32).step(1).name('Symmetry Max');
    rangeAnimFolder.add(config.animationRanges.lineWidth, 'min', 0.1, 2).step(0.1).name('Line Width Min');
    rangeAnimFolder.add(config.animationRanges.lineWidth, 'max', 0.5, 5).step(0.1).name('Line Width Max');
    rangeAnimFolder.add(config.animationRanges.opacity, 'min', 0.1, 0.9).step(0.1).name('Opacity Min');
    rangeAnimFolder.add(config.animationRanges.opacity, 'max', 0.2, 1).step(0.1).name('Opacity Max');
    rangeAnimFolder.add(config.animationRanges.complexity, 'min', 0.1, 0.8).step(0.1).name('Complexity Min');
    rangeAnimFolder.add(config.animationRanges.complexity, 'max', 0.2, 1).step(0.1).name('Complexity Max');
    
    animationFolder.open();
    
    // Actions
    const actionsFolder = gui.addFolder('Actions');
    actionsFolder.add({ regenerate: window.MandalaApp.randomizeMandala }, 'regenerate').name('New Mandala');
    
    // Presets folder
    const presetsFolder = gui.addFolder('Presets');
    setupPresets(presetsFolder, config);
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Space bar - Generate new mandala
        if (event.code === 'Space') {
            window.MandalaApp.randomizeMandala();
        }
        
        // R key - Toggle rotation
        if (event.code === 'KeyR') {
            window.MandalaApp.config.autoRotate = !window.MandalaApp.config.autoRotate;
        }
        
        // P key - Toggle pulse effect
        if (event.code === 'KeyP') {
            window.MandalaApp.config.pulseEffect = !window.MandalaApp.config.pulseEffect;
        }
        
        // A key - Toggle parameter animation
        if (event.code === 'KeyA') {
            window.MandalaApp.config.parameterAnimation = !window.MandalaApp.config.parameterAnimation;
        }
        
        // + key - Increase symmetry
        if (event.code === 'Equal' || event.code === 'NumpadAdd') {
            window.MandalaApp.config.symmetry = Math.min(32, window.MandalaApp.config.symmetry + 1);
            window.MandalaApp.updateMandala();
        }
        
        // - key - Decrease symmetry
        if (event.code === 'Minus' || event.code === 'NumpadSubtract') {
            window.MandalaApp.config.symmetry = Math.max(2, window.MandalaApp.config.symmetry - 1);
            window.MandalaApp.updateMandala();
        }
        
        // H key - Toggle GUI visibility
        if (event.code === 'KeyH') {
            toggleGuiVisibility();
        }
        
        // 1-4 keys - Switch between algorithms
        if (event.code === 'Digit1') {
            window.MandalaApp.setAlgorithm('simple');
        }
        if (event.code === 'Digit2') {
            window.MandalaApp.setAlgorithm('geometric');
        }
        if (event.code === 'Digit3') {
            window.MandalaApp.setAlgorithm('flower');
        }
        if (event.code === 'Digit4') {
            window.MandalaApp.setAlgorithm('shader');
        }
    });
}

// Toggle GUI visibility
function toggleGuiVisibility() {
    const guiElement = document.querySelector('.dg.ac');
    if (guiElement) {
        if (guiElement.style.display === 'none') {
            guiElement.style.display = '';
        } else {
            guiElement.style.display = 'none';
        }
    }
}

// Setup preset configurations
function setupPresets(folder, config) {
    const presets = {
        'Classic': function() {
            applyPreset({
                symmetry: 8,
                lineWidth: 2,
                opacity: 0.7,
                useGradient: false,
                color: '#ffffff',
                colorMode: 'monochrome',
                layers: 3,
                complexity: 0.5,
                algorithm: 'simple'
            });
        },
        'Floral': function() {
            applyPreset({
                symmetry: 12,
                lineWidth: 1.5,
                opacity: 0.8,
                useGradient: true,
                colorMode: 'rainbow',
                layers: 4,
                complexity: 0.7,
                pulseEffect: true,
                algorithm: 'simple'
            });
        },
        'Minimalist': function() {
            applyPreset({
                symmetry: 6,
                lineWidth: 1,
                opacity: 0.9,
                useGradient: false,
                color: '#ffffff',
                backgroundColor: '#000000',
                layers: 2,
                complexity: 0.3,
                pulseEffect: false,
                algorithm: 'simple'
            });
        },
        'Ocean Waves': function() {
            applyPreset({
                symmetry: 16,
                lineWidth: 1.2,
                opacity: 0.6,
                useGradient: true,
                colorMode: 'ocean',
                backgroundColor: '#001133',
                layers: 4,
                complexity: 0.8,
                rotationSpeed: 0.002,
                algorithm: 'simple'
            });
        },
        'Sacred Geometry': function() {
            applyPreset({
                symmetry: 7,
                lineWidth: 1.5,
                opacity: 0.85,
                useGradient: true,
                colorMode: 'earth',
                backgroundColor: '#110011',
                layers: 3,
                complexity: 0.6,
                algorithm: 'simple'
            });
        },
        // Geometric algorithm presets
        'Geometric Stars': function() {
            applyPreset({
                symmetry: 8,
                lineWidth: 1.8,
                opacity: 0.8,
                useGradient: true,
                colorMode: 'complementary',
                backgroundColor: '#000022',
                layers: 3,
                complexity: 0.7,
                algorithm: 'geometric'
            });
        },
        'Sacred Polygons': function() {
            applyPreset({
                symmetry: 6,
                lineWidth: 1.2,
                opacity: 0.9,
                useGradient: true,
                colorMode: 'earth',
                backgroundColor: '#111111',
                layers: 4,
                complexity: 0.5,
                algorithm: 'geometric'
            });
        },
        // Flower algorithm presets
        'Spring Bloom': function() {
            applyPreset({
                symmetry: 10,
                lineWidth: 1.4,
                opacity: 0.85,
                useGradient: true,
                colorMode: 'rainbow',
                backgroundColor: '#001a00',
                layers: 3,
                complexity: 0.6,
                pulseEffect: true,
                algorithm: 'flower'
            });
        },
        'Lotus Flow': function() {
            applyPreset({
                symmetry: 12,
                lineWidth: 1.0,
                opacity: 0.75,
                useGradient: true,
                colorMode: 'complementary',
                backgroundColor: '#000a1a',
                layers: 4,
                complexity: 0.8,
                pulseEffect: true,
                algorithm: 'flower'
            });
        },
        // Parameter animation presets
        'Dancing Mandala': function() {
            applyPreset({
                symmetry: 8,
                lineWidth: 1.5,
                opacity: 0.8,
                useGradient: true,
                colorMode: 'rainbow',
                backgroundColor: '#000033',
                layers: 3,
                complexity: 0.6,
                pulseEffect: true,
                autoRotate: true,
                rotationSpeed: 0.002,
                algorithm: 'flower',
                parameterAnimation: true,
                animationSpeed: 0.015,
                animationParameters: {
                    symmetry: true,
                    lineWidth: true,
                    opacity: true,
                    complexity: true
                },
                animationRanges: {
                    symmetry: { min: 5, max: 12 },
                    lineWidth: { min: 0.8, max: 2.5 },
                    opacity: { min: 0.6, max: 0.9 },
                    complexity: { min: 0.4, max: 0.8 }
                },
                animationSpeeds: {
                    symmetry: 0.5,
                    lineWidth: 1.3,
                    opacity: 2.0,
                    complexity: 0.7
                }
            });
        },
        'Slow Breathing': function() {
            applyPreset({
                symmetry: 6,
                lineWidth: 1.2,
                opacity: 0.85,
                useGradient: true,
                colorMode: 'complementary',
                backgroundColor: '#000000',
                layers: 4,
                complexity: 0.5,
                pulseEffect: false,
                autoRotate: true,
                rotationSpeed: 0.001,
                algorithm: 'geometric',
                parameterAnimation: true,
                animationSpeed: 0.005,
                animationParameters: {
                    symmetry: false,
                    lineWidth: true,
                    opacity: true,
                    complexity: false
                },
                animationRanges: {
                    lineWidth: { min: 0.5, max: 2.0 },
                    opacity: { min: 0.5, max: 1.0 }
                },
                animationSpeeds: {
                    lineWidth: 1.0,
                    opacity: 0.6
                }
            });
        },
        'Rhythmic Flow': function() {
            applyPreset({
                symmetry: 10,
                lineWidth: 1.8,
                opacity: 0.7,
                useGradient: true,
                colorMode: 'ocean',
                backgroundColor: '#001a1a',
                layers: 3,
                complexity: 0.7,
                pulseEffect: true,
                autoRotate: true,
                rotationSpeed: 0.003,
                algorithm: 'simple',
                parameterAnimation: true,
                animationSpeed: 0.02,
                animationParameters: {
                    symmetry: true,
                    lineWidth: false,
                    opacity: false,
                    complexity: true
                },
                animationRanges: {
                    symmetry: { min: 6, max: 16 },
                    complexity: { min: 0.3, max: 0.9 }
                },
                animationSpeeds: {
                    symmetry: 0.3,
                    complexity: 2.5
                }
            });
        }
    };
    
    // Add presets to folder
    for (const presetName in presets) {
        folder.add(presets, presetName);
    }
    
    // Apply preset function
    function applyPreset(presetConfig) {
        for (const key in presetConfig) {
            if (config.hasOwnProperty(key)) {
                config[key] = presetConfig[key];
            }
        }
        
        // Generate a new random seed
        config.randomSeed = Math.random() * 1000;
        
        // Update the UI to reflect the new values
        for (const controller of gui.__controllers) {
            controller.updateDisplay();
        }
        
        // Refresh folders as well
        for (const folder of Object.values(gui.__folders)) {
            for (const controller of folder.__controllers) {
                controller.updateDisplay();
            }
        }
        
        // Update the mandala
        window.MandalaApp.updateMandala();
    }
}

// Initialize controls when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // We need to wait a bit to make sure MandalaApp is available
    setTimeout(initControls, 100);
}); 