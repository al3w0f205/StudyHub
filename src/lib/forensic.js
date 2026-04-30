// =============================================================================
// StudyHub — Utilidad de Marca de Agua Forense (Anti-Piratería)
// =============================================================================
// Implementa un sistema de marca de agua invisible usando Zero-Width Characters (ZWC).
// Si un usuario comparte o filtra las preguntas, podemos decodificar el texto
// filtrado para identificar QUIÉN lo compartió.
//
// MECANISMO:
//   - Cada carácter del userId se convierte a su representación binaria (8 bits).
//   - Bit "0" → Zero-Width Space       (U+200B) — invisible en pantalla
//   - Bit "1" → Zero-Width Non-Joiner   (U+200C) — invisible en pantalla
//   - Separador final → Zero-Width Joiner (U+200D) — marca el fin de la secuencia
//   - La secuencia se inyecta después de la primera palabra del texto.
//
// EJEMPLO:
//   userId "ab" → binario: "01100001 01100010"
//   → ZWC: [‌‌​‌‌​​‌][‌‌​‌‌​‌​]‍
//   → Se inserta invisible después de la primera palabra de la pregunta.
//
// USO:
//   - encodeForensic(text, userId) → texto con marca de agua invisible
//   - decodeForensic(text)         → userId extraído del texto filtrado
//
// APLICACIÓN:
//   Se usa en src/app/(app)/quiz/[categoryId]/page.js para marcar:
//   - El texto de cada pregunta
//   - La explicación de cada pregunta
// =============================================================================

/**
 * Codifica un userId como caracteres Zero-Width e inyecta en el texto.
 *
 * @param {string} text - Texto original (pregunta, explicación, etc.)
 * @param {string} userId - ID del usuario a codificar como marca de agua
 * @returns {string} Texto con marca de agua invisible inyectada
 */
export function encodeForensic(text, userId) {
  if (!text || !userId) return text;

  // Paso 1: Convertir cada carácter del userId a su representación binaria de 8 bits
  const binary = userId.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join('');

  // Paso 2: Mapear cada bit a su carácter Zero-Width correspondiente
  // + agregar el separador final (U+200D)
  const encoded = binary.split('').map(bit => {
    return bit === '0' ? '\u200B' : '\u200C';
  }).join('') + '\u200D';

  // Paso 3: Inyectar después de la primera palabra (posición estable y predecible)
  const words = text.split(' ');
  if (words.length > 1) {
    words[0] = words[0] + encoded;
    return words.join(' ');
  }
  
  // Si el texto es una sola palabra, agregar al final
  return text + encoded;
}

/**
 * Extrae el userId codificado de un texto con marca de agua forense.
 * Útil para investigar filtraciones de contenido.
 *
 * @param {string} text - Texto que potencialmente contiene una marca de agua
 * @returns {string|null} userId decodificado, o null si no se encontró marca
 */
export function decodeForensic(text) {
  // Buscar la secuencia de ZWC seguida del separador U+200D
  const match = text.match(/[\u200B\u200C]+\u200D/);
  if (!match) return null;

  // Extraer solo los bits (sin el separador final)
  const encoded = match[0].replace('\u200D', '');

  // Convertir ZWC de vuelta a binario
  const binary = encoded.split('').map(char => {
    return char === '\u200B' ? '0' : '1';
  }).join('');

  // Convertir binario a caracteres ASCII (8 bits por carácter)
  const chars = [];
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    chars.push(String.fromCharCode(parseInt(byte, 2)));
  }

  return chars.join('');
}
