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
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { UserService } from 'app/core/user/user.service';
import { MatRadioChange, MatRadioGroup, MatRadioModule } from "@angular/material/radio"
import { MatSelectionListChange, MatSelectionList, MatListModule, MatList } from '@angular/material/list';
import { environment } from 'app/environments/environment';
import {MatSnackBarModule} from '@angular/material/snack-bar'; 
import { SnackbarService } from 'app/services/snackbar.service';
import { CurrencyMaskDirective } from 'app/directives/currency-mask.directive';

@Component({
  selector: 'app-replenishment',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    CustomCurrencyPipe,
    MatRadioModule,
    MatSnackBarModule,
    MatListModule,
    CurrencyMaskDirective
  ],
  providers: [CurrencyPipe, CustomCurrencyPipe],
  templateUrl: './replenishment.component.html',
  styleUrl: './replenishment.component.scss'
})

export class ReplenishmentComponent implements OnInit {

  private _httpClient = inject(HttpClient)
  private _authService = inject(AuthService)
  private _userService = inject(UserService);

  clients = signal([]);
  paymentMethods = signal([]);
  showClearButton = signal(false);
  inputDisabled = signal(false);
  selectedClient = signal(null);
  selectedPaymentMethod = signal(null);
  disableClientDropdown = signal(false);
  disablePaymentMethodDropdown = signal(false);
  validPaidInput = signal(null);
  validRechargeInput = signal(null);
  validPaymentMethod = signal(null);
  currentEvent = signal(null);

  @ViewChild('nameInput', { static: false }) nameInput: ElementRef;
  @ViewChild('cpfInput', { static: false }) cpfInput: ElementRef;
  @ViewChild('clientDropdown', { static: false }) clientDropdown: MatRadioGroup;
  @ViewChild('paymentMethodDropdown', { static: false }) paymentMethodDropdown: MatSelect;
  @ViewChild('paidValueInput', { static: false }) paidValueInput: ElementRef;
  @ViewChild('rechargeValueInput', { static: false }) rechargeValueInput: ElementRef;

  constructor(private snackbar : SnackbarService) {}

  ngOnInit(): void {
    this.loadCashRegister()
  }

  handleSubmit() {
    if (this.selectedPaymentMethod() == null) {
      this.validPaymentMethod.set(false)
      return
    }

    if (this.rechargeValueInput.nativeElement.value == "") {
      this.validRechargeInput.set(false)
      return
    }

    if (this.paidValueInput.nativeElement.value == "") {
      this.validPaidInput.set(false)
      return
    }

    console.log("validation passed")

    if (this.currentEvent() === null) {
      console.log('current event (cash register) is null')
      return
    }

    this._httpClient.post(`${environment.API_URL}caixa/adicionarcredito`, {
      "caixaId": this.currentEvent().id,
      "valor": this.paidValueInput.nativeElement.value,
      "formaPagamentoId": this.selectedPaymentMethod().id,
      "clienteId": this.selectedClient().id
    }).pipe(
      catchError((error) => {
        console.log(error);
        throw error
      })
    ).subscribe((response: ApiResponse<any>) => {
      console.log(response)
      this.snackbar.success("Success", 30 * 1000)
    })
  }

  loadCashRegister() {
    this._httpClient.get(`${environment.API_URL}caixa/getcaixaativosbyoperadorid/${this._userService.user.id}`, {
      headers: {
        Authorization: `Bearer ${this._authService.accessToken}`
      }
    }).pipe(
      catchError((error) => {
        console.log(error);
        throw error
      })
    ).subscribe((response: ApiResponse<any>) => {
      if (response.success) {
        this.currentEvent.set(response.result)
        console.log(this.currentEvent())
      }

    });
  }

  handleRechargeValueInput(event: KeyboardEvent) {
    this.onKeyPress(event)
  }

  handlePaidValueInput(event: KeyboardEvent) {
    this.onKeyPress(event)
  }

  onKeyPress(event: KeyboardEvent) {
    console.log(event.key)

    if (event.key === 'Enter' || event.key === '-') {
      return
    }

    const allowedChars = /[0-9\.]/; // Allow numbers and a single decimal point
    const inputChar = String.fromCharCode(event.keyCode || event.which);

    if (!allowedChars.test(inputChar)) {
      event.preventDefault();
    }
  }

  handleNameInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    if (input.value.length >= 4) {
      this.selectedClient.set(null)
      this.clients.set([])
      // this.inputDisabled.set(true);
      // TODO : Move this to an API service
      this._httpClient.get(`${environment.API_URL}clientes/getclientesbynome/${input.value}`, {
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
      this.selectedClient.set(null)
      this.clients.set([])
      // this.inputDisabled.set(true);

      this._httpClient.get(`${environment.API_URL}clientes/getclientesbycpf/${input.value}`, {
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
    this.showClearButton.set(false)
    this.inputDisabled.set(false)
    this.clients.set([])
    this.selectedClient.set(null)
  }


  handleClientSelection(clientId : string) {    
    if (clientId) {
      this.disableClientDropdown.set(true)
      this._httpClient.get(`${environment.API_URL}clientes/getclientebyid/${clientId}`, {
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
            this.fetchPaymentMethods()
          }
        });

    }
  }

  fetchPaymentMethods() {
    this._httpClient.get(`${environment.API_URL}formapagamento/listarformapagamento`, {
      headers: {
        "Authorization": `Bearer ${this._authService.accessToken}`
      }
    })
      .pipe(catchError((error) => {
        console.log(error);
        throw error;
      }))
      .subscribe((data: ApiResponse<Array<{ id: string, descricao: string }>>) => {
        if (data.success) {
          this.paymentMethods.set(data.result)
          console.log(data.result)
        }
      });
  }

  handlePaymentMethodSelection() {
    if (this.paymentMethodDropdown.value) {
      const paymentMethodId = this.paymentMethodDropdown.value
      this.disablePaymentMethodDropdown.set(true)
      this.paymentMethods().forEach(paymentMethod => {
        paymentMethod.id === paymentMethodId ? this.selectedPaymentMethod.set(paymentMethod) : null
      });
      console.log(this.selectedPaymentMethod())
      this.disablePaymentMethodDropdown.set(false)
    }
  }
}
