import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UserDetails } from '../../core/models/auth.model';

import { Router, RouterLink } from '@angular/router';
import { ConfirmationService } from '../../core/services/confirmation/confirmation.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  // Con @Input, el componente padre puede pasarle datos.
  @Input() title: string = 'Mi Aplicación';
  @Input() user: UserDetails | null = null;
  // Nuevo Input: por defecto, el botón de volver no se muestra.
  @Input() showBackButton: boolean = false;

  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  onLogout(): void {
    this.confirmationService.confirm(
      '¿Está seguro de que desea cerrar sesión?',
      () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    );
    // Cuando se hace clic en el botón, emitimos el evento.
  }
}
