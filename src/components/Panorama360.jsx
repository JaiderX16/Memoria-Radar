import React, { useEffect, useRef, useState, useCallback } from 'react';
import '@photo-sphere-viewer/core/index.css';

// ==================== CONFIGURACIÓN ====================
const DEFAULT_OPTIONS = {
  navbar: ['zoom', 'fullscreen', 'autorotate'],
  mousemove: true,
  mousewheelCtrlKey: false,
  touchmoveTwoFingers: false,
  keyboard: 'fullscreen',
  canvasBackground: '#000000',
  plugins: []
};

// ==================== HOOK OPTIMIZADO ====================
const usePanoramaViewer = (panoramaUrl, containerRef, options = {}) => {
  const viewerRef = useRef(null);
  const [state, setState] = useState({
    loading: true,
    error: null,
    progress: 0
  });

  const destroyViewer = useCallback(() => {
    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }
  }, []);

  const initViewer = useCallback(async () => {
    if (!containerRef.current || !panoramaUrl) {
      setState({ loading: false, error: 'Configuración incompleta', progress: 0 });
      return;
    }

    try {
      destroyViewer();
      setState({ loading: true, error: null, progress: 0 });

      // WebGL check optimizado
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        throw new Error('WebGL no compatible');
      }

      const { Viewer } = await import('@photo-sphere-viewer/core');
      const { AutorotatePlugin } = await import('@photo-sphere-viewer/autorotate-plugin');
      
      const mergedPlugins = [
        [AutorotatePlugin, {
          pitch: '0deg',
          speed: '1rpm',
          delay: 1000
        }]
      ];
      
      const viewer = new Viewer({
        container: containerRef.current,
        panorama: panoramaUrl,
        ...DEFAULT_OPTIONS,
        ...options,
        plugins: [...mergedPlugins, ...(options.plugins || [])]
      });

      viewerRef.current = viewer;

      viewer.addEventListener('ready', () => {
        setState(prev => ({ ...prev, loading: false, error: null }));
        
        // Iniciar autorotación cuando el panorama esté listo
        const autorotatePlugin = viewer.getPlugin(AutorotatePlugin);
        if (autorotatePlugin) {
          autorotatePlugin.start();
        }
      });

      viewer.addEventListener('panorama-load-progress', (e) => {
        setState(prev => ({ ...prev, progress: Math.round(e.detail * 100) }));
      });

      viewer.addEventListener('error', () => {
        setState({ loading: false, error: 'Error al cargar panorama', progress: 0 });
      });

    } catch (err) {
      console.error('Error al inicializar el visor:', err);
      setState({ loading: false, error: 'Navegador no compatible', progress: 0 });
    }
  }, [panoramaUrl, options, containerRef, destroyViewer]);

  useEffect(() => {
    const timer = setTimeout(initViewer, 100);
    return () => {
      clearTimeout(timer);
      destroyViewer();
    };
  }, [initViewer, destroyViewer]);

  return { ...state, reinitialize: initViewer };
};

// ==================== COMPONENTES UI OPTIMIZADOS ====================
const LoadingIndicator = React.memo(({ progress }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-10">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto" />
      <p className="font-medium mb-2">Cargando experiencia virtual...</p>
      <div className="w-48 bg-gray-700 rounded-full h-2 mx-auto mb-2">
        <div 
          className="bg-white h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm opacity-75">{progress}%</p>
    </div>
  </div>
));

const ErrorDisplay = React.memo(({ error, onRetry }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white text-center p-8 rounded-2xl">
    <div>
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="font-bold text-lg mb-2">Experiencia no disponible</h3>
      <p className="text-sm opacity-75 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  </div>
));

// ==================== COMPONENTE PRINCIPAL OPTIMIZADO ====================
const Panorama360 = ({
  panoramaUrl,
  className = "",
  viewerOptions = {},
  onReady,
  onError,
  showRetryButton = true,
  ...props
}) => {
  const containerRef = useRef(null);
  const { loading, error, progress, reinitialize } = usePanoramaViewer(
    panoramaUrl, 
    containerRef, 
    viewerOptions
  );

  // Callbacks optimizados con useEffect
  useEffect(() => {
    if (!loading && !error && onReady) {
      onReady();
    }
  }, [loading, error, onReady]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Early return para URL faltante
  if (!panoramaUrl) {
    return (
      <div className={`relative bg-black rounded-2xl overflow-hidden shadow-xl ${className}`}>
        <ErrorDisplay error="URL de panorama requerida" />
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-black rounded-2xl overflow-hidden shadow-xl ${className}`}
      {...props}
    >
      {loading && <LoadingIndicator progress={progress} />}
      {error && (
        <ErrorDisplay 
          error={error}
          onRetry={showRetryButton ? reinitialize : null}
        />
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '100%' }}
        role="img"
        aria-label="Experiencia virtual panorámica 360°"
        aria-live="polite"
        aria-busy={loading}
      />
    </div>
  );
};

export default React.memo(Panorama360);