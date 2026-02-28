import React, { useState, useRef } from 'react';

export const TouchableGlassContainer = ({ children, className = '', onClick, style }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const isTouchRef = useRef(false);

    const handleTouchStart = () => {
        isTouchRef.current = true;
        setIsPressed(true);
        setIsHovered(false);
    };
    const handleTouchEnd = () => setIsPressed(false);

    const handleMouseEnter = () => { if (!isTouchRef.current) setIsHovered(true); };
    const handleMouseLeave = () => {
        setIsHovered(false);
        setIsPressed(false);
        isTouchRef.current = false;
    };
    const handleMouseDown = () => { if (!isTouchRef.current) setIsPressed(true); };
    const handleMouseUp = () => { if (!isTouchRef.current) setIsPressed(false); };

    const scaleClass = isPressed ? "scale-[0.95]" : (isHovered ? "scale-[1.02]" : "scale-100");

    return (
        <div
            className={`relative transition-transform duration-300 ease-out cursor-pointer ${scaleClass} ${className}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={onClick}
            style={style}
        >
            {typeof children === 'function' ? children({ isPressed, isHovered }) : children}
        </div>
    );
};
