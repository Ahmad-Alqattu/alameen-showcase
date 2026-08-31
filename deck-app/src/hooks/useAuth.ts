/**
 * Nobody is signed in here, and that is the right answer.
 *
 * The deck used exactly one thing from the platform's auth: whether to offer an "open this
 * section" button on the two slides that map to a real module. Standing alone there is no
 * platform to open, so this reports nobody and the button stays hidden — the same
 * behaviour the real hook gives a signed-out visitor.
 *
 * Kept as a hook rather than deleted from the caller, so the deck's source stays identical
 * to the platform's copy and a fix in either can be carried across by diff.
 */
export interface DeckUser {
  isSuperAdmin: boolean;
  modules: string[];
}

export function useAuth(): { user: DeckUser | null } {
  return { user: null };
}
