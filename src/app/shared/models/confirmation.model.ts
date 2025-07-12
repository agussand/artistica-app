export interface ConfirmationState {
  message: string;
  confirmAction: () => void;
  cancelAction?: () => void;
}
