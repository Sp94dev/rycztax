import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleAuth } from 'google-auth-library';

admin.initializeApp();

const BUCKET_NAME = 'rycztax.appspot.com';

export const processInvoice = functions.storage.object().onFinalize(async (object) => {
  const fileBucket = object.bucket;
  const filePath = object.name;
  const contentType = object.contentType;

  if (!filePath || !contentType || !fileBucket.endsWith(BUCKET_NAME)) {
    return functions.logger.log('Not a valid file.');
  }

  if (!contentType.startsWith('image/')) {
    return functions.logger.log('This is not an image.');
  }

  const bucket = admin.storage().bucket(fileBucket);
  const file = bucket.file(filePath);
  const [fileBuffer] = await file.download();

  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });
  const client = await auth.getClient();
  const accessToken = (await client.getAccessToken()).token;

  const prompt = `
    Analyze the following invoice and extract the following information in JSON format:
    - NIP (seller's tax identification number)
    - grossAmount (total amount including tax)
    - netAmount (amount before tax)
    - saleDate (date of sale)
    - invoiceNumber (invoice number)

    If any of the information is not available, please use "N/A".
  `;

  const request = {
    contents: [
      { role: 'user', parts: [{ inlineData: { mimeType: contentType, data: fileBuffer.toString('base64') } }, { text: prompt }] },
    ],
  };

  const response = await fetch(
    `https://us-central1-aiplatform.googleapis.com/v1/projects/rycztax/locations/us-central1/publishers/google/models/gemini-1.5-flash-001:streamGenerateContent`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  const data = await response.json();
  const { NIP, grossAmount, netAmount, saleDate, invoiceNumber } = JSON.parse(data[0].candidates[0].content.parts[0].text.replace(/```json\n|```/g, ''));

  const newFileName = `${saleDate}_${NIP}_${invoiceNumber || 'X'}.pdf`;
  await file.rename(newFileName);

  await admin.firestore().collection('invoices').add({
    fileName: newFileName,
    nip: NIP,
    grossAmount: grossAmount,
    netAmount: netAmount,
    saleDate: saleDate,
    invoiceNumber: invoiceNumber || 'X',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return functions.logger.log('Invoice processed successfully!');
});