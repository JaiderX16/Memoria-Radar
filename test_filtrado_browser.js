// INSTRUCCIONES: Copia y pega este código en la consola del navegador

// Función de diagnóstico específico para el problema de filtrado
function diagnosticarProblemaFiltrado() {
  console.log('🔧 === DIAGNÓSTICO ESPECÍFICO DEL PROBLEMA DE FILTRADO ===');
  
  // 1. Verificar lugares disponibles
  console.log('\n1. 📍 LUGARES DISPONIBLES EN BD:');
  if (window.lugares) {
    console.log('Total lugares:', window.lugares.length);
    window.lugares.forEach((lugar, i) => {
      const normalizado = lugar.nombre?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '');
      console.log(`  ${i+1}. "${lugar.nombre}" -> normalizado: "${normalizado}" (${lugar.categoria})`);
    });
  } else {
    console.log('❌ window.lugares no está disponible');
    return;
  }
  
  // 2. Simular lo que MIA extrae del chat
  console.log('\n2. 🤖 SIMULANDO LO QUE MIA EXTRAE:');
  const lugaresQueMIAMenciona = [
    'Parque Constitución',
    'parque constitucion', // sin acentos
    'PARQUE CONSTITUCIÓN', // mayúsculas
    'Plaza Huamanmarca',
    'plaza huamanmarca'
  ];
  
  lugaresQueMIAMenciona.forEach(mencionado => {
    const normalizado = mencionado?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '');
    console.log(`  MIA menciona: "${mencionado}" -> normalizado: "${normalizado}"`);
  });
  
  // 3. Probar cada variación
  console.log('\n3. 🔍 PROBANDO CADA VARIACIÓN:');
  lugaresQueMIAMenciona.forEach(mencionado => {
    console.log(`\n--- Probando: "${mencionado}" ---`);
    
    // Aplicar filtro
    if (window.globalFilterState) {
      window.globalFilterState.setMentionedPlacesFilter([mencionado]);
      
      // Esperar y verificar
      setTimeout(() => {
        if (window.lugaresFiltrados) {
          console.log(`  Resultado: ${window.lugaresFiltrados.length} lugares filtrados`);
          console.log(`  Nombres: [${window.lugaresFiltrados.map(l => l.nombre).join(', ')}]`);
          
          if (window.lugaresFiltrados.length === 0) {
            console.log('  ❌ NO SE ENCONTRARON COINCIDENCIAS');
            
            // Diagnóstico detallado
            const normalizedMentioned = mencionado?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '');
            console.log(`  Buscando coincidencias para: "${normalizedMentioned}"`);
            
            window.lugares.forEach(lugar => {
              const normalizedLugar = lugar.nombre?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '');
              const includes1 = normalizedLugar.includes(normalizedMentioned);
              const includes2 = normalizedMentioned.includes(normalizedLugar);
              console.log(`    "${lugar.nombre}" ("${normalizedLugar}") -> includes1: ${includes1}, includes2: ${includes2}`);
            });
          } else {
            console.log('  ✅ COINCIDENCIAS ENCONTRADAS');
          }
        }
      }, 500);
    }
  });
}

// Función para probar caso específico
function probarCasoEspecifico() {
  console.log('\n🎯 === PROBANDO CASO ESPECÍFICO ===');
  
  // Caso: MIA menciona "Parque Constitución"
  const mencionado = 'Parque Constitución';
  console.log(`MIA menciona: "${mencionado}"`);
  
  if (window.globalFilterState) {
    window.globalFilterState.setMentionedPlacesFilter([mencionado]);
    
    setTimeout(() => {
      console.log('\nResultado del filtrado:');
      if (window.lugaresFiltrados) {
        console.log(`Lugares filtrados: ${window.lugaresFiltrados.length}`);
        console.log(`Nombres: [${window.lugaresFiltrados.map(l => l.nombre).join(', ')}]`);
        
        // Verificar si "Parque Constitución" está en los resultados
        const encontrado = window.lugaresFiltrados.find(l => l.nombre === 'Parque Constitución');
        if (encontrado) {
          console.log('✅ "Parque Constitución" SÍ aparece en los resultados filtrados');
        } else {
          console.log('❌ "Parque Constitución" NO aparece en los resultados filtrados');
          console.log('🔍 Esto confirma el problema reportado por el usuario');
        }
      }
    }, 500);
  }
}

// Función para resetear filtros
function resetearFiltros() {
  console.log('🔄 Reseteando filtros...');
  if (window.globalFilterState) {
    window.globalFilterState.setMentionedPlacesFilter([]);
    console.log('✅ Filtros reseteados');
  }
}

// Ejecutar diagnóstico automáticamente
console.log('🚀 Iniciando diagnóstico específico del problema...');
diagnosticarProblemaFiltrado();

// Ejecutar caso específico después de un momento
setTimeout(() => {
  probarCasoEspecifico();
}, 3000);

console.log('\n💡 Tip: Ejecuta resetearFiltros() para limpiar los filtros');