import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import MapLibreGL from "maplibre-gl";
import { createPortal } from "react-dom";
import { X, Minus, Plus, Locate, Maximize, Loader2, Navigation } from "lucide-react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/utils/cn";
import CircleButton from "@/buttons/CircleButton";

// --- Tooltip Components ---

function TooltipProvider({
    delayDuration = 0,
    ...props
}) {
    return (
        <TooltipPrimitive.Provider
            data-slot="tooltip-provider"
            delayDuration={delayDuration}
            {...props}
        />
    );
}

function Tooltip({
    ...props
}) {
    return (
        <TooltipProvider>
            <TooltipPrimitive.Root data-slot="tooltip" {...props} />
        </TooltipProvider>
    );
}

function TooltipTrigger({
    ...props
}) {
    return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
    className,
    sideOffset = 0,
    children,
    ...props
}) {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                data-slot="tooltip-content"
                sideOffset={sideOffset}
                className={cn(
                    "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
                    className
                )}
                {...props}
            >
                {children}
                <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    );
}

// --- Map Components ---

// Check document class for theme (works with next-themes, etc.)
function getDocumentTheme() {
    if (typeof document === "undefined") return null;
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.documentElement.classList.contains("light")) return "light";
    return null;
}

// Get system preference
function getSystemTheme() {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function useResolvedTheme(themeProp) {
    const [detectedTheme, setDetectedTheme] = useState(
        () => getDocumentTheme() ?? getSystemTheme()
    );

    useEffect(() => {
        if (themeProp) return; // Skip detection if theme is provided via prop

        // Watch for document class changes (e.g., next-themes toggling dark class)
        const observer = new MutationObserver(() => {
            const docTheme = getDocumentTheme();
            if (docTheme) {
                setDetectedTheme(docTheme);
            }
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        // Also watch for system preference changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemChange = (e) => {
            // Only use system preference if no document class is set
            if (!getDocumentTheme()) {
                setDetectedTheme(e.matches ? "dark" : "light");
            }
        };
        mediaQuery.addEventListener("change", handleSystemChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener("change", handleSystemChange);
        };
    }, [themeProp]);

    return themeProp ?? detectedTheme;
}

const MapContext = createContext(null);

function useMap() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMap must be used within a Map component");
    }
    return context;
}

const defaultStyles = {
    dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

const satelliteStyle = {
    version: 8,
    sources: {
        'satellite-tiles': {
            type: 'raster',
            tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '&copy; Esri, Maxar, Earthstar Geographics'
        }
    },
    layers: [
        {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            minzoom: 0,
            maxzoom: 22
        }
    ]
};

const hybridStyle = {
    version: 8,
    sources: {
        'satellite-tiles': {
            type: 'raster',
            tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '&copy; Esri, Maxar, Earthstar Geographics'
        },
        'labels-tiles': {
            type: 'raster',
            tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256
        }
    },
    layers: [
        {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
        },
        {
            id: 'labels-layer',
            type: 'raster',
            source: 'labels-tiles',
        }
    ]
};

const DefaultLoader = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex gap-1">
            <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
            <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:150ms]" />
            <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:300ms]" />
        </div>
    </div>
);

const Map = forwardRef(function Map(
    { children, theme: themeProp, styles, projection, mapTheme = 'standard', starrySky = false, ...props },
    ref
) {
    const containerRef = useRef(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isStyleLoaded, setIsStyleLoaded] = useState(false);
    const currentStyleRef = useRef(null);
    const styleTimeoutRef = useRef(null);
    const resolvedTheme = useResolvedTheme(themeProp);

    const mapStyles = useMemo(
        () => ({
            dark: styles?.dark ?? defaultStyles.dark,
            light: styles?.light ?? defaultStyles.light,
        }),
        [styles]
    );

    useImperativeHandle(ref, () => mapInstance, [mapInstance]);

    const clearStyleTimeout = useCallback(() => {
        if (styleTimeoutRef.current) {
            clearTimeout(styleTimeoutRef.current);
            styleTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        let initialStyle;
        if (mapTheme === 'satellite') {
            initialStyle = satelliteStyle;
        } else if (mapTheme === 'hybrid') {
            initialStyle = hybridStyle;
        } else {
            initialStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
        }

        currentStyleRef.current = initialStyle;

        const map = new MapLibreGL.Map({
            container: containerRef.current,
            style: initialStyle,
            renderWorldCopies: false,
            attributionControl: {
                compact: true,
            },
            center: [0, 0],
            zoom: 1,
            projection: projection || 'mercator',
            ...props,
        });


        const styleDataHandler = () => {
            clearStyleTimeout();
            // Delay to ensure style is fully processed before allowing layer operations
            // This is a workaround to avoid race conditions with the style loading
            // else we have to force update every layer on setStyle change
            styleTimeoutRef.current = setTimeout(() => {
                setIsStyleLoaded(true);
                if (projection) {
                    map.setProjection(projection);
                }
            }, 100);
        };
        const loadHandler = () => setIsLoaded(true);

        map.on("load", loadHandler);
        map.on("styledata", styleDataHandler);
        setMapInstance(map);

        return () => {
            clearStyleTimeout();
            map.off("load", loadHandler);
            map.off("styledata", styleDataHandler);
            map.remove();
            setIsLoaded(false);
            setIsStyleLoaded(false);
            setMapInstance(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [isOverZoomLimit, setIsOverZoomLimit] = useState(false);

    useEffect(() => {
        if (!mapInstance) return;

        const checkZoom = () => {
            const z = mapInstance.getZoom();
            // Esri usually stops around 18-19. 17.5 is a safe buffer to switch before it gets ugly.
            // Adjusting to 16 based on user feedback to prevent gray tiles.
            setIsOverZoomLimit(z > 16);
        };

        mapInstance.on('zoom', checkZoom);

        return () => {
            mapInstance.off('zoom', checkZoom);
        };
    }, [mapInstance]);

    useEffect(() => {
        if (!mapInstance) return;

        let newStyle;
        const useStandard = !mapTheme || mapTheme === 'standard' || (isOverZoomLimit && (mapTheme === 'satellite' || mapTheme === 'hybrid'));

        if (!useStandard) {
            if (mapTheme === 'satellite') newStyle = satelliteStyle;
            else if (mapTheme === 'hybrid') newStyle = hybridStyle;
        } else {
            newStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
        }

        if (currentStyleRef.current === newStyle) return;

        // Prevent style reload if we are just toggling between satellite and standard due to zoom 
        // implies we need to handle the transition smoothly. 
        // Current implementation replaces style. 

        const loadNewStyle = () => {
            if (mapInstance.isStyleLoaded()) {
                mapInstance.setStyle(newStyle, { diff: true });
            } else {
                // waits
            }
        };

        currentStyleRef.current = newStyle;

        // Debounce style changes slightly to prevent flickering at the boundary if zoom jitters? 
        // React batching should handle it, but map.setStyle is expensive.
        // Direct call:

        mapInstance.setStyle(newStyle, { diff: true });

    }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout, mapTheme, isOverZoomLimit]);

    const contextValue = useMemo(
        () => ({
            map: mapInstance,
            isLoaded: isLoaded && isStyleLoaded,
        }),
        [mapInstance, isLoaded, isStyleLoaded]
    );

    return (
        <MapContext.Provider value={contextValue}>
            <div ref={containerRef} className="relative w-full h-full">
                {!isLoaded && <DefaultLoader />}
                {/* SSR-safe: children render only when map is loaded on client */}
                {mapInstance && children}
            </div>
        </MapContext.Provider>
    );
});

const MarkerContext = createContext(null);

function useMarkerContext() {
    const context = useContext(MarkerContext);
    if (!context) {
        throw new Error("Marker components must be used within MapMarker");
    }
    return context;
}

function MapMarker({
    longitude,
    latitude,
    children,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
    draggable = false,
    ...markerOptions
}) {
    const { map } = useMap();

    const marker = useMemo(() => {
        const markerInstance = new MapLibreGL.Marker({
            ...markerOptions,
            element: document.createElement("div"),
            draggable,
        }).setLngLat([longitude, latitude]);

        const handleClick = (e) => onClick?.(e);
        const handleMouseEnter = (e) => onMouseEnter?.(e);
        const handleMouseLeave = (e) => onMouseLeave?.(e);

        markerInstance.getElement()?.addEventListener("click", handleClick);
        markerInstance
            .getElement()
            ?.addEventListener("mouseenter", handleMouseEnter);
        markerInstance
            .getElement()
            ?.addEventListener("mouseleave", handleMouseLeave);

        const handleDragStart = () => {
            const lngLat = markerInstance.getLngLat();
            onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat });
        };
        const handleDrag = () => {
            const lngLat = markerInstance.getLngLat();
            onDrag?.({ lng: lngLat.lng, lat: lngLat.lat });
        };
        const handleDragEnd = () => {
            const lngLat = markerInstance.getLngLat();
            onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat });
        };

        markerInstance.on("dragstart", handleDragStart);
        markerInstance.on("drag", handleDrag);
        markerInstance.on("dragend", handleDragEnd);

        return markerInstance;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!map) return;

        marker.addTo(map);

        return () => {
            marker.remove();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    if (
        marker.getLngLat().lng !== longitude ||
        marker.getLngLat().lat !== latitude
    ) {
        marker.setLngLat([longitude, latitude]);
    }
    if (marker.isDraggable() !== draggable) {
        marker.setDraggable(draggable);
    }

    const currentOffset = marker.getOffset();
    const newOffset = markerOptions.offset ?? [0, 0];
    const [newOffsetX, newOffsetY] = Array.isArray(newOffset)
        ? newOffset
        : [newOffset.x, newOffset.y];
    if (currentOffset.x !== newOffsetX || currentOffset.y !== newOffsetY) {
        marker.setOffset(newOffset);
    }

    if (marker.getRotation() !== markerOptions.rotation) {
        marker.setRotation(markerOptions.rotation ?? 0);
    }
    if (marker.getRotationAlignment() !== markerOptions.rotationAlignment) {
        marker.setRotationAlignment(markerOptions.rotationAlignment ?? "auto");
    }
    if (marker.getPitchAlignment() !== markerOptions.pitchAlignment) {
        marker.setPitchAlignment(markerOptions.pitchAlignment ?? "auto");
    }

    return (
        <MarkerContext.Provider value={{ marker, map }}>
            {children}
        </MarkerContext.Provider>
    );
}

function MarkerContent({ children, className }) {
    const { marker } = useMarkerContext();

    return createPortal(
        <div className={cn("relative cursor-pointer", className)}>
            {children || <DefaultMarkerIcon />}
        </div>,
        marker.getElement()
    );
}

function DefaultMarkerIcon() {
    return (
        <div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
    );
}

function MarkerPopup({
    children,
    className,
    closeButton = false,
    ...popupOptions
}) {
    const { marker, map } = useMarkerContext();
    const container = useMemo(() => document.createElement("div"), []);
    const prevPopupOptions = useRef(popupOptions);

    const popup = useMemo(() => {
        const popupInstance = new MapLibreGL.Popup({
            offset: 16,
            ...popupOptions,
            closeButton: false,
        })
            .setMaxWidth("none")
            .setDOMContent(container);

        return popupInstance;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!map) return;

        popup.setDOMContent(container);
        marker.setPopup(popup);

        return () => {
            marker.setPopup(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    if (popup.isOpen()) {
        const prev = prevPopupOptions.current;

        if (prev.offset !== popupOptions.offset) {
            popup.setOffset(popupOptions.offset ?? 16);
        }
        if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
            popup.setMaxWidth(popupOptions.maxWidth ?? "none");
        }

        prevPopupOptions.current = popupOptions;
    }

    const handleClose = () => popup.remove();

    return createPortal(
        <div
            className={cn(
                "relative rounded-md border bg-popover p-3 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
                className
            )}
        >
            {closeButton && (
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-1 right-1 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label="Close popup"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            )}
            {children}
        </div>,
        container
    );
}

function MarkerTooltip({
    children,
    className,
    ...popupOptions
}) {
    const { marker, map } = useMarkerContext();
    const container = useMemo(() => document.createElement("div"), []);
    const prevTooltipOptions = useRef(popupOptions);

    const tooltip = useMemo(() => {
        const tooltipInstance = new MapLibreGL.Popup({
            offset: 16,
            ...popupOptions,
            closeOnClick: true,
            closeButton: false,
        }).setMaxWidth("none");

        return tooltipInstance;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!map) return;

        tooltip.setDOMContent(container);

        const handleMouseEnter = () => {
            tooltip.setLngLat(marker.getLngLat()).addTo(map);
        };
        const handleMouseLeave = () => tooltip.remove();

        marker.getElement()?.addEventListener("mouseenter", handleMouseEnter);
        marker.getElement()?.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            marker.getElement()?.removeEventListener("mouseenter", handleMouseEnter);
            marker.getElement()?.removeEventListener("mouseleave", handleMouseLeave);
            tooltip.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    if (tooltip.isOpen()) {
        const prev = prevTooltipOptions.current;

        if (prev.offset !== popupOptions.offset) {
            tooltip.setOffset(popupOptions.offset ?? 16);
        }
        if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
            tooltip.setMaxWidth(popupOptions.maxWidth ?? "none");
        }

        prevTooltipOptions.current = popupOptions;
    }

    return createPortal(
        <div
            className={cn(
                "rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95",
                className
            )}
        >
            {children}
        </div>,
        container
    );
}

function MarkerLabel({
    children,
    className,
    position = "top",
}) {
    const positionClasses = {
        top: "bottom-full mb-1",
        bottom: "top-full mt-1",
    };

    return (
        <div
            className={cn(
                "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
                "text-[10px] font-medium text-foreground",
                positionClasses[position],
                className
            )}
        >
            {children}
        </div>
    );
}

const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-5 right-4",
};

function ControlGroup({ children }) {
    return (
        <div className="flex flex-col gap-3 items-center">
            {children}
        </div>
    );
}

function ControlButton({
    onClick,
    label,
    children,
    disabled = false,
    className,
}) {
    return (
        <CircleButton
            onClick={onClick}
            disabled={disabled}
            className={className}
            style={{ width: '2.5rem', height: '2.5rem' }}
        >
            {children}
        </CircleButton>
    );
}

function MapControls({
    position = "bottom-right",
    showZoom = false,
    showCompass = false,
    showLocate = false,
    showFullscreen = false,
    className,
    onLocate,
    children,
    chatState = 'closed',
}) {
    const { map } = useMap();
    const [waitingForLocation, setWaitingForLocation] = useState(false);

    const handleZoomIn = useCallback(() => {
        map?.zoomTo(map.getZoom() + 1, { duration: 300 });
    }, [map]);

    const handleZoomOut = useCallback(() => {
        map?.zoomTo(map.getZoom() - 1, { duration: 300 });
    }, [map]);

    const handleResetBearing = useCallback(() => {
        map?.easeTo({ bearing: 0, pitch: 0, duration: 300 });
    }, [map]);

    const handleLocate = useCallback(() => {
        setWaitingForLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = {
                        longitude: pos.coords.longitude,
                        latitude: pos.coords.latitude,
                    };
                    map?.flyTo({
                        center: [coords.longitude, coords.latitude],
                        zoom: 14,
                        duration: 1500,
                    });
                    onLocate?.(coords);
                    setWaitingForLocation(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setWaitingForLocation(false);
                    let errorMessage = "Could not get your location.";
                    switch (error.code) {
                        case 1:
                            errorMessage = "Location permission denied. Please enable location services.";
                            break;
                        case 2:
                            errorMessage = "Location unavailable. Ensure GPS is on.";
                            break;
                        case 3:
                            errorMessage = "Location request timed out.";
                            break;
                        default:
                            errorMessage = `Error: ${error.message}`;
                    }
                    // Check for insecure origin (HTTP)
                    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                        errorMessage += "\n\nNote: Geolocation requires HTTPS on mobile devices/remote networks.";
                    }
                    alert(errorMessage);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setWaitingForLocation(false);
            alert("Geolocation is not supported by your browser.");
        }
    }, [map, onLocate]);

    const handleFullscreen = useCallback(() => {
        const container = map?.getContainer();
        if (!container) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen();
        }
    }, [map]);

    // Determinar clases de posición dinámicas basadas en el estado del chat
    let dynamicPositionClass = positionClasses[position];

    // Solo aplicar lógica de chat si los controles están en bottom-right (donde está el chat)
    // Y solo si estamos en móvil (window.innerWidth < 768)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (position === "bottom-right" && isMobile) {
        if (chatState === 'half') {
            dynamicPositionClass = "bottom-[48vh] right-6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-[1100]";
        } else if (chatState === 'full') {
            // Se queda en la misma posición visual que 'half' pero se oculta detrás del chat (z-1000)
            dynamicPositionClass = "bottom-[48vh] right-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-[900] opacity-0 pointer-events-none";
        } else {
            dynamicPositionClass = "bottom-5 right-6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-[1100]";
        }
    } else if (position === "bottom-right") {
        // En desktop, siempre se queda abajo
        dynamicPositionClass = "bottom-5 right-6 z-[1100]";
    }

    return (
        <div
            className={cn(
                "absolute flex flex-col gap-2",
                dynamicPositionClass,
                className
            )}
        >
            {showZoom && (
                <ControlGroup>
                    <ControlButton onClick={handleZoomIn} label="Zoom in">
                        <Plus className="size-4" />
                    </ControlButton>
                    <ControlButton onClick={handleZoomOut} label="Zoom out">
                        <Minus className="size-4" />
                    </ControlButton>
                </ControlGroup>
            )}
            {showCompass && (
                <ControlGroup>
                    <CompassButton onClick={handleResetBearing} />
                </ControlGroup>
            )}
            {showLocate && (
                <ControlGroup>
                    <ControlButton
                        onClick={handleLocate}
                        label="Find my location"
                        disabled={waitingForLocation}
                    >
                        {waitingForLocation ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Locate className="size-4" />
                        )}
                    </ControlButton>
                </ControlGroup>
            )}
            {showFullscreen && (
                <ControlGroup>
                    <ControlButton onClick={handleFullscreen} label="Toggle fullscreen">
                        <Maximize className="size-4" />
                    </ControlButton>
                </ControlGroup>
            )}
            {children}
        </div>
    );
}

function CompassButton({ onClick }) {
    const { map } = useMap();
    const compassRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        const updateRotation = () => {
            if (!compassRef.current) return;
            const bearing = map.getBearing();
            const pitch = map.getPitch();
            compassRef.current.style.transform = `rotate(${-bearing}deg) rotateX(${pitch}deg)`;
        };

        map.on("rotate", updateRotation);
        map.on("pitch", updateRotation);
        map.on("move", updateRotation); // Ensure updates on any move
        updateRotation(); // Initial update

        return () => {
            map.off("rotate", updateRotation);
            map.off("pitch", updateRotation);
            map.off("move", updateRotation);
        };
    }, [map]);

    return (
        <CircleButton
            onClick={onClick}
            style={{ width: '2.5rem', height: '2.5rem' }}
        >
            <div
                ref={compassRef}
                className="transition-transform duration-100 ease-out flex items-center justify-center w-full h-full"
                style={{ transformOrigin: "center" }}
            >
                <Navigation className="size-4 fill-red-500 text-red-500/80" />
            </div>
        </CircleButton>
    );
}

export {
    Map,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MarkerTooltip,
    MarkerLabel,
    MapControls,
    ControlGroup,
    ControlButton,
    useMap,
    useMarkerContext,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
};
