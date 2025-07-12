import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationState } from '../models/confirmation.model';
import { Subscription } from 'rxjs';
import { ConfirmationService } from '../../core/services/confirmation/confirmation.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css',
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  state: ConfirmationState | null = null;
  private subscription: Subscription | undefined;
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.subscription = this.confirmationService.confirmationState$.subscribe(
      (state) => {
        this.state = state;
        this.isOpen = !!state;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onConfirm(): void {
    if (this.state?.confirmAction) {
      this.state.confirmAction();
    }
    this.confirmationService.close();
  }

  onCancel(): void {
    if (this.state?.cancelAction) {
      this.state.cancelAction();
    }
    this.confirmationService.close();
  }
}
