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
  public animatingItemIndex: number | null = null;

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
        firstMenuItem.focus;
      }
    }, 100);
  }

  /**
   * Este método ahora es llamado tanto por el click como por el Enter.
   * @param item El objeto del menú seleccionado.
   * @param index El índice del elemento en el array, para la animación.
   */
  selectMenuItem(item: MenuItem, index: number): void {
    // 1. Activamos la animación estableciendo el índice
    this.animatingItemIndex = index;

    // 2. Esperamos a que la animación CSS se complete (o sea visible)
    setTimeout(() => {
      // 3. Navegamos a la ruta deseada
      this.router.navigate([item.route], {
        state: {
          userRole: this.currentUser?.role,
          fromDashboard: true,
        },
      });

      // 4. (Opcional pero recomendado) Reseteamos el estado de la animación
      //    Esto es útil si el usuario vuelve atrás rápidamente.
      this.animatingItemIndex = null;
    }, 150); // Mantenemos tu delay de 150ms
  }

  logout() {
    // Limpiar datos del usuario
    localStorage.removeItem('currentUser');

    // Redirigir al login
    this.router.navigate(['/login']);
  }
}
