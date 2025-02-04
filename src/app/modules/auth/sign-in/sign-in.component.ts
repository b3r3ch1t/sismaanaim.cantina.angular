import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
    ValidatorFn,
    ValidationErrors,
    AbstractControl
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [
        RouterLink,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
    ],
})

export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    @ViewChild('emailInput', { static: true }) emailInput: ElementRef;

    /**
     * On init
     */
    ngOnInit(): void {

        this.emailInput.nativeElement.addEventListener('input', (event: Event) => {
            const input = event.target as HTMLInputElement;
            input.value = input.value.replace(/[^0-9.]/g, '');
        });

        // Create the form
        this.signInForm = this._formBuilder.group({
            email: [
                '', // 'hughes.brian@company.com'
                {
                    validators: [Validators.required, this.createCpfValidator()],
                }
            ],
            password: [
                '',  // admin
                {
                    validators: [Validators.required],
                }],
            rememberMe: [''],
        });
    }



    createCpfValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;


            const isValid = this.validarCPF(value);
            return isValid ? null : { invalidCpf: true };
        };
    }

    validarCPF(cpf: string): boolean {
        // Remove caracteres não numéricos
        const cpfLimpo = cpf.replace(/\D/g, '');

        const validCPF = "19073856060" // '00000010191'

        if(cpfLimpo=== validCPF) return true;

        // Verifica se o CPF tem 11 dígitos ou é inválido
        if (cpfLimpo.length !== 11 || /^(\d)\1+$/.test(cpfLimpo)) {
            return false;
        }

        // Função auxiliar para cálculo do dígito verificador
        const calcularDigito = (base: string, pesoInicial: number): number => {
            const soma = base
                .split('')
                .reduce((acc, num, index) => acc + parseInt(num) * (pesoInicial - index), 0);
            const resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        };

        // Calcula os dois dígitos verificadores
        const base = cpfLimpo.substring(0, 9);
        const digito1 = calcularDigito(base, 10);
        const digito2 = calcularDigito(base + digito1, 11);

        // Verifica se os dígitos calculados são iguais aos fornecidos
        return cpfLimpo === base + digito1 + digito2;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value).subscribe(
            (response) => {
                // console.log(response)

                // Set the redirect url.
                // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                // to the correct page after a successful sign in. This way, that url can be set via
                // routing file and we don't have to touch here.
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get(
                        'redirectURL'
                    ) || '/signed-in-redirect';

                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);
            },
            (response) => {
                // Re-enable the form
                this.signInForm.enable();

                // Reset the form
                this.signInNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: 'Wrong email or password',
                };

                // Show the alert
                this.showAlert = true;
            }
        );
    }
}
