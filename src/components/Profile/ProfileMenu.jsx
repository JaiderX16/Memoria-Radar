import React, { useState, useRef, useEffect } from 'react';
import {
    X, ChevronLeft, ChevronRight, User, Mail, FileText, Lock, Eye, EyeOff,
    CreditCard, Check, Bell, Shield, HelpCircle, LogOut, Sun, Moon, Camera,
    UserCircle, Save, Plus
} from 'lucide-react';
import UserAvatar from './UserAvatar';

const SubMenuHeader = ({ title, onBack, theme }) => (
    <div className={`p-6 pt-10 md:pt-6 pb-2 flex items-center gap-4 ${theme.text}`}>
        <button type="button" onClick={onBack} className={`p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors`}><ChevronLeft size={24} strokeWidth={3} /></button>
        <h3 className="text-lg font-black uppercase tracking-wide">{title}</h3>
    </div>
);

const SwitchItem = ({ label, description, active, onToggle, theme, isDarkMode }) => (
    <button type="button" onClick={onToggle} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors group text-left hover:bg-black/5 ${isDarkMode ? 'hover:bg-white/10' : ''}`}>
        <div><div className={`font-bold text-sm ${theme.text}`}>{label}</div>{description && <div className={`text-[10px] mt-0.5 ${theme.textMuted}`}>{description}</div>}</div>
        <div className={`w-10 h-6 rounded-full p-1 transition-colors border-2 ${active ? 'bg-green-500 border-green-500' : isDarkMode ? 'bg-transparent border-gray-500' : 'bg-transparent border-gray-300'}`}><div className={`w-3 h-3 bg-current rounded-full transform transition-transform ${active ? 'translate-x-4 text-white' : `translate-x-0 ${theme.textMuted}`}`} /></div>
    </button>
);

const ViewProfile = ({ user, theme, onSave, isDarkMode, onViewImage, onOpenEditor }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [formData, setFormData] = useState({ ...user });
    const [securityData, setSecurityData] = useState({ current: '', new: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const fileInputRef = useRef(null);

    useEffect(() => {
        setFormData(prev => ({ ...prev, avatar: user.avatar }));
    }, [user.avatar]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onOpenEditor(reader.result, (editedImage) => {
                    setFormData(prev => ({ ...prev, avatar: editedImage }));
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (activeTab === 'info') {
            onSave(formData);
        } else {
            if (securityData.new === securityData.confirm && securityData.new.length > 0) {
                onSave(formData, 'Contraseña actualizada correctamente');
                setSecurityData({ current: '', new: '', confirm: '' });
            } else {
                onSave(formData, 'Error: Las contraseñas no coinciden');
            }
        }
    };

    const togglePass = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const inputClasses = `w-full p-4 pr-12 rounded-2xl outline-none font-bold text-sm ${theme.inputBg} ${theme.text} focus:ring-2 focus:ring-current/20 transition-all`;

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className={`flex flex-col items-center p-6`}>
                <div className="relative group">
                    <UserAvatar name={formData.name} image={formData.avatar} size="lg" onClick={() => onViewImage(formData.avatar, formData.name)} className={`${isDarkMode ? 'bg-white text-black border-black' : 'bg-black text-white border-white'} group-hover:opacity-80`} />
                    <div className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-95 z-[60] border-2 border-black ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}><Camera size={14} strokeWidth={2.5} /></div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <p className={`text-[10px] font-bold mt-3 uppercase tracking-wider opacity-60 ${theme.text}`}>Toca la foto para ver • Toca el icono para editar</p>
            </div>
            <div className="flex px-6 mt-4 gap-4">
                <button type="button" onClick={() => setActiveTab('info')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'info' ? (isDarkMode ? 'border-white text-white' : 'border-black text-black') : 'border-transparent opacity-40 hover:opacity-70 ' + theme.text}`}>Datos</button>
                <button type="button" onClick={() => setActiveTab('security')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'security' ? (isDarkMode ? 'border-white text-white' : 'border-black text-black') : 'border-transparent opacity-40 hover:opacity-70 ' + theme.text}`}>Seguridad</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
                {activeTab === 'info' ? (
                    <>
                        <div className="space-y-2"><label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${theme.textMuted}`}><User size={12} /> Nombre Completo</label><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClasses} /></div>
                        <div className="space-y-2"><label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${theme.textMuted}`}><FileText size={12} /> Biografía</label><textarea value={formData.bio || ''} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3} className={`${inputClasses} resize-none`} placeholder="Cuéntanos un poco sobre ti..." /></div>
                        <div className="space-y-2"><label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${theme.textMuted}`}><Mail size={12} /> Email</label><input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClasses} /></div>
                    </>
                ) : (
                    <>
                        <div className={`p-4 rounded-2xl text-xs font-medium mb-2 ${isDarkMode ? 'bg-yellow-500/10 text-yellow-200' : 'bg-yellow-500/5 text-yellow-700'}`}><div className="flex items-center gap-2 mb-1 font-bold"><Lock size={14} /> Zona Segura</div>Crea una contraseña fuerte que incluya números y símbolos.</div>
                        <div className="space-y-2"><label className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Contraseña Actual</label><div className="relative"><input type={showPasswords.current ? "text" : "password"} value={securityData.current} onChange={e => setSecurityData({ ...securityData, current: e.target.value })} className={inputClasses} placeholder="Escribe tu clave actual" /><button type="button" onClick={() => togglePass('current')} className={`absolute inset-y-0 right-0 pr-4 flex items-center ${theme.textMuted} hover:${theme.text}`}>{showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                        <div className="space-y-2"><label className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Nueva Contraseña</label><div className="relative"><input type={showPasswords.new ? "text" : "password"} value={securityData.new} onChange={e => setSecurityData({ ...securityData, new: e.target.value })} className={inputClasses} placeholder="Nueva clave" /><button type="button" onClick={() => togglePass('new')} className={`absolute inset-y-0 right-0 pr-4 flex items-center ${theme.textMuted} hover:${theme.text}`}>{showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                        <div className="space-y-2"><label className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Confirmar Nueva</label><div className="relative"><input type={showPasswords.confirm ? "text" : "password"} value={securityData.confirm} onChange={e => setSecurityData({ ...securityData, confirm: e.target.value })} className={inputClasses} placeholder="Repetir clave" /><button type="button" onClick={() => togglePass('confirm')} className={`absolute inset-y-0 right-0 pr-4 flex items-center ${theme.textMuted} hover:${theme.text}`}>{showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                    </>
                )}
            </div>
            <div className={`p-4`}><button type="button" onClick={handleSave} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-none transform active:scale-95 transition-all flex items-center justify-center gap-2 ${theme.buttonBg} ${theme.buttonText}`}>{activeTab === 'info' ? 'Guardar Cambios' : 'Actualizar Clave'}</button></div>
        </div>
    );
};

const ViewPayments = ({ theme, onAdd }) => (
    <div className="p-6 space-y-4 animate-in slide-in-from-right duration-300">
        <div className={`p-5 rounded-3xl flex items-center justify-between bg-black text-white shadow-none`}><div className="flex items-center gap-4"><div className="w-10 h-7 bg-white/20 rounded flex items-center justify-center font-bold text-[8px]">VISA</div><div><div className="text-sm font-bold tracking-widest">•••• 4242</div><div className="text-[9px] opacity-60">Expira 12/28</div></div></div><div className="text-green-400"><Check size={20} /></div></div>
        <div className={`p-5 rounded-3xl flex items-center justify-between opacity-60 bg-black/5 dark:bg-white/5`}><div className="flex items-center gap-4"><div className="w-10 h-7 bg-red-500/20 rounded flex items-center justify-center font-bold text-[8px] text-red-500">MC</div><div><div className={`text-sm font-bold ${theme.text} tracking-widest`}>•••• 8899</div><div className={`text-[9px] ${theme.textMuted}`}>Expira 09/25</div></div></div></div>
        <button type="button" onClick={onAdd} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold uppercase tracking-wide hover:bg-black/5 transition-colors ${theme.text}`}><Plus size={18} /> Agregar Método</button>
    </div>
);

const ViewNotifications = ({ theme, isDarkMode }) => {
    const [toggles, setToggles] = useState({ trip: true, promo: false, app: true, sound: true });
    const toggle = (key) => setToggles(p => ({ ...p, [key]: !p[key] }));
    return (
        <div className="px-2 pt-2 animate-in slide-in-from-right duration-300">
            <SwitchItem label="Alertas de viaje" description="Notificar estado del conductor" active={toggles.trip} onToggle={() => toggle('trip')} theme={theme} isDarkMode={isDarkMode} />
            <SwitchItem label="Promociones" description="Descuentos y ofertas exclusivas" active={toggles.promo} onToggle={() => toggle('promo')} theme={theme} isDarkMode={isDarkMode} />
            <SwitchItem label="Novedades de la App" description="Actualizaciones y mejoras" active={toggles.app} onToggle={() => toggle('app')} theme={theme} isDarkMode={isDarkMode} />
            <SwitchItem label="Sonidos y Vibración" description="Feedback háptico en interacciones" active={toggles.sound} onToggle={() => toggle('sound')} theme={theme} isDarkMode={isDarkMode} />
        </div>
    );
};

const ViewPrivacy = ({ theme, isDarkMode }) => {
    const [toggles, setToggles] = useState({ location: true, profile: false, data: true });
    const toggle = (key) => setToggles(p => ({ ...p, [key]: !p[key] }));
    return (
        <div className="px-2 pt-2 animate-in slide-in-from-right duration-300">
            <div className={`p-4 mb-4 rounded-2xl text-xs font-medium flex gap-3 items-start ${isDarkMode ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-500/5 text-blue-700'}`}><Shield size={16} className="mt-0.5 flex-shrink-0" />Tus datos están protegidos con encriptación de grado militar. Tú controlas lo que compartes.</div>
            <SwitchItem label="Compartir Ubicación" description="Permitir acceso al GPS en tiempo real" active={toggles.location} onToggle={() => toggle('location')} theme={theme} isDarkMode={isDarkMode} />
            <SwitchItem label="Perfil Público" description="Visible para otros usuarios" active={toggles.profile} onToggle={() => toggle('profile')} theme={theme} isDarkMode={isDarkMode} />
            <SwitchItem label="Uso de Datos" description="Ayudar a mejorar el servicio" active={toggles.data} onToggle={() => toggle('data')} theme={theme} isDarkMode={isDarkMode} />
        </div>
    );
};

const ViewHelp = ({ theme, isDarkMode, showToast }) => {
    const FAQItem = ({ q, a }) => (
        <details className={`group p-4 rounded-2xl mb-2 transition-colors bg-black/5 dark:bg-white/5`}><summary className={`font-bold text-sm cursor-pointer list-none flex justify-between items-center ${theme.text}`}>{q} <ChevronRight size={16} className="transform group-open:rotate-90 transition-transform" /></summary><p className={`text-xs mt-2 opacity-70 leading-relaxed ${theme.text}`}>{a}</p></details>
    );
    return (
        <div className="px-4 animate-in slide-in-from-right duration-300">
            <div className="py-4">
                <FAQItem q="¿Cómo cambio mi contraseña?" a="Ve a Mi Perfil > Seguridad > Cambiar Contraseña para actualizar tus credenciales." />
                <FAQItem q="¿Métodos de pago aceptados?" a="Aceptamos tarjetas de crédito/débito Visa, Mastercard y AMEX, así como PayPal." />
                <FAQItem q="¿Cómo reportar un problema?" a="Usa el botón de contacto inferior para abrir un ticket directo con soporte." />
            </div>
            <div className={`mt-4 p-6 rounded-3xl text-center bg-black/5 dark:bg-white/5`}><p className={`text-sm font-bold mb-4 ${theme.text}`}>¿Sigues con dudas?</p><button type="button" className={`px-8 py-3 rounded-full font-bold shadow-none transform active:scale-95 transition-all ${theme.buttonBg} ${theme.buttonText}`} onClick={() => showToast('Chat de soporte iniciado...')}>Contactar Soporte</button></div>
        </div>
    );
};

const ProfileMenu = ({ user, onClose, onLogout, isDarkMode, toggleTheme, theme, showToast, onUpdateUser, onViewImage, onOpenEditor, showTools, setShowTools }) => {
    const [view, setView] = useState('main');

    const handleProfileUpdate = (updatedUser, msg = 'Perfil actualizado') => {
        onUpdateUser(updatedUser);
        showToast(msg);
        if (!msg.includes('Error')) setView('main');
    };

    const MenuItem = ({ icon: Icon, label, subLabel, action, danger = false, badge }) => (
        <button type="button" onClick={action} className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all group mb-1 ${danger ? 'text-red-600 hover:bg-red-50' : isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/5'}`}>
            <div className="flex items-center gap-4"><div className={`p-2.5 rounded-xl transition-colors ${danger ? 'bg-red-100' : isDarkMode ? 'bg-white/10 group-hover:bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'}`}><Icon size={18} strokeWidth={2.5} /></div><div className="text-left"><span className="block text-sm font-bold">{label}</span>{subLabel && <span className={`block text-[10px] font-medium opacity-50`}>{subLabel}</span>}</div></div>
            <div className="flex items-center gap-2">{badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>{badge}</span>}{!danger && <ChevronRight size={16} className="opacity-30 group-hover:opacity-100 transition-opacity" />}</div>
        </button>
    );

    const renderContent = () => {
        switch (view) {
            case 'profile': return <><SubMenuHeader title="Mi Perfil" onBack={() => setView('main')} theme={theme} /><ViewProfile user={user} theme={theme} onSave={handleProfileUpdate} isDarkMode={isDarkMode} onViewImage={onViewImage} onUpdateImage={(newImg) => onUpdateUser({ avatar: newImg })} onOpenEditor={onOpenEditor} /></>;
            case 'payments': return <><SubMenuHeader title="Pagos" onBack={() => setView('main')} theme={theme} /><ViewPayments theme={theme} onAdd={() => showToast('Abriendo pasarela...')} /></>;
            case 'notifications': return <><SubMenuHeader title="Notificaciones" onBack={() => setView('main')} theme={theme} /><ViewNotifications theme={theme} isDarkMode={isDarkMode} /></>;
            case 'privacy': return <><SubMenuHeader title="Privacidad" onBack={() => setView('main')} theme={theme} /><ViewPrivacy theme={theme} isDarkMode={isDarkMode} /></>;
            case 'help': return <><SubMenuHeader title="Ayuda" onBack={() => setView('main')} theme={theme} /><ViewHelp theme={theme} isDarkMode={isDarkMode} showToast={showToast} /></>;
            default:
                return (
                    <>
                        <div className={`p-6 pt-10 md:pt-6 pb-6 flex flex-col items-center relative overflow-hidden flex-shrink-0`}>
                            <button type="button" onClick={onClose} className={`absolute top-6 right-6 md:top-4 md:right-4 p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/20 text-white' : 'hover:bg-black/10 text-black'}`}><X size={20} strokeWidth={2.5} /></button>
                            <div className="relative mb-4 z-10 mt-2 group">
                                <UserAvatar name={user.name} image={user.avatar} size="lg" className={`${isDarkMode ? 'bg-white text-black border-black' : 'bg-black text-white border-white'}`} onClick={() => onViewImage(user.avatar, user.name)} />
                                <div className={`absolute bottom-0 right-0 p-1.5 rounded-full border-[3px] ${isDarkMode ? 'bg-green-500 border-black' : 'bg-green-500 border-white'}`}></div>
                            </div>
                            <h3 className={`text-xl font-black z-10 ${theme.text}`}>{user.name}</h3>
                            <p className={`text-xs font-bold opacity-60 mb-4 z-10 ${theme.text}`}>{user.email}</p>
                            <div className={`grid grid-cols-3 gap-2 w-full mt-2 z-10 max-w-xs ${theme.text}`}>
                                <div className={`text-center p-2 rounded-2xl ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}><div className="font-black text-lg">12</div><div className="text-[9px] uppercase font-bold opacity-60">Viajes</div></div>
                                <div className={`text-center p-2 rounded-2xl ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}><div className="font-black text-lg">4.9</div><div className="text-[9px] uppercase font-bold opacity-60">Rating</div></div>
                                <div className={`text-center p-2 rounded-2xl ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}><div className="font-black text-lg">PRO</div><div className="text-[9px] uppercase font-bold opacity-60">Nivel</div></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 scrollbar-hide">
                            <div className={`text-[10px] font-black uppercase tracking-widest mb-2 pl-2 opacity-40 ${theme.text}`}>General</div>
                            <MenuItem icon={isDarkMode ? Sun : Moon} label="Apariencia" subLabel={`Tema: ${isDarkMode ? 'Oscuro' : 'Claro'}`} action={toggleTheme} />

                            {/* Show Tools Toggle */}
                            <div className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all group mb-1 ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/5'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-white/10 group-hover:bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                        <Save size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-bold">Panel de Herramientas</span>
                                        <span className={`block text-[10px] font-medium opacity-50`}>{showTools ? 'Visible' : 'Oculto'}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowTools(!showTools)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showTools ? 'bg-blue-600' : 'bg-gray-300 dark:bg-zinc-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTools ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <MenuItem icon={UserCircle} label="Mi Perfil" subLabel="Editar datos, foto y seguridad" action={() => setView('profile')} />
                            <MenuItem icon={CreditCard} label="Métodos de Pago" subLabel="Visa •••• 4242" action={() => setView('payments')} />
                            <div className={`my-4 opacity-10 ${isDarkMode ? 'bg-white' : 'bg-black'} h-[1px]`} />
                            <div className={`text-[10px] font-black uppercase tracking-widest mb-2 pl-2 opacity-40 ${theme.text}`}>Preferencias</div>
                            <MenuItem icon={Bell} label="Notificaciones" subLabel="Configurar alertas" action={() => setView('notifications')} badge="2" />
                            <MenuItem icon={Shield} label="Privacidad" subLabel="Gestión de datos" action={() => setView('privacy')} />
                            <MenuItem icon={HelpCircle} label="Ayuda" subLabel="Soporte técnico" action={() => setView('help')} />
                        </div>
                        <div className={`p-4 flex-shrink-0 ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
                            <MenuItem icon={LogOut} label="Cerrar Sesión" action={onLogout} danger />
                            <div className={`text-center text-[10px] font-bold mt-2 opacity-30 ${theme.text}`}>VERSIÓN 2.5.0 • BUILD 2024</div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} className={`absolute inset-0 md:inset-[4px] md:rounded-[30px] shadow-none border-0 z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 ease-out ${isDarkMode ? 'bg-[#121214]/40 backdrop-blur-xl border-white/20' : 'bg-white/40 backdrop-blur-xl border-black/10'}`}>
            {renderContent()}
        </div>
    );
};

export default ProfileMenu;
