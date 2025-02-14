import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'app/environments/environment';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-client-balance',
  templateUrl: './client-balance.component.html',
  styleUrls: ['./client-balance.component.css'],
  imports: [
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatSort,
    MatPaginator,
    CustomDatePipe,
    CustomCurrencyPipe
  ],
  providers: [
    CurrencyPipe,
    CustomCurrencyPipe,
    CustomDatePipe
  ],
})
export class ClientBalanceComponent implements OnInit {

  private _httpClient = inject(HttpClient)
  private _authService = inject(AuthService)
  private _userService = inject(UserService);
  private _customCurrencyPipe = inject(CustomCurrencyPipe)

  clients = signal([]);
  showClearButton = signal(false);
  selectedClient = signal(null);
  clientBalanceDataSource = signal(new MatTableDataSource([]));
  inputDisabled = signal(false);

  displayedColumns = [
    "Forma Pagamento",
    "Saldo",
    "Ordem de Débito"
  ]

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor() { }

  ngOnInit() {
  }

  handleCpfInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    if (input.value.length >= 4) {
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
            this.clients().length == 1 ? this.handleClientSelection(this.clients()[0].id) : null
          }
          this.showClearButton.set(true)
        });
    } else {
      this.showClearButton.set(false)
    }
  }


  clearInputs() {
    this.showClearButton.set(false)
    this.clients.set([])
    this.selectedClient.set(null)
    this.inputDisabled.set(false)
  }

  handleClientSelection(clientId: string) {
    if (clientId) {
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
          if (data.success) {
            this.selectedClient.set(data.result)
            console.log(this.selectedClient())
            this.showClientBalance()
          }
        });
    }
  }

  showClientBalance() {
    const clientId = this.selectedClient().id   
    if(clientId){
      this._httpClient.get(`${environment.API_URL}clientes/getsaldoclientebyclientid/${clientId}`, {
        headers: {
          "Authorization": `Bearer ${this._authService.accessToken}`
        }
      }).pipe(catchError((error) => {
        console.log(error)
        throw error
      })).subscribe((response: ApiResponse<any>) => {
        if (response.success) {
          console.log(response.result)
          // Create a new MatTableDataSource instance
          const dataSource = new MatTableDataSource(response.result);

          if (dataSource) {
            dataSource.sortingDataAccessor = (item : any, property) => {
              switch(property) {
                case 'Forma Pagamento':
                  return item.formaPagamentoNome;  
                case 'Saldo':
                  return Number(item.saldo);  
                case 'Ordem de Débito':
                    return Number(item.ordemDebito);  
                default:
                  return item[property];
              }
            };
          }

          this.sort.sort(({ id: 'Ordem de Débito', start: 'asc' }) as MatSortable);

          this.clientBalanceDataSource.set(dataSource)
          this.clientBalanceDataSource().sort = this.sort
          this.clientBalanceDataSource().paginator = this.paginator
        }
      });
    }
  }
}
