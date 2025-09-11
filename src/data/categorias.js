export const categorias = [
  { id: 'monumentos', nombre: 'Monumentos', icon: '🏛️', color: '#3B82F6' },
  { id: 'parques', nombre: 'Parques', icon: '🌳', color: '#10B981' },
  { id: 'restaurantes', nombre: 'Restaurantes', icon: '🍽️', color: '#EF4444' },
  { id: 'hoteles', nombre: 'Hoteles', icon: '🏨', color: '#8B5CF6' },
  { id: 'discotecas', nombre: 'Discotecas', icon: '🎵', color: '#EC4899' },
  { id: 'playas', nombre: 'Playas', icon: '🏖️', color: '#06B6D4' },
  { id: 'mercados', nombre: 'Mercados', icon: '🛒', color: '#F97316' },
  { id: 'museos', nombre: 'Museos', icon: '🎨', color: '#6366F1' },
  { id: 'bares', nombre: 'Bares', icon: '🍺', color: '#EAB308' },
  { id: 'tiendas', nombre: 'Tiendas', icon: '🛍️', color: '#F59E0B' },
  { id: 'otros', nombre: 'Otros', icon: '📍', color: '#6B7280' }
];

export const colores = [
  { id: 'blue', nombre: 'Azul', hex: '#3B82F6' },
  { id: 'red', nombre: 'Rojo', hex: '#EF4444' },
  { id: 'green', nombre: 'Verde', hex: '#10B981' },
  { id: 'purple', nombre: 'Morado', hex: '#8B5CF6' },
  { id: 'orange', nombre: 'Naranja', hex: '#F97316' },
  { id: 'pink', nombre: 'Rosa', hex: '#EC4899' },
  { id: 'cyan', nombre: 'Cian', hex: '#06B6D4' },
  { id: 'indigo', nombre: 'Índigo', hex: '#6366F1' },
  { id: 'yellow', nombre: 'Amarillo', hex: '#EAB308' },
  { id: 'gray', nombre: 'Gris', hex: '#6B7280' }
];

export const getCategoriaById = (id) => {
  return categorias.find(c => c.id === id) || categorias.find(c => c.id === 'otros');
};