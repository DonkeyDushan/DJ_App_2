import { useEffect } from 'react';

/**
 * While `active`, docks any open MUI dialog toward the top of the viewport
 * (horizontally centered) via a `body` data attribute consumed by global CSS,
 * freeing space below it for the tour's instruction popup so the two never
 * overlap. Clears the attribute on cleanup, restoring the default centering.
 */
export const useDialogDock = (active: boolean): void => {
  useEffect(() => {
    if (!active) return undefined;

    document.body.dataset.tutorialDialog = 'top';

    return () => {
      delete document.body.dataset.tutorialDialog;
    };
  }, [active]);
};
