import React, { useState, useMemo } from 'react';
import Mapa from './components/Mapa';
import Sidebar from './components/Sidebar';
import FormularioLugar from './components/FormularioLugar';
import { lugares as lugaresIniciales } from './data/lugares';

function App() {
  const [lugares, setLugares] = useState(lugaresIniciales);
  const [selectedLugar, setSelectedLugar] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filter lugares based on search term
  const filteredLugares = useMemo(() => {
    if (!searchTerm.trim()) return lugares;
    
    return lugares.filter(lugar =>
      lugar.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lugar.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, lugares]);



  const handleLugarClick = (lugar) => {
    setSelectedLugar(lugar);
    // No abrimos el modal aquí, solo seleccionamos el lugar
  };

  const handleAddLugar = () => {
    setIsFormOpen(true);
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
        />
      </div>

      

      {/* Form Modal */}
      <FormularioLugar
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitLugar}
      />
    </div>
  );
}

export default App; //poruqe no 