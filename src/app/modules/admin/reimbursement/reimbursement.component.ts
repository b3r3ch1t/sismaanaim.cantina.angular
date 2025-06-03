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
import { MatRadioGroup, MatRadioModule } from "@angular/material/radio"
import { environment } from 'app/environments/environment';
import { SnackbarService } from 'app/services/snackbar.service';
import { ConfirmationService } from 'app/services/confirmation.service';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ReimbursementModalComponent } from './reimbursement-modal/reimbursement-modal.component';

@Component({
    selector: 'app-reimbursement',
    imports: [
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatRadioModule,
        CurrencyMaskModule,


        MatTableModule,
        MatSort,
        MatPaginator,
    ],
    providers: [CurrencyPipe, CustomCurrencyPipe],
    templateUrl: './reimbursement.component.html',
    styleUrl: './reimbursement.component.scss'
})

export class ReimbursementComponent implements OnInit {

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)
    private readonly _userService = inject(UserService);
    private readonly _customCurrencyPipe = inject(CustomCurrencyPipe)

    noClientFound = signal(false);
    clients = signal([]);
    paymentMethods = signal([]);
    showClearButton = signal(false);
    inputDisabled = signal(false);
    selectedClient = signal(null);
    disableClientDropdown = signal(false);
    disablePaymentMethodDropdown = signal(false);
    validPaidInput = signal(null);
    validRechargeInput = signal(null);
    validPaymentMethod = signal(null);
    currentEvent = signal(null);
    selectedClientBalance = signal([])
    balanceAgainstPaymentMethod = signal(null)
    clientDataSource = signal(new MatTableDataSource([]));
    displayedColumns = [
        "Nome",
        "CPF",
        "Ressarcimento"
    ]


    @ViewChild('nameInput', { static: true }) nameInput: ElementRef;
    @ViewChild('cpfInput', { static: true }) cpfInput: ElementRef;
    @ViewChild('clientDropdown', { static: false }) clientDropdown: MatRadioGroup;
    @ViewChild('paymentMethodDropdown', { static: false }) paymentMethodDropdown: MatSelect;
    @ViewChild('returnAmountValueInput', { static: false }) returnAmountValueInput: ElementRef;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;
    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

    constructor(
        private readonly snackbar: SnackbarService,
        private readonly confirmationService: ConfirmationService,
        private readonly dialog: MatDialog,
    ) { }

    ngOnInit(): void {
        this.loadCashRegister();
    }

    handleSubmit() {


        if (this.returnAmountValueInput.nativeElement.value == null) {
            this.validRechargeInput.set(false);
            return
        }


        if (this.currentEvent() === null) {
            console.log('current event (cash register) is null')
            return
        }

        if (this.selectedClient() === null) {
            console.log('selected client is null');
        }

        const value = parseFloat(this.returnAmountValueInput.nativeElement.value.replace(".", "").replace(",", "."));
        const amount = this._customCurrencyPipe.transform(value);



        this.confirmationService.confirm('Reembolso', 'Deseja realmente estornar o reembolso para o cliente?').subscribe((result) => {
            if (result) {


                this._httpClient.post(`${environment.API_URL}caixa/estornarvalorcliente`, {
                    "caixaId": this.currentEvent().id,
                    "valor": value,
                    "clienteId": this.selectedClient().id
                }).pipe(
                    catchError((error) => {
                        console.log(error);
                        throw error
                    })
                ).subscribe((response: ApiResponse<any>) => {


                    if (response.success) {

                        const value = parseFloat(this.returnAmountValueInput.nativeElement.value.replace(".", "").replace(",", "."))
                        const amount = this._customCurrencyPipe.transform(value)
                        this.snackbar.success(`*O Reembolso para o cliente ‘${this.selectedClient().nome}’ no valor de ‘${amount}’ foi feito com sucesso`, 30 * 1000)
                        this.clearInputs();

                    }

                    if (response.error) {
                        this.snackbar.error(response.message, 30 * 1000)
                    }
                })

            }
        }


        );

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
                this.currentEvent.set(response.result);
            }

        });
    }
    handleNameInput(event: InputEvent) {
        this.noClientFound.set(false)
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

                        const dataSource = new MatTableDataSource(data.result);

                        // Set default sort to 'Data' column in descending order
                        if (this.sort) {
                            this.sort.active = 'nome';
                            this.sort.direction = 'asc';
                        }

                        // Set the paginator and sort
                        dataSource.paginator = this.paginator;
                        dataSource.sort = this.sort;
                        // Update the signal
                        this.clientDataSource.set(dataSource);


                        const clients = data.result;
                        this.clients.set(clients);

                        if (this.clients().length === 1) {
                            this.selectedClient.set(this.clients()[0]);
                        }

                        if (!this.clients().length) {


                            this.noClientFound.set(true);
                            this.snackbar.error("Nenhum cliente encontrado com esse CPF", 30 * 1000);

                        }
                    }
                    this.showClearButton.set(true)
                });

        } else {
            this.showClearButton.set(false)
        }
    }

    handleCpfInput(event: InputEvent) {
        this.noClientFound.set(false)
        const input = event.target as HTMLInputElement;
        if (input.value.length >= 4) {
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

                    const dataSource = new MatTableDataSource(data.result);

                    // Set default sort to 'Data' column in descending order
                    if (this.sort) {
                        this.sort.active = 'nome';
                        this.sort.direction = 'asc';
                    }

                    // Set the paginator and sort
                    dataSource.paginator = this.paginator;
                    dataSource.sort = this.sort;
                    // Update the signal
                    this.clientDataSource.set(dataSource);


                    const clients = data.result;
                    this.clients.set(clients);

                    this.showClearButton.set(true);

                    if (this.clients().length === 1) {
                        this.selectedClient.set(this.clients()[0]);

                    }

                    if (!this.clients().length) {

                        this.showClearButton.set(false);
                        this.noClientFound.set(true);
                        this.snackbar.error("Nenhum cliente encontrado com esse CPF", 30 * 1000);

                    }
                });

        } else {
            this.showClearButton.set(false)
        }
    }

    applyFilter(event: Event) {

        const filterValue = (event.target as HTMLInputElement).value;
        this.clientDataSource().filter = filterValue.trim().toLowerCase();
    }

    clearInputs() {

        this.showClearButton.set(false);
        this.inputDisabled.set(false);
        this.clients.set([]);
        this.selectedClient.set(null);

        if (this.cpfInput) {
            this.cpfInput.nativeElement.value = '';
        }

        if (this.nameInput) {
            this.nameInput.nativeElement.value = '';
        }


        this.clientDataSource.set(new MatTableDataSource([]));

    }


    handleClientSelection(clientId: string) {
        if (clientId) {


            const cliente = this.clients()
                .find(cliente => cliente.id === clientId);

            console.log(cliente);


            const dialogRef = this.dialog.open(ReimbursementModalComponent, {
                data: cliente,
                width: "99%"
            });

            dialogRef.afterClosed().subscribe(result => {
                this.clearInputs();
            });



        }
    }




}
