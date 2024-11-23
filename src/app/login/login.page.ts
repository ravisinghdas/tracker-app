import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from '../services/app.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    loginForm: FormGroup;
    passwordType: string = 'password';
    passwordIcon: string = 'eye';
    processing: boolean = false;

    validation_messages = {
        email: [
            { type: "required", message: "Email is required." },
            { type: "pattern", message: "Enter a valid email." }
        ],
        password: [
            { type: "required", message: "Password is required." }
        ]
    };

    @HostListener('document:keydown.enter', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        this.login();
    }

    constructor(
        private service: AppService
    ) { }

    ngOnInit() {
        this.loginForm = new FormGroup({
            'email': new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]),
            'password': new FormControl('', [Validators.required])
        });
    }

    hideShowPassword() {
        this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
        this.passwordIcon = this.passwordIcon === 'eye' ? 'eye-off' : 'eye';
    }

    login() {
        this.loginForm.markAllAsTouched();
        if (this.loginForm.valid) {
            this.processing = true;
            this.service.login(this.loginForm.value).subscribe((response: any) => {
                const { success } = response;
                this.service.account = success;
                this.service.accessToken = success.token;
                this.service.refreshToken = success.refresh_token;
                this.service.isAuthenticated.next(true);
                this.service.storage.set(success);
                this.processing = false;
                this.service.goToRoot('/map', { replaceUrl: true });
            }, (err) => {
                this.processing = false;
                const emailError = err.error.error.emailError;
                const passwordError = err.error.error.passwordError;

                this.service.presentAlert(emailError || passwordError)
            });
        }

    }

}
