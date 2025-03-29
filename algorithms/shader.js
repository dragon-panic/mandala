// Shader-based Mandala Algorithm

(function() {
    // Create algorithms object if it doesn't exist
    window.algorithms = window.algorithms || {};
    
    /**
     * Draw a mandala using WebGL shaders
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
            pulsePhase
        } = params;
        
        // We need to create a new canvas for WebGL rendering
        // Check if we already have a WebGL canvas
        let glCanvas = document.getElementById('mandala-gl-canvas');
        let renderer, scene, camera;
        
        if (!glCanvas) {
            // First time setup - create WebGL canvas and renderer
            glCanvas = document.createElement('canvas');
            glCanvas.id = 'mandala-gl-canvas';
            glCanvas.style.position = 'absolute';
            glCanvas.style.top = '0';
            glCanvas.style.left = '0';
            glCanvas.style.zIndex = '0';
            document.body.appendChild(glCanvas);
            
            // Setup THREE.js renderer
            renderer = new THREE.WebGLRenderer({ 
                canvas: glCanvas, 
                antialias: true,
                alpha: true
            });
            
            // Store renderer in the window object for reuse
            window.mandalaShaderRenderer = renderer;
            
            // Create scene and camera
            scene = new THREE.Scene();
            camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
            camera.position.z = 1;
            
            // Store scene and camera for reuse
            window.mandalaShaderScene = scene;
            window.mandalaShaderCamera = camera;
            
            // Create a plane to render the shader on
            const geometry = new THREE.PlaneGeometry(2, 2);
            
            // Create shader material
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    iTime: { value: 0 },
                    iResolution: { value: new THREE.Vector3() },
                    iRotation: { value: 0 },
                    iSymmetry: { value: 8 },
                    iComplexity: { value: 0.5 },
                    iPulse: { value: 0 },
                    iColorMode: { value: 0 }
                },
                vertexShader: `
                    void main() {
                        gl_Position = vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    #define WHITE vec3(1.0)
                    #define BLACK vec3(0.0)
                    #define RED vec3(1.0, 0.0, 0.0)
                    #define BLUE vec3(0.0, 0.0, 1.0)
                    #define YELLOW vec3(1.0, 1.0, 0.0)
                    #define HANADA vec3(39.0/255.0, 146.0/255.0, 195.0/255.0)

                    uniform float iTime;
                    uniform vec3 iResolution;
                    uniform float iRotation;
                    uniform float iSymmetry;
                    uniform float iComplexity;
                    uniform float iPulse;
                    uniform int iColorMode;

                    const float PI = 3.14159265359;

                    float rand(in vec2 n) {
                        return fract(sin(dot(n, vec2(12.9898, 78.233))) * 43758.5453);
                    }
                    
                    float rand(in float n) {
                        return rand(vec2(n));
                    }
                    
                    float noise(in float x) {
                        float f = fract(x);
                        float i = floor(x);
                        return mix(rand(i), rand(i+1.0), f*f*(3.0-2.0*f));
                    }
                    
                    float noise(in vec2 st) {
                        vec2 f = fract(st);
                        vec2 i = floor(st);
                        
                        float a = rand(i);
                        float b = rand(i + vec2(1.0, 0.0));
                        float c = rand(i + vec2(0.0, 1.0));
                        float d = rand(i + vec2(1.0, 1.0));
                        
                        vec2 u = f*f*(3.0-2.0*f);

                        return mix(a, b, u.x) +
                                (c-a)*u.y*(1.0-u.x) +
                                (d-b)*u.x*u.y;
                    }

                    mat2 rotate(in float r) {
                        float c = cos(r), s = sin(r);
                        return mat2(c, -s, s, c);
                    }
                    
                    float usin(in float x) {
                        return 0.5 + 0.5 * sin(x);
                    }

                    void main() {
                        vec2 uv = gl_FragCoord.xy/iResolution.xy;
                        uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);

                        float t = 0.2 * iTime + iRotation;
                        float pulseEffect = 0.2 + iPulse * 0.1 * sin(iTime * 0.5);
                        float complexity = iComplexity * 1.5 + 0.5;
                        
                        for(int i = 0; i < 5; i++) {
                            float a = atan(uv.x, uv.y);
                            float symmetryValue = max(3.0, iSymmetry);
                            a *= symmetryValue / (2.0 * PI);
                            a = abs(fract(a * 0.5 - symmetryValue * 0.5) * 2.0 - 1.0);
                            a *= (2.0 * PI) / symmetryValue;
                            uv = length(uv) * vec2(sin(a + t * 0.7), cos(a + t * 0.8));
                            uv -= vec2(0.2 + pulseEffect * usin(iTime * 0.3), 0.0);
                            uv = fract(uv) * 2.0 - 1.0;
                        }
                        
                        float v = noise(uv * complexity);
                        
                        vec3 col1, col2;
                        if (iColorMode == 0) { // Monochrome
                            col1 = mix(WHITE, WHITE * 0.7, usin(iTime * 0.4));
                            col2 = mix(BLACK, WHITE * 0.3, usin(iTime * 0.9));
                        } else if (iColorMode == 1) { // Rainbow
                            col1 = mix(RED, YELLOW, usin(iTime * 0.4));
                            col2 = mix(BLACK, BLUE, usin(iTime * 0.9));
                        } else if (iColorMode == 2) { // Complementary
                            col1 = mix(YELLOW, BLUE, usin(iTime * 0.4));
                            col2 = mix(BLACK, RED, usin(iTime * 0.9));
                        } else if (iColorMode == 3) { // Earth
                            col1 = mix(vec3(0.6, 0.4, 0.2), vec3(0.8, 0.6, 0.3), usin(iTime * 0.4));
                            col2 = mix(BLACK, vec3(0.2, 0.4, 0.1), usin(iTime * 0.9));
                        } else { // Ocean
                            col1 = mix(vec3(0.0, 0.2, 0.5), vec3(0.0, 0.6, 0.8), usin(iTime * 0.4));
                            col2 = mix(BLACK, HANADA, usin(iTime * 0.9));
                        }
                        
                        vec3 col = mix(col1, col2, v);
                        
                        col *= clamp(length(uv), 0.0, 1.0);
                        
                        uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
                        col *= exp(-0.8 * length(uv));
                        col += 1.1 * usin(iTime * 0.4) * exp(-1.2 * length(uv));
                        
                        gl_FragColor = vec4(col, 1.0);
                    }
                `,
                transparent: true
            });
            
            // Store material for reuse
            window.mandalaShaderMaterial = material;
            
            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            
            // Store mesh for reuse
            window.mandalaShaderMesh = mesh;
        } else {
            // Reuse existing components
            renderer = window.mandalaShaderRenderer;
            scene = window.mandalaShaderScene;
            camera = window.mandalaShaderCamera;
        }
        
        // Update canvas size
        renderer.setSize(ctx.canvas.width, ctx.canvas.height);
        glCanvas.width = ctx.canvas.width;
        glCanvas.height = ctx.canvas.height;
        
        // Update shader uniforms
        const material = window.mandalaShaderMaterial;
        material.uniforms.iTime.value += 0.016; // Simulate time passing
        material.uniforms.iResolution.value.set(ctx.canvas.width, ctx.canvas.height, 1);
        material.uniforms.iRotation.value = angle;
        material.uniforms.iSymmetry.value = config.symmetry;
        material.uniforms.iComplexity.value = config.complexity;
        material.uniforms.iPulse.value = config.pulseEffect ? 1.0 : 0.0;
        
        // Set color mode
        switch (config.colorMode) {
            case 'monochrome': material.uniforms.iColorMode.value = 0; break;
            case 'rainbow': material.uniforms.iColorMode.value = 1; break;
            case 'complementary': material.uniforms.iColorMode.value = 2; break;
            case 'earth': material.uniforms.iColorMode.value = 3; break;
            case 'ocean': material.uniforms.iColorMode.value = 4; break;
            default: material.uniforms.iColorMode.value = 0;
        }
        
        // Render the scene with the shader
        renderer.render(scene, camera);
        
        // The fragment shader outputs directly to glCanvas,
        // so we don't need to do anything with ctx directly
    }

    // Expose the algorithm through the window.algorithms object
    window.algorithms.shader = {
        name: "Shader Algorithm",
        draw: drawMandala
    };
})(); 