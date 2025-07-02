export interface LoginResponse {
  token: string;
}

export interface LoginPOSTDTO {
  usuario: string;
  password: string;
}

export interface UserDetails {
  sub: string; // 'subject', que es el username
  role: string; // Los roles/permisos
  iat: number; // 'issued at'
  exp: number; // 'expiration'
}
