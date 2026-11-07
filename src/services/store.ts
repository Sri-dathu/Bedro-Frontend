import { useSyncExternalStore } from "react";
import type { ActivityEvent } from "./types";

/** Session-only activity notes for confirmed backend outcomes (lost on refresh). All business data —
 *  requirements, pools, negotiations, decisions — comes from the backend API, not from this store. */
type State = {
  activity: ActivityEvent[];
  /** Supplier Communications drawer: open, optionally on one negotiation's conversation */
  comms: { open: boolean; negotiationId: string | null };
  /** Supplier Communications items the buyer has already looked at: key -> activity signature when seen.
   *  Per-browser convenience only (localStorage); the backend still decides what needs action. */
  seen: Record<string, string>;
};

const SEEN_KEY = "comms-seen";
function loadSeen(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

let state: State = { activity: [], comms: { open: false, negotiationId: null }, seen: loadSeen() };
const listeners = new Set<() => void>();
const set = (fn: (s: State) => State) => {
  state = fn(state);
  listeners.forEach((l) => l());
};

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => sel(state),
    () => sel(state),
  );
}

export const actions = {
  /** Records a confirmed backend outcome in this session's activity list. */
  note(text: string) {
    set((s) => ({
      ...s,
      activity: [
        { id: crypto.randomUUID(), at: new Date().toISOString(), text },
        ...s.activity,
      ].slice(0, 30),
    }));
  },
  openComms(negotiationId: string | null = null) {
    set((s) => ({ ...s, comms: { open: true, negotiationId } }));
  },
  closeComms() {
    set((s) => ({ ...s, comms: { open: false, negotiationId: null } }));
  },
  /** Marks items as seen at their current activity signature; new activity changes the signature again. */
  markSeen(items: Record<string, string>) {
    if (Object.entries(items).every(([k, v]) => state.seen[k] === v)) return;
    set((s) => ({ ...s, seen: { ...s.seen, ...items } }));
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(state.seen));
    } catch {
      /* storage unavailable: badge simply resets on reload */
    }
  },
};
