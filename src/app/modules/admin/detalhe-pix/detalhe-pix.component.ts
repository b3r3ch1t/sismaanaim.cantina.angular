import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from 'app/environments/environment';
import { DetalhePix } from 'app/interfaces/DetalhePix.types';
import { DateTime } from 'luxon';
import { ApiResponse } from 'app/core/api/api-response.types';

@Component({
    selector: 'app-detalhe-pix',
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        HttpClientModule,
        MatIconModule,
        MatDialogModule,
        MatButtonModule,
        MatCardModule],
    templateUrl: './detalhe-pix.component.html',
    styleUrl: './detalhe-pix.component.scss'
})
export class DetalhePixComponent implements OnInit {


    loading: boolean = false;
    error: boolean = false;
    isExpired: boolean;

    currentUrl: string;
    detalhePix: DetalhePix | null = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private httpClient: HttpClient,
        @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: DetalhePix,
        public dialog: MatDialog,
        private _snackBar: MatSnackBar,
    ) {

        this.currentUrl = environment.Checkout_URL;
    }

    ngOnInit(): void {
        // Se vier do dialog, usar os dados do dialog
        if (this.dialogData) {
            this.detalhePix = this.dialogData;
            this.getExpired();
        } else {
            // Se vier da rota, buscar os dados pela API
            const id = this.route.snapshot.paramMap.get('id');
            if (id) {
                this.loadPixDetails(id);
            }
        }

        this.router.events.subscribe(() => {
            this.currentUrl = environment.Checkout_URL;
        });
    }

    loadPixDetails(id: string): void {
        this.loading = true;
        this.error = false;

        this.httpClient.get<ApiResponse<DetalhePix>>(`${environment.API_URL}pix/detalhes/${id}`)
            .subscribe({
                next: (response) => {
                    if (response.success && response.result) {
                        this.detalhePix = response.result;
                        this.getExpired();
                    } else {
                        this.error = true;
                    }
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Erro ao carregar detalhes do PIX:', error);
                    this.error = true;
                    this.loading = false;
                }
            });
    }


    copiarCodigo() {
        if (!this.detalhePix) return;

        navigator.clipboard.writeText( environment.Checkout_URL+ this.detalhePix.cobrancaId).then(() => {
            this.openSnackBar("Endereço do checkout copiado com sucesso","sucess","sucess") ;
        }).catch(err => {
            console.error('Erro ao copiar código: ', err);
        });
    }


    copiarCodigoPIX() {
        if (!this.detalhePix) return;

        navigator.clipboard.writeText(this.detalhePix.codigo).then(() => {
            this.openSnackBar("Código copiado com sucesso","sucess","sucess") ;


        }).catch(err => {
            console.error('Erro ao copiar código: ', err);
        });
    }


    getExpired() {
        if (!this.detalhePix) return;
        
        const now = DateTime.now();
        const dataCobranca = DateTime.fromISO(this.detalhePix.dataExpiracao.toString())

       this.isExpired= now >= dataCobranca;
    }

    getDataExpiracaoColor( ): string {
        this.getExpired();
        return !this.isExpired ? 'orange' : 'red';
    }


    openSnackBar(message: string, type: string, classCSS: string) {
         
    }



    onClose() {
        this.dialog.closeAll();
    }

}
