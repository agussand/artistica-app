import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [loginGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'articulos',
    loadComponent: () =>
      import('./components/articulos/articulos.component').then(
        (m) => m.ArticulosComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'presupuesto',
    loadComponent: () =>
      import('./components/presupuesto/presupuesto.component').then(
        (m) => m.PresupuestoComponent
      ),
    canActivate: [authGuard],
  },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
