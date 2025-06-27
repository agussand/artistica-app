import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { filter, fromEvent, Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KeyboardNavigationService implements OnDestroy {
  // Lista de elementos que se han registrado como navegables
  public navigableElements: ElementRef[] = [];
  public activeIndex = -1; // Comienza sin ningún elemento activo

  // Subjects para emitir eventos
  private readonly enterSubject = new Subject<ElementRef>();
  private readonly escapeSubject = new Subject<void>();
  private keyboardSubscription: Subscription;

  // Observables públicos
  public readonly onEnter$ = this.enterSubject.asObservable();
  public readonly onEscape$ = this.escapeSubject.asObservable();

  constructor() {
    this.keyboardSubscription = fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        // Solo procesamos si hay elementos navegables registrados
        filter(() => this.navigableElements.length > 0)
      )
      .subscribe((event) => {
        // Prevenimos scroll u otras acciones por defecto
        if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)) {
          event.preventDefault();
        }

        this.processKeyEvent(event);
      });
  }

  /**
   * Las directivas se registran a sí mismas aquí.
   * @param element La referencia del elemento a añadir.
   */
  register(element: ElementRef) {
    // Añadimos el elemento al array de navegables
    this.navigableElements.push(element);
  }

  /**
   * Las directivas se eliminan del registro al ser destruidas.
   * @param element La referencia del elemento a eliminar.
   */
  unregister(element: ElementRef) {
    const index = this.navigableElements.indexOf(element);
    if (index > -1) {
      this.navigableElements.splice(index, 1);
      // Si el elemento des-registrado era el activo, reseteamos
      if (index === this.activeIndex) {
        this.activeIndex = -1;
      }
    }
  }

  private processKeyEvent(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        this.moveNext();
        break;
      case 'ArrowUp':
        this.movePrevious();
        break;
      case 'Enter':
        if (this.activeIndex !== -1) {
          this.enterSubject.next(this.navigableElements[this.activeIndex]);
        }
        break;
      case 'Escape':
        this.activeIndex = -1; // Deseleccionar
        this.escapeSubject.next();
        break;
    }
  }

  private moveNext(): void {
    if (this.navigableElements.length === 0) return;

    this.activeIndex =
      this.activeIndex < this.navigableElements.length - 1
        ? this.activeIndex + 1
        : 0; // Vuelve al inicio si llega al final

    this.focusActiveElement();
  }

  private movePrevious(): void {
    if (this.navigableElements.length === 0) return;

    this.activeIndex =
      this.activeIndex > 0
        ? this.activeIndex - 1
        : this.navigableElements.length - 1; // Va al final si está en el inicio

    this.focusActiveElement();
  }

  private focusActiveElement() {
    if (
      this.activeIndex > -1 &&
      this.activeIndex < this.navigableElements.length
    ) {
      const activeElement =
        this.navigableElements[this.activeIndex].nativeElement;

      // Hacemos scroll para que el elemento sea visible y lo enfocamos
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      activeElement.hover();
      // El foco visual se gestiona por la directiva con una clase CSS.
      // Opcionalmente, podrías llamar a activeElement.focus() si son elementos enfocables.
    }
  }

  ngOnDestroy(): void {
    if (this.keyboardSubscription) {
      this.keyboardSubscription.unsubscribe();
    }
  }
}
