import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
    //Acá va el guard de autenticación mas adelante
  },
  {
    path: 'articulos',
    loadComponent: () => import('./components/articulos/articulos.component').then(m => m.ArticulosComponent)
  },
  {
    path: 'presupuesto',
    loadComponent: () => import('./components/presupuesto/presupuesto.component').then(m => m.PresupuestoComponent)
  },
  { path: '**', redirectTo: '/login' }
];
