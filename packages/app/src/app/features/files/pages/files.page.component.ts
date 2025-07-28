import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { AuthService } from 'auth/auth.service';
import { ref, uploadBytes } from 'firebase/storage';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { filter, map, Observable, of, tap } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
          <td>Nazwa pliku</td>
          <td>NIP</td>
          <td>Data</td>
          <td>Kwota Brutto</td>
          <td></td>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-invoice>
        <tr>
          <td>{{ invoice.filePath }}</td>
          <td>{{ invoice.sellerTaxId }}</td>
          <td>{{ invoice.invoiceDate }}</td>
          <td>{{ invoice.documentNumber }}</td>
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
  private authService = inject(AuthService);

  #user = toSignal(this.authService.user);
  #userId$ = this.authService.user.pipe(
    filter(user => !!user),
    map(user => user?.uid),
  )

  collection$ = this.#userId$.pipe(map((userId) => collection(this.firestore, `users/${userId}/invoices`)))
  invoices$ = this.collection$.pipe(switchMap(collection => {
    const q = query(collection, where('status' , '==', 'processed'));

    return collectionData(q)
  }), tap(console.log))

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.uploadFile(files);
    }
  }

  async uploadFile(files: File[]) {
    const userId = this.#user()?.uid;
    if (!userId) {
      return;
    }
    const userFilePath = `users/${userId}/uploads`;
    const toUploadFiles = files.map((file) => {
      const storageRef = ref(this.storage, `${userFilePath}/${file.name}`);
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
