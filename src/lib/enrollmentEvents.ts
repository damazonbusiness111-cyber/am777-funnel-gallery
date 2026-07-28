/** Fired by the hero CTA so the enrollment card can jump straight into the
 * application form instead of requiring a second click once scrolled into
 * view. Kept as a plain DOM event so the hero and the card stay decoupled. */
export const START_ENROLLMENT_EVENT = "inframind:start-enrollment";

export function dispatchStartEnrollment() {
  window.dispatchEvent(new Event(START_ENROLLMENT_EVENT));
}
