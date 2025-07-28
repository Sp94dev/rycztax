import { initializeApp } from 'firebase-admin/app';
import { processFile } from './features/process-file/process-file.js';



// Inicjalizacja Firebase Admin
initializeApp();

export { processFile };