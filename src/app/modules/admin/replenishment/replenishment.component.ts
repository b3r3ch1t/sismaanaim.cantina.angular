import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelect, MatSelectModule } from "@angular/material/select"
import { HttpClient } from "@angular/common/http"
import { AuthService } from 'app/core/auth/auth.service';
import { catchError } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';

@Component({
  selector: 'app-replenishment',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './replenishment.component.html',
  styleUrl: './replenishment.component.scss'
})

export class ReplenishmentComponent {
  private _httpClient = inject(HttpClient)
  private _authService = inject(AuthService)

  clients = signal([]);
  showClearButton = signal(false);
  inputDisabled = signal(false);
  selectedClient = signal(null);
  disableClientDropdown = signal(false);

  @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
  @ViewChild('cpfInput', { static: true }) cpfInput: ElementRef;
  @ViewChild('clientDropdown', { static: false }) clientDropdown: MatSelect;


  handleNameInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    if (input.value.length >= 4) {
      this.inputDisabled.set(true);
      // TODO : Move this to an API service
      this._httpClient.get(`https://apicantina.berechit.com.br/v1/sismaanaim/clientes/getclientesbynome/${input.value}`, {
        headers: {
          "Authorization": `Bearer ${this._authService.accessToken}`
        }
      })
        .pipe(catchError((error) => {
          console.log(error);
          throw error;
        }))
        // TODO : Create datatype for Client
        .subscribe((data: ApiResponse<Array<{ id: string, nome: string }>>) => {
          if (data.result) {
            const clients = data.result
            this.clients.set(clients)
          }
          this.showClearButton.set(true)
        });

    } else {
      this.showClearButton.set(false)
    }
  }

  handleCpfInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    if (input.value.length >= 4) {
      this.inputDisabled.set(true);

      this._httpClient.get(`https://apicantina.berechit.com.br/v1/sismaanaim/clientes/getclientesbycpf/${input.value}`, {
        headers: {
          "Authorization": `Bearer ${this._authService.accessToken}`
        }
      })
        .pipe(catchError((error) => {
          console.log(error);
          throw error;
        }))
        .subscribe((data: ApiResponse<Array<{ id: string, nome: string }>>) => {
          if (data.success) {
            const clients = data.result
            this.clients.set(clients)
          }
          this.showClearButton.set(true)
        });

    } else {
      this.showClearButton.set(false)
    }
  }

  clearInputs() {
    const nameInput = this.nameInput.nativeElement as HTMLInputElement;
    const cpfInput = this.cpfInput.nativeElement as HTMLInputElement;
    
    nameInput.value = '';
    cpfInput.value = '';
    this.showClearButton.set(false)
    this.inputDisabled.set(false)
    this.clients.set([])
    this.selectedClient.set(null)
    this.clientDropdown.value = null
  }


  handleClientSelection() {
    if (this.clientDropdown.value) {
      const clientId = this.clientDropdown.value
      this.disableClientDropdown.set(true)
      this._httpClient.get(`https://apicantina.berechit.com.br/v1/sismaanaim/clientes/getclientebyid/${clientId}`, {
        headers: {
          "Authorization": `Bearer ${this._authService.accessToken}`
        }
      })
        .pipe(catchError((error) => {
          console.log(error);
          throw error;
        }))
        // TODO : Create a datatype for Client
        // TODO : Move this to an API service
        .subscribe((data: ApiResponse<object>) => {
          console.log(data)
          this.disableClientDropdown.set(false)
          if (data.success) {
            this.selectedClient.set(data.result)
            console.log(this.selectedClient())
          }         
        });

    }
  }

}