/**
 * StudyHub Forensic Security Utility
 * Uses Zero-Width Characters to hide user identity within text.
 * \u200B = 0, \u200C = 1, \u200D = separator
 */

export function encodeForensic(text, userId) {
  if (!text || !userId) return text;

  // Convert userId to binary-like zero-width sequence
  const binary = userId.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join('');

  const encoded = binary.split('').map(bit => {
    return bit === '0' ? '\u200B' : '\u200C';
  }).join('') + '\u200D';

  // Inject at a random-ish but stable position (e.g., after the first word)
  const words = text.split(' ');
  if (words.length > 1) {
    words[0] = words[0] + encoded;
    return words.join(' ');
  }
  
  return text + encoded;
}

export function decodeForensic(text) {
  const match = text.match(/[\u200B\u200C]+\u200D/);
  if (!match) return null;

  const encoded = match[0].replace('\u200D', '');
  const binary = encoded.split('').map(char => {
    return char === '\u200B' ? '0' : '1';
  }).join('');

  const chars = [];
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    chars.push(String.fromCharCode(parseInt(byte, 2)));
  }

  return chars.join('');
}
