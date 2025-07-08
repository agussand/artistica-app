export interface ShortcutEvent {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
}

export interface Shortcut {
  key: string;
  description: string;
}
