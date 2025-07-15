import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { ArticulosAdminContainerComponent } from './admin/articulos/articulos-admin-container/articulos-admin-container.component';
import { adminGuard } from './core/guards/admin.guard';
import { ArticulosContainerComponent } from './components/articulos/articulos-container/articulos-container.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { PresupuestoContainerComponent } from './components/presupuestos/presupuesto-container/presupuesto-container.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'articulos',
    component: ArticulosContainerComponent,
    canActivate: [authGuard],
  },
  {
    path: 'presupuesto',
    component: PresupuestoContainerComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin/articulos',
    component: ArticulosAdminContainerComponent,
    canActivate: [adminGuard], // Protegemos la ruta con el nuevo guard
  },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
