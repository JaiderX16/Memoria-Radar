import React, { useId } from 'react';
import { displacementMap } from './displacementMap';

const CircleButton = ({ 
  children, 
  onClick, 
  style, 
  className,
  ...props 
}) => {
  const id = useId().replace(/:/g, '');
  const filterId = `frosted-${id}`;
  const btnId = `btn-${id}`;
  
  return (
    <>
      <button
        id={btnId}
        onClick={onClick}
        className={className}
        style={{
          position: 'relative',
          width: '8rem',
          height: '8rem',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, .08)',
          border: '2px solid transparent',
          boxShadow: '0 16px 32px rgba(0, 0, 0, .12)',
          backdropFilter: `url(#${filterId})`,
          WebkitBackdropFilter: `url(#${filterId})`,
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          outline: 0,
          pointerEvents: 'auto',
          touchAction: 'none',
          ...style,
        }}
        {...props}
      >
        {children || (
          <>
            <div
              style={{
                position: 'absolute',
                width: '40%',
                height: '10px',
                background: '#fff',
                borderRadius: '10px',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '40%',
                height: '10px',
                background: '#fff',
                borderRadius: '10px',
                transform: 'rotate(90deg)',
              }}
            />
          </>
        )}
      </button>

      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <filter id={filterId} primitiveUnits="objectBoundingBox">
          <feImage
            href={displacementMap}
            x={0} y={0} width={1} height={1} result="map"
            preserveAspectRatio="none"
          />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="blur" in2="map" scale={1} xChannelSelector="R" yChannelSelector="G">
            <animate attributeName="scale" to="1.4" dur="0.3s" begin={`${btnId}.mouseover`} fill="freeze" />
            <animate attributeName="scale" to={1} dur="0.3s" begin={`${btnId}.mouseout`} fill="freeze" />
          </feDisplacementMap>
        </filter>
      </svg>
    </>
  );
};

export default CircleButton;