import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy, OnInit{
  credentials = {
    username: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Focus inicial en el campo de usuario
    setTimeout(() => {
      const usernameInput = document.getElementById('username');
      if (usernameInput) {
        usernameInput.focus();
      }
    }, 100);
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }

  handleKeyDown(event: KeyboardEvent, currentField: string) {
    // Navegación con Enter
    if (event.key === 'Enter') {
      event.preventDefault();

      switch (currentField) {
        case 'username':
          document.getElementById('password')?.focus();
          break;
        case 'password':
          document.getElementById('loginButton')?.focus();
          if (this.isFormValid()) {
            this.onSubmit();
          }
          break;
        case 'loginButton':
          break;
      }
    }

    // Navegación con flechas (opcional, complementa Tab)
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusNextField(currentField);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusPreviousField(currentField);
    }
  }

  private focusNextField(currentField: string) {
    const fieldOrder = ['username', 'password', 'loginButton'];
    const currentIndex = fieldOrder.indexOf(currentField);
    const nextIndex = (currentIndex + 1) % fieldOrder.length;
    const nextFieldId = fieldOrder[nextIndex];

    document.getElementById(nextFieldId)?.focus();
  }

  private focusPreviousField(currentField: string) {
    const fieldOrder = ['username', 'password', 'loginButton'];
    const currentIndex = fieldOrder.indexOf(currentField);
    const prevIndex = currentIndex === 0 ? fieldOrder.length - 1 : currentIndex - 1;
    const prevFieldId = fieldOrder[prevIndex];

    document.getElementById(prevFieldId)?.focus();
  }

  private isFormValid(): boolean {
    return this.credentials.username.trim() !== '' &&
      this.credentials.password.trim() !== '';
  }

  async onSubmit() {
    if (!this.isFormValid() || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Simulación de autenticación (reemplazar con tu API)
      await this.simulateLogin();

      // Determinar rol y redirigir
      const userRole = this.determineUserRole();

      // Guardar información del usuario (temporalmente en localStorage)
      localStorage.setItem('currentUser', JSON.stringify({
        username: this.credentials.username,
        role: userRole,
        token: 'fake-jwt-token' // Reemplazar con token real
      }));

      // Redirigir al dashboard
      this.router.navigate(['/dashboard']);

    } catch (error) {
      this.errorMessage = 'Credenciales incorrectas. Por favor, intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  private async simulateLogin(): Promise<void> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validar credenciales (modo de prueba)
    const validCredentials = [
      { username: 'user', password: 'password', role: 'USER' },
      { username: 'admin', password: 'password', role: 'ADMIN' }
    ];

    const isValid = validCredentials.some(cred =>
      cred.username === this.credentials.username &&
      cred.password === this.credentials.password
    );

    if (!isValid) {
      throw new Error('Invalid credentials');
    }
  }

  private determineUserRole(): string {
    // Lógica simple para determinar el rol
    if (this.credentials.username === 'admin') {
      return 'ADMIN';
    }
    return 'USER';
  }


}
