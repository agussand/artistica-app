import {
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { KeyboardNavigationService } from '../../core/services/keyboard-navigation.service';

@Directive({
  selector: '[keyboardNavigable]',
  standalone: true,
})
export class KeyboardNavigableDirective implements OnInit, OnDestroy {
  private enterSubscription: Subscription | undefined;
  private escapeSubscription: Subscription | undefined;

  // Emitimos un evento cuando se presiona Enter sobre este elemento
  @Output() enterPress = new EventEmitter<void>();

  constructor(
    private elementRef: ElementRef,
    private keyboardNav: KeyboardNavigationService
  ) {}

  // Añadimos una clase CSS 'active-nav' cuando este elemento es el activo
  @HostBinding('class.active-nav')
  get isActive(): boolean {
    return (
      this.keyboardNav.navigableElements[this.keyboardNav.activeIndex] ===
      this.elementRef
    );
  }

  ngOnInit(): void {
    this.keyboardNav.register(this.elementRef);

    // Nos suscribimos al evento Enter, pero solo reaccionamos si somos el elemento activo
    this.enterSubscription = this.keyboardNav.onEnter$
      .pipe(filter((element) => element === this.elementRef))
      .subscribe(() => {
        this.enterPress.emit();
      });

    // Opcional: escuchar al escape para quitar el foco
    this.escapeSubscription = this.keyboardNav.onEscape$.subscribe(() => {
      // La clase 'active-nav' se quitará automáticamente por el HostBinding
      // al cambiar `activeIndex` a -1 en el servicio.
    });
  }

  ngOnDestroy(): void {
    this.keyboardNav.unregister(this.elementRef);
    this.enterSubscription?.unsubscribe();
    this.escapeSubscription?.unsubscribe();
  }
}
