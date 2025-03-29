// Geometric Mandala Algorithm

(function() {
    // Create algorithms object if it doesn't exist
    window.algorithms = window.algorithms || {};
    
    /**
     * Draw a mandala using geometric patterns
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
        
        // Draw geometric elements
        drawGeometricElements(ctx, centerX, centerY, radius, config, angle, pulsePhase, colorPalettes);
        
        // Draw layers of patterns
        for (let layer = 0; layer < config.layers; layer++) {
            drawGeometricLayer(ctx, centerX, centerY, radius, layer, config, angle, pulsePhase, colorPalettes);
        }
        
        // Draw central design
        drawCentralDesign(ctx, centerX, centerY, radius, config, colorPalettes);
    }

    // Draw geometric elements (background patterns)
    function drawGeometricElements(ctx, centerX, centerY, radius, config, angle, pulsePhase, colorPalettes) {
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Get a color from the palette
        const colors = colorPalettes[config.colorMode] || colorPalettes.monochrome;
        
        // Draw background circles
        for (let i = 1; i <= 5; i++) {
            const r = radius * (i * 0.2);
            
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            
            ctx.lineWidth = config.lineWidth * 0.5;
            ctx.globalAlpha = config.opacity * 0.3;
            ctx.strokeStyle = colors[i % colors.length];
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // Draw a geometric layer
    function drawGeometricLayer(ctx, centerX, centerY, radius, layer, config, angle, pulsePhase, colorPalettes) {
        const layerRadius = radius * (0.4 + layer * 0.2);
        const colors = colorPalettes[config.colorMode] || colorPalettes.monochrome;
        const polygonSides = 3 + layer * 2; // Increase sides for each layer (triangle, pentagon, etc.)
        
        // Draw symmetric elements
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
            
            // Set style for this layer
            ctx.lineWidth = config.lineWidth * (1 - layer * 0.1);
            ctx.globalAlpha = config.opacity * (1 - layer * 0.1);
            ctx.strokeStyle = colors[layer % colors.length];
            
            // Draw geometric shape
            drawPolygon(ctx, 0, 0, layerRadius * 0.6, polygonSides);
            
            // Draw connecting lines
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(layerRadius, 0);
            ctx.stroke();
            
            // Draw dots along radial lines
            const dotCount = Math.floor(5 + config.complexity * 10);
            for (let j = 1; j < dotCount; j++) {
                const r = layerRadius * (j / dotCount);
                
                ctx.beginPath();
                ctx.arc(r, 0, 2, 0, Math.PI * 2);
                if (j % 3 === 0) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            }
            
            ctx.restore();
        }
        
        // Draw concentric polygon
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle * 0.5);
        
        ctx.lineWidth = config.lineWidth;
        ctx.globalAlpha = config.opacity * 0.5;
        ctx.strokeStyle = colors[(layer + 1) % colors.length];
        
        drawPolygon(ctx, 0, 0, layerRadius * 0.8, config.symmetry);
        
        ctx.restore();
    }

    // Draw a regular polygon
    function drawPolygon(ctx, x, y, radius, sides) {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const pointX = x + radius * Math.cos(angle);
            const pointY = y + radius * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(pointX, pointY);
            } else {
                ctx.lineTo(pointX, pointY);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }

    // Draw the central design
    function drawCentralDesign(ctx, centerX, centerY, radius, config, colorPalettes) {
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Get a color from the palette
        const colors = colorPalettes[config.colorMode] || colorPalettes.monochrome;
        
        // Set style for central design
        ctx.lineWidth = config.lineWidth * 1.5;
        ctx.globalAlpha = config.opacity + 0.1;
        ctx.strokeStyle = colors[0];
        
        // Draw central design
        const innerRadius = radius * 0.1;
        
        // Draw central polygon
        drawPolygon(ctx, 0, 0, innerRadius, config.symmetry);
        
        // Draw star pattern
        ctx.beginPath();
        for (let i = 0; i < config.symmetry; i++) {
            const angle = (i / config.symmetry) * Math.PI * 2;
            const pointX = innerRadius * 1.5 * Math.cos(angle);
            const pointY = innerRadius * 1.5 * Math.sin(angle);
            
            ctx.moveTo(0, 0);
            ctx.lineTo(pointX, pointY);
        }
        ctx.stroke();
        
        ctx.restore();
    }

    // Expose the algorithm through the window.algorithms object
    window.algorithms.geometric = {
        name: "Geometric Algorithm",
        draw: drawMandala
    };
})(); 