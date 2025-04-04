// Fractal Mandala Shader Algorithm

(function() {
    // Create algorithms object if it doesn't exist
    window.algorithms = window.algorithms || {};
    
    // Keep track of active algorithm
    let isActive = false;
    
    /**
     * Draw a fractal mandala using WebGL shaders
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
        
        // Set this algorithm as active
        isActive = true;
        
        // We need to create a new canvas for WebGL rendering
        // Check if we already have a WebGL canvas
        let glCanvas = document.getElementById('fractal-mandala-gl-canvas');
        let renderer, scene, camera;
        
        if (!glCanvas) {
            // First time setup - create WebGL canvas and renderer
            glCanvas = document.createElement('canvas');
            glCanvas.id = 'fractal-mandala-gl-canvas';
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
            window.fractalMandalaRenderer = renderer;
            
            // Create scene and camera
            scene = new THREE.Scene();
            camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
            camera.position.z = 1;
            
            // Store scene and camera for reuse
            window.fractalMandalaScene = scene;
            window.fractalMandalaCamera = camera;
            
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
                    #define PI  3.141592654
                    #define TAU (2.0*PI)

                    uniform float iTime;
                    uniform vec3 iResolution;
                    uniform float iRotation;
                    uniform float iSymmetry;
                    uniform float iComplexity;
                    uniform float iPulse;
                    uniform int iColorMode;

                    vec3 saturate(vec3 col) {
                      return clamp(col, 0.0, 1.0);
                    }

                    void rot(inout vec2 p, float a) {
                      float c = cos(a);
                      float s = sin(a);
                      p = vec2(c*p.x + s*p.y, -s*p.x + c*p.y);
                    }

                    vec2 mod2(inout vec2 p, vec2 size) {
                      vec2 c = floor((p + size*0.5)/size);
                      p = mod(p + size*0.5,size) - size*0.5;
                      return c;
                    }

                    vec2 modMirror2(inout vec2 p, vec2 size) {
                      vec2 halfsize = size*0.5;
                      vec2 c = floor((p + halfsize)/size);
                      p = mod(p + halfsize, size) - halfsize;
                      p *= mod(c,vec2(2.0))*2.0 - vec2(1.0);
                      return c;
                    }

                    vec2 toSmith(vec2 p) {
                      float d = (1.0 - p.x)*(1.0 - p.x) + p.y*p.y;
                      float x = (1.0 + p.x)*(1.0 - p.x) - p.y*p.y;
                      float y = 2.0*p.y;
                      return vec2(x,y)/d;
                    }

                    vec2 fromSmith(vec2 p) {
                      float d = (p.x + 1.0)*(p.x + 1.0) + p.y*p.y;
                      float x = (p.x + 1.0)*(p.x - 1.0) + p.y*p.y;
                      float y = 2.0*p.y;
                      return vec2(x,y)/d;
                    }

                    vec2 toRect(vec2 p) {
                      return vec2(p.x*cos(p.y), p.x*sin(p.y));
                    }

                    vec2 toPolar(vec2 p) {
                      return vec2(length(p), atan(p.y, p.x));
                    }

                    float box(vec2 p, vec2 b) {
                      vec2 d = abs(p)-b;
                      return length(max(d,vec2(0))) + min(max(d.x,d.y),0.0);
                    }

                    float circle(vec2 p, float r) {
                      return length(p) - r;
                    }

                    float mandala_df(float localTime, vec2 p) {
                      vec2 pp = toPolar(p);
                      float symmetry = max(8.0, iSymmetry);
                      float a = TAU/symmetry;
                      float np = pp.y/a;
                      pp.y = mod(pp.y, a);
                      float m2 = mod(np, 2.0);
                      if (m2 > 1.0) {
                        pp.y = a - pp.y;
                      }
                      pp.y += localTime/40.0;
                      p = toRect(pp);
                      p = abs(p);
                      p -= vec2(0.5);
                      
                      float d = 10000.0;
                      float complexity = 4.0 * iComplexity;
                      int iterations = int(max(2.0, complexity));
                      
                      for (int i = 0; i < 4; ++i) {
                        if (i >= iterations) break;
                        mod2(p, vec2(1.0));
                        float da = -0.2 * cos(localTime*0.25);
                        float sb = box(p, vec2(0.35)) + da;
                        float cb = circle(p + vec2(0.2), 0.25) + da;
                        
                        float dd = max(sb, -cb);
                        d = min(dd, d);
                        
                        p *= 1.5 + 1.0*(0.5 + 0.5*sin(0.5*localTime));
                        rot(p, 1.0 + iRotation * 0.1);
                      }
                      
                      return d;
                    }

                    vec3 mandala_postProcess(float localTime, vec3 col, vec2 uv) {
                      float r = length(uv);
                      float a = atan(uv.y, uv.x);
                      col = clamp(col, 0.0, 1.0);
                      
                      // Apply different color processing based on color mode
                      if (iColorMode == 0) { // Monochrome
                        col = pow(col, vec3(0.5));
                      } else if (iColorMode == 1) { // Rainbow
                        col = pow(col, mix(vec3(0.5, 0.75, 1.5), vec3(0.45), r));
                      } else if (iColorMode == 2) { // Complementary
                        col = pow(col, mix(vec3(1.5, 0.5, 0.75), vec3(0.45), r));
                      } else if (iColorMode == 3) { // Earth
                        col = pow(col, mix(vec3(0.7, 0.6, 0.4), vec3(0.45), r));
                        col = mix(col, vec3(0.6, 0.4, 0.2), 0.3);
                      } else { // Ocean
                        col = pow(col, mix(vec3(0.5, 0.8, 1.2), vec3(0.45), r));
                        col = mix(col, vec3(0.0, 0.4, 0.8), 0.3);
                      }
                        
                      col=col*0.6+0.4*col*col*(3.0-2.0*col);  // contrast
                      col=mix(col, vec3(dot(col, vec3(0.33))), -0.4);  // satuation
                      
                      // Add pulse effect if enabled
                      float pulseEffect = iPulse * sin(-localTime + (50.0 - 25.0*sqrt(r))*r);
                      col *= sqrt(1.0 - 0.7 * pulseEffect) * (1.0 - sin(0.5*r));
                      
                      col = clamp(col, 0.0, 1.0);
                      float ff = pow(1.0-0.75*sin(20.0*(0.5*a + r + -0.1*localTime)), 0.75);
                      col = pow(col, vec3(ff*0.9, 0.8*ff, 0.7*ff));
                      col *= 0.5*sqrt(max(4.0 - r*r, 0.0));
                      return clamp(col, 0.0, 1.0);
                    }

                    vec2 mandala_distort(float localTime, vec2 uv) {
                      float lt = 0.1*localTime;
                      vec2 suv = toSmith(uv);
                      suv += iComplexity * vec2(cos(lt), sin(sqrt(2.0)*lt));
                      uv = fromSmith(suv);
                      modMirror2(uv, vec2(2.0+sin(lt)));
                      return uv;
                    }

                    vec3 mandala_sample(float localTime, vec2 p) {
                      float lt = 0.1*localTime;
                      vec2 uv = p;
                      uv *= 8.0;
                      rot(uv, lt + iRotation);

                      vec2 nuv = mandala_distort(localTime, uv);
                      vec2 nuv2 = mandala_distort(localTime, uv + vec2(0.0001));

                      float nl = length(nuv - nuv2);
                      float nf = 1.0 - smoothstep(0.0, 0.002, nl);

                      uv = nuv;
                      
                      float d = mandala_df(localTime, uv);

                      vec3 col = vec3(0.0);
                     
                      const float r = 0.065;

                      float nd = d / r;
                      float md = mod(d, r);
                      
                      vec3 col1, col2;
                      if (iColorMode == 0) { // Monochrome
                          col1 = vec3(0.8);
                          col2 = vec3(0.3);
                      } else if (iColorMode == 1) { // Rainbow
                          col1 = vec3(0.25, 0.65, 0.25);
                          col2 = vec3(0.65, 0.25, 0.65);
                      } else if (iColorMode == 2) { // Complementary
                          col1 = vec3(0.7, 0.3, 0.1);
                          col2 = vec3(0.1, 0.3, 0.7);
                      } else if (iColorMode == 3) { // Earth
                          col1 = vec3(0.6, 0.4, 0.1);
                          col2 = vec3(0.3, 0.5, 0.2);
                      } else { // Ocean
                          col1 = vec3(0.1, 0.5, 0.8);
                          col2 = vec3(0.0, 0.3, 0.6);
                      }
                      
                      if (abs(md) < 0.025) {
                        col = (d > 0.0 ? col1 : col2)/abs(nd);
                      }

                      if (abs(d) < 0.0125) {
                        col = vec3(1.0);
                      }

                      col += 1.0 - pow(nf, 5.0);
                      
                      col = mandala_postProcess(localTime, col, uv);
                      
                      col += 1.0 - pow(nf, 1.0);

                      return saturate(col);
                    }

                    vec3 mandala_main(vec2 p, float localTime) {
                      vec3 col = vec3(0.0);
                      vec2 unit = 1.0/iResolution.xy;
                      const int aa = 2; // Anti-aliasing
                      
                      for(int y = 0; y < aa; ++y) {
                        for(int x = 0; x < aa; ++x) {
                          col += mandala_sample(localTime, p - 0.5*unit + unit*vec2(x, y));
                        }
                      }

                      col /= float(aa*aa);
                      return col;
                    }

                    void main() {
                      float localTime = iTime + 30.0;
                      vec2 uv = (gl_FragCoord.xy/iResolution.xy - vec2(0.5)) * 2.0;
                      uv.x *= iResolution.x/iResolution.y;

                      vec3 col = mandala_main(uv, localTime);
                        
                      gl_FragColor = vec4(col, 1.0);
                    }
                `,
                transparent: true
            });
            
            // Store material for reuse
            window.fractalMandalaMaterial = material;
            
            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            
            // Store mesh for reuse
            window.fractalMandalaMesh = mesh;
        } else {
            // Reuse existing components
            renderer = window.fractalMandalaRenderer;
            scene = window.fractalMandalaScene;
            camera = window.fractalMandalaCamera;
            
            // Make sure the canvas is visible
            glCanvas.style.display = 'block';
        }
        
        // Update canvas size
        renderer.setSize(ctx.canvas.width, ctx.canvas.height);
        glCanvas.width = ctx.canvas.width;
        glCanvas.height = ctx.canvas.height;
        
        // Update shader uniforms
        const material = window.fractalMandalaMaterial;
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
    }
    
    /**
     * Check if our algorithm is active and hide WebGL canvas if not
     */
    function checkAndCleanup() {
        // If we're no longer the active algorithm, hide the canvas
        if (!isActive) {
            const glCanvas = document.getElementById('fractal-mandala-gl-canvas');
            if (glCanvas) {
                glCanvas.style.display = 'none';
            }
        }
        
        // Reset active state - will be set to true again if we're still active
        isActive = false;
        
        // Check again on next frame
        requestAnimationFrame(checkAndCleanup);
    }
    
    // Start the cleanup check loop
    checkAndCleanup();

    // Expose the algorithm through the window.algorithms object
    window.algorithms.fractalMandala = {
        name: "Fractal Mandala",
        draw: drawMandala
    };
})(); 