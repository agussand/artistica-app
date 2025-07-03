import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userDetails = authService.getUserDetails();

  if (authService.isLoggedIn() && userDetails?.role === 'ADMIN') {
    return true; // Permite el acceso si está logueado Y es ADMIN
  } else {
    // Si no es admin, lo redirigimos al dashboard principal.
    router.navigate(['/dashboard']);
    return false;
  }
};
