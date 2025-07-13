import { onObjectFinalized } from 'firebase-functions/storage';
import { logger } from 'firebase-functions';
import { GoogleGenAI } from '@google/genai';
import { getStorage } from 'firebase-admin/storage';


export const processFile = onObjectFinalized({cpu: 2,region: 'europe-central2', memory: '1GiB',  secrets: ['GEMINI_API_KEY']}, async (event) => {
  const fileName = event.data.name;
  const contentType = event.data.contentType;
  if(!fileName.includes('users/') || !fileName.includes('uploads/')){
    logger.error(`No file named ${fileName}`);
    return;
  }

  try {
    const bucket = getStorage().bucket(); // Nie podawaj nazwy - użyje domyślnego
    const file = bucket.file(fileName);
    const [fileBuffer] = await file.download();
    const base64Data = fileBuffer.toString('base64');

    const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY!});

    const prompt = `Przeanalizuj ten plik. Powinna to być faktura z Polski. Chcciałbym abys odczytał z niej: NIP sprzedawcy, Date sprzedazy i numer faktury i zwrocil to w formacie json {seller_tax_id, document_number, invoice_date}.`;

    let mimeType = contentType;

    // Wyślij do Gemini
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ]
    });

    const analysisResult = response.text;
    logger.info(`File analysis result for ${fileName}: ${analysisResult}`);
  } catch (error) {
   logger.error(error);
  }

});