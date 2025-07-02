import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Usamos 'inject' para obtener una instancia del servicio, en lugar del constructor.
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si no hay token, simplemente dejamos pasar la petición original.
  if (!token) {
    return next(req);
  }

  // Si hay token, clonamos la petición y añadimos la cabecera.
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Dejamos que la petición clonada continúe su camino.
  return next(clonedRequest);
};
