
import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { MatCard, MatCardHeader, MatCardContent, MatCardActions } from "@angular/material/card";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseConfirmationService } from '@fuse/services/confirmation/public-api';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { ApiResponse } from 'app/core/api/api-response.types';
import { FuseUtilsService } from '@fuse/services/utils';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';

@Component({
    selector: 'app-member-recarga',
    standalone: true,
    imports: [

        CommonModule,
        MatCard,
        MatCardHeader,
        MatCardContent,
        MatTabGroup,
        MatTableModule,
        MatIconModule,
        MatTab,
        MatFormField,
        MatLabel,
        MatCardActions,
        MatInputModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        CurrencyMaskModule,
    ],
    providers: [

        CurrencyPipe,
        CustomCurrencyPipe,
    ],
    templateUrl: './member-recarga.component.html',
    styleUrl: './member-recarga.component.scss'

})
export class MemberRecargaComponent implements OnInit, OnDestroy {





    readonly clienteSignal = signal<any | null>(null);
    registrationForm: FormGroup;
    displayedColumns: string[] = ['nome', 'acoes'];
    dataSource = new MatTableDataSource<any>([]);
    registrationOtherForm: FormGroup;
    loading = false;

    // Controle de bloqueio
    horarioBloqueio: Date | null = null;
    tempoRestante: string = '';
    bloqueioAtivo: boolean = false;
    private timerInterval: any;

    constructor(
        private readonly http: HttpClient,
        private readonly authService: AuthService,
        private readonly fuseUtils: FuseUtilsService,
        private readonly fb: FormBuilder,

        private readonly snackbar: MatSnackBar,
        private readonly _fuseConfirmationService: FuseConfirmationService,

    ) { }


    ngOnInit(): void {
        // Verifica bloqueio ao iniciar
        const bloqueioStr = localStorage.getItem('horarioBloqueio');

        if (bloqueioStr) {
            const bloqueioDate = new Date(bloqueioStr);
            if (bloqueioDate > new Date()) {
                this.horarioBloqueio = bloqueioDate;
                this.bloqueioAtivo = true;
                this.atualizarTempoRestante();
                if (this.timerInterval) clearInterval(this.timerInterval);
                this.timerInterval = setInterval(() => {
                    this.atualizarTempoRestante();
                }, 1000);
                this.atualizarTempoRestante();
            }
            if (!this.horarioBloqueio) return;
            const agora = new Date();
            const diff = this.horarioBloqueio.getTime() - agora.getTime();
            if (diff <= 0) {
                this.bloqueioAtivo = false;
                this.tempoRestante = '';
                localStorage.removeItem('horarioBloqueio');
                if (this.timerInterval) clearInterval(this.timerInterval);
                return;
            }
            const minutos = Math.floor(diff / 60000);
            const segundos = Math.floor((diff % 60000) / 1000);
            this.tempoRestante = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }

        this.registrationForm = this.fb.group({
            valor: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^(?:[1-9]\d{2,}|[1-9]\d|10)(?:[.,]\d{2})?$/) // Aceita valores >= 10.00
                ]
            ],
        });

        this.registrationOtherForm = this.fb.group({
            valor: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^(?:[1-9]\d{2,}|[1-9]\d|10)(?:[.,]\d{2})?$/) // Aceita valores >= 10.00
                ]
            ],
            cpf: ['', [Validators.required]],
        });

        this.carregarSaldoCliente();
    }

    async carregarSaldoCliente() {
        try {
            const result = await firstValueFrom(
                this.http.get<ApiResponse<any>>(`${environment.API_URL}clientes/getsaldoclientelogado`, {
                    headers: {
                        'Authorization': `Bearer ${this.authService.accessToken}`
                    }
                })
            );

            if (result.success && result.result) {
                console.log('Cliente logado:', result.result);
                this.clienteSignal.set(result.result);
            } else {
                console.log('Cliente não encontrado');
                this.clienteSignal.set(null);
            }
        } catch (error) {
            console.error('Erro ao carregar saldo do cliente:', error);
            this.clienteSignal.set(null);
        }
    }


    onSubmitCpf() {


        if (this.registrationForm.valid) {

            const valor = this.registrationForm.get('valor')?.value;
            const formattedValue = valor;
            const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });


            const confirmationMessage = ` Deseja confirmar a recarga ? <br>
                Nome: ${this.clienteSignal()?.nome} <br>
                Valor: ${formatter.format(formattedValue)} <br>`;

            const dialogRef = this._fuseConfirmationService.open({
                title: "SisMaanaim",
                message: confirmationMessage,
                icon: {
                    color: "warning"
                },
                actions: {
                    confirm: {
                        show: true,
                        label: "Realizar recarga",
                        color: "primary"
                    },
                    cancel: {
                        show: true,
                        label: "Cancelar"
                    }
                },
                dismissible: false
            });

            // Subscribe to afterClosed from the dialog reference
            dialogRef.afterClosed().subscribe(async (result) => {

                console.log("valor:", valor);


                if (result == 'confirmed') {
                    this.loading = true;
                    try {
                        this.loading = true;
                        
                        const response = await firstValueFrom(
                            this.http.post<ApiResponse<any>>(`${environment.API_URL}clientes/adicionarrecarga?valor=${valor}`, null, {
                                headers: {
                                    'Authorization': `Bearer ${this.authService.accessToken}`
                                }
                            })
                        );
                        
                        this.loading = false;
                        
                        if (response.success) {
                            this.snackbar.open('Recarga realizada com sucesso!', 'Fechar', { duration: 3000 });
                            this.registrationForm.reset();
                            await this.carregarSaldoCliente();
                        } else {
                            this.snackbar.open(response.message || 'Erro ao realizar recarga', 'Fechar', { duration: 3000 });
                        }
                    } catch (error) {
                        console.error('Erro ao realizar recarga:', error);
                        this.snackbar.open('Erro ao realizar recarga. Tente novamente.', 'Fechar', { duration: 3000 });
                    } finally {
                        this.loading = false;
                    }
                }
            });

            this.loading = false;

        } else {
            console.log('Formulário inválido');
        }
    }


    async onSubmitCpfOther() {
        const dadosDoFormulario = this.registrationOtherForm.getRawValue();

        const cpf = dadosDoFormulario.cpf;

        try {
            const result = await firstValueFrom(
                this.http.get<ApiResponse<any[]>>(`${environment.API_URL}clientes/getclientesbycpf/${cpf}`, {
                    headers: {
                        'Authorization': `Bearer ${this.authService.accessToken}`
                    }
                })
            );

            if (result.result == null || result.result.length === 0 || result.error) {
                this.openSnackBar("Favor dirigir-se a um dos caixas !", "error", "error");
                this.registrationForm.patchValue({ cpf: "" });
            } else {

                console.log("Dados do cliente:", result.result);
                this.dataSource.data = result.result;
            }

        } catch (parseError) {
            console.error(
                'Falha ao analisar result.message para CobrancaDetail',
                parseError
            );
            this.openSnackBar("Este CPF não está cadastrado, favor dirigir-se a um dos caixas !", "error", "error");

        }
    }

    openSnackBar(message: string, type: string, classCSS: string) {
        this.snackbar.open(message, 'Fechar', {
            duration: 5000,
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            panelClass: [classCSS],
        });
    }


    cancel() {
        this.dataSource.data = [];
        this.registrationForm.patchValue({ cpf: "" });
    }

    limparCpf() {
        this.registrationOtherForm.patchValue({ cpf: "" });
        this.dataSource.data = [];
    }

    limparFormulario() {
        this.registrationOtherForm.reset();
        this.registrationForm.reset();
        this.dataSource.data = [];
    }

    InserirRecarga(id: string, nome: string) {
        const cliente = this.clienteSignal();

        console.log("Cliente:", cliente);
        console.log("ID:", id);


        const valor = this.registrationOtherForm.get('valor')?.value;
        const formattedValue = valor;
        const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });


        const confirmationMessage = ` Deseja confirmar o reabastecimento ? <br>
                Nome: ${nome} <br>
                Valor: ${formatter.format(formattedValue)} <br>`;

        const dialogRef = this._fuseConfirmationService.open({
            title: "SisMaanaim",
            message: confirmationMessage,
            icon: {
                color: "warning"
            },
            actions: {
                confirm: {
                    show: true,
                    label: "Realizar recarga",
                    color: "primary"
                },
                cancel: {
                    show: true,
                    label: "Cancelar"
                }
            },
            dismissible: false
        });

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe(async (result) => {
            if (result == 'confirmed') {
                this.loading = true;
                try {
                    this.loading = true;
                    // TODO: Implementar recarga para outros
                    /*
                    this.clienteService.recargaEfichasOthers(valor, id, this.clienteSignal()?.id).subscribe({
                        next: (response) => {

                            console.log("Response:", response);


                            if (response.success) {

                                if (response.code === 145) {
                                    this.snackbar.open("Usuário inválido. Aguarde 15 minutos para tentar novamente.", 'Fechar', { duration: 5000 });

                                    const now = new Date();
                                    const future = new Date(now.getTime() + 15 * 60000); // 15 minutos em ms
                                    localStorage.setItem('horarioBloqueio', future.toISOString());
                                    this.horarioBloqueio = future;
                                    this.bloqueioAtivo = true;
                                    this.atualizarTempoRestante();
                                    if (this.timerInterval) clearInterval(this.timerInterval);
                                    this.timerInterval = setInterval(() => {
                                        this.atualizarTempoRestante();
                                        this.atualizarTempoRestante();
                                    }, 1000);

                                    this.dataSource.data = [];
                                    this.registrationOtherForm.reset();
                                    return;
                                }

                                this.snackbar.open('Recarga realizada com sucesso!', 'Fechar', { duration: 3000 });
                                this.registrationForm.reset();
                                this.dataSource.data = [];
                                this.registrationOtherForm.reset();
                            } else {
                                this.snackbar.open('Erro ao realizar recarga: ' + response.message, 'Fechar', { duration: 3000 });
                            }
                        },
                        error: (error) => {
                            console.error('Erro ao realizar recarga:', error);
                            this.snackbar.open('Erro ao realizar recarga. Tente novamente.', 'Fechar', { duration: 3000 });
                        },
                        complete: () => {
                            this.loading = false;
                        }
                    });
                    */
                    this.loading = false;
                    this.snackbar.open('Função em desenvolvimento', 'Fechar', { duration: 3000 });
                } catch (error) {
                    console.error('Erro ao realizar recarga:', error);
                    this.snackbar.open('Erro ao realizar recarga. Tente novamente.', 'Fechar', { duration: 3000 });
                } finally {
                    this.loading = false;
                }
            }
        });

        this.loading = false;


    }

    ngOnDestroy(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    atualizarTempoRestante() {
        if (!this.horarioBloqueio) return;
        const agora = new Date();
        const diff = this.horarioBloqueio.getTime() - agora.getTime();
        if (diff <= 0) {
            this.bloqueioAtivo = false;
            this.tempoRestante = '';
            localStorage.removeItem('horarioBloqueio');
            if (this.timerInterval) clearInterval(this.timerInterval);
            return;
        }
        const minutos = Math.floor(diff / 60000);
        const segundos = Math.floor((diff % 60000) / 1000);
        this.tempoRestante = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }

}
