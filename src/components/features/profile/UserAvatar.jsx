import React from 'react';

const UserAvatar = ({ name, image, size = "md", className = "", onClick }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'US';
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-12 h-12 text-sm",
        lg: "w-24 h-24 text-2xl",
        xl: "w-32 h-32 text-4xl"
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-black tracking-wider border-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden relative bg-gray-100 dark:bg-gray-800 shadow-none ${className}`}
        >
            {image ? (
                <img src={image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                initials
            )}
        </button>
    );
};

export default UserAvatar;
