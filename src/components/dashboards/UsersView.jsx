import React from 'react';
import { Download, MoreHorizontal, Ban, UserCheck, Trash2 } from 'lucide-react';

const UsersView = ({
    filteredUsers,
    handleExportCSV,
    searchQuery,
    userMenuOpen,
    setUserMenuOpen,
    toggleUserStatus,
    deleteItem
}) => {
    return (
        <div className="p-4 md:p-8 overflow-y-auto h-full animate-in fade-in duration-500 scrollbar-hide" onClick={() => setUserMenuOpen(null)}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Usuarios</h2>
                    {searchQuery && <p className="text-sm text-slate-500">Resultados para "{searchQuery}"</p>}
                </div>
                <button onClick={handleExportCSV} className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                    <Download size={18} /> Exportar CSV
                </button>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="p-6 font-bold">Usuario</th>
                                <th className="p-6 font-bold">Rol</th>
                                <th className="p-6 font-bold">Estado</th>
                                <th className="p-6 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-6">
                                        <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                                        <div className="text-slate-400 text-xs">{user.email}</div>
                                    </td>
                                    <td className="p-6 text-slate-600 dark:text-slate-300">{user.role}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${user.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {user.status === 'active' ? 'Activo' : 'Suspendido'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setUserMenuOpen(userMenuOpen === user.id ? null : user.id); }}
                                            className="text-slate-300 hover:text-slate-900 dark:text-zinc-600 dark:hover:text-white transition-colors"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>
                                        {/* User Context Menu */}
                                        {userMenuOpen === user.id && (
                                            <div className="absolute right-8 top-12 w-40 bg-white dark:bg-zinc-800 shadow-xl rounded-xl border border-slate-100 dark:border-zinc-700 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                                                <button onClick={() => toggleUserStatus(user.id)} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                                                    {user.status === 'active' ? <Ban size={14} /> : <UserCheck size={14} />}
                                                    {user.status === 'active' ? 'Suspender' : 'Activar'}
                                                </button>
                                                <button onClick={() => deleteItem('user', user.id)} className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2">
                                                    <Trash2 size={14} /> Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No se encontraron usuarios.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersView;
