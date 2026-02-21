import React, { useState } from 'react';
import { User as UserIcon, X } from 'lucide-react';
import UserAvatar from './UserAvatar';
import Toast from './Toast';
import ImageEditor from './ImageEditor';
import ImageViewer from './ImageViewer';
import ProfileMenu from './ProfileMenu';
import AuthScreen from './AuthScreen';

const Profile = ({ user, setUser, showTools, setShowTools, mapTheme, setMapTheme, starrySky, setStarrySky, darkMode, toggleDarkMode, minimal = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [viewingImage, setViewingImage] = useState(null); // { src, name }
    const [editorImage, setEditorImage] = useState(null); // src original
    const [onEditorSave, setOnEditorSave] = useState(null); // callback (processedImage) => {}

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleLogin = (userData) => {
        setUser(userData);
        showToast('¡Bienvenido de nuevo!');
    };

    const handleLogout = () => {
        setUser(null);
        setIsOpen(false);
        showToast('Sesión cerrada');
    };

    const handleUpdateUser = (newUserData) => {
        setUser(prev => ({ ...prev, ...newUserData }));
    };

    const handleOpenEditor = (imageSrc, saveCallback) => {
        setEditorImage(imageSrc);
        setOnEditorSave(() => (processedImage) => {
            saveCallback(processedImage);
            setEditorImage(null);
            setOnEditorSave(null);
        });
    };

    const theme = {
        bg: darkMode ? 'bg-[#121214]/40' : 'bg-white/40',
        text: darkMode ? 'text-white' : 'text-black',
        textMuted: darkMode ? 'text-white/40' : 'text-black/40',
        border: darkMode ? 'border-white/10' : 'border-black/10',
        inputBg: darkMode ? 'bg-[#262626]/50 backdrop-blur-md' : 'bg-white/20 backdrop-blur-md',
        inputBorder: darkMode ? 'border-white/30 focus:border-white' : 'border-black/10 focus:border-black',
        inputText: darkMode ? 'text-white placeholder:text-white/30' : 'text-black placeholder:text-black/30',
        buttonBg: darkMode ? 'bg-white hover:bg-white/90' : 'bg-black hover:bg-black/90',
        buttonText: darkMode ? 'text-black' : 'text-white',
        socialBg: darkMode ? 'bg-[#262626]/50 backdrop-blur-md text-white hover:bg-[#262626]/80' : 'bg-black/5 backdrop-blur-md text-black hover:bg-black/10',
        iconBg: darkMode ? 'bg-[#262626]/50 backdrop-blur-md text-white' : 'bg-black/10 backdrop-blur-md text-black'
    };

    return (
        <div className="relative">
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-white/90 dark:bg-black/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-white/20 hover:scale-105 transition-all group h-[52px]"
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-inner overflow-hidden">
                    {user ? (
                        user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold">{user.name.charAt(0)}</span>
                        )
                    ) : (
                        <UserIcon size={20} />
                    )}
                </div>
                {!user && !minimal && (
                    <span className="pr-3 text-sm font-bold text-gray-700 dark:text-white hidden md:block">
                        Crear cuenta
                    </span>
                )}
            </button>

            {/* Profile Modal/Dropdown */}
            {isOpen && (
                <div className="fixed inset-0 md:absolute md:inset-auto md:top-[70px] md:right-0 w-full h-full md:w-[450px] xl:w-[500px] md:h-[650px] bg-white/80 dark:bg-[#121214]/80 backdrop-blur-2xl md:rounded-[32px] shadow-2xl md:shadow-[0_30px_70px_rgba(0,0,0,0.4)] border-0 overflow-hidden animate-in zoom-in-95 duration-300 origin-top-right z-[10001] md:z-[50]">

                    {/* Floating Layers: Viewer and Editor */}
                    {viewingImage && !editorImage && (
                        <ImageViewer
                            src={viewingImage.src}
                            name={viewingImage.name}
                            onClose={() => setViewingImage(null)}
                            onUpdateImage={(newImg, needsEdit) => {
                                if (needsEdit) {
                                    handleOpenEditor(newImg, (processed) => {
                                        handleUpdateUser({ avatar: processed });
                                        setViewingImage(prev => ({ ...prev, src: processed }));
                                    });
                                } else {
                                    handleUpdateUser({ avatar: newImg });
                                    setViewingImage(prev => ({ ...prev, src: newImg }));
                                }
                            }}
                            theme={theme}
                        />
                    )}

                    {editorImage && (
                        <ImageEditor
                            src={editorImage}
                            onCancel={() => { setEditorImage(null); setOnEditorSave(null); }}
                            onSave={onEditorSave}
                            theme={theme}
                            isDarkMode={darkMode}
                        />
                    )}

                    {toast && <Toast message={toast.message} theme={theme} />}

                    {user ? (
                        <ProfileMenu
                            user={user}
                            onClose={() => setIsOpen(false)}
                            onLogout={handleLogout}
                            isDarkMode={darkMode}
                            toggleTheme={toggleDarkMode}
                            theme={theme}
                            showToast={showToast}
                            onUpdateUser={handleUpdateUser}
                            onViewImage={(src, name) => setViewingImage({ src, name })}
                            onOpenEditor={handleOpenEditor}
                            showTools={showTools}
                            setShowTools={setShowTools}
                            mapTheme={mapTheme}
                            setMapTheme={setMapTheme}
                            starrySky={starrySky}
                            setStarrySky={setStarrySky}
                        />
                    ) : (
                        <div className="flex-1 h-full flex flex-col justify-center pt-16 md:pt-10">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 md:top-4 md:right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-20"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                            <AuthScreen
                                onLogin={handleLogin}
                                theme={theme}
                                isDarkMode={darkMode}
                                onOpenEditor={handleOpenEditor}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
