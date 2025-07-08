import { initializeApp } from 'firebase-admin/app';
import { processInvoice } from './features/process-file/process-file.js';

export const app = initializeApp();

export { processInvoice };
