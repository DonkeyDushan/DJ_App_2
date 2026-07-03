/**
 * A measured position of a spotlight target in viewport coordinates. Mirrors the
 * fields of `DOMRect` we care about; kept as a plain type so it can be compared
 * and stored without holding a reference to the live element.
 */
export type TargetRect = {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
};
