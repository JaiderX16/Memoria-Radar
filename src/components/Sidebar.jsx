import React, { useState } from 'react';
import {
  Search, X, Star, MapPin, Navigation, Phone,
  Globe, MoreHorizontal, Menu, Plus, Trash2,
  Ticket, Clock, BarChart3, Users, TrendingUp, Settings, Database
} from 'lucide-react';

// DATOS DE PRUEBA
const MOCK_PLACES = [
  { id: 1, nombre: "Café Central", rating: 4.8, categoria: "Cafetería", descripcion: "Café acogedor con especialidad en espresso", imagen: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400&auto=format&fit=crop", horario: "Lun-Dom: 7:00 - 22:00" },
  { id: 2, nombre: "Grand Vista Hotel", rating: 4.5, categoria: "Hotel", descripcion: "Hotel boutique con vistas panorámicas", imagen: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop", horario: "24 horas" },
  { id: 3, nombre: "Parque del Retiro", rating: 4.9, categoria: "Parque", descripcion: "Hermoso parque público con jardines", imagen: "https://images.unsplash.com/photo-1576082869502-d7b38df3743e?q=80&w=400&auto=format&fit=crop", horario: "6:00 - 22:00" },
  { id: 4, nombre: "Restaurante La Plaza", rating: 4.7, categoria: "Restaurante", descripcion: "Cocina tradicional con ingredientes frescos", imagen: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop", horario: "12:00 - 23:00" },
  { id: 5, nombre: "Museo de Arte", rating: 4.6, categoria: "Museo", descripcion: "Colección de arte contemporáneo y clásico", imagen: "https://images.unsplash.com/photo-1566127444979-b2e871d3bef8?q=80&w=400&auto=format&fit=crop", horario: "Mar-Dom: 10:00 - 19:00" }
];

const EVENTOS_DESTACADOS = [
  { id: 101, title: "Noche de Jazz", date: "Hoy, 20:00", location: "Café Central", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=300&auto=format&fit=crop" },
  { id: 102, title: "Feria de Diseño", date: "Mañana", location: "Matadero", image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=300&auto=format&fit=crop" },
  { id: 103, title: "Ruta de Tapas", date: "Sáb, 13:00", location: "Centro", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=300&auto=format&fit=crop" },
  { id: 104, title: "Cine de Verano", date: "Dom, 21:00", location: "Parque Retiro", image: "https://images.unsplash.com/photo-1517604931442-710e8b6b0606?q=80&w=300&auto=format&fit=crop" }
];

const RatingBadge = ({ rating }) => (
  <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md self-start">
    <Star size={12} className="fill-yellow-500 text-yellow-500" />
    <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{rating || 4.5}</span>
  </div>
);

const ActionButton = ({ icon, label, primary }) => (
  <button className={`flex flex-col items-center justify-center gap-2 w-full py-3 rounded-xl transition-all duration-200 ${primary ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700' : 'bg-gray-50 dark:bg-white/5 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// --- ADMIN DASHBOARD COMPONENT ---
const AdminDashboard = ({ lugares, onAddLugar, onDeleteLugar, setIsOpen }) => {
  const [activePanel, setActivePanel] = useState(null); // 'users' | 'stats' | 'settings' | null
  const [users, setUsers] = useState([
    { id: 1, name: "Carlos García", email: "carlos@email.com", role: "Admin", status: "active" },
    { id: 2, name: "María López", email: "maria@email.com", role: "Editor", status: "active" },
    { id: 3, name: "Juan Pérez", email: "juan@email.com", role: "Viewer", status: "inactive" },
    { id: 4, name: "Ana Martínez", email: "ana@email.com", role: "Editor", status: "active" },
  ]);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'Viewer',
    status: 'active'
  });

  const stats = [
    { label: "Total Lugares", value: lugares.length || 127, icon: <MapPin size={20} />, color: "bg-blue-500" },
    { label: "Usuarios Activos", value: users.filter(u => u.status === 'active').length, icon: <Users size={20} />, color: "bg-green-500" },
    { label: "Visitas Hoy", value: "3.2K", icon: <TrendingUp size={20} />, color: "bg-purple-500" },
    { label: "Categorías", value: 12, icon: <Database size={20} />, color: "bg-orange-500" },
  ];

  // CRUD Operations
  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormData({ name: '', email: '', role: 'Viewer', status: 'active' });
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleSaveUser = () => {
    if (!userFormData.name || !userFormData.email) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userFormData } : u));
    } else {
      // Create new user
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...userFormData
      };
      setUsers([...users, newUser]);
    }
    setIsUserFormOpen(false);
    setEditingUser(null);
  };

  // If a panel is active, show that panel
  if (activePanel) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setActivePanel(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all">
                <X size={20} />
              </button>
              <h1 className="text-xl font-bold text-white">
                {activePanel === 'users' && 'Gestión de Usuarios'}
                {activePanel === 'stats' && 'Estadísticas Detalladas'}
                {activePanel === 'settings' && 'Configuración'}
              </h1>
            </div>
          </div>
        </div>
        <div className="p-6 flex-grow overflow-y-auto no-scrollbar">
          {activePanel === 'users' && (
            <div className="space-y-4">
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                  <Plus size={16} /> Nuevo Usuario
                </button>
              </div>

              {/* User Form Modal */}
              {isUserFormOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                  <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                      <button onClick={() => setIsUserFormOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-zinc-400 mb-1 block">Nombre</label>
                        <input
                          type="text"
                          value={userFormData.name}
                          onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                          placeholder="Nombre completo"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-zinc-400 mb-1 block">Email</label>
                        <input
                          type="email"
                          value={userFormData.email}
                          onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                          placeholder="email@ejemplo.com"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-zinc-400 mb-1 block">Rol</label>
                        <select
                          value={userFormData.role}
                          onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Editor">Editor</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm text-zinc-400 mb-1 block">Estado</label>
                        <select
                          value={userFormData.status}
                          onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                        >
                          <option value="active">Activo</option>
                          <option value="inactive">Inactivo</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsUserFormOpen(false)}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl font-bold transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveUser}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
                      >
                        {editingUser ? 'Actualizar' : 'Crear'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Users List */}
              {users.map(user => (
                <div key={user.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-white">{user.name}</h3>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'Admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {user.role}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-zinc-500'}`}></span>

                  {/* Action Buttons */}
                  <div className="flex gap-2 transition-all">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all"
                      title="Editar"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activePanel === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4 text-white`}>
                      {stat.icon}
                    </div>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h3 className="font-bold text-white mb-4">Visitas por Día (Últimos 7 días)</h3>
                <div className="flex items-end gap-2 h-32">
                  {[65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-purple-500 rounded-t-lg transition-all hover:opacity-80" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-zinc-500">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>
            </div>
          )}
          {activePanel === 'settings' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Settings size={18} /> General</h3>
                <label className="flex items-center justify-between py-3 border-b border-white/5">
                  <span className="text-zinc-300">Notificaciones push</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-blue-600" />
                </label>
                <label className="flex items-center justify-between py-3 border-b border-white/5">
                  <span className="text-zinc-300">Modo oscuro</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-blue-600" />
                </label>
                <label className="flex items-center justify-between py-3">
                  <span className="text-zinc-300">Sonidos</span>
                  <input type="checkbox" className="w-5 h-5 rounded accent-blue-600" />
                </label>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Database size={18} /> Base de Datos</h3>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-300">Estado</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Conectado</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-300">Última sincronización</span>
                  <span className="text-zinc-400 text-sm">Hace 5 min</span>
                </div>
              </div>
              <button className="w-full p-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all">
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-zinc-500">Gestiona los lugares y usuarios</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen && setIsOpen(false)}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 flex-grow overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer" onClick={() => setActivePanel('stats')}>
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3 text-white`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={onAddLugar} className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-3 transition-all">
              <Plus size={20} />
              <span>Nuevo Lugar</span>
            </button>
            <button onClick={() => setActivePanel('users')} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center gap-3 transition-all border border-white/5">
              <Users size={20} />
              <span>Ver Usuarios</span>
            </button>
            <button onClick={() => setActivePanel('stats')} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center gap-3 transition-all border border-white/5">
              <BarChart3 size={20} />
              <span>Estadísticas</span>
            </button>
            <button onClick={() => setActivePanel('settings')} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center gap-3 transition-all border border-white/5">
              <Settings size={20} />
              <span>Configuración</span>
            </button>
          </div>
        </div>

        {/* Recent Places Table */}
        <div>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Lugares Recientes</h2>
          <div className="space-y-2">
            {(lugares.length > 0 ? lugares : MOCK_PLACES).slice(0, 8).map((lugar) => (
              <div key={lugar.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                  {lugar.imagen ? (
                    <img src={lugar.imagen} className="w-full h-full object-cover" alt={lugar.nombre} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><MapPin className="text-zinc-600" size={20} /></div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-semibold text-white truncate">{lugar.nombre}</h3>
                  <p className="text-xs text-zinc-500">{lugar.categoria}</p>
                </div>
                <RatingBadge rating={lugar.rating} />
                {onDeleteLugar && (
                  <button
                    onClick={() => onDeleteLugar(lugar.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- BUSINESS DASHBOARD COMPONENT ---
const BusinessDashboard = ({ lugares, onAddLugar, setIsOpen }) => {
  const [activePanel, setActivePanel] = useState(null);
  const [myPlaces, setMyPlaces] = useState(lugares.slice(0, 3));
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationFormData, setLocationFormData] = useState({
    nombre: '',
    categoria: '',
    descripcion: '',
    status: 'active'
  });

  const stats = [
    { label: "Mis Lugares", value: myPlaces.length || 0, icon: <MapPin size={20} />, color: "bg-purple-500" },
    { label: "Vistas Totales", value: "2.4K", icon: <TrendingUp size={20} />, color: "bg-blue-500" },
    { label: "Reseñas", value: 48, icon: <Star size={20} />, color: "bg-yellow-500" },
    { label: "Clicks", value: 156, icon: <Navigation size={20} />, color: "bg-green-500" },
  ];

  // CRUD Operations
  const handleCreateLocation = () => {
    setEditingLocation(null);
    setLocationFormData({ nombre: '', categoria: '', descripcion: '', status: 'active' });
    setIsLocationFormOpen(true);
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setLocationFormData({
      nombre: location.nombre,
      categoria: location.categoria || '',
      descripcion: location.descripcion || '',
      status: 'active'
    });
    setIsLocationFormOpen(true);
  };

  const handleDeleteLocation = (locationId) => {
    if (window.confirm('¿Estás seguro de eliminar esta ubicación?')) {
      setMyPlaces(myPlaces.filter(l => l.id !== locationId));
    }
  };

  const handleSaveLocation = () => {
    if (!locationFormData.nombre) {
      alert('Por favor completa el nombre de la ubicación');
      return;
    }

    if (editingLocation) {
      setMyPlaces(myPlaces.map(l => l.id === editingLocation.id ? { ...l, ...locationFormData } : l));
    } else {
      const newLocation = {
        id: Date.now(),
        ...locationFormData,
        imagen: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600'
      };
      setMyPlaces([...myPlaces, newLocation]);
    }
    setIsLocationFormOpen(false);
    setEditingLocation(null);
  };

  if (activePanel === 'analytics') {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setActivePanel(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all">
              <X size={20} />
            </button>
            <h1 className="text-xl font-bold text-white">Analíticas de Mi Negocio</h1>
          </div>
        </div>
        <div className="p-6 flex-grow overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {stats.map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3 text-white`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
            <h3 className="font-bold text-white mb-4">Vistas por Semana</h3>
            <div className="flex items-end gap-2 h-32">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-500">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 rounded-xl">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mi Negocio</h1>
              <p className="text-sm text-zinc-500">Gestiona tus ubicaciones</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen && setIsOpen(false)}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-6 flex-grow overflow-y-auto no-scrollbar">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:border-white/10 transition-all" onClick={() => setActivePanel('analytics')}>
              <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center mb-2 text-white`}>
                {stat.icon}
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Acciones</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleCreateLocation} className="p-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-3 transition-all">
              <Plus size={20} />
              <span>Agregar Ubicación</span>
            </button>
            <button onClick={() => setActivePanel('analytics')} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center gap-3 transition-all border border-white/5">
              <BarChart3 size={20} />
              <span>Ver Analíticas</span>
            </button>
          </div>
        </div>

        {/* Location Form Modal */}
        {isLocationFormOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}</h3>
                <button onClick={() => setIsLocationFormOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Nombre del Lugar</label>
                  <input
                    type="text"
                    value={locationFormData.nombre}
                    onChange={(e) => setLocationFormData({ ...locationFormData, nombre: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-purple-500"
                    placeholder="Ej: Mi Restaurante"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Categoría</label>
                  <input
                    type="text"
                    value={locationFormData.categoria}
                    onChange={(e) => setLocationFormData({ ...locationFormData, categoria: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-purple-500"
                    placeholder="Ej: Restaurante, Café, Tienda"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Descripción</label>
                  <textarea
                    value={locationFormData.descripcion}
                    onChange={(e) => setLocationFormData({ ...locationFormData, descripcion: e.target.value })}
                    rows="3"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-purple-500 resize-none"
                    placeholder="Describe tu negocio..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsLocationFormOpen(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveLocation}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all"
                >
                  {editingLocation ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Places */}
        <div>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Mis Ubicaciones</h2>
          <div className="space-y-2">
            {myPlaces.map((lugar) => (
              <div key={lugar.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                  {lugar.imagen ? (
                    <img src={lugar.imagen} className="w-full h-full object-cover" alt={lugar.nombre} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><MapPin className="text-zinc-600" size={20} /></div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-semibold text-white truncate">{lugar.nombre}</h3>
                  <p className="text-xs text-zinc-500">{lugar.categoria || 'Sin categoría'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold">Activo</span>
                  <button
                    onClick={() => handleEditLocation(lugar)}
                    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all"
                    title="Editar"
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(lugar.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {myPlaces.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500">No tienes ubicaciones todavía</p>
              <button onClick={handleCreateLocation} className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all">
                Agregar Primera Ubicación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SKELETON SCREEN COMPONENT ---
const SkeletonScreen = () => (
  <div className="absolute inset-0 p-6 animate-pulse">
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 bg-white/10 rounded-2xl"></div>
      <div className="flex-1">
        <div className="h-6 bg-white/10 rounded-lg w-48 mb-2"></div>
        <div className="h-4 bg-white/5 rounded-lg w-32"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 rounded-2xl bg-white/5">
          <div className="w-10 h-10 bg-white/10 rounded-xl mb-3"></div>
          <div className="h-6 bg-white/10 rounded-lg w-16 mb-2"></div>
          <div className="h-3 bg-white/5 rounded-lg w-20"></div>
        </div>
      ))}
    </div>
    <div className="h-4 bg-white/5 rounded-lg w-32 mb-4"></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 bg-white/5 rounded-2xl"></div>
      ))}
    </div>
    <div className="h-4 bg-white/5 rounded-lg w-40 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
          <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-5 bg-white/10 rounded-lg w-32 mb-2"></div>
            <div className="h-3 bg-white/5 rounded-lg w-20"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Sidebar = ({
  lugares = [],
  filteredLugares = [],
  searchTerm = "",
  setSearchTerm,
  onLugarClick,
  isOpen = true,
  setIsOpen,
  onAddLugar,
  onDeleteLugar,
  userRole = 'user'
}) => {
  const [localSearch, setLocalSearch] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevRole, setPrevRole] = useState(userRole);
  const isAdmin = userRole === 'admin';
  const isBusiness = userRole === 'business';
  const isUser = userRole === 'user';

  // Two-phase transition: exit current sidebar, then enter new one
  React.useEffect(() => {
    if (prevRole !== userRole && isOpen) {
      // Phase 1: Exit current sidebar (700ms)
      setIsTransitioning(true);

      // Phase 2: Enter new sidebar after exit completes
      const enterTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 700); // Match animation duration

      setPrevRole(userRole);
      return () => clearTimeout(enterTimer);
    }
    setPrevRole(userRole);
  }, [userRole, prevRole, isOpen]);

  const displayPlaces = filteredLugares.length > 0 ? filteredLugares : MOCK_PLACES;
  const currentSearch = setSearchTerm ? searchTerm : localSearch;
  const handleSearchChange = (value) => {
    if (setSearchTerm) setSearchTerm(value);
    else setLocalSearch(value);
  };

  const handlePlaceClick = (lugar) => {
    setSelectedPlace(lugar);
    if (onLugarClick) onLugarClick(lugar);
  };

  // Clases para sidebar de USUARIO (pequeño, izquierda)
  const userSidebarClasses = `
    absolute z-20 overflow-hidden will-change-transform
    transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]
    top-4 left-4 bottom-4 w-full md:w-[380px]
    flex flex-col rounded-3xl border
    bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-xl border-white/40 dark:border-white/5
    shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
    ${selectedPlace ? '-translate-x-[20px] opacity-50 scale-95 pointer-events-none' : ''}
    ${!isOpen || !isUser ? '-translate-x-[105%] opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
  `;

  // Clases para sidebar de BUSINESS (pantalla completa)
  const businessSidebarClasses = `
    absolute z-20 overflow-hidden will-change-transform
    transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]
    top-4 left-4 right-4 bottom-4
    flex flex-col rounded-3xl border
    bg-zinc-900/95 backdrop-blur-xl border-purple-500/20
    shadow-[0_8px_32px_rgba(139,92,246,0.2)]
    ${!isOpen || !isBusiness ? '-translate-x-[105%] opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
  `;

  // Clases para sidebar de ADMIN (pantalla completa)
  const adminSidebarClasses = `
    absolute z-20 overflow-hidden will-change-transform
    transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]
    top-4 left-4 right-4 bottom-4
    flex flex-col rounded-3xl border
    bg-zinc-900/95 backdrop-blur-xl border-white/10
    shadow-[0_8px_32px_rgba(0,0,0,0.5)]
    ${!isOpen || !isAdmin ? '-translate-x-[105%] opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
  `;

  return (
    <>
      {/* Botón flotante para abrir - con animación fade */}
      <button
        onClick={() => setIsOpen && setIsOpen(true)}
        className={`fixed top-6 left-6 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/20 hover:scale-110 transition-all duration-500
          ${isOpen && !isTransitioning ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}`}
      >
        <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>

      {/* USER SIDEBAR (pequeño, izquierda) */}
      <div className={userSidebarClasses}>
        {/* Header */}
        <div className="p-5 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Explorar</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsOpen && setIsOpen(false)} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" title="Cerrar sidebar">
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/10 focus:bg-white dark:focus:bg-[#2C2C2E] border-0 rounded-xl py-3 pl-10 pr-4 text-gray-800 dark:text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Contenido scrollable (User Mode) */}
        <div className="flex-grow overflow-y-auto px-3 pb-4 no-scrollbar">
          <div className="mb-6 mt-2">
            <div className="flex items-center justify-between px-2 mb-3">
              <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Ticket size={14} className="text-blue-500" />
                Destacados
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-3 px-3 no-scrollbar">
              {EVENTOS_DESTACADOS.map(event => (
                <div key={event.id} className="relative w-28 h-40 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 border border-black/5 dark:border-white/5">
                  <img src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-white border border-white/20">
                    {event.date.split(',')[0]}
                  </div>
                  <div className="absolute bottom-3 left-2 right-2">
                    <p className="text-[10px] font-medium text-blue-300 truncate">{event.location}</p>
                    <p className="text-white text-xs font-bold leading-tight mt-0.5 line-clamp-2">{event.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-2">Cerca de ti</h2>
          <div className="space-y-3">
            {displayPlaces.map((lugar) => (
              <div key={lugar.id} onClick={() => handlePlaceClick(lugar)} className="group flex gap-3 p-3 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-gray-100 dark:hover:border-white/5 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 relative">
                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0 relative bg-gray-200 dark:bg-gray-700">
                  {lugar.imagen ? (
                    <img src={lugar.imagen} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={lugar.nombre} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><MapPin className="w-8 h-8 text-gray-400" /></div>
                  )}
                </div>
                <div className="flex flex-col flex-grow min-w-0 justify-center">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate pr-2">{lugar.nombre}</h3>
                    <RatingBadge rating={lugar.rating} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{lugar.categoria}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{lugar.descripcion}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Disponible</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ADMIN DASHBOARD (pantalla completa) */}
      <div className={adminSidebarClasses}>
        <AdminDashboard
          lugares={displayPlaces}
          onAddLugar={onAddLugar}
          onDeleteLugar={onDeleteLugar}
          setIsOpen={setIsOpen}
        />
      </div>

      {/* BUSINESS DASHBOARD (pantalla completa) */}
      <div className={businessSidebarClasses}>
        <BusinessDashboard
          lugares={displayPlaces}
          onAddLugar={onAddLugar}
          setIsOpen={setIsOpen}
        />
      </div>

      {/* PANEL DE DETALLE (Solo en User Mode) */}
      {!isAdmin && !isBusiness && selectedPlace && (
        <div className="absolute z-30 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] top-4 left-2 right-2 bottom-4 w-auto md:w-[380px] md:left-[420px] md:right-auto rounded-3xl border bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl border-white/40 dark:border-white/5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)]">
          <button onClick={() => setSelectedPlace(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full text-gray-500 dark:text-gray-200 transition-colors backdrop-blur-md">
            <X size={20} />
          </button>
          <div className="relative h-56 w-full flex-shrink-0 rounded-t-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            {selectedPlace.imagen ? (
              <img src={selectedPlace.imagen} className="w-full h-full object-cover" alt={selectedPlace.nombre} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
            )}
            <div className="absolute bottom-4 left-5 right-5 z-20 text-white">
              <h1 className="text-3xl font-bold mb-1 tracking-tight">{selectedPlace.nombre}</h1>
              <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                <span>{selectedPlace.categoria}</span>
                <div className="flex items-center bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg ml-2">
                  <Star size={12} className="fill-white text-white mr-1" />
                  <span>{selectedPlace.rating || 4.5}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto p-6">
            <div className="grid grid-cols-4 gap-3 mb-8">
              <ActionButton icon={<Navigation />} label="Ir" primary />
              <ActionButton icon={<Phone />} label="Llamar" />
              <ActionButton icon={<Globe />} label="Web" />
              <ActionButton icon={<MoreHorizontal />} label="Más" />
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 flex gap-4 items-center">
                <MapPin className="text-blue-500" size={24} />
                <div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium text-sm">{selectedPlace.descripcion || 'Información del lugar'}</p>
                  <p className="text-gray-400 text-xs">A 2.5 km • 12 min en auto</p>
                </div>
              </div>
              {selectedPlace.horario && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 flex gap-4 items-center">
                  <Clock className="text-green-500" size={24} />
                  <div>
                    <p className="text-green-600 dark:text-green-400 font-medium text-sm">Abierto ahora</p>
                    <p className="text-gray-400 text-xs">{selectedPlace.horario}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default Sidebar;
