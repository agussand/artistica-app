import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from './MenuItem';
import { Router } from '@angular/router';
import { CommonModule, NgForOf } from '@angular/common';
import { KeyboardNavigableDirective } from '../../shared/directives/keyboard-navigable.directive';
import { KeyboardNavigationService } from '../../core/services/keyboard-navigation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgForOf, KeyboardNavigableDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly menuItems: MenuItem[] = [
    {
      id: 'articulos',
      title: 'Buscar/Listar Artículos',
      description: 'Explora y gestiona el catálogo de productos disponibles',
      route: '/articulos',
      icon: '📦',
      roles: ['USER', 'ADMIN'],
      shortcut: '1',
    },
    {
      id: 'presupuesto',
      title: 'Nuevo Presupuesto',
      description: 'Crea presupuestos seleccionando productos y cantidades',
      route: '/presupuesto',
      icon: '💰',
      roles: ['USER'],
      shortcut: '2',
    },
    {
      id: 'admin-articulos',
      title: 'Gestión de Artículos',
      description: 'Administra precios, descripciones y datos de productos',
      route: '/articulos',
      icon: '⚙️',
      roles: ['ADMIN'],
      shortcut: '1',
    },
  ];

  currentUser: any = null;
  public selectedMenuItem: MenuItem | null = null;

  private router = inject(Router);
  public keyboardNav = inject(KeyboardNavigationService);

  constructor() {}

  ngOnInit() {
    this.loadCurrentUser();
    this.focusFirstMenuItem();

    // Listener global para shortcuts de teclado
  }

  ngOnDestroy() {}

  private loadCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    } else {
      // Si no hay usuario, redirigir al login
      this.router.navigate(['/login']);
    }
  }

  get availableMenuItems(): MenuItem[] {
    if (!this.currentUser) return [];

    return this.menuItems.filter((item) =>
      item.roles.includes(this.currentUser.role)
    );
  }

  private focusFirstMenuItem() {
    setTimeout(() => {
      const firstMenuItem = document.getElementById('menu-item-0');
      if (firstMenuItem) {
        firstMenuItem.focus();
      }
    }, 100);
  }

  selectMenuItem(item: MenuItem) {
    // Agregar una pequeña animación antes de navegar
    const menuElement = document.getElementById(
      `menu-item-${this.availableMenuItems.indexOf(item)}`
    );
    if (menuElement) {
      menuElement.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.router.navigate([item.route], {
          state: {
            userRole: this.currentUser?.role,
            fromDashboard: true,
          },
        });
      }, 150);
    }
  }

  logout() {
    // Limpiar datos del usuario
    localStorage.removeItem('currentUser');

    // Redirigir al login
    this.router.navigate(['/login']);
  }
}
