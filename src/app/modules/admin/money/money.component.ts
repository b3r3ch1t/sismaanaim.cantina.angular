import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { catchError } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { PaymentMethodFormComponent } from './payment-method-form/payment-method-form.component';
import { SnackbarService } from 'app/services/snackbar.service';
import { ConfirmationService } from 'app/services/confirmation.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-money',
  imports: [MatTableModule, MatPaginator, MatSortModule, MatButtonModule, MatIconModule, MatCheckboxModule],
  templateUrl: './money.component.html',
  styleUrl: './money.component.scss'
})

export class MoneyComponent implements OnInit {
  private _httpClient = inject(HttpClient)
  private _authService = inject(AuthService)

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  paymentMethods = signal([])
  paymentMethodsDataSource = signal(new MatTableDataSource([]))

  displayedColumns = [
    "Descricao",
    "Aceita Estorno",
    "Ordem debito",
    "Acoes"
  ]

  constructor(
    private readonly dialog: MatDialog,
    private readonly snackbarService: SnackbarService,
    private readonly confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.fetchPaymentMethods()
  }


  addPaymentMethod() {
    const dialogRef = this.dialog.open(PaymentMethodFormComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.response.success) {
          this.snackbarService.success("Forma de pagamento criado com sucesso")
          this.fetchPaymentMethods()
        }
      }
    });
  }

  enablePaymentMethod(paymentMethod) {
    this.confirmationService.confirm("Confirmar", "Tem certeza que deseja ativar a forma de pagamento?").subscribe(result => {
      if (result) {
        this._httpClient.post(`${environment.API_URL}formapagamento/enableformapagamento/${paymentMethod.id}`, {}, {
          headers : {
            "Authorization": `Bearer ${this._authService.accessToken}`
          }
        }).pipe(catchError(error => {
          console.log(error)
          throw error
        })).subscribe((response : ApiResponse<any>) => {
          console.log(response)
          // if (response.success) {
          //   this.fetchPaymentMethods()
          // }
        })
      }
    })
  }

  disablePaymentMethod(paymentMethod) {
    this.confirmationService.confirm("Confirmar", "Tem certeza que deseja desativar a forma de pagamento?").subscribe(result => {
      if (result) {
        this._httpClient.post(`${environment.API_URL}formapagamento/disableformapagamento/${paymentMethod.id}`, {}, {
          headers : {
            "Authorization": `Bearer ${this._authService.accessToken}`
          }
        }).pipe(catchError(error => {
          console.log(error)
          throw error
        })).subscribe((response : ApiResponse<any>) => {
          console.log(response)
          // if (response.success) {
          //   this.fetchPaymentMethods()
          // }
        })
      }
    })
  }

  removePaymentMethod(paymentMethod) {
    this.confirmationService.confirm("Confirmar", "Tem certeza de que deseja remover esta forma de pagamento?").subscribe(result => {
      if (result) {
        this._httpClient.request('DELETE', `${environment.API_URL}formapagamento/excluirformapagamento`, {
          headers: {
            "Authorization": `Bearer ${this._authService.accessToken}`,
            "Content-Type": "application/json" // Ensure JSON is sent properly
          },
          body: {
            id: paymentMethod.id, // Replace with actual values
            descricao: paymentMethod.descricao,
            aceitaEstorno: paymentMethod.aceitaEstorno,
            ordemDebito: paymentMethod.ordemDebito
          }
        }).subscribe({
          next: (response : ApiResponse<any>) => {
            console.log(response)
            if(response.success){
              console.log('Deleted Successfully:', response);
              this.snackbarService.success("Forma de pagamento removido com sucesso")
              this.fetchPaymentMethods()
            }

            if (response.error) {
              this.snackbarService.error(response.errors.join(", "))
            }
          },
          error: (error) => {
            console.error('Error:', error);
          }
        });

      }
    })
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
      .subscribe((data: ApiResponse<Array<{ id: string, descricao: string, aceitaEstorno: boolean }>>) => {
        if (data.success) {
          this.paymentMethods.set(data.result)
          console.log(this.paymentMethods())
          const dataSource = new MatTableDataSource(this.paymentMethods())
          if (dataSource) {
            dataSource.sortingDataAccessor = (item: any, property) => {
              switch (property) {
                case 'Descricao':
                  return item.descricao;
                case 'Aceita Estorno':
                  return item.aceitaEstorno;
                case 'Ordem débito':
                  return parseInt(item.ordemDebito);
                default:
                  return item[property];
              }
            };

            dataSource.paginator = this.paginator;
            dataSource.sort = this.sort;
            this.paymentMethodsDataSource.set(dataSource);
          }
        }
      });
  }

  handleCheckbox(e : MatCheckboxChange){
    e.source.toggle()
  }
}
