/**
 * 🧪 PRUEBAS - Validación Geográfica
 * Ejecuta con: node test-geographic-validation.js
 */

const {
  isLocationInCundinamarca,
  isInUniversityZone,
  validateUniversityEntrance,
  validateRouteWithUniversityRules,
  validatePickupLocation,
  getUniversityEntrances,
  getCundinamarcaBounds
} = require('./src/utils/geographicUtils');

console.log('🗺️  PRUEBAS DE VALIDACIÓN GEOGRÁFICA\n');

// ============================================
// TEST 1: Validar ubicaciones en Cundinamarca
// ============================================
console.log('TEST 1: Validar ubicaciones en Cundinamarca');
console.log('='.repeat(50));

const testLocationsBogota = {
  name: 'Centro de Bogotá',
  lat: 4.7110,
  lng: -74.0055
};

const testLocationQuito = {
  name: 'Quito (fuera)',
  lat: 0.2193,
  lng: -78.5123
};

const result1 = isLocationInCundinamarca(testLocationsBogota);
console.log(`✓ Bogotá: ${result1.valid ? 'VÁLIDA' : 'INVÁLIDA'}`);
console.log(`  Mensaje: ${result1.message}`);

const result2 = isLocationInCundinamarca(testLocationQuito);
console.log(`✗ Quito: ${result2.valid ? 'VÁLIDA' : 'INVÁLIDA'}`);
console.log(`  Mensaje: ${result2.message}`);

// ============================================
// TEST 2: Validar zona de la Universidad
// ============================================
console.log('\n\nTEST 2: Validar zona de la Universidad');
console.log('='.repeat(50));

const entradaPrincipal = {
  name: 'Entrada Principal Universidad',
  lat: 4.7208,
  lng: -74.0555
};

const puntoAleatorioEnCampus = {
  name: 'Punto aleatorio en Campus',
  lat: 4.7230,
  lng: -74.0500
};

const entranceValidation1 = validateUniversityEntrance(entradaPrincipal);
console.log(`✓ Entrada Principal:`);
console.log(`  Válida: ${entranceValidation1.isValidEntrance}`);
console.log(`  Mensaje: ${entranceValidation1.message}`);

const entranceValidation2 = validateUniversityEntrance(puntoAleatorioEnCampus);
console.log(`✗ Punto Aleatorio:`);
console.log(`  Válida: ${entranceValidation2.isValidEntrance}`);
console.log(`  Mensaje: ${entranceValidation2.message}`);

// ============================================
// TEST 3: Validar rutas completas
// ============================================
console.log('\n\nTEST 3: Validar rutas completas');
console.log('='.repeat(50));

const rutaValida = {
  origin: { name: 'Centro', lat: 4.7000, lng: -74.0600 },
  destination: { name: 'Centro Comercial', lat: 4.6500, lng: -74.0700 }
};

const rutaAUniversidad = {
  origin: { name: 'Centro', lat: 4.7000, lng: -74.0600 },
  destination: { name: 'Universidad', lat: 4.7208, lng: -74.0555 }
};

const rutaDesdeUniversidad = {
  origin: { name: 'Universidad', lat: 4.7158, lng: -74.0555 },
  destination: { name: 'Centro', lat: 4.6000, lng: -74.0800 }
};

const rutaFueraDeUniversidad = {
  origin: { name: 'Centro', lat: 4.7000, lng: -74.0600 },
  destination: { name: 'Punto aleatorio en U', lat: 4.7230, lng: -74.0500 }
};

const rutaFueraDeCundinamarca = {
  origin: { name: 'Bogotá', lat: 4.7110, lng: -74.0055 },
  destination: { name: 'Quito', lat: 0.2193, lng: -78.5123 }
};

const validation1 = validateRouteWithUniversityRules(rutaValida.origin, rutaValida.destination);
console.log(`✓ Ruta Normal (Centro → Centro Comercial):`);
console.log(`  Válida: ${validation1.valid}`);
console.log(`  Errores: ${validation1.errors.length === 0 ? 'Ninguno' : validation1.errors.join(', ')}`);

const validation2 = validateRouteWithUniversityRules(rutaAUniversidad.origin, rutaAUniversidad.destination);
console.log(`✓ Ruta a Universidad (Centro → Entrada U):`);
console.log(`  Válida: ${validation2.valid}`);
console.log(`  Errores: ${validation2.errors.length === 0 ? 'Ninguno' : validation2.errors.join(', ')}`);

const validation3 = validateRouteWithUniversityRules(rutaDesdeUniversidad.origin, rutaDesdeUniversidad.destination);
console.log(`✓ Ruta desde Universidad (Entrada U → Centro):`);
console.log(`  Válida: ${validation3.valid}`);
console.log(`  Errores: ${validation3.errors.length === 0 ? 'Ninguno' : validation3.errors.join(', ')}`);

const validation4 = validateRouteWithUniversityRules(rutaFueraDeUniversidad.origin, rutaFueraDeUniversidad.destination);
console.log(`✗ Ruta a punto aleatorio en U (Centro → Punto Aleatorio):`);
console.log(`  Válida: ${validation4.valid}`);
console.log(`  Errores: ${validation4.errors.join(', ')}`);

const validation5 = validateRouteWithUniversityRules(rutaFueraDeCundinamarca.origin, rutaFueraDeCundinamarca.destination);
console.log(`✗ Ruta fuera de Cundinamarca (Bogotá → Quito):`);
console.log(`  Válida: ${validation5.valid}`);
console.log(`  Errores: ${validation5.errors.join(', ')}`);

// ============================================
// TEST 4: Validar punto de recogida
// ============================================
console.log('\n\nTEST 4: Validar punto de recogida');
console.log('='.repeat(50));

const rutaNormal = {
  origin: { lat: 4.7000, lng: -74.0600 },
  destination: { lat: 4.6500, lng: -74.0700 }
};

const recogidaValida = { name: 'Casa', lat: 4.6800, lng: -74.0500 };
const recogidaEnU = { name: 'En la U', lat: 4.7230, lng: -74.0500 };
const recogidaEnEntrada = { name: 'Entrada de la U', lat: 4.7208, lng: -74.0555 };
const recogidaFueraDeCol = { name: 'Ecuador', lat: 0.5000, lng: -78.0000 };

const pickupValidation1 = validatePickupLocation(recogidaValida, rutaNormal.origin, rutaNormal.destination);
console.log(`✓ Recogida en casa: ${pickupValidation1.valid ? 'VÁLIDA' : 'INVÁLIDA'}`);
console.log(`  Mensaje: ${pickupValidation1.message}`);

const pickupValidation2 = validatePickupLocation(recogidaEnU, rutaNormal.origin, rutaNormal.destination);
console.log(`✗ Recogida en punto aleatorio de U: ${pickupValidation2.valid ? 'VÁLIDA' : 'INVÁLIDA'}`);
console.log(`  Mensaje: ${pickupValidation2.message}`);

const pickupValidation3 = validatePickupLocation(recogidaEnEntrada, rutaNormal.origin, rutaNormal.destination);
console.log(`✓ Recogida en entrada de U: ${pickupValidation3.valid ? 'VÁLIDA' : 'INVÁLIDA'}`);
console.log(`  Mensaje: ${pickupValidation3.message}`);

const pickupValidation4 = validatePickupLocation(recogidaFueraDeCol, rutaNormal.origin, rutaNormal.destination);
console.log(`✗ Recogida fuera de Cundinamarca: ${pickupValidation4.valid ? 'VÁLIDA' : 'INVÁLIDA'}`);
console.log(`  Mensaje: ${pickupValidation4.message}`);

// ============================================
// TEST 5: Obtener datos
// ============================================
console.log('\n\nTEST 5: Obtener datos de configuración');
console.log('='.repeat(50));

const entrances = getUniversityEntrances();
console.log(`Entradas de la Universidad: ${entrances.length}`);
entrances.forEach((e) => {
  console.log(`  • ${e.name} (${e.lat}, ${e.lng})`);
});

const bounds = getCundinamarcaBounds();
console.log(`\nLímites de Cundinamarca:`);
console.log(`  Norte: ${bounds.bounds.north}°`);
console.log(`  Sur: ${bounds.bounds.south}°`);
console.log(`  Este: ${bounds.bounds.east}°`);
console.log(`  Oeste: ${bounds.bounds.west}°`);
console.log(`  Centro: (${bounds.center.lat}, ${bounds.center.lng})`);

// ============================================
// RESUMEN
// ============================================
console.log('\n\n' + '='.repeat(50));
console.log('✅ TODAS LAS PRUEBAS COMPLETADAS');
console.log('='.repeat(50));
