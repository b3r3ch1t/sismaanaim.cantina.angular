import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { SnackbarService } from 'app/services/snackbar.service';

@Component({
    selector: 'app-client-loading',
    templateUrl: './client-loading.component.html',
    styleUrls: ['./client-loading.component.css'],
    imports: [


        CommonModule

    ]
})
export class ClientLoadingComponent implements OnInit {

    selectedFile?: File;
    uploadProgress: number = 0;
    message: string = '';

    private readonly _httpClient = inject(HttpClient)
    private readonly _authService = inject(AuthService)



    constructor(

        private readonly snackbarService: SnackbarService,

    ) { }

    ngOnInit() {
    }


    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    uploadFile(): void {
        if (!this.selectedFile) {
            this.message = 'Por favor, selecione um arquivo primeiro.';
            return;
        }

        const formData = new FormData();
        formData.append('file', this.selectedFile, this.selectedFile.name);

        const headers = new HttpHeaders().set(
            'Authorization',
            `Bearer ${this._authService.accessToken}`
        );

        //     this._httpClient
        //         .post<ApiResponse<any>>(
        //             `${environment.API_URL}clientes/importarclientes`,
        //             formData,
        //             {
        //                 headers: headers,
        //                 reportProgress: true,
        //                 observe: 'events',
        //             }
        //         )
        //         .subscribe({
        //             next: (event) => {
        //                 if (event.type === HttpEventType.UploadProgress && event.total) {
        //                     this.uploadProgress = Math.round(
        //                         (100 * event.loaded) / event.total
        //                     );
        //                 } else if (event instanceof HttpResponse) {
        //                     const response = event.body;

        //                     console.log('Resposta do servidor:', response);


        //                     if (response?.success) {
        //                         this.snackbarService.success(
        //                             'Upload realizado com sucesso!'
        //                         );
        //                     } else if (response?.error) {
        //                         this.snackbarService.error(
        //                             response.errors.join(', ')
        //                         );
        //                     }
        //                 }
        //             },
        //             error: (error) => {
        //                 console.error('Erro no upload:', error);
        //                 this.snackbarService.error(
        //                     'Ocorreu um erro ao enviar o arquivo.'
        //                 );
        //             },
        //         });
        // }



        this._httpClient
            .post<ApiResponse<any>>(
                `${environment.API_URL}clientes/importarclientes`,
                formData,
                {
                    headers: headers,
                    reportProgress: true,
                    observe: 'events',
                }
            )
            .subscribe({
                next: (event) => {
                    if (event instanceof HttpResponse) {


                        const response = event.body;

                        console.log('Resposta do servidor:', response);
                        if (response?.success) {
                            this.snackbarService.success(response.result);
                        } else if (response?.errors) {
                            this.snackbarService.error(response.message);
                        }
                    }
                },
                error: (error) => {
                    console.error('Erro no upload:', error);
                    this.snackbarService.error('Ocorreu um erro ao enviar o arquivo.');
                },
            });

    }
}
