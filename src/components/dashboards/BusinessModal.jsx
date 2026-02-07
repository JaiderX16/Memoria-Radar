import React from 'react';
import { Briefcase, X, Save } from 'lucide-react';

const BusinessModal = ({ isOpen, onClose, onSubmit, initialData = {}, modalType }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = React.useState(initialData);

    // Update state when initialData changes
    React.useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e, formData);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">

                {/* Header Modal */}
                <div className="relative px-8 py-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 bg-gradient-to-b from-slate-50 dark:from-white/5 to-transparent sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900 dark:bg-white/10 p-2.5 rounded-xl">
                            <Briefcase size={20} className="text-white dark:text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                                Gestión de Negocios
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {modalType.includes('add') ? 'Creando nuevo registro' : 'Editando registro existente'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors border border-slate-200 dark:border-white/5">
                        <X size={18} className="text-slate-500 dark:text-slate-300" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar scrollbar-hide">
                    <form id="genericForm" onSubmit={handleSubmit} className="space-y-8">
                        {/* CAMPOS PARA NEGOCIOS */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Datos de la Empresa</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Nombre Comercial</label>
                                    <input required type="text" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3.5 focus:bg-white dark:focus:bg-transparent focus:ring-4 focus:ring-slate-900/10 dark:focus:ring-white/5 transition-all outline-none font-medium dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
                                        placeholder="Ej: Mi Empresa S.A."
                                        value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Dueño / Contacto</label>
                                    <input required type="text" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3.5 focus:bg-white dark:focus:bg-transparent focus:ring-4 focus:ring-slate-900/10 dark:focus:ring-white/5 transition-all outline-none font-medium dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
                                        placeholder="Nombre del responsable"
                                        value={formData.owner || ''} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Plan & Facturación</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Plan Contratado</label>
                                        <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-slate-900/10 dark:focus:ring-white/5 outline-none font-medium appearance-none dark:text-white cursor-pointer"
                                            value={formData.plan || 'Free'} onChange={(e) => setFormData({ ...formData, plan: e.target.value })}>
                                            <option value="Free" className="dark:bg-zinc-900">Free</option>
                                            <option value="Premium" className="dark:bg-zinc-900">Premium</option>
                                            <option value="Enterprise" className="dark:bg-zinc-900">Enterprise</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">Sedes Activas</label>
                                        <input type="number" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-slate-900/10 dark:focus:ring-white/5 outline-none font-medium dark:text-white"
                                            value={formData.locations || 0} onChange={(e) => setFormData({ ...formData, locations: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                                    <input type="checkbox" checked={formData.verified || false} onChange={(e) => setFormData({ ...formData, verified: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Cuenta Verificada</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Modal */}
                <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky bottom-0 z-10">
                    <button onClick={() => document.getElementById('genericForm').requestSubmit()} className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold hover:scale-[1.01] transition-transform flex justify-center items-center gap-2 shadow-xl shadow-slate-900/20 dark:shadow-white/10">
                        <Save size={20} /> Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusinessModal;
