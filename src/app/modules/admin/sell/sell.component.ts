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
import { catchError, single } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { UserService } from 'app/core/user/user.service';
import { MatRadioChange, MatRadioGroup, MatRadioModule } from "@angular/material/radio"
import { MatSelectionListChange, MatSelectionList, MatListModule, MatList } from '@angular/material/list';
import { environment } from 'app/environments/environment';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarService } from 'app/services/snackbar.service';
import { CurrencyMaskDirective } from 'app/directives/currency-mask.directive';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.css'],
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
    CurrencyMaskDirective,
    CurrencyMaskModule
  ],
  providers: [CurrencyPipe, CustomCurrencyPipe],
})

export class AttendantSellComponent implements OnInit {
  private _httpClient = inject(HttpClient)
  private _authService = inject(AuthService)
  private _userService = inject(UserService);

  noClientFound = signal(false)
  clients = signal([]);
  paymentMethods = signal([]);
  showClearButton = signal(false);
  inputDisabled = signal(true);
  selectedClient = signal(null);
  selectedPaymentMethod = signal(null);
  disableClientDropdown = signal(false);
  disablePaymentMethodDropdown = signal(false);
  validPaidInput = signal(null);
  validRechargeInput = signal(null);
  validPaymentMethod = signal(null);
  currentAttendant = signal(null);
  totalClientBalance = signal(0);

  @ViewChild('cpfInput', { static: false }) cpfInput: ElementRef;
  @ViewChild('clientDropdown', { static: false }) clientDropdown: MatRadioGroup;
  @ViewChild('paymentMethodDropdown', { static: false }) paymentMethodDropdown: MatSelect;
  @ViewChild('paidValueInput', { static: false }) paidValueInput: ElementRef;
  @ViewChild('rechargeValueInput', { static: false }) rechargeValueInput: ElementRef;

  @ViewChild('sellingInput', { static: false }) sellingInput: ElementRef;

  constructor(private snackbar: SnackbarService) { }

  ngOnInit(): void {
    this.loadAttendant()
  }

  handleSubmit() {
    const unformatedValue = this.sellingInput.nativeElement.value
    if (unformatedValue == "") {
      this.snackbar.error("O valor de venda é obrigatório")
      return
    }

    let sellingAmount = parseFloat(unformatedValue.replace('R$', '').replace('.', '').replace(',', '.'))
    console.log("Selling Amount", sellingAmount, "total balance", this.totalClientBalance())
    if (sellingAmount > this.totalClientBalance()) {
      this.snackbar.error("O valor de venda deve ser menor que o saldo")
      return
    }

    this._httpClient.post(`${environment.API_URL}atendente/realizarvenda`,
      {
        eventoId: this.currentAttendant().eventoId,
        valor: sellingAmount,
        clienteId: this.selectedClient().id,
        permissionarioId: this.currentAttendant().permissionarioId
      },
      {
        headers: {
          Authorization: `Bearer ${this._authService.accessToken}`
        },
      }).pipe(catchError(error => {
        console.log(error)
        throw error
      })).subscribe((response: ApiResponse<any>) => {
        this.snackbar.success("Venda Realizada com sucesso!", 1000 * 10)
        this.clearInputs()
        console.log(response)
      })

  }

  loadAttendant() {
    this._httpClient.get(`${environment.API_URL}atendente/getatendentebyid/${this._userService.user.id}`, {
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
        this.currentAttendant.set(response.result)
        this.inputDisabled.set(false)
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

    if (event.key === 'Enter' || event.key === '-' || event.key === ',') {
      return
    }

    const allowedChars = /[0-9\.]/; // Allow numbers and a single decimal point
    const inputChar = String.fromCharCode(event.keyCode || event.which);

    if (!allowedChars.test(inputChar)) {
      event.preventDefault();
    }
  }

  handleCpfInput(event: InputEvent) {

    this.noClientFound.set(false)

    const input = event.target as HTMLInputElement;
    if (input.value.length >= 4) {
      this.selectedClient.set(null)
      this.clients.set([])
      this.inputDisabled.set(true);

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

            if(this.clients().length === 1){
              this.selectedClient.set(this.clients()[0])
              this.handleClientSelection(this.selectedClient().id)
            }

            if(!this.clients().length) {
              this.noClientFound.set(false)
            }

          }
          else{
            this.snackbar.error("Nenhum cliente encontrado");
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


  handleClientSelection(clientId: string) {
    this.noClientFound.set(false)
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
            this.loadClientBalance()
          }
        });

    }
  }

  loadClientBalance() {
    this._httpClient.get(`${environment.API_URL}clientes/getsaldoclientebyclientid/${this.selectedClient().id}`, {
      headers: {
        "Authorization": `Bearer ${this._authService.accessToken}`
      }
    })
      .pipe(catchError((error) => {
        console.log(error);
        throw error;
      }))
      .subscribe((data: ApiResponse<Array<{ id: string, saldo: number }>>) => {
        if (data.success) {
          data.result.forEach(item => {
            this.totalClientBalance.update(old => old + item.saldo)
          })
        }
      });
  }

}
