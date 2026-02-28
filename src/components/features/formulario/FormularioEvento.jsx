import React, { useState, useEffect } from 'react';
import { X, MapPin, Save, Image as ImageIcon, Type, AlignLeft, Tag, DollarSign, Users, Video, Bell, Link as LinkIcon, Upload } from 'lucide-react';
import { createEvent } from '@/services/api';
import { CustomDatePicker, CustomTimePicker } from '@/components/ui/DateTimePicker';

// Etiquetas de Evento (Ejemplos basados en imagen)
const EVENT_TAGS = [
    { id: 'cumpleanos', label: 'Cumpleaños' },
    { id: 'reuniones', label: 'Reuniones' },
    { id: 'fiesta', label: 'Fiesta' },
    { id: 'aniversarios', label: 'Aniversarios' },
    { id: 'bodas', label: 'Bodas' },
    { id: 'raves', label: 'Raves' },
    { id: 'santiagos', label: 'Santiagos' }
];

const INITIAL_FORM_STATE = {
    nombre: '',
    google_maps_link: '',
    latitud: '',
    longitud: '',
    descripcion: '',
    fecha_inicio: '',
    hora_inicio: '',
    fecha_fin: '',
    hora_fin: '',
    precio: '',
    capacidad: '',
    video_link: '',
    notificaciones: false,
    tiempo_aviso: 60, // minutos
    tags: [],
    continente_nombre: '',
    pais_nombre: '',
    region_nombre: '',
    ciudad_nombre: ''
};

// Estilos Premium
const INPUT_CLASSES = "w-full bg-gray-50/50 dark:bg-[#1c1c1e]/50 border border-gray-200 dark:border-white/5 focus:border-pink-500/30 focus:ring-4 focus:ring-pink-500/10 rounded-2xl py-3.5 px-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 outline-none transition-all font-medium backdrop-blur-sm";
const LABEL_CLASSES = "flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-zinc-400 ml-1 uppercase tracking-wider mb-1.5";
const CHECKBOX_CLASSES = "w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-white/10 text-pink-500 focus:ring-pink-500/20 bg-gray-50 dark:bg-white/5 transition-all cursor-pointer";

const FormularioEvento = ({ isOpen, onClose, onSubmit, initialCoords, initialData }) => {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [imagePreview, setImagePreview] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...INITIAL_FORM_STATE,
                ...initialData,
                tags: initialData.tags || []
            });
            setImagePreview(initialData.imagen || null);
        } else if (initialCoords) {
            setFormData(prev => ({
                ...prev,
                latitud: initialCoords.lat,
                longitud: initialCoords.lng,
                continente_nombre: initialCoords.continente_nombre || prev.continente_nombre,
                pais_nombre: initialCoords.pais_nombre || prev.pais_nombre,
                region_nombre: initialCoords.region_nombre || prev.region_nombre,
                ciudad_nombre: initialCoords.ciudad_nombre || prev.ciudad_nombre
            }));
        } else {
            setFormData(INITIAL_FORM_STATE);
            setImagePreview(null);
        }
    }, [initialData, initialCoords, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleTagToggle = (tagId) => {
        setFormData(prev => {
            const currentTags = prev.tags || [];
            if (currentTags.includes(tagId)) {
                return { ...prev, tags: currentTags.filter(t => t !== tagId) };
            } else {
                return { ...prev, tags: [...currentTags, tagId] };
            }
        });
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
            }
        }
    };

    const handleVideoFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setVideoFile(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validación básica
        if (!formData.nombre.trim()) return setErrors({ nombre: 'Requerido' });
        if (!formData.latitud || !formData.longitud) return setErrors({ latitud: 'Ubicación requerida' });

        // Preparar datos para el backend
        // Combinar fecha y hora para enviar timestamp completo si es necesario, 
        // o enviar como campos separados según espere el backend.
        // Aquí enviamos el objeto formData completo más el tipo 'evento'

        const eventoData = {
            ...formData,
            type: 'evento',
            imagen: imagePreview,
            // videoFile: videoFile // Manejar carga de archivos real requeriría FormData
        };

        onSubmit(eventoData);
    };

    // if (!isOpen) return null; // Controlled by parent

    return (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-8 space-y-6 scrollbar-hide animate-in fade-in duration-300">

            {/* Google Maps Link */}
            <div className="space-y-2">
                <label className={LABEL_CLASSES}>Enlace de Google Maps para el Evento</label>
                <input
                    type="url"
                    name="google_maps_link"
                    value={formData.google_maps_link}
                    onChange={handleChange}
                    className={INPUT_CLASSES}
                    placeholder="https://www.google.com/maps/place/..."
                />
            </div>

            {/* Lat/Lng */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className={LABEL_CLASSES}>Latitud</label>
                    <input type="number" name="latitud" value={formData.latitud} onChange={handleChange} className={INPUT_CLASSES} step="any" required />
                </div>
                <div className="space-y-2">
                    <label className={LABEL_CLASSES}>Longitud</label>
                    <input type="number" name="longitud" value={formData.longitud} onChange={handleChange} className={INPUT_CLASSES} step="any" required />
                </div>
            </div>

            {/* Ubicación Detallada */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className={LABEL_CLASSES}>Continente</label>
                    <input type="text" name="continente_nombre" value={formData.continente_nombre} onChange={handleChange} className={INPUT_CLASSES} placeholder="Ej: América del Sur" />
                </div>
                <div className="space-y-2">
                    <label className={LABEL_CLASSES}>País</label>
                    <input type="text" name="pais_nombre" value={formData.pais_nombre} onChange={handleChange} className={INPUT_CLASSES} placeholder="Ej: Perú" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className={LABEL_CLASSES}>Región / Estado</label>
                    <input type="text" name="region_nombre" value={formData.region_nombre} onChange={handleChange} className={INPUT_CLASSES} placeholder="Ej: Junín" />
                </div>
                <div className="space-y-2">
                    <label className={LABEL_CLASSES}>Ciudad</label>
                    <input type="text" name="ciudad_nombre" value={formData.ciudad_nombre} onChange={handleChange} className={INPUT_CLASSES} placeholder="Ej: Huancayo" />
                </div>
            </div>

            {/* Título */}
            <div className="space-y-2">
                <label className={LABEL_CLASSES}>Título del Evento</label>
                <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={INPUT_CLASSES}
                    placeholder="Ej: Fiesta de Verano"
                    required
                />
                {errors.nombre && <span className="text-red-500 text-xs">{errors.nombre}</span>}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className={LABEL_CLASSES}>Inicia</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                            <CustomDatePicker
                                value={formData.fecha_inicio}
                                onChange={(e) => handleChange({ target: { name: 'fecha_inicio', value: e.target.value } })}
                            />
                        </div>
                        <CustomTimePicker
                            value={formData.hora_inicio}
                            onChange={(e) => handleChange({ target: { name: 'hora_inicio', value: e.target.value } })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className={LABEL_CLASSES}>Finaliza</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                            <CustomDatePicker
                                value={formData.fecha_fin}
                                onChange={(e) => handleChange({ target: { name: 'fecha_fin', value: e.target.value } })}
                            />
                        </div>
                        <CustomTimePicker
                            value={formData.hora_fin}
                            onChange={(e) => handleChange({ target: { name: 'hora_fin', value: e.target.value } })}
                        />
                    </div>
                </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
                <label className={LABEL_CLASSES}>Descripción Detallada</label>
                <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="4"
                    className={INPUT_CLASSES}
                    placeholder="Detalles del evento..."
                />
            </div>

            {/* Precio y Capacidad */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className={LABEL_CLASSES}><DollarSign size={14} /> Precio Entrada</label>
                    <input type="number" name="precio" value={formData.precio} onChange={handleChange} className={INPUT_CLASSES} placeholder="0.00" min="0" />
                </div>
                <div className="space-y-2">
                    <label className={LABEL_CLASSES}><Users size={14} /> Capacidad Máxima</label>
                    <input type="number" name="capacidad" value={formData.capacidad} onChange={handleChange} className={INPUT_CLASSES} placeholder="Ej: 100" />
                </div>
            </div>

            {/* Video Link */}
            <div className="space-y-2">
                <label className={LABEL_CLASSES}><LinkIcon size={14} /> Video Promocional (Link Youtube/Vimeo)</label>
                <input type="url" name="video_link" value={formData.video_link} onChange={handleChange} className={INPUT_CLASSES} placeholder="https://youtube.com/..." />
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
                <label className={LABEL_CLASSES}><Video size={14} /> O Cargar Video (MP4)</label>
                <div className={`border border-gray-200 dark:border-white/10 rounded-2xl p-3 flex items-center gap-3 bg-gray-50 dark:bg-white/5`}>
                    <button type="button" className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
                        Seleccionar archivo
                    </button>
                    <span className="text-xs text-slate-500 dark:text-zinc-500 truncate">
                        {videoFile ? videoFile.name : 'Ningún archivo seleccionado'}
                    </span>
                    <input type="file" accept="video/mp4" onChange={handleVideoFileChange} className="hidden" />
                </div>
            </div>

            {/* Fotos */}
            <div className="space-y-2">
                <label className={LABEL_CLASSES}><ImageIcon size={14} /> Fotos / Fotos 360°</label>
                {!imagePreview ? (
                    <div
                        onDrop={handleImageDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        className={`
                                    relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer group
                                    ${isDragging
                                ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10'
                                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-pink-400 dark:hover:border-pink-500/50'}
                                `}
                    >
                        <input type="file" accept="image/*" onChange={handleImageDrop} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="w-6 h-6 text-slate-400 dark:text-zinc-400 group-hover:text-pink-500" />
                            <p className="text-xs text-slate-500">Arrastra o haz clic para subir</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 h-32">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => setImagePreview(null)}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-red-500/90 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Notificaciones */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Activar Notificaciones Push</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">Minutos antes para avisar:</span>
                            <input
                                type="number"
                                name="tiempo_aviso"
                                value={formData.tiempo_aviso}
                                onChange={handleChange}
                                className="w-16 h-8 rounded-lg border border-gray-200 dark:border-white/10 px-2 text-sm text-center bg-white dark:bg-black/20"
                            />
                        </div>
                    </div>
                </div>
                <input
                    type="checkbox"
                    name="notificaciones"
                    checked={formData.notificaciones}
                    onChange={handleChange}
                    className="w-6 h-6 rounded-md border-gray-300 text-orange-500 focus:ring-orange-500"
                />
            </div>

            {/* Etiquetas */}
            <div className="space-y-3">
                <label className={LABEL_CLASSES}>Etiquetas del Evento</label>
                <div className="flex flex-wrap gap-2">
                    {EVENT_TAGS.map(tag => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleTagToggle(tag.id)}
                            className={`
                                        px-4 py-2 rounded-xl text-xs font-bold transition-all border
                                        ${formData.tags.includes(tag.id)
                                    ? 'bg-pink-100 border-pink-200 text-pink-700 dark:bg-pink-500/20 dark:border-pink-500/30 dark:text-pink-300'
                                    : 'bg-gray-100 border-transparent text-slate-500 hover:bg-gray-200 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10'}
                                    `}
                        >
                            {tag.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-2 flex gap-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 px-6 bg-slate-100 dark:bg-[#1c1c1e]/50 hover:bg-slate-200 dark:hover:bg-[#2c2c2e] text-slate-600 dark:text-white rounded-2xl font-bold transition-all active:scale-[0.98]"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex-1 py-4 px-6 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-2xl font-bold shadow-lg shadow-slate-900/20 dark:shadow-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Save size={18} strokeWidth={2.5} />
                    Publicar Evento
                </button>
            </div>

        </form>
    );
};

export default FormularioEvento;
