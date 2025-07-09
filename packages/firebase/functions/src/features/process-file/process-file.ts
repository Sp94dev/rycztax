import { VertexAI } from '@google-cloud/vertexai';
import { getStorage } from 'firebase-admin/storage';
import * as functions from 'firebase-functions';
import { REGION } from '../../config.js';

export const processInvoice = functions
  .region(REGION)
  .runWith({ timeoutSeconds: 300, memory: '1GB' })
  .storage.object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    const contentType = object.contentType;

    // Walidacja ścieżki pliku (pozostaje bez zmian)
    if (
      !filePath ||
      !filePath.startsWith('users/') ||
      !filePath.includes('/uploads/') ||
      !contentType
    ) {
      functions.logger.log(
        'Plik nie znajduje się w lokalizacji do przetworzenia. Pomijam.',
      );
      return;
    }

    functions.logger.log(`Przetwarzam plik: ${filePath}`);

    const bucket = getStorage().bucket(object.bucket);
    const file = bucket.file(filePath);

    try {
      // KROK 1: Pobranie pliku i przygotowanie danych obrazu
      const [fileBuffer] = await file.download();
      const fileAsBase64 = fileBuffer.toString('base64');
      const filePart = {
        inlineData: {
          mimeType: contentType,
          data: fileAsBase64,
        },
      };

      // KROK 2: Przygotowanie precyzyjnego polecenia dla AI
      const prompt = `
        Przeanalizuj załączony obraz polskiej faktury. Zidentyfikuj i wyodrębnij następujące dane:
        - NIP sprzedawcy (firmy wystawiającej fakturę) jako "nipWystawcy"
        - datę wystawienia faktury jako "dataWystawienia" w formacie RRRR-MM-DD
        - numer faktury jako "numerFaktury"

        Zwróć odpowiedź WYŁĄCZNIE jako obiekt JSON w formacie:
        {
          "nipWystawcy": "wartość",
          "dataWystawienia": "wartość",
          "numerFaktury": "wartość"
        }
        Nie dodawaj żadnych innych wyjaśnień ani formatowania markdown.
      `;

      // KROK 3: Wywołanie Vertex AI z właściwym modelem
      const vertex_ai = new VertexAI({
        project: 'rycztax',
        location: 'us-central1',
      });
      const generativeModel = vertex_ai.getGenerativeModel({
        model: 'gemini-2.0-flash-lite-001', // Stabilny i szybki model
      });

      const request = {
        contents: [{ role: 'user', parts: [filePart, { text: prompt }] }],
      };

      const result = await generativeModel.generateContent(request);
      const rawContent =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawContent) {
        throw new Error('AI nie zwróciło żadnej treści w odpowiedzi.');
      }
      functions.logger.log('Otrzymano odpowiedź od AI:', rawContent);

      const jsonMatch = rawContent.match(/{[\s\S]*}/); // Znajdź blok JSON w tekście
      if (!jsonMatch) {
        throw new Error(
          'Nie znaleziono poprawnego obiektu JSON w odpowiedzi od AI.',
        );
      }
      const jsonString = jsonMatch[0];

      // KROK 4: Przetworzenie odpowiedzi i walidacja danych
      const invoiceData = JSON.parse(jsonString.trim());

      if (!invoiceData.dataWystawienia || !invoiceData.nipWystawcy) {
        throw new Error(
          'AI nie zwróciło wymaganych danych (NIP lub data wystawienia).',
        );
      }

      // KROK 5: Stworzenie nowej nazwy pliku i ścieżki docelowej
      const invoiceId = (invoiceData.numerFaktury || 'BEZ-NUMERU').replace(
        /[\/\\?%*:|"<>]/g,
        '-',
      );
      const fileExtension = filePath.split('.').pop() || 'pdf';

      const newFileName = `${invoiceData.dataWystawienia}_${invoiceData.nipWystawcy}_${invoiceId}.${fileExtension}`;

      const destinationPath = filePath
        .replace('uploads/', 'proceeds/')
        .replace(/[^/]*$/, newFileName);

      // KROK 6: Przeniesienie pliku
      await file.move(destinationPath);
      functions.logger.log(
        `SUKCES! Plik został przetworzony i przeniesiony do: ${destinationPath}`,
      );
    } catch (error) {
      functions.logger.error(
        'Błąd podczas finalnego przetwarzania pliku:',
        error,
      );
      // Opcjonalnie: przenieś plik do folderu 'errors/' w razie błędu
      const errorPath = filePath.replace('uploads/', 'errors/');
      try {
        await file.move(errorPath);
        functions.logger.log(`Plik z błędem przeniesiono do: ${errorPath}`);
      } catch (moveError) {
        functions.logger.error(
          `Krytyczny błąd: nie udało się przenieść pliku do folderu 'errors/'.`,
          moveError,
        );
      }
    }
  });
