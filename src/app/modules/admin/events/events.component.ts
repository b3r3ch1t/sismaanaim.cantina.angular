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
import { CashierEventDetailComponent } from './cashier-event-detail/cashier-event-detail-component';
import { AttendantsEventDetailComponent } from './attendants-event-detail/attendants-event-detail.component';
import { DetailEventComponent } from './detail-event/detail-event.component';

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
    providers: []
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
        "descriptionStateEvento",
        "dataAlteracao",
        "Ações"
    ]

    constructor(
        private readonly dialog: MatDialog,
        private readonly snackbarService: SnackbarService,
        private readonly confirmationService: ConfirmationService,

    ) { }

    ngOnInit(): void {
        this.fetchEvents()
    }

    eventDetails(event) {
        const dialogRef = this.dialog.open(DetailEventComponent, {
            data: event,
            width: "600px"
        })

    }

    editEvent(event) {
        const dialogRef = this.dialog.open(EventFormComponent, {
            data: event,
            width: "400px"
        })

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result.response.success) {
                    this.snackbarService.success("Evento atualizado com sucesso")
                    this.fetchEvents()
                } else {
                    this.snackbarService.error(result.response.errors.join(", "))
                }
            }
        });
    }

    confirmEvent(event) {
        this.confirmationService.confirm("Confirmar", "Confirme se deseja alterar o status do evento").subscribe(result => {
            if (result) {
                this._httpClient.put(`${environment.API_URL}evento/confirmarevento`, event.id, {
                    headers: {
                        Authorization: `Bearer ${this._authService.accessToken}`
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

    cancelEvent(event) {
        this.confirmationService.confirm("Confirmar", "Confirme se deseja alterar o status do evento").subscribe(result => {
            if (result) {
                this._httpClient.put(`${environment.API_URL}evento/cancelarevento`, event.id, {
                    headers: {
                        Authorization: `Bearer ${this._authService.accessToken}`
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

    endEventSelling(event) {
        this.confirmationService.confirm("Confirmar", "Tem certeza que deseja encerrar as vendas para o evento?").subscribe(result => {
            if (result) {
                this._httpClient.put(`${environment.API_URL}evento/encerrarvendasevento/${event.id}`, null, {
                    headers: {
                        Authorization: `Bearer ${this._authService.accessToken}`
                    }
                }).pipe(catchError((error) => {
                    console.log(error)
                    throw error
                })).subscribe((data: ApiResponse<any>) => {

                    if (data.error) {
                        this.snackbarService.error(data.message);
                        return;
                    }

                    this.snackbarService.success("Evento encerrado com sucesso");
                    this.fetchEvents();
                })
            }
        })
    }

    endEvent(event) {
        this.confirmationService.confirm("Confirmar", "Tem certeza que deseja fechar o evento ?").subscribe(result => {
            if (result) {
                this._httpClient.put(`${environment.API_URL}evento/encerrarevento/${event.id}`, null , {
                    headers: {
                        Authorization: `Bearer ${this._authService.accessToken}`
                    }
                }).pipe(catchError((error) => {
                    console.log(error)
                    throw error
                })).subscribe((result: ApiResponse<any>) => {

                    if (result.error) {

                        console.log(result);
                        this.snackbarService.error(result.message);
                        return;
                    }

                    this.snackbarService.success("Evento reaberto com sucesso");
                    this.fetchEvents();

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
                } else {
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
            .subscribe((data: ApiResponse<Array<any>>) => {
                if (data.success) {

                    console.log(data.result);

                    this.events.set(data.result)

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


    showCashier(event) {

        this.dialog.open(CashierEventDetailComponent, {
            data: event,
            width: "99%"
        })
    }


    showAttendants(event) {
        this.dialog.open(AttendantsEventDetailComponent, {
            data: event,
            width: "99%"
        })
    }

    reopenEvent(event) {

        this.confirmationService.confirm("Confirmar", "Tem certeza que deseja reabrir as vendas para o evento?").subscribe(result => {
            if (result) {
                this._httpClient.put(`${environment.API_URL}evento/reabrirvendasevento/${event.id}`, null, {
                    headers: {
                        Authorization: `Bearer ${this._authService.accessToken}`
                    }
                }).pipe(catchError((error) => {
                    console.log(error)
                    throw error
                })).subscribe((data: ApiResponse<any>) => {

                    if (data.error) {
                        this.snackbarService.error(data.message);
                        return;
                    }

                    this.snackbarService.success("Evento reaberto com sucesso");
                    this.fetchEvents();
                })
            }
        })
    }
}
