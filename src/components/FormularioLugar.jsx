import React, { useState } from 'react';
import { X, MapPin, Save, Image as ImageIcon, Type, AlignLeft, Tag, Palette, Globe, Upload } from 'lucide-react';

// TODO: Obtener desde backend cuando esté integrado
const categorias = ['parques', 'monumentos', 'restaurantes', 'museos', 'hoteles', 'mercados', 'playas', 'bares', 'discotecas'];
const colores = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

const FormularioLugar = ({ isOpen, onClose, onSubmit, initialCoords }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        latitud: initialCoords?.lat || '',
        longitud: initialCoords?.lng || '',
        descripcion: '',
        imagen: '',
        website: '',
        categoria: 'monumentos',
        color: 'blue'
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer?.files || e.target?.files;
        if (files && files[0]) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                setImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Por favor selecciona una imagen válida');
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.descripcion) {
            alert('Por favor, completa el nombre y la descripción');
            return;
        }

        const lat = initialCoords?.lat || parseFloat(formData.latitud);
        const lng = initialCoords?.lng || parseFloat(formData.longitud);

        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            alert('Por favor, ingresa coordenadas válidas');
            return;
        }

        const nuevoLugar = {
            id: Date.now(),
            nombre: formData.nombre,
            latitud: lat,
            longitud: lng,
            descripcion: formData.descripcion,
            imagen: imagePreview || 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600',
            website: formData.website,
            categoria: formData.categoria,
            color: formData.color
        };

        onSubmit(nuevoLugar);

        setFormData({
            nombre: '',
            latitud: '',
            longitud: '',
            descripcion: '',
            imagen: '',
            website: '',
            categoria: 'monumentos',
            color: 'blue'
        });
        setImageFile(null);
        setImagePreview(null);

        onClose();
    };

    React.useEffect(() => {
        if (initialCoords) {
            setFormData(prev => ({
                ...prev,
                latitud: initialCoords.lat,
                longitud: initialCoords.lng
            }));
        }
    }, [initialCoords]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10001] p-4 animate-in fade-in duration-300">
            <div className="bg-zinc-900/95 border border-white/10 rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="relative p-8 pb-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                                <MapPin className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Nuevo Lugar
                                </h2>
                                <p className="text-zinc-500 text-sm font-medium">Completa los detalles del punto</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all border border-white/5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar flex-grow">

                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 ml-1">
                            <Type size={14} className="text-blue-400" />
                            Nombre del lugar
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 outline-none transition-all"
                            placeholder="Ej: Mirador del Valle"
                            required
                        />
                    </div>

                    {/* Coordenadas */}
                    {!initialCoords ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-400 ml-1">Latitud</label>
                                <input
                                    type="number"
                                    name="latitud"
                                    value={formData.latitud}
                                    onChange={handleChange}
                                    step="any"
                                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 outline-none transition-all"
                                    placeholder="41.4036"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-400 ml-1">Longitud</label>
                                <input
                                    type="number"
                                    name="longitud"
                                    value={formData.longitud}
                                    onChange={handleChange}
                                    step="any"
                                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 outline-none transition-all"
                                    placeholder="2.1744"
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ubicación Seleccionada</label>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400 font-medium">Lat: <span className="text-white">{initialCoords.lat.toFixed(6)}</span></span>
                                <span className="text-zinc-400 font-medium">Lng: <span className="text-white">{initialCoords.lng.toFixed(6)}</span></span>
                            </div>
                        </div>
                    )}

                    {/* Descripción */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 ml-1">
                            <AlignLeft size={14} className="text-blue-400" />
                            Descripción
                        </label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="3"
                            className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 outline-none transition-all resize-none"
                            placeholder="Describe brevemente este lugar..."
                            required
                        />
                    </div>

                    {/* Categoría y Color */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 ml-1">
                                <Tag size={14} className="text-blue-400" />
                                Categoría
                            </label>
                            <div className="relative">
                                <select
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 px-4 text-white outline-none transition-all appearance-none cursor-pointer"
                                >
                                    {categorias.map((cat) => (
                                        <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                    <Tag size={14} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 ml-1">
                                <Palette size={14} className="text-blue-400" />
                                Color
                            </label>
                            <div className="relative">
                                <select
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 px-4 text-white outline-none transition-all appearance-none cursor-pointer"
                                >
                                    {colores.map((col) => (
                                        <option key={col.id} value={col.id} className="bg-zinc-900 text-white">
                                            {col.nombre}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                    <Palette size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* URL de la página web */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 ml-1">
                            <Globe size={14} className="text-blue-400" />
                            URL de la página web
                        </label>
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 outline-none transition-all"
                            placeholder="https://ejemplo.com"
                        />
                    </div>

                    {/* Drag & Drop para Imagen */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 ml-1">
                            <ImageIcon size={14} className="text-blue-400" />
                            Imagen del lugar
                        </label>

                        {!imagePreview ? (
                            <div
                                onDrop={handleImageDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer
                  ${isDragging
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-white/20 bg-white/5 hover:border-blue-500/50 hover:bg-white/10'
                                    }`}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageDrop}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 bg-blue-600/20 rounded-2xl">
                                        <Upload className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-semibold mb-1">
                                            Arrastra una imagen aquí
                                        </p>
                                        <p className="text-zinc-500 text-sm">
                                            o haz clic para seleccionar
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden border border-white/10">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-xl transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer / Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white rounded-2xl font-bold transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioLugar;
