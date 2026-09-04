export const MESSENGER_FAB_OPEN_EVENT = "messenger-fab:open";

export type MessengerFabOpenDetail = {
  focusOnDesktop?: boolean;
};

/** Opens contact options via full navigation (iOS-safe). */
export function openMessengerFab(_options?: MessengerFabOpenDetail) {
  window.location.href = "/messengers";
}
