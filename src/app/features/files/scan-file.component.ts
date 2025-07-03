import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { TableModule } from 'primeng/table';

import { Auth, user } from '@angular/fire/auth';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import { take } from 'rxjs/operators';

declare var cv: any;
type ScanStep = 'initial' | 'scanning' | 'processing' | 'preview';

@Component({
  selector: 'app-scan-file',
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    TableModule,
  ],
  host: {},
  styles: ``,
  template: ` <div></div>`,
})
export class ScanFileComponent implements OnDestroy {
  // === Elementy DOM ===
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('hiddenCanvas') hiddenCanvas!: ElementRef<HTMLCanvasElement>;
  overlayCanvas = viewChild<any>('overlayCanvas');

  test = effect(() => {
    console.log(this.overlayCanvas());
  });

  // === Zarządzanie stanem ===
  currentStep: ScanStep = 'initial';
  isProcessing = false;
  pdfPreviewUrl: SafeResourceUrl | null = null;

  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;

  private storage: Storage = inject(Storage);
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  constructor(private sanitizer: DomSanitizer) {}

  ngOnDestroy() {
    this.stopScanLoop();
    this.stopCamera();
  }

  // === GŁÓWNA LOGIKA ===

  async startScanner() {
    this.currentStep = 'scanning';
    await this.setupCamera();
    this.startScanLoop();
  }

  private startScanLoop() {
    // if (this.animationFrameId) return; // Pętla już działa
    debugger;
    this.scanLoop();
  }

  private stopScanLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private stopCamera() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  private scanLoop = () => {
    if (typeof cv === 'undefined') {
      console.warn('OpenCV jeszcze się nie załadowało.');
      this.requestNextFrame(); // Spróbuj ponownie w następnej klatce
      return;
    }

    const video = this.videoElement?.nativeElement;
    const overlay = this.overlayCanvas();
    if (!overlay) {
      return;
    }
    console.log(overlay);
    debugger;
    const overlayCtx = overlay?.getContext('2d')!;

    if (video?.readyState !== video?.HAVE_ENOUGH_DATA) {
      this.requestNextFrame();
      return;
    }
    console.log(overlay);
    overlay.width = video?.videoWidth;
    overlay.height = video?.videoHeight;

    const polygon = this.detectDocument(video);

    overlayCtx.clearRect(0, 0, overlay?.width, overlay?.height);

    if (polygon) {
      this.drawPolygon(overlayCtx, polygon);
      // Jeśli wykryliśmy stabilny dokument, automatycznie przechwytujemy
      this.triggerAutoCaptureAndProcess(polygon);
    } else {
      this.requestNextFrame(); // Kontynuuj pętlę, jeśli nie wykryto dokumentu
    }
  };

  private triggerAutoCaptureAndProcess(polygon: { x: number; y: number }[]) {
    this.isProcessing = true;
    this.stopScanLoop(); // Zatrzymujemy analizę

    // Przechwyć, przytnij i wygeneruj PDF
    const croppedImageData = this.cropDocument(polygon);
    if (croppedImageData) {
      this.generatePdf(croppedImageData);
    }
    this.stopCamera();
  }

  private cropDocument(polygon: { x: number; y: number }[]): string | null {
    // Ta funkcja jest bardzo podobna do `capture` z poprzedniej odpowiedzi
    // ... logika `warpPerspective` do przycięcia ...
    // Na końcu zwraca `canvas.toDataURL('image/jpeg');`
    // Placeholder - wklej tutaj pełną logikę crop/warp z poprzedniej odpowiedzi
    const video = this.videoElement.nativeElement;
    const canvas = this.hiddenCanvas.nativeElement;
    canvas.width = video?.videoWidth;
    canvas.height = video?.videoHeight;
    canvas
      .getContext('2d')!
      .drawImage(video, 0, 0, canvas?.width, canvas?.height);
    const image = cv.imread(canvas);
    // ... cała logika z getPerspectiveTransform i warpPerspective ...
    const cropped = new cv.Mat(); // Zakładamy, że tu jest wynik warp
    // ...
    // cv.imshow(canvas, cropped);
    // ...
    // image.delete(); cropped.delete(); ...
    // Zwróć wynik (dla przykładu używamy pełnego obrazu)
    return canvas.toDataURL('image/jpeg');
  }

  private generatePdf(imageData: string) {
    const doc = new jsPDF();
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
      const scaledWidth = img.width * ratio;
      const scaledHeight = img.height * ratio;
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      doc.addImage(imageData, 'JPEG', x, y, scaledWidth, scaledHeight);

      // Generujemy PDF jako Data URI string
      const pdfDataUri = doc.output('datauristring');

      // Używamy DomSanitizer, aby URL był bezpieczny dla iframe
      this.pdfPreviewUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(pdfDataUri);

      this.isProcessing = false;
      this.currentStep = 'preview';
    };
    img.src = imageData;
  }

  // === AKCJE UŻYTKOWNIKA ===

  async acceptScan() {
    console.log('PDF zaakceptowany!');
    if (this.pdfPreviewUrl) {
      const pdfDataUri = this.pdfPreviewUrl.toString().split(',')[1];
      const pdfBlob = this.dataURItoBlob(
        'data:application/pdf;base64,' + pdfDataUri,
      );
      await this.uploadDocument(pdfBlob, 'scanned_document.pdf');
    }
    this.reset();
  }

  rejectScan() {
    console.log('PDF odrzucony. Rozpoczynam skanowanie od nowa.');
    this.reset();
    this.startScanner();
  }

  async onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      // Możesz tutaj dodać logikę konwersji obrazu na PDF po stronie klienta
      // lub przesłać obraz i wywołać funkcję chmurową do konwersji.
      // Na razie przesyłamy bezpośrednio plik.
      await this.uploadDocument(file, file.name);
      this.reset();
    }
  }

  private async uploadDocument(file: Blob | File, fileName: string) {
    const currentUser = await user(this.auth).pipe(take(1)).toPromise();
    if (!currentUser) {
      console.error('Użytkownik nie jest zalogowany.');
      return;
    }

    const filePath = `user_documents/${
      currentUser.uid
    }/${Date.now()}_${fileName}`;
    const storageRef = ref(this.storage, filePath);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Zapisz metadane do Firestore
      await addDoc(collection(this.firestore, 'userDocuments'), {
        userId: currentUser.uid,
        fileName: fileName,
        filePath: filePath,
        downloadURL: downloadURL,
        uploadedAt: new Date(),
        fileType: file.type,
      });
      console.log('Dokument przesłany i metadane zapisane!', downloadURL);
    } catch (error) {
      console.error('Błąd podczas przesyłania dokumentu:', error);
    }
  }

  private dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  private reset() {
    this.currentStep = 'initial';
    this.pdfPreviewUrl = null;
    this.isProcessing = false;
  }

  // === FUNKCJE POMOCNICZE ===
  private requestNextFrame() {
    this.animationFrameId = requestAnimationFrame(this.scanLoop);
  }

  private drawPolygon(
    ctx: CanvasRenderingContext2D,
    polygon: { x: number; y: number }[],
  ) {
    // ... logika rysowania zielonego konturu z poprzedniej odpowiedzi ...
  }

  private async setupCamera() {
    // ... logika setupCamera z poprzedniej odpowiedzi ...
  }

  private detectDocument(
    imageSource: CanvasImageSource,
  ): { x: number; y: number }[] | null {
    // ... logika detectDocument z OpenCV z poprzedniej odpowiedzi ...
    return null; // Placeholder
  }
}
