import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KeyboardNavigableDirective } from '../../shared/directives/keyboard-navigable/keyboard-navigable.directive';
import { KeyboardNavigationService } from '../../core/services/keyboard-navigation/keyboard-navigation.service';
import { UserDetails } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { ShortcutsFooterComponent } from '../../shared/shortcuts-footer/shortcuts-footer.component';
import { Shortcut } from '../../shared/models/shortcut.model';
import { MenuItem } from '../../shared/models/menu.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KeyboardNavigableDirective,
    HeaderComponent,
    ShortcutsFooterComponent
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  public dashboardShortcuts: Shortcut[] = [
    { key: '↑↓', description: 'Navegar' },
    { key: 'Enter', description: 'Seleccionar' },
  ];

  private readonly menuItems: MenuItem[] = [
    {
      id: 'articulos',
      title: 'Buscar/Listar Artículos',
      description: 'Explora y gestiona el catálogo de productos disponibles',
      route: '/articulos',
      icon: '📦',
      roles: ['USUARIO', 'ADMIN'],
      shortcut: '1',
    },
    {
      id: 'presupuesto',
      title: 'Nuevo Presupuesto',
      description: 'Crea presupuestos seleccionando productos y cantidades',
      route: '/presupuesto',
      icon: '💰',
      roles: ['USUARIO', 'ADMIN'],
      shortcut: '2',
    },
    {
      id: 'admin-articulos',
      title: 'Gestión de Artículos',
      description: 'Administra precios, descripciones y datos de productos',
      route: '/admin/articulos',
      icon: '⚙️',
      roles: ['ADMIN'],
      shortcut: '1',
    },
  ];

  currentUser: UserDetails | null = null;
  public selectedMenuItem: MenuItem | null = null;
  public animatingItemIndex: number | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);
  public keyboardNav = inject(KeyboardNavigationService);

  constructor() {}

  ngOnInit() {
    this.currentUser = this.authService.getUserDetails();
    this.focusFirstMenuItem();

    // Opcional: Si por alguna razón no hay usuario (ej. token inválido),
    // podríamos redirigir al login.
    if (!this.currentUser) {
      this.logout();
    }
  }

  ngOnDestroy() {}

  /**
   * Getter que filtra los items del menú según el rol del usuario actual.
   * La lógica ahora es mucho más simple.
   */
  get availableMenuItems(): MenuItem[] {
    if (!this.currentUser?.role) {
      return [];
    }
    return this.menuItems.filter((item) =>
      item.roles.includes(this.currentUser!.role)
    );
  }

  private focusFirstMenuItem() {
    setTimeout(() => {
      const firstMenuItem = document.getElementById('menu-item-0');
      if (firstMenuItem) {
        firstMenuItem.focus();
        this.keyboardNav.activeIndex = 0;
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
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
