require("@testing-library/jest-dom");

// Polyfill para TextEncoder/TextDecoder (necessário para Next.js)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
