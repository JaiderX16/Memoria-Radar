import React, { useState, useRef } from 'react';
import {
    User, UserPlus, Mail, Eye, EyeOff, Camera, Chrome, Facebook,
    AlertTriangle, ArrowRight
} from 'lucide-react';
import { LiquidGlassInput } from '@/buttons/LiquidGlassInput';
import { LiquidActionButton } from '@/buttons/LiquidActionButton';

const AuthScreen = ({ onLogin, theme, isDarkMode, onOpenEditor }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationStep, setRegistrationStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', bio: '', avatar: null });
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const fileInputRef = useRef(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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

    const handleNextStep = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            setStatus({ type: 'error', message: 'Completa todos los campos' });
            return;
        }
        setStatus({ type: '', message: '' });
        setRegistrationStep(2);
    };

    const handleBackStep = () => {
        setRegistrationStep(1);
        setStatus({ type: '', message: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true); setStatus({ type: '', message: '' });
        setTimeout(() => {
            if (!isRegistering) {
                if (!formData.email || !formData.password) {
                    setIsLoading(false); setStatus({ type: 'error', message: 'Faltan credenciales' }); return;
                }
            }
            onLogin({
                name: isRegistering ? formData.name : 'Usuario Demo',
                email: formData.email,
                bio: isRegistering ? formData.bio : 'Amante de la tecnología y los viajes.',
                provider: 'email',
                avatar: isRegistering ? formData.avatar : null
            });
        }, 1500);
    };

    const handleSocial = (provider) => {
        setIsLoading(true);
        setTimeout(() => onLogin({ name: `Usuario ${provider}`, email: `user@${provider.toLowerCase()}.com`, bio: `Cuenta vinculada con ${provider}`, provider: provider, avatar: null }), 1000);
    };

    const resetFlow = (mode) => {
        setIsRegistering(mode);
        setRegistrationStep(1);
        setStatus({ type: '', message: '' });
        setFormData({ name: '', email: '', password: '', bio: '', avatar: null });
    };

    return (
        <div className="flex flex-col h-full w-full justify-center relative z-10 animate-in fade-in duration-500">
            <div className="flex flex-col items-center mb-6 transition-all duration-300">
                <div className={`p-5 rounded-full mb-4 border-2 ${theme.border} ${theme.iconBg} shadow-none`}>
                    {isRegistering ? (registrationStep === 2 ? <Camera className="w-8 h-8" strokeWidth={2} /> : <UserPlus className="w-8 h-8" strokeWidth={2} />) : <User className="w-8 h-8" strokeWidth={2} />}
                </div>
                <h2 className={`text-3xl font-black tracking-tighter uppercase text-center ${theme.text}`}>
                    {isRegistering ? (registrationStep === 2 ? 'Personalizar' : 'Crear Cuenta') : 'Bienvenido'}
                </h2>
                <p className={`text-xs font-bold tracking-widest uppercase mt-2 text-center ${theme.textMuted}`}>
                    {isRegistering ? (registrationStep === 2 ? 'Configura tu perfil público' : 'Paso 1 de 2: Credenciales') : 'Acceso a la plataforma'}
                </p>
            </div>
            {status.message && <div className={`mb-6 p-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl border-dashed border-2 ${theme.text} ${theme.border}`}><AlertTriangle size={16} /> {status.message}</div>}
            <form onSubmit={handleSubmit} className="space-y-4 w-full relative">
                {isRegistering && registrationStep === 2 ? (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div onClick={() => fileInputRef.current?.click()} className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-solid ${theme.border} ${theme.text}`}>
                                    {formData.avatar ? <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2 opacity-50"><Camera size={24} /><span className="text-[10px] font-black uppercase">Subir Foto</span></div>}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>
                        <div className="space-y-1"><label className={`text-[10px] font-bold uppercase tracking-wider ml-3 ${theme.text}`}>Biografía (Opcional)</label><textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className={`block w-full px-5 py-4 rounded-2xl outline-none text-sm font-medium resize-none ${theme.inputBg} ${theme.inputText}`} placeholder="Cuéntanos algo sobre ti..." /></div>
                        <div className="flex gap-3 pt-2"><LiquidActionButton type="button" onClick={handleBackStep} shape="pill" isDarkMode={isDarkMode} className="flex-1 h-14 text-sm font-bold uppercase tracking-widest">Atrás</LiquidActionButton><LiquidActionButton type="submit" disabled={isLoading} shape="pill" isDarkMode={isDarkMode} className="flex-[2] h-14 text-sm font-black uppercase tracking-widest hover:-translate-y-1">{isLoading ? 'Creando...' : 'Finalizar'}</LiquidActionButton></div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-left duration-300">
                        {isRegistering && <div className="space-y-1"><label className={`text-[10px] font-bold uppercase tracking-wider ml-3 ${theme.text}`}>Nombre</label><LiquidGlassInput name="name" value={formData.name} onChange={handleChange} placeholder="TU NOMBRE" isDarkMode={isDarkMode} className="!h-14 font-bold" /></div>}
                        <div className="space-y-1"><label className={`text-[10px] font-bold uppercase tracking-wider ml-3 ${theme.text}`}>Email</label><LiquidGlassInput name="email" value={formData.email} onChange={handleChange} placeholder="CORREO@EJEMPLO.COM" isDarkMode={isDarkMode} className="!h-14 font-bold" /></div>
                        <div className="space-y-1"><label className={`text-[10px] font-bold uppercase tracking-wider ml-3 ${theme.text}`}>Contraseña</label><LiquidGlassInput type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" isDarkMode={isDarkMode} className="!h-14 font-bold" rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className={`flex items-center ${theme.textMuted} hover:${theme.text}`}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>} /></div>
                        {isRegistering ? <LiquidActionButton type="button" onClick={handleNextStep} shape="pill" isDarkMode={isDarkMode} className="w-full h-14 text-sm font-black uppercase tracking-widest mt-6 hover:-translate-y-1">Siguiente <ArrowRight size={16} className="ml-2" /></LiquidActionButton> : <LiquidActionButton type="submit" disabled={isLoading} shape="pill" isDarkMode={isDarkMode} className="w-full h-14 text-sm font-black uppercase tracking-widest mt-6 hover:-translate-y-1">{isLoading ? 'PROCESANDO...' : 'INGRESAR'}</LiquidActionButton>}
                    </div>
                )}
            </form>
            {(!isRegistering || registrationStep === 1) && (
                <>
                    <div className="mt-6 grid grid-cols-2 gap-3"><LiquidActionButton type="button" onClick={() => handleSocial('Google')} shape="pill" isDarkMode={isDarkMode} className="w-full h-12 text-xs font-bold uppercase tracking-wider"><Chrome size={18} className="mr-2" /> Google</LiquidActionButton><LiquidActionButton type="button" onClick={() => handleSocial('Facebook')} shape="pill" isDarkMode={isDarkMode} className="w-full h-12 text-xs font-bold uppercase tracking-wider"><Facebook size={18} className="mr-2" /> Facebook</LiquidActionButton></div>
                    <p className={`mt-4 text-center text-xs font-bold uppercase tracking-wide ${theme.textMuted}`}><button type="button" onClick={() => resetFlow(!isRegistering)} className={`underline decoration-2 underline-offset-4 ${theme.text}`}>{isRegistering ? '¿Ya tienes cuenta?' : '¿Crear cuenta nueva?'}</button></p>
                </>
            )}
        </div>
    );
};

export default AuthScreen;
