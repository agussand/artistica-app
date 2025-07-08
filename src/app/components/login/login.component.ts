import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginError: string | null = null;
  isLoading = false;
  private authService = inject(AuthService);

  private fb = inject(FormBuilder);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  ngOnInit(): void {
    this.focusUserInput();
  }

  focusUserInput() {
    const userInput = document.getElementById('username');
    userInput?.focus();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return; // Si el formulario no es válido, no hacemos nada.
    }
    this.isLoading = true;
    this.loginError = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // ¡Éxito! Navegamos al dashboard.
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // Ocurrió un error. Usamos el mensaje de nuestro GlobalExceptionHandler.
        this.isLoading = false;
        if (err.status === 403) {
          this.loginError =
            'Credenciales inválidas. Por favor, verifique el usuario y la contraseña.';
        } else {
          this.loginError =
            'Ocurrió un error inesperado. Por favor, intente más tarde.';
        }
        console.error(err);
      },
    });
  }
}
