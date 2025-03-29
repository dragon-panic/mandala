// Flower Mandala Algorithm

(function() {
    // Create algorithms object if it doesn't exist
    window.algorithms = window.algorithms || {};
    
    /**
     * Draw a mandala using flower-like patterns
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
        
        // Draw background elements
        drawBackground(ctx, centerX, centerY, radius, config, colorPalettes);
        
        // Draw flower petals
        drawFlowerPetals(ctx, centerX, centerY, radius, config, angle, pulsePhase, noise, colorPalettes);
        
        // Draw center of the flower
        drawFlowerCenter(ctx, centerX, centerY, radius, config, angle, colorPalettes);
    }

    // Draw background elements
    function drawBackground(ctx, centerX, centerY, radius, config, colorPalettes) {
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Background gradient
        const gradient = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
        const colors = colorPalettes[config.colorMode] || colorPalettes.monochrome;
        
        // Add color stops to gradient
        gradient.addColorStop(0, config.backgroundColor);
        gradient.addColorStop(0.9, adjustAlpha(colors[0], 0.1));
        gradient.addColorStop(1, config.backgroundColor);
        
        // Draw background circle
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw subtle circles in background
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = colors[1];
        ctx.lineWidth = config.lineWidth * 0.3;
        
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, radius * i * 0.2, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // Draw flower petals
    function drawFlowerPetals(ctx, centerX, centerY, radius, config, angle, pulsePhase, noise, colorPalettes) {
        // Draw multiple layers of petals
        for (let layer = 0; layer < config.layers; layer++) {
            drawPetalLayer(ctx, centerX, centerY, radius, layer, config, angle, pulsePhase, noise, colorPalettes);
        }
    }

    // Draw a layer of petals
    function drawPetalLayer(ctx, centerX, centerY, radius, layer, config, angle, pulsePhase, noise, colorPalettes) {
        const layerRadius = radius * (0.3 + layer * 0.2);
        const petalCount = config.symmetry + (layer * 2);
        const colors = colorPalettes[config.colorMode] || colorPalettes.monochrome;
        const petalColor = colors[layer % colors.length];
        
        // Set style for this layer
        ctx.lineWidth = config.lineWidth * (1 - layer * 0.1);
        ctx.globalAlpha = config.opacity * (1 - layer * 0.15);
        ctx.strokeStyle = petalColor;
        
        // Draw each petal
        for (let i = 0; i < petalCount; i++) {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate((Math.PI * 2 * i) / petalCount + angle);
            
            // Apply pulse effect if enabled
            if (config.pulseEffect) {
                const scale = 1 + 0.08 * Math.sin(pulsePhase + layer * 0.5);
                ctx.scale(scale, scale);
            }
            
            // Draw the petal
            drawPetal(ctx, layerRadius, layer, config, noise);
            
            ctx.restore();
        }
    }

    // Draw a single petal
    function drawPetal(ctx, petalLength, layer, config, noise) {
        const seed = config.randomSeed + layer * 100;
        const petalWidth = petalLength * (0.2 + config.complexity * 0.2);
        
        // Create path for the petal
        ctx.beginPath();
        
        // Use bezier curves to create the petal shape
        ctx.moveTo(0, 0);
        
        // Right edge of petal
        const ctrlPoint1X = petalLength * 0.3;
        const ctrlPoint1Y = petalWidth * (0.7 + noise.noise2D(seed, layer) * 0.3);
        
        const ctrlPoint2X = petalLength * 0.7;
        const ctrlPoint2Y = petalWidth * (0.5 + noise.noise2D(seed + 1, layer) * 0.5);
        
        ctx.bezierCurveTo(
            ctrlPoint1X, ctrlPoint1Y,
            ctrlPoint2X, ctrlPoint2Y,
            petalLength, 0
        );
        
        // Left edge of petal
        const ctrlPoint3X = ctrlPoint2X;
        const ctrlPoint3Y = -ctrlPoint2Y;
        
        const ctrlPoint4X = ctrlPoint1X;
        const ctrlPoint4Y = -ctrlPoint1Y;
        
        ctx.bezierCurveTo(
            ctrlPoint3X, ctrlPoint3Y,
            ctrlPoint4X, ctrlPoint4Y,
            0, 0
        );
        
        // Draw the petal
        ctx.stroke();
        
        // Add details to petals
        if (layer < 2 && config.complexity > 0.4) {
            addPetalDetails(ctx, petalLength, layer, config);
        }
    }

    // Add details to a petal
    function addPetalDetails(ctx, petalLength, layer, config) {
        // Draw veins
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(petalLength, 0);
        ctx.stroke();
        
        // Draw curved veins
        const veinCount = Math.max(2, Math.floor(4 * config.complexity));
        for (let i = 1; i <= veinCount; i++) {
            const veinPos = petalLength * (i / (veinCount + 1));
            const veinHeight = petalLength * 0.15 * (1 - i / (veinCount + 2));
            
            ctx.beginPath();
            ctx.moveTo(veinPos, 0);
            ctx.quadraticCurveTo(
                veinPos + veinHeight * 0.5, veinHeight,
                veinPos + veinHeight, 0
            );
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(veinPos, 0);
            ctx.quadraticCurveTo(
                veinPos + veinHeight * 0.5, -veinHeight,
                veinPos + veinHeight, 0
            );
            ctx.stroke();
        }
    }

    // Draw the center of the flower
    function drawFlowerCenter(ctx, centerX, centerY, radius, config, angle, colorPalettes) {
        ctx.save();
        ctx.translate(centerX, centerY);
        
        const colors = colorPalettes[config.colorMode] || colorPalettes.monochrome;
        const innerRadius = radius * 0.15;
        
        // Draw circular center
        ctx.lineWidth = config.lineWidth * 1.2;
        ctx.globalAlpha = config.opacity + 0.1;
        ctx.strokeStyle = colors[0];
        
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw dots in center (like stamens)
        const dotCount = config.symmetry * 2;
        const dotRadius = innerRadius * 0.15;
        
        ctx.fillStyle = colors[1];
        
        for (let i = 0; i < dotCount; i++) {
            const dotAngle = (i / dotCount) * Math.PI * 2 + angle;
            const distance = innerRadius * 0.7;
            
            const x = distance * Math.cos(dotAngle);
            const y = distance * Math.sin(dotAngle);
            
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw central dot
        ctx.fillStyle = colors[0];
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // Helper function to adjust alpha of a color
    function adjustAlpha(color, alpha) {
        if (color.startsWith('#')) {
            return `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${alpha})`;
        }
        return color;
    }

    // Expose the algorithm through the window.algorithms object
    window.algorithms.flower = {
        name: "Flower Algorithm",
        draw: drawMandala
    };
})(); 