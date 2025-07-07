import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { ref, uploadBytes } from 'firebase/storage';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Observable } from 'rxjs';

@Component({
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    ToastModule,
  ],
  template: `
    <input
      #fileInput
      type="file"
      (change)="onFileSelected($event)"
      style="display: none"
      multiple
    />
    <p-table [value]="(invoices$ | async) || []">
      <ng-template #caption>
        <div
          style="display: flex; flexDirection: end; justifyContent: end"
          class="flex justify-content-end"
        >
          <p-button (click)="fileInput.click()">Dodaj plik</p-button>
        </div>
      </ng-template>
      <ng-template #header>
        <tr>
          <td>NIP</td>
          <td>Data</td>
          <td>Kwota Brutto</td>
          <td></td>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-invoice>
        <tr>
          <td>{{ invoice.nip }}</td>
          <td>{{ invoice.saleDate }}</td>
          <td>{{ invoice.grossAmount }}</td>
          <td></td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr>
          <td colspan="4" style="text-align: center;">No files found.</td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class FilesPageComponent {
  private storage: Storage = inject(Storage);
  private firestore: Firestore = inject(Firestore);
  selectedFile: File | null = null;
  invoices$: Observable<any[]>;

  constructor() {
    const invoiceCollection = collection(this.firestore, 'invoices');
    this.invoices$ = collectionData(invoiceCollection);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.uploadFile(files);
    }
  }

  async uploadFile(files: File[]) {
    const toUploadFiles = files.map((file) => {
      const fileExtension = file.name.split('.').pop();
      const newFileName = `${new Date().getTime()}.${fileExtension}`;
      const storageRef = ref(this.storage, `uploads/${newFileName}`);
      return uploadBytes(storageRef, file);
    });

    try {
      await Promise.all(toUploadFiles);
      alert('Plik został wgrany pomyślnie!');

      // Tutaj można dodać logikę po udanym wgraniu pliku
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }
}
