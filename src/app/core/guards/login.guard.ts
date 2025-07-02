import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Si el usuario ya está logueado, lo redirigimos al dashboard.
    router.navigate(['/dashboard']);
    return false;
  } else {
    // Si no está logueado, le permitimos el acceso a la página de login.
    return true;
  }
};
