// Simple Mandala Algorithm

(function() {
    // Create algorithms object if it doesn't exist
    window.algorithms = window.algorithms || {};
    
    /**
     * Draw a mandala using the simple algorithm
     * @param {Object} ctx - Canvas 2D context
     * @param {Object} params - Drawing parameters
     */
    function drawMandala(ctx, params) {
        const { 
            centerX, 
            centerY, 
            radius, 
            config, 
            angle, 
            pulsePhase, 
            noise, 
            colorPalettes 
        } = params;
        
        // Clear canvas
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw the mandala pattern
        for (let layer = 0; layer < config.layers; layer++) {
            const layerRadius = radius * (0.5 + layer * 0.2);
            
            // Draw the mandala pattern for this layer
            for (let i = 0; i < config.symmetry; i++) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate((Math.PI * 2 * i) / config.symmetry + angle);
                
                // Apply pulse effect if enabled
                let scale = 1;
                if (config.pulseEffect) {
                    scale = 1 + 0.05 * Math.sin(pulsePhase + layer * 0.5);
                }
                ctx.scale(scale, scale);
                
                // Set drawing styles for this layer
                setLayerStyle(ctx, config, layer, colorPalettes);
                
                drawPattern(ctx, layerRadius, layer, config, noise);
                
                ctx.restore();
            }
        }
        
        // Draw central design
        drawCentralDesign(ctx, centerX, centerY, radius, config, colorPalettes);
    }

    // Set style for a specific layer
    function setLayerStyle(ctx, config, layer, colorPalettes) {
        ctx.lineWidth = config.lineWidth * (1 - layer * 0.15);
        ctx.globalAlpha = config.opacity * (1 - layer * 0.1);
        
        if (config.useGradient) {
            // Get colors based on current color mode
            const colors = colorPalettes[config.colorMode] || colorPalettes.monochrome;
            const colorIndex = layer % colors.length;
            ctx.strokeStyle = colors[colorIndex];
        } else {
            ctx.strokeStyle = config.color;
        }
    }

    // Draw a single pattern segment
    function drawPattern(ctx, layerRadius, layer, config, noise) {
        const seed = config.randomSeed + layer * 100;
        const segments = Math.floor(10 + config.complexity * 20);
        
        ctx.beginPath();
        
        // Draw curves and patterns
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const r = layerRadius * t;
            
            // Use noise to create organic variation
            const noiseVal = 40 + (layer * 10) * config.complexity;
            const noiseX = noise.noise2D(t * 5 + seed, layer * 0.2) * noiseVal;
            const noiseY = noise.noise2D(layer * 0.2, t * 5 + seed) * noiseVal;
            
            const x = r + noiseX;
            const y = noiseY;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Draw circular elements
        const circleCount = Math.max(3, Math.floor(5 * config.complexity));
        for (let i = 0; i < circleCount; i++) {
            const r = layerRadius * (0.2 + i * 0.15);
            const noiseVal = noise.noise2D(i * 0.5 + seed, i * 0.5 + seed);
            
            if (noiseVal > 0) {
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // Draw detailed elements
        drawDetailedElements(ctx, layerRadius, layer, seed, noise, config);
    }

    // Draw detailed geometric elements
    function drawDetailedElements(ctx, layerRadius, layer, seed, noise, config) {
        const detailCount = Math.floor(config.complexity * 8);
        
        for (let i = 0; i < detailCount; i++) {
            const angle = (i / detailCount) * Math.PI * 2;
            const r = layerRadius * (0.3 + 0.5 * noise.noise2D(i * 0.2 + seed, 0));
            
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            
            // Draw a small pattern element
            ctx.beginPath();
            ctx.arc(x, y, 2 + layer * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            
            // Occasionally draw connecting lines
            if (noise.noise2D(i * 0.3 + seed, layer) > 0.2) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }
    }

    // Draw the central design of the mandala
    function drawCentralDesign(ctx, centerX, centerY, radius, config, colorPalettes) {
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Set style for central design
        ctx.lineWidth = config.lineWidth * 1.5;
        ctx.globalAlpha = config.opacity + 0.1;
        
        // Get a color from the palette
        const colors = colorPalettes[config.colorMode] || colorPalettes.monochrome;
        ctx.strokeStyle = colors[0];
        
        // Draw central circle
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.1, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw central geometric pattern
        const points = config.symmetry;
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const r = radius * 0.15;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }

    // Expose the algorithm through the window.algorithms object
    window.algorithms.simple = {
        name: "Simple Algorithm",
        draw: drawMandala
    };
})(); 