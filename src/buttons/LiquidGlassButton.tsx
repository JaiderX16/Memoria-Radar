import React, { useRef, useEffect } from 'react';

interface LiquidGlassButtonProps {
  imageUrl?: string;
  pageRef?: React.RefObject<HTMLElement | null>;
  domCanvas?: HTMLCanvasElement | null;
  shape?: 'pill' | 'circle';
  isPressed?: boolean;
}

export const LiquidGlassButtonWebGL: React.FC<LiquidGlassButtonProps> = ({
  imageUrl,
  pageRef,
  domCanvas,
  shape = "pill",
  isPressed = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPressedRef = useRef(isPressed);
  const domCanvasRef = useRef(domCanvas);
  const imageUrlRef = useRef(imageUrl);

  useEffect(() => {
    isPressedRef.current = isPressed;
  }, [isPressed]);

  useEffect(() => {
    domCanvasRef.current = domCanvas;
  }, [domCanvas]);

  useEffect(() => {
    imageUrlRef.current = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const gl = canvas.getContext("webgl", { alpha: true });
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const setCanvasSize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
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
        vec2 d_normal;
        if (u_shapeType == 1) {
            vec2 p = fragCoord - iResolution.xy * 0.5;
            float radius = min(iResolution.x, iResolution.y) * 0.5;
            d_normal = p;
            roundedBox = length(p) / radius; 
        } else {
            vec2 p = fragCoord - iResolution.xy * 0.5;
            float radius = iResolution.y * 0.5;
            float flatWidth = max(0.0, iResolution.x * 0.5 - radius);
            d_normal = vec2(0.0, p.y);
            if (abs(p.x) > flatWidth) {
                d_normal.x = (abs(p.x) - flatWidth) * sign(p.x);
            }
            roundedBox = length(d_normal) / radius;
        }
        
        vec2 normal = length(d_normal) > 0.001 ? normalize(d_normal) : vec2(0.0);
        
        roundedBox = pow(roundedBox, 6.0);

        // OPTIMIZATION: Hollow out the center of the shape (pill and circle)
        float coreMask = smoothstep(0.05, 0.45, roundedBox);
        // Fast rejection for the center to save GPU processing
        if (coreMask <= 0.0) {
            fragColor = vec4(0.0);
            return;
        }

        float rb1 = clamp((1.0 - roundedBox * 0.9) * 5.0, 0.0, 1.0);
        float rb2 = clamp((0.95 - roundedBox * 0.9) * 10.0, 0.0, 1.0) - clamp(pow(0.9 - roundedBox * 0.9, 1.0) * 10.0, 0.0, 1.0);
        float rb3 = clamp((1.5 - roundedBox * 1.1) * 2.0, 0.0, 1.0) - clamp(pow(1.0 - roundedBox * 1.1, 1.0) * 2.0, 0.0, 1.0);

        // Constant pixel space waves prevent stretching in wide components
        float waveIntensity = 2.0 + (u_pressed * 3.0);
        vec2 fluidOffsetPixels = vec2(sin(fragCoord.y * 0.05 + iTime * 3.0), cos(fragCoord.x * 0.05 + iTime * 3.0)) * waveIntensity;
        
        // Lens offset: push pixels inwards towards spine based on distance, plus fluid wave.
        vec2 pixelOffset = -normal * (roundedBox * (12.0 + u_pressed * 8.0)) + fluidOffsetPixels;

        vec2 distortedUV;
        if (u_isDomCaptured) {
            vec2 docPixel = u_buttonBottomLeft + fragCoord;
            distortedUV = (docPixel + pixelOffset) / u_pageResolution;
        } else {
            distortedUV = uv + pixelOffset / iResolution.xy;
        }

        fragColor = vec4(0.0);
        vec2 offsets[5];
        offsets[0] = vec2(0.0, 0.0);
        offsets[1] = vec2(1.0, 1.0);
        offsets[2] = vec2(-1.0, -1.0);
        offsets[3] = vec2(1.0, -1.0);
        offsets[4] = vec2(-1.0, 1.0);

        for (int i = 0; i < 5; i++) {
            if (u_isDomCaptured) {
                vec2 blurOffset = offsets[i] * 1.5 / u_pageResolution;
                fragColor += texture2D(iChannel0, distortedUV + blurOffset);
            } else {
                vec2 blurOffset = offsets[i] * 0.006;
                fragColor += texture2D(iChannel0, getCoverUV(distortedUV + blurOffset));
            }
        }
        fragColor /= 5.0;

        float gradient = clamp((m2.y + 0.5), 0.0, 1.0) * 0.5 + clamp((-m2.y + 0.5) * rb3, 0.0, 1.0);
        
        vec4 lighting = clamp(fragColor + vec4(rb1) * gradient * 0.15 + vec4(rb2) * 0.25, 0.0, 1.0);
        lighting -= u_pressed * 0.15; 

        float alpha = (1.0 - smoothstep(0.95, 1.0, roundedBox)) * coreMask;
        
        fragColor = vec4(lighting.rgb, alpha);
      }

      void main() { 
        mainImage(gl_FragColor, gl_FragCoord.xy); 
      }
    `;

    const createShader = (type: number, source: string) => {
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

    const updateTexture = (source: TexImageSource) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      imgWidth = (source as any).width || (source as any).videoWidth || 1;
      imgHeight = (source as any).height || (source as any).videoHeight || 1;
    };

    let lastDomCanvas: HTMLCanvasElement | null | undefined = undefined;
    let lastImageUrl: string | undefined = undefined;
    let lastMapVersion = -1;

    const checkAndUpdateTexture = () => {
      const currentDomCanvas = domCanvasRef.current;
      const currentImageUrl = imageUrlRef.current;

      if (currentDomCanvas) {
        // @ts-ignore
        const currentVersion = currentDomCanvas.__mapVersion;
        if (currentVersion === undefined || currentVersion !== lastMapVersion) {
          lastMapVersion = currentVersion;
          updateTexture(currentDomCanvas);
        }
      } else if (!currentDomCanvas && currentImageUrl !== lastImageUrl) {
        lastImageUrl = currentImageUrl;
        if (currentImageUrl) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => updateTexture(img);
          img.src = currentImageUrl;
        }
      }
    };

    checkAndUpdateTexture();

    let animationFrameId: number;
    let startTime = performance.now();
    let currentPress = 0;

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    observer.observe(canvas);

    let lastRenderTime = 0;
    const TARGET_FPS = 30;
    const frameInterval = 1000 / TARGET_FPS;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      if (!isVisible) {
        return;
      }

      const now = performance.now();
      if (now - lastRenderTime < frameInterval) {
        return;
      }
      lastRenderTime = now;

      const currentTime = (performance.now() - startTime) / 1000;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      gl.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1.0);
      gl.uniform1f(uniforms.time, currentTime);
      const currentDomCanvas = domCanvasRef.current;
      checkAndUpdateTexture();
      gl.uniform1i(uniforms.uIsDomCaptured, currentDomCanvas ? 1 : 0);
      gl.uniform2f(uniforms.uImageResolution, imgWidth, imgHeight);
      gl.uniform1i(uniforms.uShapeType, shape === "circle" ? 1 : 0);

      const targetPress = isPressedRef.current ? 1.0 : 0.0;
      currentPress += (targetPress - currentPress) * 0.15;
      gl.uniform1f(uniforms.uPressed, currentPress);

      if (currentDomCanvas && pageRef?.current) {
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
    };

    render();
    const handleResize = () => setCanvasSize();
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      gl.deleteProgram(program);
      gl.deleteTexture(texture);
    };
  }, [pageRef, shape]);

  return <canvas ref={canvasRef} className={`block w-full h-full rounded-full`} />;
};

const LiquidGlassButtonWebGPU: React.FC<LiquidGlassButtonProps> = ({
  imageUrl,
  pageRef,
  domCanvas,
  shape = "pill",
  isPressed = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPressedRef = useRef(isPressed);
  const domCanvasRef = useRef(domCanvas);
  const imageUrlRef = useRef(imageUrl);

  useEffect(() => {
    isPressedRef.current = isPressed;
  }, [isPressed]);

  useEffect(() => {
    domCanvasRef.current = domCanvas;
  }, [domCanvas]);

  useEffect(() => {
    imageUrlRef.current = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    let animationFrameId: number;
    let device: GPUDevice;
    let context: GPUCanvasContext;
    let pipeline: GPURenderPipeline;
    let uniformBuffer: GPUBuffer;
    let sampler: GPUSampler;
    let texture: GPUTexture;
    let bindGroup: GPUBindGroup;
    let imgWidth = 1;
    let imgHeight = 1;
    let currentPress = 0;
    let startTime = performance.now();

    let observer: IntersectionObserver;

    const initWebGPU = async () => {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) return;
        device = await adapter.requestDevice();
        context = canvas.getContext('webgpu') as GPUCanvasContext;
        if (!context) return;

        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({ device, format, alphaMode: 'premultiplied' });

        const setCanvasSize = () => {
          const rect = canvas.parentElement!.getBoundingClientRect();
          canvas.width = rect.width;
          canvas.height = rect.height;
        };
        setCanvasSize();

        const wgslCode = `
          struct Uniforms {
              resolution: vec2f,
              pageResolution: vec2f,
              buttonBottomLeft: vec2f,
              imageResolution: vec2f,
              time: f32,
              isDomCaptured: f32,
              shapeType: f32,
              pressed: f32,
          };

          @group(0) @binding(0) var<uniform> u: Uniforms;
          @group(0) @binding(1) var mySampler: sampler;
          @group(0) @binding(2) var myTexture: texture_2d<f32>;

          struct VertexOutput {
              @builtin(position) position: vec4f,
          };

          @vertex
          fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
              var pos = array<vec2f, 4>(
                  vec2f(-1.0, -1.0),
                  vec2f( 1.0, -1.0),
                  vec2f(-1.0,  1.0),
                  vec2f( 1.0,  1.0)
              );
              var output: VertexOutput;
              output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
              return output;
          }

          fn getCoverUV(targetUV: vec2f) -> vec2f {
              let canvasAspect = u.resolution.x / u.resolution.y;
              let imageAspect = u.imageResolution.x / u.imageResolution.y;
              var result = targetUV;
              if (canvasAspect > imageAspect) {
                  let scale = imageAspect / canvasAspect;
                  result.y = (result.y - 0.5) * scale + 0.5;
              } else {
                  let scale = canvasAspect / imageAspect;
                  result.x = (result.x - 0.5) * scale + 0.5;
              }
              return result;
          }

          @fragment
          fn fs_main(@builtin(position) fragCoord: vec4f) -> @location(0) vec4f {
              let uv = vec2f(fragCoord.x / u.resolution.x, 1.0 - (fragCoord.y / u.resolution.y));
              let m2 = uv - 0.5;

              var roundedBox: f32;
              if (u.shapeType > 0.5) {
                  roundedBox = length(m2 * 2.0);
              } else {
                  let p = vec2f(fragCoord.x, u.resolution.y - fragCoord.y) - u.resolution * 0.5;
                  let radius = u.resolution.y * 0.5;
                  let flatWidth = max(0.0, u.resolution.x * 0.5 - radius);
                  let d = vec2f(max(0.0, abs(p.x) - flatWidth), p.y);
                  roundedBox = length(d) / radius;
              }
              roundedBox = pow(roundedBox, 6.0);

              let rb1 = clamp((1.0 - roundedBox * 0.9) * 5.0, 0.0, 1.0);
              let rb2 = clamp((0.95 - roundedBox * 0.9) * 10.0, 0.0, 1.0) - clamp(pow(0.9 - roundedBox * 0.9, 1.0) * 10.0, 0.0, 1.0);
              let rb3 = clamp((1.5 - roundedBox * 1.1) * 2.0, 0.0, 1.0) - clamp(pow(1.0 - roundedBox * 1.1, 1.0) * 2.0, 0.0, 1.0);

              let waveIntensity = 0.005 + (u.pressed * 0.02);
              let fluidOffset = vec2f(sin(uv.y * 5.0 + u.time * 3.0), cos(uv.x * 5.0 + u.time * 3.0)) * waveIntensity;
              
              let localLens = ((uv - 0.5) * (1.0 - roundedBox * (0.2 + u.pressed * 0.1)) + 0.5) + fluidOffset;
              let uvOffset = localLens - uv;

              var distortedUV: vec2f;
              if (u.isDomCaptured > 0.5) {
                  let docPixel = u.buttonBottomLeft + vec2f(fragCoord.x, u.resolution.y - fragCoord.y);
                  let baseUV = docPixel / u.pageResolution;
                  distortedUV = baseUV + uvOffset * (u.resolution / u.pageResolution) * 3.0;
              } else {
                  distortedUV = uv + uvOffset * 2.0;
              }

              var color = vec4f(0.0);
              let offsets = array<vec2f, 5>(
                  vec2f(0.0, 0.0),
                  vec2f(1.0, 1.0),
                  vec2f(-1.0, -1.0),
                  vec2f(1.0, -1.0),
                  vec2f(-1.0, 1.0)
              );
              
              for (var i: i32 = 0; i < 5; i++) {
                  let offset = offsets[i];
                  if (u.isDomCaptured > 0.5) {
                      let blurOffset = offset * 1.5 / u.pageResolution;
                      let sampleUV = distortedUV + blurOffset;
                      color += textureSample(myTexture, mySampler, vec2f(sampleUV.x, 1.0 - sampleUV.y));
                  } else {
                      let blurOffset = offset * 0.006;
                      let sampleUV = getCoverUV(distortedUV + blurOffset);
                      color += textureSample(myTexture, mySampler, vec2f(sampleUV.x, 1.0 - sampleUV.y));
                  }
              }
              color /= 5.0;

              let gradient = clamp((m2.y + 0.5), 0.0, 1.0) * 0.5 + clamp((-m2.y + 0.5) * rb3, 0.0, 1.0);
              var lighting = clamp(color + vec4f(rb1) * gradient * 0.15 + vec4f(rb2) * 0.25, vec4f(0.0), vec4f(1.0));
              lighting -= u.pressed * 0.15; 

              let alpha = 1.0 - smoothstep(0.95, 1.0, roundedBox);
              return vec4f(lighting.rgb, alpha);
          }
        `;

        const shaderModule = device.createShaderModule({ code: wgslCode });

        pipeline = device.createRenderPipeline({
          layout: 'auto',
          vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
          },
          fragment: {
            module: shaderModule,
            entryPoint: 'fs_main',
            targets: [
              {
                format,
                blend: {
                  color: {
                    srcFactor: 'src-alpha' as GPUBlendFactor,
                    dstFactor: 'one-minus-src-alpha' as GPUBlendFactor,
                    operation: 'add' as GPUBlendOperation,
                  },
                  alpha: {
                    srcFactor: 'one' as GPUBlendFactor,
                    dstFactor: 'one-minus-src-alpha' as GPUBlendFactor,
                    operation: 'add' as GPUBlendOperation,
                  }
                }
              }
            ]
          },
          primitive: {
            topology: 'triangle-strip',
            stripIndexFormat: 'uint32',
          }
        });

        uniformBuffer = device.createBuffer({
          size: 48,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        sampler = device.createSampler({
          magFilter: 'linear',
          minFilter: 'linear',
          addressModeU: 'clamp-to-edge',
          addressModeV: 'clamp-to-edge',
        });

        const createBindGroup = () => {
          if (!texture) return;
          bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: { buffer: uniformBuffer } },
              { binding: 1, resource: sampler },
              { binding: 2, resource: texture.createView() }
            ]
          });
        };

        texture = device.createTexture({
          size: [1, 1, 1],
          format: 'rgba8unorm',
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });
        device.queue.writeTexture(
          { texture },
          new Uint8Array([0, 0, 0, 0]),
          { bytesPerRow: 4 },
          [1, 1, 1]
        );
        createBindGroup();

        const updateTexture = async (source: any) => {
          if (!device) return;

          let bitmap;
          if (source instanceof HTMLImageElement) {
            bitmap = await createImageBitmap(source);
          } else {
            bitmap = source;
          }

          imgWidth = bitmap.width || 1;
          imgHeight = bitmap.height || 1;

          if (texture) texture.destroy();
          texture = device.createTexture({
            size: [imgWidth, imgHeight, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
          });

          device.queue.copyExternalImageToTexture(
            { source: bitmap },
            { texture },
            [imgWidth, imgHeight]
          );
          createBindGroup();
        };

        let lastImageUrl: string | undefined = undefined;
        let lastMapVersion = -1;

        const checkAndUpdateTexture = () => {
          const currentDomCanvas = domCanvasRef.current;
          const currentImageUrl = imageUrlRef.current;

          if (currentDomCanvas) {
            // @ts-ignore
            const currentVersion = currentDomCanvas.__mapVersion;
            if (currentVersion === undefined || currentVersion !== lastMapVersion) {
              lastMapVersion = currentVersion;
              updateTexture(currentDomCanvas);
            }
          } else if (!currentDomCanvas && currentImageUrl !== lastImageUrl) {
            lastImageUrl = currentImageUrl;
            if (currentImageUrl) {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => updateTexture(img);
              img.src = currentImageUrl;
            }
          }
        };

        checkAndUpdateTexture();

        const uniformData = new Float32Array(12);

        let isVisible = true;
        observer = new IntersectionObserver((entries) => {
          isVisible = entries[0].isIntersecting;
        }, { threshold: 0 });
        observer.observe(canvas);

        let lastRenderTime = 0;
        const TARGET_FPS = 30;
        const frameInterval = 1000 / TARGET_FPS;

        const render = () => {
          if (!device || !context || !pipeline || !bindGroup) return;

          animationFrameId = requestAnimationFrame(render);

          if (!isVisible) {
            return;
          }

          const now = performance.now();
          if (now - lastRenderTime < frameInterval) {
            return;
          }
          lastRenderTime = now;

          const currentTime = (performance.now() - startTime) / 1000;

          const currentDomCanvas = domCanvasRef.current;
          checkAndUpdateTexture();

          uniformData[0] = canvas.width;
          uniformData[1] = canvas.height;
          if (currentDomCanvas && pageRef?.current) {
            const pageHeight = pageRef.current.offsetHeight || pageRef.current.scrollHeight;
            const pageWidth = pageRef.current.offsetWidth || pageRef.current.scrollWidth;
            uniformData[2] = pageWidth;
            uniformData[3] = pageHeight;

            const btnRect = canvas.getBoundingClientRect();
            const pageRect = pageRef.current.getBoundingClientRect();
            uniformData[4] = btnRect.left - pageRect.left;
            uniformData[5] = pageHeight - (btnRect.bottom - pageRect.top);
          }
          uniformData[6] = imgWidth;
          uniformData[7] = imgHeight;
          uniformData[8] = currentTime;
          uniformData[9] = currentDomCanvas ? 1.0 : 0.0;
          uniformData[10] = shape === "circle" ? 1.0 : 0.0;

          const targetPress = isPressedRef.current ? 1.0 : 0.0;
          currentPress += (targetPress - currentPress) * 0.15;
          uniformData[11] = currentPress;

          device.queue.writeBuffer(uniformBuffer, 0, uniformData);

          const commandEncoder = device.createCommandEncoder();
          const textureView = context.getCurrentTexture().createView();
          const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
              view: textureView,
              clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
              loadOp: 'clear' as GPULoadOp,
              storeOp: 'store' as GPUStoreOp,
            }],
          };
          const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
          passEncoder.setPipeline(pipeline);
          passEncoder.setBindGroup(0, bindGroup);
          passEncoder.draw(4);
          passEncoder.end();
          device.queue.submit([commandEncoder.finish()]);
        };

        render();

        const handleResize = () => setCanvasSize();
        window.addEventListener("resize", handleResize);
      } catch (e) {
        console.error("WebGPU init failed", e);
      }
    };

    initWebGPU();

    return () => {
      if (observer) observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (texture) texture.destroy();
      if (uniformBuffer) uniformBuffer.destroy();
      if (device) device.destroy();
    };
  }, [pageRef, shape]);

  return <canvas ref={canvasRef} className="block w-full h-full rounded-full" />;
};

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = (props) => {
  const [gpuSupported, setGpuSupported] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (navigator.gpu) {
      navigator.gpu.requestAdapter().then(adapter => {
        setGpuSupported(!!adapter);
      }).catch(() => setGpuSupported(false));
    } else {
      setGpuSupported(false);
    }
  }, []);

  if (gpuSupported === null) return <canvas className="block w-full h-full rounded-full" />;
  if (gpuSupported) return <LiquidGlassButtonWebGPU {...props} />;
  return <LiquidGlassButtonWebGL {...props} />;
};
