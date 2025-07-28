import { GoogleGenAI } from '@google/genai';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions';
import { onObjectFinalized } from 'firebase-functions/storage';

export const processFile = onObjectFinalized({cpu: 2,region: 'europe-central2', memory: '1GiB',  secrets: ['GEMINI_API_KEY']}, async (event) => {
  const fileName = event.data.name;
  const contentType = event.data.contentType;

  if (!fileName.startsWith('users/') || !fileName.includes('/uploads/')) {
    logger.info(`Ignoring file in non-upload path: ${fileName}`);
    return;
  }

  const pathParts = fileName.split('/');
  const userId = pathParts[1];
  const bucket = getStorage().bucket();
  const file = bucket.file(fileName);

  try {
    const [fileBuffer] = await file.download();
    const base64Data = fileBuffer.toString('base64');
    const extension = fileName.split('.').pop();
    const uploadDate = event.data.timeCreated;

    const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

    const prompt = `Twoim zadaniem jest analiza załączonego dokumentu, który jest polską fakturą. Wyodrębnij z niego wyłącznie poniższe informacje i zwróć je jako pojedynczy, surowy obiekt JSON, używając notacji camelCase.\n\nSCHEMAT JSON:\n{\n  "sellerTaxId": "string",  // NIP sprzedawcy, format bez myślników (np. "1234567890")\n  "documentNumber": "string", // Pełny numer faktury\n  "invoiceDate": "string"   // Data sprzedaży lub wystawienia w formacie YYYY-MM-DD\n}\n\nZASADY:\n1.  **Zwróć TYLKO i wyłącznie obiekt JSON.**\n2.  **Nie dodawaj żadnego tekstu przed ani po obiekcie JSON.**\n3.  **Nie używaj formatowania markdown** (np. \`\`\`json).\n4.  Jeśli którejś z wartości nie można odnaleźć w dokumencie, użyj dla niej wartości \`null\`.\n5.  Upewnij się, że format daty to \`YYYY-MM-DD\`.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: contentType!, data: base64Data } }
          ]
        }
      ]
    });

    const analysisResult = response.text;
    if (!analysisResult) {
      throw new Error('AI model returned no text.');
    }

    // @ts-ignore
    const jsonMatch = analysisResult.match(/\{.*\}/s);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON object from model response.');
    }

    let extractedData;
    try {
      extractedData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      throw new Error('Failed to parse extracted JSON.');
    }

    const { sellerTaxId, documentNumber, invoiceDate } = extractedData as any;

    // --- Duplicate Check ---
    const db = getFirestore();
    const invoicesRef = db.collection('users').doc(userId).collection('invoices');
    const q = invoicesRef
      .where('sellerTaxId', '==', sellerTaxId)
      .where('documentNumber', '==', documentNumber)
      .where('invoiceDate', '==', invoiceDate);

    const querySnapshot = await q.get();

    if (!querySnapshot.empty) {
      const existingDoc = querySnapshot.docs[0];
      logger.warn(`Duplicate invoice detected. Original doc ID: ${existingDoc.id}`);

      const originalFileName = fileName.split('/').pop();
      const duplicatePath = `users/${userId}/duplicates/${originalFileName}`;
      await file.move(duplicatePath);

      await invoicesRef.add({
        status: 'duplicate',
        originalFilePath: fileName,
        duplicateFilePath: duplicatePath,
        processedAt: new Date().toISOString(),
        duplicateOf: existingDoc.id
      });
      return; // Stop processing
    }
    // --- End of Duplicate Check ---

    const formattedDate = invoiceDate || 'BRAK_DATY';
    const safeTaxId = (sellerTaxId || 'BRAK_NIP').replace(/[^a-zA-Z0-9]/g, '');
    const safeDocNumber = (documentNumber || 'BRAK_NUMERU').replace(/[^a-zA-Z0-9-]/g, '_');
    const newFileName = `${formattedDate}_${safeTaxId}_${safeDocNumber}.${extension}`;

    const destinationPath = `users/${userId}/processed/${newFileName}`;
    await file.move(destinationPath);

    const invoiceData = {
      sellerTaxId,
      documentNumber,
      invoiceDate,
      uploadDate,
      processedDate: FieldValue.serverTimestamp(),
      originalFilePath: fileName,
      filePath: newFileName,
      processedAt: new Date().toISOString(),
      status: 'processed'
    };

    const docRef = await invoicesRef.add(invoiceData);
    logger.info(`Invoice data saved for user ${userId} with ID: ${docRef.id}`);

  } catch (error) {
    logger.error('Error processing file:', error);

    const originalFileName = fileName.split('/').pop();
    const failedPath = `users/${userId}/failed/${originalFileName}`;
    await file.move(failedPath);

    const db = getFirestore();
    await db.collection('users').doc(userId).collection('invoices').add({
      status: 'failed',
      originalFilePath: fileName,
      failedFilePath: failedPath,
      error: (error as Error).message,
      processedAt: new Date().toISOString(),
    });
  }
});