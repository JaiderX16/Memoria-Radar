import React, { useState, useMemo } from 'react';
import Mapa from './components/Mapa';
import Sidebar from './components/Sidebar';
import FormularioLugar from './components/FormularioLugar';
import { lugares as lugaresIniciales } from './data/lugares';

function App() {
  const [lugares, setLugares] = useState(lugaresIniciales);
  const [selectedLugar, setSelectedLugar] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newLugarCoords, setNewLugarCoords] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddingMode, setIsAddingMode] = useState(false);

  // Filter lugares based on search term and category
  const filteredLugares = useMemo(() => {
    let filtered = lugares;
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(lugar =>
        lugar.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lugar.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(lugar => lugar.categoria === selectedCategory);
    }
    
    return filtered;
  }, [searchTerm, selectedCategory, lugares]);



  const handleLugarClick = (lugar) => {
    setSelectedLugar(lugar);
    // No abrimos el modal aquí, solo seleccionamos el lugar
  };

  const handleAddLugar = () => {
    setIsAddingMode(true);
  };

  const handleMapClick = (latlng) => {
    setNewLugarCoords({ lat: latlng.lat, lng: latlng.lng });
    setIsAddingMode(false);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setNewLugarCoords(null);
    setIsAddingMode(false);
  };

  const handleSubmitLugar = (nuevoLugar) => {
    setLugares(prev => [...prev, nuevoLugar]);
  };

  const handleDeleteLugar = (lugarId) => {
    setLugares(prev => prev.filter(lugar => lugar.id !== lugarId));
    // Si el lugar eliminado estaba seleccionado, limpiar la selección
    if (selectedLugar && selectedLugar.id === lugarId) {
      setSelectedLugar(null);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        lugares={lugares}
        filteredLugares={filteredLugares}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onLugarClick={handleLugarClick}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onAddLugar={handleAddLugar}
        onDeleteLugar={handleDeleteLugar}
      />

      {/* Main content - Map */}
      <div className="flex-1 relative">
        <Mapa
          lugares={filteredLugares}
          selectedLugar={selectedLugar}
          onMapClick={handleMapClick}
          isAddingMode={isAddingMode}
        />
      </div>

      

      {/* Form Modal */}
      <FormularioLugar
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmitLugar}
        initialCoords={newLugarCoords}
      />
    </div>
  );
}

export default App; //poruqe no