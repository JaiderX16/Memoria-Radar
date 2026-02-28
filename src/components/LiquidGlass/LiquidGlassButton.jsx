import React, { useRef, useEffect } from 'react';

export const LiquidGlassButton = ({
    imageUrl,
    pageRef,
    domCanvas,
    shape = "pill",
    isPressed = false
}) => {
    const canvasRef = useRef(null);
    const isPressedRef = useRef(isPressed);

    useEffect(() => {
        isPressedRef.current = isPressed;
    }, [isPressed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !canvas.parentElement) return;

        const gl = canvas.getContext("webgl", { alpha: true });
        if (!gl) return;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const setCanvasSize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        setCanvasSize();

        const vsSource = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

        const fsSource = `
      precision mediump float;
      uniform vec3 iResolution;
      uniform float iTime;
      uniform sampler2D iChannel0;
      uniform bool u_isDomCaptured;
      uniform vec2 u_pageResolution;
      uniform vec2 u_buttonBottomLeft;
      uniform vec2 u_imageResolution;
      uniform int u_shapeType;
      uniform float u_pressed; 

      vec2 getCoverUV(vec2 targetUV) {
        float canvasAspect = iResolution.x / iResolution.y;
        float imageAspect = u_imageResolution.x / u_imageResolution.y;
        vec2 result = targetUV;
        if (canvasAspect > imageAspect) {
            float scale = imageAspect / canvasAspect;
            result.y = (result.y - 0.5) * scale + 0.5;
        } else {
            float scale = canvasAspect / imageAspect;
            result.x = (result.x - 0.5) * scale + 0.5;
        }
        return result;
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = fragCoord / iResolution.xy;
        vec2 m2 = uv - 0.5;

        float roundedBox;
        if (u_shapeType == 1) {
            roundedBox = pow(length(m2 * 2.0), 6.0); 
        } else {
            roundedBox = pow(abs(m2.x * 2.0), 6.0) + pow(abs(m2.y * 2.0), 6.0); 
        }

        float rb1 = clamp((1.0 - roundedBox * 0.9) * 5.0, 0.0, 1.0);
        float rb2 = clamp((0.95 - roundedBox * 0.9) * 10.0, 0.0, 1.0) - clamp(pow(0.9 - roundedBox * 0.9, 1.0) * 10.0, 0.0, 1.0);
        float rb3 = clamp((1.5 - roundedBox * 1.1) * 2.0, 0.0, 1.0) - clamp(pow(1.0 - roundedBox * 1.1, 1.0) * 2.0, 0.0, 1.0);

        float waveIntensity = 0.005 + (u_pressed * 0.02);
        vec2 fluidOffset = vec2(sin(uv.y * 5.0 + iTime * 3.0), cos(uv.x * 5.0 + iTime * 3.0)) * waveIntensity;
        
        vec2 localLens = ((uv - 0.5) * (1.0 - roundedBox * (0.2 + u_pressed * 0.1)) + 0.5) + fluidOffset;
        vec2 uvOffset = localLens - uv;

        vec2 distortedUV;
        if (u_isDomCaptured) {
            vec2 docPixel = u_buttonBottomLeft + fragCoord;
            vec2 baseUV = docPixel / u_pageResolution;
            distortedUV = baseUV + uvOffset * (iResolution.xy / u_pageResolution) * 3.0;
        } else {
            distortedUV = uv + uvOffset * 2.0;
        }

        fragColor = vec4(0.0);
        float total = 0.0;
        const float SAMPLE_RANGE = 2.0; 
        for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x++) {
          for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y++) {
            if (u_isDomCaptured) {
                vec2 blurOffset = vec2(x, y) * 0.5 / u_pageResolution;
                fragColor += texture2D(iChannel0, distortedUV + blurOffset);
            } else {
                vec2 blurOffset = vec2(x, y) * 0.002;
                fragColor += texture2D(iChannel0, getCoverUV(distortedUV + blurOffset));
            }
            total += 1.0;
          }
        }
        fragColor /= total;

        float gradient = clamp((m2.y + 0.5), 0.0, 1.0) * 0.5 + clamp((-m2.y + 0.5) * rb3, 0.0, 1.0);
        vec4 lighting = clamp(fragColor + vec4(rb1) * gradient * 0.15 + vec4(rb2) * 0.25, 0.0, 1.0);
        lighting -= u_pressed * 0.15; 

        float alpha = 1.0 - smoothstep(0.95, 1.0, roundedBox);
        gl_FragColor = vec4(lighting.rgb, alpha);
      }

      void main() { 
        mainImage(gl_FragColor, gl_FragCoord.xy); 
      }
    `;

        const createShader = (type, source) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader Error:", gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        };

        const vs = createShader(gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        if (!program) return;

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const uniforms = {
            resolution: gl.getUniformLocation(program, "iResolution"),
            time: gl.getUniformLocation(program, "iTime"),
            texture: gl.getUniformLocation(program, "iChannel0"),
            uIsDomCaptured: gl.getUniformLocation(program, "u_isDomCaptured"),
            uPageResolution: gl.getUniformLocation(program, "u_pageResolution"),
            uButtonBottomLeft: gl.getUniformLocation(program, "u_buttonBottomLeft"),
            uImageResolution: gl.getUniformLocation(program, "u_imageResolution"),
            uShapeType: gl.getUniformLocation(program, "u_shapeType"),
            uPressed: gl.getUniformLocation(program, "u_pressed"),
        };

        const texture = gl.createTexture();
        let imgWidth = 1, imgHeight = 1;
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        const updateTexture = (source) => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            imgWidth = source.width || source.videoWidth || 1;
            imgHeight = source.height || source.videoHeight || 1;
        };

        if (domCanvas) {
            updateTexture(domCanvas);
        } else if (imageUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => updateTexture(img);
            img.src = imageUrl;
        }

        let animationFrameId;
        let startTime = performance.now();
        let currentPress = 0;

        const render = () => {
            const currentTime = (performance.now() - startTime) / 1000;

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);

            gl.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1.0);
            gl.uniform1f(uniforms.time, currentTime);
            gl.uniform1i(uniforms.uIsDomCaptured, domCanvas ? 1 : 0);
            gl.uniform2f(uniforms.uImageResolution, imgWidth, imgHeight);
            gl.uniform1i(uniforms.uShapeType, shape === "circle" ? 1 : 0);

            const targetPress = isPressedRef.current ? 1.0 : 0.0;
            currentPress += (targetPress - currentPress) * 0.15;
            gl.uniform1f(uniforms.uPressed, currentPress);

            if (domCanvas && pageRef?.current) {
                const pageHeight = pageRef.current.offsetHeight || pageRef.current.scrollHeight;
                const pageWidth = pageRef.current.offsetWidth || pageRef.current.scrollWidth;
                gl.uniform2f(uniforms.uPageResolution, pageWidth, pageHeight);

                const btnRect = canvas.getBoundingClientRect();
                const pageRect = pageRef.current.getBoundingClientRect();

                const docX = btnRect.left - pageRect.left;
                const docY = pageHeight - (btnRect.bottom - pageRect.top);

                gl.uniform2f(uniforms.uButtonBottomLeft, docX, docY);
            }

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(uniforms.texture, 0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        const handleResize = () => setCanvasSize();
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            gl.deleteProgram(program);
            gl.deleteTexture(texture);
        };
    }, [imageUrl, pageRef, domCanvas, shape]);

    return <canvas ref={canvasRef} className={`block w-full h-full ${shape === "circle" ? "rounded-full" : "rounded-[3rem]"}`} />;
};
