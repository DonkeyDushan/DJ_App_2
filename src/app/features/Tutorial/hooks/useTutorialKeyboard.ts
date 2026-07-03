import { useEffect } from 'react';

type TutorialKeyboardHandlers = {
  readonly onNext: () => void;
  readonly onPrev: () => void;
  readonly onClose: () => void;
};

/**
 * Wires global keyboard navigation for the tour while `active` is true:
 * Enter / ArrowRight advance, ArrowLeft goes back, Escape closes. Listens on the
 * window so it works regardless of focus, and prevents default so the keys do
 * not also scroll the page or trigger other handlers.
 */
export const useTutorialKeyboard = (
  active: boolean,
  { onNext, onPrev, onClose }: TutorialKeyboardHandlers,
): void => {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      switch (event.key) {
        case 'Enter':
        case 'ArrowRight':
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onPrev();
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onNext, onPrev, onClose]);
};
