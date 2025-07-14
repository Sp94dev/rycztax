import { GoogleGenAI } from '@google/genai';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions';
import { onObjectFinalized } from 'firebase-functions/storage';


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
    const extension = fileName.split('.').pop();
    const uploadDate = event.data.timeCreated;
    const pathParts = fileName.split('/');
    const userId = pathParts[1];

    const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY!});

    const prompt = `woim zadaniem jest analiza załączonego dokumentu, który jest polską fakturą. Wyodrębnij z niego wyłącznie poniższe informacje i zwróć je jako pojedynczy, surowy obiekt JSON.

SCHEMAT JSON:
{
  "seller_tax_id": "string",  // NIP sprzedawcy, format bez myślników (np. "1234567890")
  "document_number": "string", // Pełny numer faktury
  "invoice_date": "string"   // Data sprzedaży lub wystawienia w formacie YYYY-MM-DD
}

ZASADY:
1.  **Zwróć TYLKO i wyłącznie obiekt JSON.**
2.  **Nie dodawaj żadnego tekstu przed ani po obiekcie JSON.**
3.  **Nie używaj formatowania markdown** (np. \`\`\`json).
4.  Jeśli którejś z wartości nie można odnaleźć w dokumencie, użyj dla niej wartości \`null\`.
5.  Upewnij się, że format daty to \`YYYY-MM-DD\`.`;

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
    if(!analysisResult){
      return
    }
    // @ts-ignore
    const jsonMatch = analysisResult.match(/\{.*\}/s);

    if (!jsonMatch) {
      console.error('Odpowiedź Gemini nie zawierała obiektu JSON:', analysisResult);
      throw new Error('Nie udało się wyodrębnić obiektu JSON z odpowiedzi modelu.');
    }

// 2. Parsuj tylko znaleziony, "czysty" fragment JSON
    const jsonString = jsonMatch[0];
    let extractedData;
    try {
      extractedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Błąd parsowania wyodrębnionego JSON:', jsonString, parseError);
      throw new Error('Ostateczna próba parsowania JSON nie powiodła się.');
    }

    const { seller_tax_id, document_number } = extractedData as any;
    const invoice_date: string = extractedData['extractedData'].replace('-', '_');

    const safeDocNumber = (document_number || 'BRAK_NUMERU').replace(/[^a-zA-Z0-9-]/g, '_');
    const newFileName = `${seller_tax_id || 'BRAK_NIP'}-${invoice_date || 'BRAK_DATY'}-${safeDocNumber}.${extension}`.replace('/', '_');

    const destinationPath = `users/${userId}/processed/${newFileName}`;
    await file.move(destinationPath);

    const db = getFirestore();
    const invoiceData = {
      ...extractedData,
      uploadDate,
      processedDate: FieldValue.serverTimestamp(),
      originalFilePath: fileName,
      filePath: newFileName,
      processedAt: new Date().toISOString(),
      status: 'processed'
    };

    const docRef = await db.collection('users').doc(userId).collection('invoices').add(invoiceData);

    logger.info(`Dane faktury zapisane w Firestore dla użytkownika ${userId} pod ID: ${docRef.id}`);

  } catch (error) {
   logger.error(error);
  }
});