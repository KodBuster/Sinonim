"use client";

import { usePathname } from "next/navigation";

/**
 * Terracotta FAB → /messengers page.
 * iOS Safari 16: expand/toggle/hash/checkbox all failed; plain page links work
 * (same as catalog filters and size chips).
 */
export function MessengerFab() {
  const pathname = usePathname();
  if (pathname === "/messengers") return null;

  return (
    <div
      id="messenger-fab-root"
      className="fixed bottom-5 right-5 z-[120] md:bottom-6 md:right-6"
    >
      <a
        href="/messengers"
        id="messenger-fab-toggle"
        className="flex h-14 w-14 touch-manipulation items-center justify-center rounded-full bg-brand-terracotta text-white shadow-xl transition-all duration-300 hover:bg-brand-terracotta-logo hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-terracotta [-webkit-tap-highlight-color:transparent]"
        aria-label="Написать в мессенджер"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}
