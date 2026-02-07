import React, { useState, useEffect } from 'react';
import { X, MapPin, Save, Image as ImageIcon, Type, AlignLeft, Tag, Palette, Globe, Upload } from 'lucide-react';

// Categorías y Colores
const CATEGORIAS = ['parques', 'monumentos', 'restaurantes', 'museos', 'hoteles', 'mercados', 'playas', 'bares', 'discotecas'];
const COLORES = [
    { id: 'blue', nombre: 'Azul', hex: '#3b82f6' },
    { id: 'red', nombre: 'Rojo', hex: '#ef4444' },
    { id: 'green', nombre: 'Verde', hex: '#10b981' },
    { id: 'amber', nombre: 'Ámbar', hex: '#f59e0b' },
    { id: 'purple', nombre: 'Morado', hex: '#8b5cf6' },
    { id: 'pink', nombre: 'Rosa', hex: '#ec4899' },
    { id: 'cyan', nombre: 'Cian', hex: '#06b6d4' },
    { id: 'lime', nombre: 'Lima', hex: '#84cc16' },
    { id: 'orange', nombre: 'Naranja', hex: '#f97316' }
];

const INITIAL_FORM_STATE = {
    nombre: '',
    latitud: '',
    longitud: '',
    descripcion: '',
    website: '',
    categoria: 'monumentos',
    color: 'blue'
};

// Estilos Premium (Inspirados en Chat Mia y ModalPin)
const INPUT_CLASSES = "w-full bg-gray-50/50 dark:bg-[#1c1c1e]/50 border border-gray-200 dark:border-white/5 focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 px-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 outline-none transition-all font-medium backdrop-blur-sm";
const LABEL_CLASSES = "flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-zinc-400 ml-1 uppercase tracking-wider mb-1.5";

const FormularioLugar = ({ isOpen, onClose, onSubmit, initialCoords, initialData }) => {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState({});

    // Actualizar datos cuando cambian
    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre || '',
                latitud: initialData.latitud || '',
                longitud: initialData.longitud || '',
                descripcion: initialData.descripcion || '',
                website: initialData.website || '',
                categoria: initialData.categoria || 'monumentos',
                color: initialData.color || 'blue'
            });
            setImagePreview(initialData.imagen || null);
        } else if (initialCoords) {
            setFormData(prev => ({
                ...prev,
                latitud: initialCoords.lat,
                longitud: initialCoords.lng
            }));
        } else {
            setFormData(INITIAL_FORM_STATE);
            setImagePreview(null);
        }
    }, [initialData, initialCoords, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer?.files || e.target?.files;
        if (files?.[0]) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview(reader.result);
                reader.readAsDataURL(file);
                setErrors(prev => ({ ...prev, imagen: '' }));
            } else {
                setErrors(prev => ({ ...prev, imagen: 'Imagen inválida' }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
        if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';
        const lat = initialCoords?.lat || parseFloat(formData.latitud);
        const lng = initialCoords?.lng || parseFloat(formData.longitud);
        if (isNaN(lat)) newErrors.latitud = 'Latitud inválida';
        if (isNaN(lng)) newErrors.longitud = 'Longitud inválida';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const nuevoLugar = {
            id: initialData?.id || Date.now(),
            nombre: formData.nombre.trim(),
            latitud: initialCoords?.lat || parseFloat(formData.latitud),
            longitud: initialCoords?.lng || parseFloat(formData.longitud),
            descripcion: formData.descripcion.trim(),
            imagen: imagePreview || 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg',
            website: formData.website.trim(),
            categoria: formData.categoria,
            color: COLORES.find(c => c.id === formData.color)?.hex || '#3b82f6'
        };

        onSubmit(nuevoLugar);
        handleClose();
    };

    const handleClose = () => {
        setFormData(INITIAL_FORM_STATE);
        setImagePreview(null);
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001] p-4 animate-in fade-in duration-300">
            <div className={`
                relative w-full max-w-2xl max-h-[90vh] flex flex-col
                bg-white/90 backdrop-blur-2xl dark:bg-[#121214]/90 dark:backdrop-blur-2xl
                rounded-[32px] shadow-2xl border border-white/20 dark:border-white/5
                ring-1 ring-black/5 animate-in zoom-in-95 duration-300
            `}>

                {/* Header Premium */}
                <div className="px-8 pt-8 pb-6 flex items-start justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/20 dark:to-blue-600/10 flex items-center justify-center shadow-inner ring-1 ring-black/5 dark:ring-white/5">
                            <MapPin className="text-blue-600 dark:text-blue-400 drop-shadow-sm" size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight leading-none mb-1.5">
                                {initialData ? 'Editar Lugar' : 'Nuevo Lugar'}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                                {initialData ? 'Modifica los detalles existentes' : 'Añade un punto de interés al mapa'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#1c1c1e]/50 hover:bg-gray-200 dark:hover:bg-[#2c2c2e] text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Formulario Scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-8 space-y-6 scrollbar-hide">

                    {/* Sección Principal */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className={LABEL_CLASSES}>
                                <Type size={14} className="text-blue-500" /> NOMBRE DEL LUGAR
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={INPUT_CLASSES}
                                placeholder="Ej: Mirador del Valle"
                                required
                            />
                            {errors.nombre && <p className="text-red-500 text-xs font-bold ml-1 animate-pulse">{errors.nombre}</p>}
                        </div>

                        {!initialCoords ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className={LABEL_CLASSES}>LATITUD</label>
                                    <input type="number" name="latitud" value={formData.latitud} onChange={handleChange} step="any" className={INPUT_CLASSES} required />
                                </div>
                                <div className="space-y-2">
                                    <label className={LABEL_CLASSES}>LONGITUD</label>
                                    <input type="number" name="longitud" value={formData.longitud} onChange={handleChange} step="any" className={INPUT_CLASSES} required />
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                        <Globe size={16} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Ubicación</span>
                                        <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
                                            {initialCoords.lat.toFixed(6)}, {initialCoords.lng.toFixed(6)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className={LABEL_CLASSES}>
                                <AlignLeft size={14} className="text-blue-500" /> DESCRIPCIÓN
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="3"
                                className={`${INPUT_CLASSES} resize-none`}
                                placeholder="Describe brevemente este lugar..."
                                required
                            />
                        </div>
                    </div>

                    {/* Detalles Adicionales */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className={LABEL_CLASSES}>
                                <Tag size={14} className="text-blue-500" /> CATEGORÍA
                            </label>
                            <div className="relative">
                                <select
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    className={`${INPUT_CLASSES} appearance-none cursor-pointer capitalize`}
                                >
                                    {CATEGORIAS.map(cat => <option key={cat} value={cat} className="dark:bg-[#121214]">{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={LABEL_CLASSES}>
                                <Palette size={14} className="text-blue-500" /> COLOR
                            </label>
                            <div className="relative">
                                <select
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    className={`${INPUT_CLASSES} appearance-none cursor-pointer`}
                                >
                                    {COLORES.map(col => <option key={col.id} value={col.id} className="dark:bg-[#121214]">{col.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={LABEL_CLASSES}>
                            <Globe size={14} className="text-blue-500" /> WEBSITE (OPCIONAL)
                        </label>
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className={INPUT_CLASSES}
                            placeholder="https://ejemplo.com"
                        />
                    </div>

                    {/* Imagen Upload */}
                    <div className="space-y-2">
                        <label className={LABEL_CLASSES}>
                            <ImageIcon size={14} className="text-blue-500" /> IMAGEN (OPCIONAL)
                        </label>
                        {!imagePreview ? (
                            <div
                                onDrop={handleImageDrop}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                className={`
                                    relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer group
                                    ${isDragging
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                        : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-slate-100 dark:hover:bg-white/10'}
                                `}
                            >
                                <input type="file" accept="image/*" onChange={handleImageDrop} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-3 bg-white dark:bg-white/10 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-slate-400 dark:text-zinc-400 group-hover:text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-slate-700 dark:text-white font-semibold text-sm">Sube una imagen</p>
                                        <p className="text-slate-400 dark:text-zinc-500 text-xs mt-1">PNG, JPG hasta 5MB</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md group">
                                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                                <button
                                    type="button"
                                    onClick={() => setImagePreview(null)}
                                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-red-500/90 text-white rounded-xl backdrop-blur-md transition-all shadow-lg"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Botones de Acción */}
                    <div className="pt-2 flex gap-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-4 px-6 bg-slate-100 dark:bg-[#1c1c1e]/50 hover:bg-slate-200 dark:hover:bg-[#2c2c2e] text-slate-600 dark:text-white rounded-2xl font-bold transition-all active:scale-[0.98]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 px-6 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-2xl font-bold shadow-lg shadow-slate-900/20 dark:shadow-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Save size={18} strokeWidth={2.5} />
                            {initialData ? 'Guardar Cambios' : 'Guardar Lugar'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default FormularioLugar;
