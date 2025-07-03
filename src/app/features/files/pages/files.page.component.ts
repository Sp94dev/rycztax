import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  imports: [ButtonModule, TableModule],
  template: `
    <p-table>
      <ng-template #caption
        ><div style="display: flex; flexDirection: end; justifyContent: end">
          <p-button (click)="uploadFile()">Dodaj plik</p-button>
        </div></ng-template
      >
      <ng-template #header>
        <tr>
          <td>NIP</td>
          <td>Data</td>
          <td></td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr>
          <td colspan="3" style="text-align: center;">No files found.</td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class FilesPageComponent {
  uploadFile() {
    console.log('lets upload that!');
  }
}
