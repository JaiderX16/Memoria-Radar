import React, { useState } from 'react';
import { User, LogOut, UserPlus, LogIn, X, Mail, Shield, Settings } from 'lucide-react';

const Profile = ({ user, setUser, showTools, setShowTools, darkMode, toggleDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeView, setActiveView] = useState('main'); // 'main' | 'settings' | 'privacy'

    // Mock login function for demonstration
    const handleMockLogin = () => {
        setUser({
            name: 'Jorge Dev',
            email: 'jorge.dev@example.com',
            avatar: null,
            role: 'Admin'
        });
        setIsOpen(false);
    };

    const handleLogout = () => {
        setUser(null);
        setIsOpen(false);
        setActiveView('main');
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => setActiveView('main'), 200); // Reset after animation
    };

    const renderMainView = () => (
        <>
            {/* Header */}
            <div className="p-6 pb-4 flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {user ? 'Mi Perfil' : 'Bienvenido'}
                </h3>
                <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <X size={18} className="text-gray-400" />
                </button>
            </div>

            <div className="px-6 pb-6 space-y-6">
                {user ? (
                    /* Logged In State */
                    <>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveView('settings')}
                                className="w-full flex items-center gap-3 p-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                            >
                                <Settings size={18} /> Configuración
                            </button>
                            <button
                                onClick={() => setActiveView('privacy')}
                                className="w-full flex items-center gap-3 p-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                            >
                                <Shield size={18} /> Privacidad
                            </button>
                        </div>
                    </>
                ) : (
                    /* Logged Out State */
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Únete a nuestra comunidad para guardar tus lugares favoritos y más.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={handleMockLogin}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all"
                            >
                                <UserPlus size={18} /> Crear Cuenta
                            </button>
                            <button
                                onClick={handleMockLogin}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                            >
                                <LogIn size={18} /> Iniciar Sesión
                            </button>
                        </div>
                    </div>
                )}

                {/* Common Settings (Visible for both states) */}
                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Settings size={16} />
                            </div>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Mostrar panel tools</span>
                        </div>
                        <button
                            onClick={() => setShowTools(!showTools)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showTools ? 'bg-blue-600' : 'bg-gray-300 dark:bg-zinc-700'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTools ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>
                </div>

                {user && (
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                )}
            </div>
        </>
    );

    const renderSettingsView = () => (
        <>
            <div className="p-6 pb-4 flex items-center gap-4">
                <button
                    onClick={() => setActiveView('main')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <X size={18} className="text-gray-400 rotate-90" />
                </button>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configuración</h3>
            </div>
            <div className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preferencias</label>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors cursor-pointer">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Notificaciones Push</span>
                            <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors cursor-pointer" onClick={toggleDarkMode}>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Modo Oscuro</span>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-zinc-700'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cuenta</label>
                    <div className="space-y-1">
                        <button className="w-full text-left p-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors">
                            Cambiar Contraseña
                        </button>
                        <button className="w-full text-left p-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors">
                            Vincular Redes Sociales
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    const renderPrivacyView = () => (
        <>
            <div className="p-6 pb-4 flex items-center gap-4">
                <button
                    onClick={() => setActiveView('main')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <X size={18} className="text-gray-400 rotate-90" />
                </button>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Privacidad</h3>
            </div>
            <div className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visibilidad</label>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors cursor-pointer">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Perfil Público</span>
                            <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors cursor-pointer">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Mostrar Ubicación</span>
                            <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Datos</label>
                    <div className="space-y-1">
                        <button className="w-full text-left p-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors">
                            Exportar mis datos
                        </button>
                        <button className="w-full text-left p-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors">
                            Eliminar Cuenta
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="relative">
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-white/90 dark:bg-black/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-white/20 hover:scale-105 transition-all group h-[52px]"
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-inner overflow-hidden">
                    {user ? (
                        user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <span className="font-bold">{user.name.charAt(0)}</span>
                    ) : (
                        <User size={20} />
                    )}
                </div>
                {!user && (
                    <span className="pr-3 text-sm font-bold text-gray-700 dark:text-white hidden md:block">
                        Crear cuenta
                    </span>
                )}
            </button>

            {/* Profile Modal/Dropdown */}
            {isOpen && (
                <div className="absolute top-14 right-0 w-80 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right">
                    {activeView === 'main' && renderMainView()}
                    {activeView === 'settings' && renderSettingsView()}
                    {activeView === 'privacy' && renderPrivacyView()}
                </div>
            )}
        </div>
    );
};

export default Profile;
