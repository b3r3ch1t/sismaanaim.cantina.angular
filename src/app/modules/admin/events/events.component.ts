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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SnackbarService } from 'app/services/snackbar.service';
import { ConfirmationService } from 'app/services/confirmation.service';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { EventFormComponent } from './event-form/event-form.component';
import { EventStatus } from './event-status.enum';

@Component({
  selector: 'app-events',
  imports: [
    MatTableModule,
    MatPaginator,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    CustomDatePipe,
    MatDialogModule
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
  providers : []
})

export class EventsComponent implements OnInit {
  private _httpClient = inject(HttpClient)
  private _authService = inject(AuthService)

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  events = signal([])
  eventsDataSource = signal(new MatTableDataSource([]))
  isEventModalOpen = signal(false)
  eventStatus = EventStatus

  displayedColumns = [
    "nome",
    "dataInicial",
    "dataFinal",
    "dataAlteracao",
    "Ações"
  ]

  constructor(
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.fetchEvents()
  }

  eventDetails(event){
    console.log(event)
  }

  editEvent(event){
    const dialogRef = this.dialog.open(EventFormComponent, {
      data : event,
      width : "400px"
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.response.success) {
          this.snackbarService.success("Evento atualizado com sucesso")
          this.fetchEvents()
        }else{
          this.snackbarService.error(result.response.errors.join(", "))
        }
      }
    });
  }

  confirmEvent(event){
    this.confirmationService.confirm("Confirmar", "Confirme se deseja alterar o status do evento").subscribe(result => {
      if (result) {
        this._httpClient.put(`${environment.API_URL}evento/confirmarevento`, event.id, {
          headers: {
            Authorization : `Bearer ${this._authService.accessToken}`
          }
        }).pipe(catchError((error) => {
          console.log(error)
          throw error
        })).subscribe(result => {
          console.log(result)
        })
      }
    })
  }

  cancelEvent(event){
    this.confirmationService.confirm("Confirmar", "Confirme se deseja alterar o status do evento").subscribe(result => {
      if (result) {
        this._httpClient.put(`${environment.API_URL}evento/cancelarevento`, event.id, {
          headers: {
            Authorization : `Bearer ${this._authService.accessToken}`
          }
        }).pipe(catchError((error) => {
          console.log(error)
          throw error
        })).subscribe(result => {
          console.log(result)
        })
      }
    })
  }

  endEventSelling(event){
    this.confirmationService.confirm("Confirmar", "Confirme se deseja alterar o status do evento").subscribe(result => {
      if (result) {
        this._httpClient.put(`${environment.API_URL}evento/encerrarvendasevento`, event.id, {
          headers: {
            Authorization : `Bearer ${this._authService.accessToken}`
          }
        }).pipe(catchError((error) => {
          console.log(error)
          throw error
        })).subscribe(result => {
          console.log(result)
        })
      }
    })
  }

  endEvent(event){
    this.confirmationService.confirm("Confirmar", "Confirme se deseja alterar o status do evento").subscribe(result => {
      if (result) {
        this._httpClient.put(`${environment.API_URL}evento/encerrarevento`, event.id, {
          headers: {
            Authorization : `Bearer ${this._authService.accessToken}`
          }
        }).pipe(catchError((error) => {
          console.log(error)
          throw error
        })).subscribe(result => {
          console.log(result)
        })
      }
    })
  }

  addEvent() {
    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.response.success) {
          this.snackbarService.success("Evento Criado com sucesso")
          this.fetchEvents()
        }else{
          this.snackbarService.error(result.response.errors.join(", "))
        }
      }
    });
  }

  fetchEvents() {
    this._httpClient.get(`${environment.API_URL}evento/gettodoseventos`, {
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
          this.events.set(data.result)
          console.log(this.events())
          const dataSource = new MatTableDataSource(this.events())
          if (dataSource) {
            dataSource.sortingDataAccessor = (item: any, property) => {
              switch (property) {
                // case 'Descricao':
                //   return item.descricao;
                // case 'Aceita Estorno':
                //   return item.aceitaEstorno;
                // case 'Ordem débito':
                //   return Number(item.ordemDebito);
                default:
                  return item[property];
              }
            };

            dataSource.paginator = this.paginator;
            dataSource.sort = this.sort;
            this.eventsDataSource.set(dataSource);
          }
        }
      });
  }
}
