import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  LoginPOSTDTO,
  LoginResponse,
  UserDetails,
} from '../../models/auth.model';
import { environment } from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  /**
   * Envía las credenciales al backend para autenticar al usuario.
   * @param credentials Un objeto con 'username' y 'password'.
   * @returns Un Observable con la respuesta del login.
   */
  login(credentials: LoginPOSTDTO): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        // Usamos el operador 'tap' de RxJS para ejecutar una acción secundaria
        // sin modificar la respuesta: guardar el token.
        tap((response) => {
          if (response.token) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
          }
        })
      );
  }

  /**
   * Cierra la sesión del usuario eliminando el token.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // Aquí también podrías navegar al login o notificar a otros servicios.
  }

  /**
   * Obtiene el token JWT almacenado.
   * @returns El token como string, o null si no existe.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica si el usuario está logueado Y si su token no ha expirado.
   * @returns true si hay un token válido y vigente, false en caso contrario.
   */
  isLoggedIn(): boolean {
    const userDetails = this.getUserDetails();

    if (!userDetails) {
      return false; // No hay token o está malformado.
    }

    // El campo 'exp' del token JWT está en segundos. Date.now() está en milisegundos.
    // Comparamos si la fecha de expiración es mayor que la fecha actual.
    const isTokenExpired = userDetails.exp < Date.now() / 1000;

    if (isTokenExpired) {
      this.logout(); // Limpiamos el token expirado por higiene.
      return false;
    }

    return true;
  }

  /**
   * Decodifica el token JWT para obtener los detalles del usuario.
   * @returns Un objeto UserDetails o null si no hay token o es inválido.
   */
  getUserDetails(): UserDetails | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const rawDetails = JSON.parse(decodedPayload);

      // El servicio actúa como traductor: convierte el array 'authorities'
      // del backend a un único string 'role' para el frontend.
      const userDetails: UserDetails = {
        sub: rawDetails.sub,
        role:
          rawDetails.authorities && rawDetails.authorities.length > 0
            ? rawDetails.authorities[0].authority
            : '', // Si no hay rol, se asigna un string vacío
        iat: rawDetails.iat,
        exp: rawDetails.exp,
      };

      return userDetails;
    } catch (error) {
      console.error('Error al decodificar el token JWT', error);
      return null;
    }
  }
}
