import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { collection, collectionData, Firestore, query, where } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { AuthService } from 'auth/auth.service';
import { ref, uploadBytes } from 'firebase/storage';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { combineLatest, filter, map } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    ToastModule,
    DatePicker,
    FormsModule,
  ],
  template: `
    <input
      #fileInput
      multiple
      type="file"
      class="hidden"
      (change)="onFileSelected($event)"
    />
    <p-table [value]="(invoices$ | async) || []">
      <ng-template #caption>
        <div class="flex flex-row justify-between items-center">
          <p-datepicker [ngModel]="visiblePeriod()" (ngModelChange)="visiblePeriod.set($event)" view="month"
                        dateFormat="mm/yy" selectionMode="single" [readonlyInput]="true" />
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

  visiblePeriod = signal<Date>(new Date());
  #user = toSignal(this.authService.user);
  #userId$ = this.authService.user.pipe(
    filter(user => !!user),
    map(user => user?.uid),
  );

  visiblePeriod$ = toObservable<Date>(this.visiblePeriod).pipe(
    map(period => {
      const year = period.getFullYear();
      const month = period.getMonth() + 1;
      const startOfMonth = `${year}-${month.toString().padStart(2, '0')}`;

      const nextMonthDate = new Date(period);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const nextMonthYear = nextMonthDate.getFullYear();
      const nextMonth = nextMonthDate.getMonth() + 1;
      const startOfNextMonth = `${nextMonthYear}-${nextMonth.toString().padStart(2, '0')}`;

      return { startOfMonth, startOfNextMonth };
    }),
  );
  collection$ = this.#userId$.pipe(map((userId) => collection(this.firestore, `users/${userId}/invoices`)));
  invoices$ = combineLatest(([this.collection$, this.visiblePeriod$])).pipe(switchMap(([collection, periodData]) => {

    const q = query(
      collection,
      where('status', '==', 'processed'),
      where('invoiceDate', '>=', periodData.startOfMonth),
      where('invoiceDate', '<', periodData.startOfNextMonth));

    return collectionData(q);
  }));


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
