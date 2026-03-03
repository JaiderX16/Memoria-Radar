import React, { useState, useEffect, useRef } from 'react';

// === ESTILOS ORIGINALES ===
// Conservamos el CSS original para asegurar que los filtros SVG, 
// capas 3D y variables CSS funcionen de manera idéntica.
const rawCSS = `
@import url('https://unpkg.com/normalize.css') layer(normalize);

@layer normalize, base, demo, toggle, transitions, debug;

@layer debug {
  .arrow {
    font-family: 'Gloria Hallelujah', cursive;
    font-size: .875rem;
    position: absolute;
    opacity: .6;

    span {
      white-space: nowrap;
      display: inline-block;
    }

    &.arrow--main {
      right: 120%;
      rotate: -30deg;
      transition: opacity .26s ease-out;
      svg {
        rotate: 10deg;
        width: 24px;
        top: 150%;
        left: 50%;
        position: absolute;
        scale: -1 1;
      }
    }
  }
  [data-debug=true] {
    main {
      transform: rotateX(-24deg) rotateY(24deg);
      transition: transform 0.32s ease-out;
    }
    :is(.debug, .knockout--debug) {
      opacity: 1;
      transition-property: transform, opacity;
      transition-duration: 0.32s, 0.32s;
      transition-delay: 0.4s, 0.4s;
      transition-timing-function: ease-out, ease-in;
    }
    .debug--knockout {
      transform: translate3d(0, 0, -200px);
    }
    .debug--indicator {
      transform: translate3d(0, 0, 200px);
    }
    .debug .arrow {
      opacity: .6;
      transition: opacity 0.1s 0.8s ease-out;
    }
  }
  .debug {
    transform-style: preserve-3d;
    outline: 4px var(--checked) dashed;
    outline-offset: 4px;
    height: 100%;
    width: 100%;
    opacity: 0;
    border-radius: inherit;
    pointer-events: none;
    position: absolute;
    inset: 0;
    
    .arrow {
      transform-style: preserve-3d;
      position: absolute;
      left: calc(100% + 2rem);
      top: 50%;
      translate: 0 -50%;
      transform: rotateY(-24deg) rotateX(24deg) translate3d(0, 0, 100px);
      z-index: 20;
      opacity: 0;
    }
  }
  .indicator__liquid--debug {
    pointer-events: none;
    
    .wrapper {
      clip-path: unset;
    }
    .liquids {
      overflow: visible;
    }
  }

  :is(.debug) {
    transition-property: transform, opacity;
    transition-duration: 0.32s, 0.32s;
    transition-delay: 0.2s, 0.2s;
    transition-timing-function: ease-in, ease-out;
  }
  
  main {
    position: relative;
    transition: transform 0.32s 0.4s ease-out;
  }

  main,
  .liquid-toggle {
    transform-style: preserve-3d;
  }
}

@layer transitions {
  :root {
    --transition: 0.2s;
    --ease: ease-out;
  }
  [data-pressed=true] .liquid__track {
    min-height: 30px;
  }
  [data-bounce='true']:has(:is(button:active, [data-pressed="true"])) {
    --transition: 0.6s;
    --ease: linear(
      0 0%, 0.6091 3.69%, 1.0259 7.24%, 1.1733 9.05%,
      1.283 10.92%, 1.3562 12.87%, 1.3948 14.95%, 1.4014 16.03%,
      1.3999 17.16%, 1.3731 19.64%, 1.3202 22.27%, 1.1394 29.39%,
      1.0582 33.17%, 0.9943 37.45%, 0.9734 39.64%, 0.9593 41.92%,
      0.9505 45.08%, 0.9517 48.7%, 0.9924 63.02%, 1.0046 71.2%,
      1.0061 78.24%, 1 100%
    );
  }
  .indicator--masked .mask {
    translate: calc((var(--complete) / 100) * (100cqi - 60cqi - (0 * var(--border)))) -50%;
    transition-property: height, width, margin, scale;
    transition-duration: var(--transition);
    transition-timing-function: var(--ease);
    will-change: height, width, margin;
  }
  .wrapper {
    clip-path: inset(0 0 0 0 round 100px);
    filter: blur(6px);
    transition: filter var(--transition) var(--ease);
  }
  [aria-pressed='true']:not([data-active='true']) .liquid__track {
    left: calc(var(--border) * 6);
  }
  .liquid__track {
    left: 0;
    transition-property: height, width, filter, left;
    transition-duration: var(--transition);
    transition-timing-function: var(--ease);
    translate: calc((var(--complete) / 100) * (100cqi - 100% - (6 * var(--border)))) -50%;
  }
  [data-mapped=false] .liquid__track {
    transition-property: height, width, filter, left, background;
    transition-duration: var(--transition), var(--transition), var(--transition), var(--transition), calc(var(--transition) * 0.5);
    transition-timing-function: var(--ease), var(--ease), var(--ease), var(--ease), ease-out;
  }
  .indicator__liquid {
    translate: calc((var(--complete) / 100) * (100cqi - 100% - (2 * var(--border)))) -50%;
    transition-property: scale;
    transition-duration: var(--transition);
    transition-timing-function: var(--ease);
  }
  .indicator__liquid :is(.cover, .shadow) {
    transition: opacity var(--transition) var(--ease);
  }
  [data-active='true'] .indicator--masked .mask,
  .liquid-toggle:active .indicator--masked .mask {
    height: calc((100% - (2 * var(--border))) * (1.65 - (var(--delta, 0) * 0.025)));
    width: calc((60% - (2 * var(--border))) * (1.65 + (var(--delta, 0) * 0.025)));
    margin-left: calc((60% - (2 * var(--border))) * ((.65 + (var(--delta, 0) * 0.025)) * -0.5));
  }
  [data-active='true'] .indicator__liquid,
  .liquid-toggle:active .indicator__liquid {
    scale: calc(1.65 + (var(--delta, 0) * 0.025)) calc(1.65 - (var(--delta, 0) * 0.025));
  }
  [data-active='true'] .wrapper,
  .liquid-toggle:active .wrapper {
    filter: blur(0px);
  }
  [data-active='true'] .indicator__liquid .shadow,
  .liquid-toggle:active .indicator__liquid .shadow {
    opacity: 1;
  }
  [data-active='true'] .indicator__liquid .cover,
  .liquid-toggle:active .indicator__liquid .cover {
    opacity: 0;
  }
  [data-active='true'] .indicator__liquid .liquid__track,
  .liquid-toggle:active .indicator__liquid .liquid__track {
    left: calc(var(--border) * 3);
    height: calc((var(--height) * 1px) - (6 * var(--border)));
  }
}

@layer toggle {
  [data-mapped=false] .liquid-toggle {
    --progress: round(down, var(--complete), 85);
    --checked: hsl(
      var(--hue, 144),
      calc((8 + (var(--progress) / 85 * (92))) * 1%),
      calc((81 - (var(--progress) / 85 * (81 - 43))) * 1%)
    );
    .indicator, .indicator--masked {
      transition: background calc(var(--transition) * 0.5) ease-out;
    }
    .liquid__shadow {
      transition: box-shadow calc(var(--transition) * 0.5) ease-out;
    }
  }

  .liquid-toggle {
    --unchecked: hsl(218, 8%, 81%);
    --checked: hsl(
      var(--hue, 144),
      calc((8 + (var(--complete) / 100 * (92))) * 1%),
      calc((81 - (var(--complete) / 100 * (81 - 43))) * 1%)
    );
    --control: hsl(300, 100%, 100%);
    --border: 5px;
    --width: 140;
    --height: 60;
    height: calc(var(--height) * 1px);
    width: calc(var(--width) * 1px);
    border-radius: 100px;
    border: 0;
    padding: 0;
    cursor: pointer;
    position: relative;
    overflow: visible;
    container-type: inline-size;
    background: #0000;
    transition: outline var(--transition) var(--ease);
    outline-offset: 2px;
  }

  .liquid-toggle:focus-visible {
    outline: 4px solid color-mix(in oklch, var(--checked), #0000);
  }
  .liquid-toggle:active {
    outline: none;
  }
  .liquid-toggle[data-active='true']:focus-visible {
    outline: 4px solid #0000;
  }

  .indicator {
    border-radius: 100px;
    pointer-events: none;
    height: 100%;
    width: 100%;
    background: var(--checked);
    position: absolute;
    top: 50%;
    scale: 1;
    left: 50%;
    translate: -50% -50%;
  }

  .knockout {
    height: calc(var(--height) * 1px);
    width: calc(var(--width) * 1px);
    border-radius: 100px;
    filter: url(#remove-black);
    position: absolute;
    inset: 0;
    will-change: filter, scale;
    transform: translate3d(0, 0, 0);
  }
  .indicator--masked {
    background: var(--checked);
    z-index: 12;
    height: 100%;
    width: 100%;
    translate: -50% -50%;
    container-type: inline-size;

    .mask {
      position: absolute;
      height: calc(100% - (2 * var(--border)));
      width: calc(60% - (2 * var(--border)));
      top: 50%;
      background: #000;
      left: var(--border);
      border-radius: 100px;
    }
  }

  .wrapper {
    position: absolute;
    inset: 0;
    border-radius: 100px;
  }

  .liquids {
    position: absolute;
    inset: 0;
    transform: translate3d(0, 0, 0);
    border-radius: 100px;
    overflow: hidden;
    filter: url(#goo);

    .liquid__shadow {
      position: absolute;
      inset: 0;
      box-shadow: inset 0px 0px 3px 4px var(--checked),
        inset calc(((var(--complete) / 100) * 8px) + -4px) 0px 3px 4px var(--checked);
      border-radius: 100px;
    }

    .liquid__track {
      content: '';
      height: calc((var(--height) * 1px) - (0 * var(--border)));
      width: calc((var(--width) * 1px) - (0 * var(--border)));
      background: var(--checked);
      border-radius: 100px;
      position: absolute;
      top: 50%;
    }
  }

  .indicator__liquid {
    position: absolute;
    height: calc(100% - (2 * var(--border)));
    width: calc(60% - (2 * var(--border)));
    container-type: inline-size;
    top: 50%;
    background: #0000;
    left: var(--border);
    border-radius: 100px;

    .shadow {
      opacity: 0;
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 100px;
      box-shadow: 1px -1px 2px hsl(0 0% 100% / 0.5) inset,
        0px -1px 2px hsl(0 0% 100% / 0.5) inset,
        -1px -1px 2px hsl(0 0% 100% / 0.5) inset,
        1px 1px 2px hsl(0 0% 30% / 0.5) inset,
        -8px 4px 10px -6px hsl(0 0% 30% / 0.25) inset,
        -1px 1px 6px hsl(0 0% 30% / 0.25) inset,
        -1px -1px 8px hsl(0 0% 60% / 0.15), 1px 1px 2px hsl(0 0% 30% / 0.15),
        2px 2px 6px hsl(0 0% 30% / 0.15),
        -2px -1px 2px hsl(0 0% 100% / 0.25) inset,
        3px 6px 16px -6px hsl(0 0% 30% / 0.5);
      z-index: 20;
    }

    .cover {
      content: '';
      position: absolute;
      inset: 0;
      background: white;
      border-radius: 100px;
    }
  }
}

@layer base {
  :root {
    --font-size-min: 16;
    --font-size-max: 20;
    --font-ratio-min: 1.2;
    --font-ratio-max: 1.33;
    --font-width-min: 375;
    --font-width-max: 1500;
  }
  *, *:after, *:before {
    box-sizing: border-box;
  }
  .app-container {
    display: grid;
    place-items: center;
    font-family: 'SF Pro Text', 'SF Pro Icons', 'AOS Icons', 'Helvetica Neue', Helvetica, Arial, sans-serif, system-ui;
    overflow: visible;
    position: relative;
    color-scheme: light dark;
  }
  .app-container[data-theme='light'] {
    color-scheme: light only;
  }
  .app-container[data-theme='dark'] {
    color-scheme: dark only;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
}
`;

export const LiquidGooToggle = ({ checked = false, onChange, scale = 1, className = '', hideConfigButton = false }) => {
  const toggleRef = useRef(null);
  const containerRef = useRef(null);
  const [gsapLoaded, setGsapLoaded] = useState(false);

  // Estado para controlar la visibilidad del panel (oculto por defecto)
  const [showConfig, setShowConfig] = useState(false);

  // Estado del componente que reemplaza a Tweakpane
  const [config, setConfig] = useState({
    theme: 'system',
    complete: checked ? 100 : 0,
    active: false,
    deviation: 2,
    alpha: 16,
    bounce: true,
    hue: 144,
    delta: true,
    bubble: true,
    mapped: false,
    debug: false,
  });

  // Mantener una referencia actualizada del config para usar dentro de callbacks de GSAP
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Actualizar variables y atributos principales basados en la configuración
  useEffect(() => {
    if (toggleRef.current) {
      toggleRef.current.style.setProperty('--complete', config.complete);
      toggleRef.current.style.setProperty('--hue', config.hue);
    }
  }, [config.complete, config.hue]);

  // Sincronizar con props externas
  useEffect(() => {
    if (checked !== undefined) {
      const newComplete = checked ? 100 : 0;
      if (config.complete !== newComplete) {
        setConfig(prev => ({ ...prev, complete: newComplete }));
        if (toggleRef.current) {
          toggleRef.current.style.setProperty('--complete', newComplete);
          toggleRef.current.setAttribute('aria-pressed', checked ? "true" : "false");
        }
      }
    }
  }, [checked]);

  // Carga dinámica de GSAP y Draggable para evitar problemas en el entorno de previsualización
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initGSAP = async () => {
      // Usar GSAP global si ya está disponible (del proyecto anterior o CDN)
      if (window.gsap && window.Draggable) {
        setGsapLoaded(true);
        return;
      }
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Draggable.min.js');
        window.gsap.registerPlugin(window.Draggable);
        setGsapLoaded(true);
      } catch (err) {
        console.error("No se pudo cargar GSAP", err);
      }
    };
    initGSAP();
  }, []);

  // Configuración del objeto Draggable y lógica de animación
  useEffect(() => {
    if (!gsapLoaded || !toggleRef.current) return;

    const gsap = window.gsap;
    const Draggable = window.Draggable;
    const toggle = toggleRef.current;

    // Lógica para animar el rebote del botón
    const toggleState = async () => {
      toggle.dataset.pressed = "true";
      if (configRef.current.bubble) toggle.dataset.active = "true";

      await Promise.allSettled(
        !configRef.current.bounce
          ? toggle.getAnimations({ subtree: true }).map((a) => a.finished)
          : []
      );

      const isPressed = toggle.getAttribute('aria-pressed') === 'true';
      gsap.timeline({
        onComplete: () => {
          gsap.delayedCall(0.05, () => {
            toggle.dataset.active = "false";
            toggle.dataset.pressed = "false";
            toggle.setAttribute('aria-pressed', !isPressed ? "true" : "false");

            // Sincronizamos el estado local (para el input range del panel)
            const newValue = !isPressed;
            setConfig(prev => ({ ...prev, complete: newValue ? 100 : 0 }));
            if (onChange) onChange(newValue);
          });
        },
      }).to(toggle, {
        '--complete': isPressed ? 0 : 100,
        duration: 0.12,
        delay: configRef.current.bounce && configRef.current.bubble ? 0.18 : 0,
      });
    };

    const proxy = document.createElement('div');

    const draggableInstance = Draggable.create(proxy, {
      type: "x",
      allowContextMenu: true,
      handle: toggleRef.current,
      onDragStart: function () {
        const toggleBounds = toggle.getBoundingClientRect();
        const isPressed = toggle.getAttribute('aria-pressed') === 'true';
        const bounds = isPressed
          ? toggleBounds.left - this.pointerX
          : toggleBounds.left + toggleBounds.width - this.pointerX;
        this.dragBounds = bounds;
        toggle.dataset.active = "true";
      },
      onDrag: function () {
        const isPressed = toggle.getAttribute('aria-pressed') === 'true';
        const dragged = this.x - this.startX;
        const complete = gsap.utils.clamp(
          0,
          100,
          isPressed
            ? gsap.utils.mapRange(this.dragBounds, 0, 0, 100, dragged)
            : gsap.utils.mapRange(0, this.dragBounds, 0, 100, dragged)
        );
        this.complete = complete;
        gsap.set(toggle, {
          '--complete': complete,
          '--delta': Math.min(Math.abs(this.deltaX), 12)
        });
        setConfig(prev => ({ ...prev, complete: Math.round(complete) })); // Sincroniza interfaz
      },
      onDragEnd: function () {
        gsap.fromTo(
          toggle,
          { '--complete': this.complete },
          {
            '--complete': this.complete >= 50 ? 100 : 0,
            duration: 0.15,
            onComplete: () => {
              gsap.delayedCall(0.05, () => {
                toggle.dataset.active = "false";
                const isFinalPressed = this.complete >= 50;
                toggle.setAttribute('aria-pressed', isFinalPressed ? "true" : "false");
                setConfig(prev => ({ ...prev, complete: isFinalPressed ? 100 : 0 }));
                if (onChange) onChange(isFinalPressed);
              });
            },
          }
        );
      },
      onPress: function () {
        this.__pressTime = Date.now();
        const arrow = document.querySelector('.arrow--main');
        if (arrow) arrow.style.setProperty('opacity', 0);

        if ('ontouchstart' in window && navigator.maxTouchPoints > 0)
          toggle.dataset.active = "true";
      },
      onRelease: function () {
        this.__releaseTime = Date.now();
        gsap.set(toggle, { '--delta': 0 });
        if (
          'ontouchstart' in window &&
          navigator.maxTouchPoints > 0 &&
          ((this.startX !== undefined &&
            this.endX !== undefined &&
            Math.abs(this.endX - this.startX) < 4) ||
            this.endX === undefined)
        ) {
          toggle.dataset.active = "false";
        }
        if (this.__releaseTime - this.__pressTime <= 150) {
          toggleState();
        }
      },
    });

    const handleKeyDown = (e) => {
      const arrow = document.querySelector('.arrow--main');
      if (arrow) arrow.style.setProperty('opacity', 0);
      if (e.key === 'Enter') {
        toggleState();
      }
      if (e.key === ' ') {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === ' ') {
        toggleState();
      }
    };

    toggle.addEventListener('keydown', handleKeyDown);
    toggle.addEventListener('keyup', handleKeyUp);

    return () => {
      draggableInstance[0].kill();
      toggle.removeEventListener('keydown', handleKeyDown);
      toggle.removeEventListener('keyup', handleKeyUp);
    };
  }, [gsapLoaded]);

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <style>{rawCSS}</style>

      <div
        ref={containerRef}
        className={`app-container relative z-10 flex items-center justify-center bg-transparent pointer-events-auto transform origin-center ${className || 'w-full h-full p-8'}`}
        style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}
        data-theme={config.theme}
        data-mapped={config.mapped}
        data-delta={config.delta}
        data-debug={config.debug}
        data-active={config.active}
        data-bounce={config.bounce}
      >
        <main className="z-10 scale-110">
          <div className="arrow arrow--main">
            <span>toca y arrastra.</span>
            <svg viewBox="0 0 77 139" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M63.9153 0.37541C62.6706 1.85361 63.1403 31.3942 64.7373 54.4353C65.5593 65.9325 67.0389 77.8285 68.8708 87.6362C71.0784 99.4618 71.3837 102.113 70.7496 103.99C70.1155 105.914 68.6594 106.384 61.9191 106.876C51.2566 107.674 49.3543 108.003 32.6561 112.038C25.9157 113.681 18.8936 115.112 18.7057 114.924C18.6352 114.877 19.1754 113.939 19.8799 112.859C21.3126 110.63 21.5944 109.692 21.1951 108.401C20.6784 106.642 18.5882 105.656 16.8973 106.36C16.451 106.548 14.807 107.604 13.257 108.683C10.5797 110.56 9.0531 111.405 4.54388 113.47C-0.435059 115.745 -1.37449 119.734 1.98395 124.404C3.48702 126.515 4.9901 127.829 8.65384 130.246C12.8578 132.991 16.2397 134.61 20.561 135.971C22.4868 136.581 24.9293 137.426 25.9627 137.872C27.137 138.364 27.9355 138.575 28.0764 138.435C28.9219 137.59 24.718 133.249 18.3534 128.51C15.8404 126.633 13.4684 124.826 13.0691 124.521L12.3646 123.934L13.304 123.77C19.8565 122.667 28.1468 120.861 35.8736 118.819C45.1269 116.379 51.2566 115.018 55.8128 114.385C64.2441 113.211 68.0018 112.578 69.4579 112.132C72.558 111.17 74.977 108.824 75.8929 105.867C76.8559 102.77 76.5505 99.1568 74.2959 87.2842C71.5951 73.0888 70.1155 61.1928 68.5185 41.1785C67.5086 28.5551 66.3813 11.6614 66.1465 5.04465C65.9821 0.750832 65.7707 0 64.7608 0C64.4555 0 64.0797 0.164239 63.9153 0.37541Z" fill="currentColor" />
            </svg>
          </div>

          <button ref={toggleRef} aria-label="toggle" aria-pressed="false" className="liquid-toggle">
            <div className="debug debug--knockout">
              <div className="arrow">
                <span>fondo extraído.</span>
              </div>
              <div className="knockout knockout--debug">
                <div className="indicator indicator--masked">
                  <div className="mask"></div>
                </div>
              </div>
            </div>
            <div className="knockout">
              <div className="indicator indicator--masked">
                <div className="mask"></div>
              </div>
            </div>
            <div className="debug debug--indicator">
              <div className="arrow">
                <span>ventana goo.</span>
              </div>
              <div className="indicator__liquid indicator__liquid--debug">
                <div className="shadow"></div>
                <div className="wrapper">
                  <div className="liquids">
                    <div className="liquid__shadow"></div>
                    <div className="liquid__track"></div>
                  </div>
                </div>
                <div className="cover"></div>
              </div>
            </div>
            <div className="indicator__liquid">
              <div className="shadow"></div>
              <div className="wrapper">
                <div className="liquids">
                  <div className="liquid__shadow"></div>
                  <div className="liquid__track"></div>
                </div>
              </div>
              <div className="cover"></div>
            </div>
          </button>
        </main>

        <svg className="sr-only" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="goo">
              <feGaussianBlur
                id="SvgjsFeGaussianBlur1000"
                result="SvgjsFeGaussianBlur1000"
                in="SourceGraphic"
                stdDeviation={config.deviation}
              ></feGaussianBlur>
              <feColorMatrix
                id="SvgjsFeColorMatrix1001"
                result="SvgjsFeColorMatrix1001"
                in="SvgjsFeGaussianBlur1000"
                values={`
                    1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 ${config.alpha} -10
                `}
                type="matrix"
              ></feColorMatrix>
              <feComposite
                id="SvgjsFeComposite1002"
                result="SvgjsFeComposite1002"
                in="SvgjsFeColorMatrix1001"
                operator="atop"
              ></feComposite>
            </filter>
            <filter id="knockout" colorInterpolationFilters="sRGB">
              <feColorMatrix
                result="knocked"
                type="matrix"
                values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        -1 -1 -1 1 0"
              />
              <feComponentTransfer>
                <feFuncR type="linear" slope="3" intercept="-1" />
                <feFuncG type="linear" slope="3" intercept="-1" />
                <feFuncB type="linear" slope="3" intercept="-1" />
              </feComponentTransfer>
              <feComponentTransfer>
                <feFuncR type="table" tableValues="0 0 0 0 0 1 1 1 1 1" />
                <feFuncG type="table" tableValues="0 0 0 0 0 1 1 1 1 1" />
                <feFuncB type="table" tableValues="0 0 0 0 0 1 1 1 1 1" />
              </feComponentTransfer>
            </filter>
            <filter id="remove-black" colorInterpolationFilters="sRGB">
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          -255 -255 -255 0 1"
                result="black-pixels"
              />
              <feMorphology
                in="black-pixels"
                operator="dilate"
                radius="0.5"
                result="smoothed"
              />
              <feComposite in="SourceGraphic" in2="smoothed" operator="out" />
            </filter>
          </defs>
        </svg>

        {/* Botón flotante para abrir configuración */}
        {!showConfig && !hideConfigButton && (
          <button
            onClick={() => setShowConfig(true)}
            className="absolute top-4 right-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 rounded-full shadow-lg z-50 text-zinc-800 dark:text-zinc-200 hover:scale-105 transition-transform"
            aria-label="Abrir configuración"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        )}

        {/* Panel de Control Reactivo (Reemplazo de Tweakpane) */}
        {showConfig && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl shadow-xl z-50 w-64 max-w-[80vw] max-h-[90vh] overflow-y-auto text-xs text-zinc-800 dark:text-zinc-200 font-sans">
            <div className="flex justify-between items-center mb-3 border-b border-zinc-200 dark:border-zinc-700 pb-2">
              <h3 className="font-bold">Configuración</h3>
              <button
                onClick={() => setShowConfig(false)}
                className="text-zinc-400 hover:text-zinc-800 dark:hover:text-white px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-lg leading-none"
                aria-label="Cerrar configuración"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label>Debug</label>
                <input type="checkbox" checked={config.debug} onChange={(e) => updateConfig('debug', e.target.checked)} className="accent-blue-500" />
              </div>

              <div className="flex flex-col">
                <label className="flex justify-between mb-1">Progress <span>{config.complete}%</span></label>
                <input type="range" min="0" max="100" value={config.complete} onChange={(e) => updateConfig('complete', Number(e.target.value))} className="w-full accent-blue-500" />
              </div>

              <div className="flex flex-col">
                <label className="flex justify-between mb-1">Hue <span>{config.hue}</span></label>
                <input type="range" min="0" max="359" value={config.hue} onChange={(e) => updateConfig('hue', Number(e.target.value))} className="w-full accent-blue-500" />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label>Bounce</label>
                <input type="checkbox" checked={config.bounce} onChange={(e) => updateConfig('bounce', e.target.checked)} className="accent-blue-500" />
              </div>

              <div className="flex justify-between items-center">
                <label>Bubble</label>
                <input type="checkbox" checked={config.bubble} onChange={(e) => updateConfig('bubble', e.target.checked)} className="accent-blue-500" />
              </div>

              <div className="flex flex-col pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="flex justify-between mb-1">Deviation <span>{config.deviation}</span></label>
                <input type="range" min="0" max="50" value={config.deviation} onChange={(e) => updateConfig('deviation', Number(e.target.value))} className="w-full accent-blue-500" />
              </div>

              <div className="flex flex-col">
                <label className="flex justify-between mb-1">Alpha <span>{config.alpha}</span></label>
                <input type="range" min="0" max="50" value={config.alpha} onChange={(e) => updateConfig('alpha', Number(e.target.value))} className="w-full accent-blue-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
