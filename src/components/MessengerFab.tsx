"use client";

import { useEffect, useRef, useState } from "react";
import { MESSENGERS, SITE_PHONE_TEL } from "@/lib/contacts";
import {
  MESSENGER_FAB_OPEN_EVENT,
  type MessengerFabOpenDetail,
} from "@/lib/messenger-fab";
import {
  trackContactMax,
  trackContactPhone,
  trackContactTelegram,
} from "@/lib/analytics/metrika";

function IconMax() {
  return (
    <svg width="28" height="28" viewBox="0 0 1000 1000" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M506.532 801.271C446.865 801.271 419.136 792.551 370.937 757.673C340.45 796.911 243.908 827.575 239.698 775.112C239.698 735.728 230.987 702.448 221.115 666.116C209.356 621.356 196 571.508 196 499.281C196 326.777 337.402 197 504.935 197C672.614 197 803.998 333.172 803.998 500.879C804.561 665.993 671.473 800.39 506.532 801.271ZM509 346.106C427.411 341.891 363.824 398.424 349.742 487.073C338.128 560.463 358.743 649.84 376.309 654.49C384.729 656.525 405.925 639.376 419.136 626.151C440.981 641.258 466.419 650.331 492.885 652.456C577.425 656.526 649.661 592.099 655.338 507.564C658.642 422.851 593.551 351.099 509 346.251L509 346.106Z"
      />
    </svg>
  );
}

function IconTelegram() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38Z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ICONS = {
  phone: IconPhone,
  max: IconMax,
  telegram: IconTelegram,
} as const;

const ICON_CLASS = "text-brand-olive-dark drop-shadow-sm";

const MESSENGER_GOALS = {
  max: trackContactMax,
  telegram: trackContactTelegram,
} as const;

const MESSENGER_BUTTON_BG =
  "bg-[url('/images/logo-sinonim.png')] bg-cover bg-center bg-no-repeat";

const FAB_ITEMS: Array<{
  id: keyof typeof ICONS;
  label: string;
  href: string;
}> = [
  { id: "phone", label: "Позвонить", href: SITE_PHONE_TEL },
  ...MESSENGERS.filter((item) => item.id === "max" || item.id === "telegram"),
];

export function MessengerFab() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pendingDesktopFocusRef = useRef(false);

  useEffect(() => {
    const handleOpenRequest = (event: Event) => {
      const detail = (event as CustomEvent<MessengerFabOpenDetail>).detail;
      setOpen(true);

      if (
        detail?.focusOnDesktop !== false &&
        window.matchMedia("(min-width: 768px)").matches
      ) {
        pendingDesktopFocusRef.current = true;
      }
    };

    window.addEventListener(MESSENGER_FAB_OPEN_EVENT, handleOpenRequest);
    return () =>
      window.removeEventListener(MESSENGER_FAB_OPEN_EVENT, handleOpenRequest);
  }, []);

  useEffect(() => {
    if (!open || !pendingDesktopFocusRef.current) return;

    pendingDesktopFocusRef.current = false;
    const timer = window.setTimeout(() => {
      toggleRef.current?.focus({ preventScroll: true });
    }, 320);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      id="messenger-fab-root"
      className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-50"
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div
          className={`absolute right-full top-1/2 mr-3 flex -translate-y-1/2 flex-row items-center gap-2 transition-all duration-300 ${
            open
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
          aria-hidden={!open}
        >
          {/* Слева направо: Telegram → MAX → Позвонить → FAB */}
          {[...FAB_ITEMS].reverse().map((item, index) => {
            const Icon = ICONS[item.id];
            const isPhone = item.id === "phone";
            const isMax = item.id === "max";
            const openDelay = `${(FAB_ITEMS.length - 1 - index) * 50}ms`;
            const closeDelay = `${index * 40}ms`;

            return (
              <a
                key={item.id}
                href={item.href}
                {...(isPhone
                  ? {}
                  : { target: "_blank", rel: "noopener noreferrer" })}
                className="group relative flex items-center justify-center origin-right"
                onClick={() => {
                  if (isPhone) {
                    trackContactPhone();
                  } else if (item.id === "max" || item.id === "telegram") {
                    MESSENGER_GOALS[item.id]();
                  }
                  setOpen(false);
                }}
              >
                {isMax ? (
                  <span
                    className={`pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 grid -translate-x-1/2 grid-cols-[1fr_auto_1fr] items-center gap-x-2 transition-all duration-300 ${
                      open ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      transitionDelay: open ? openDelay : closeDelay,
                    }}
                  >
                    <span className="justify-self-end whitespace-nowrap rounded-full bg-brand-surface px-3 py-1.5 text-sm leading-none text-brand-olive-dark shadow-md border border-brand-olive/10">
                      Telegram
                    </span>
                    <span className="whitespace-nowrap rounded-full bg-brand-surface px-3 py-1.5 text-sm leading-none text-brand-olive-dark shadow-md border border-brand-olive/10">
                      MAX
                    </span>
                    <span className="justify-self-start whitespace-nowrap rounded-full bg-brand-surface px-3 py-1.5 text-sm leading-none text-brand-olive-dark shadow-md border border-brand-olive/10">
                      Позвонить
                    </span>
                  </span>
                ) : null}
                <span
                  className={`flex h-12 w-12 origin-right items-center justify-center rounded-full shadow-lg transition-all duration-300 group-hover:scale-105 ${
                    open ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  } ${MESSENGER_BUTTON_BG} ${ICON_CLASS}`}
                  style={{ transitionDelay: open ? openDelay : closeDelay }}
                  aria-label={item.label}
                >
                  <Icon />
                </span>
              </a>
            );
          })}
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-terracotta text-white shadow-xl transition-all duration-300 hover:bg-brand-terracotta-logo hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-terracotta"
          aria-expanded={open}
          aria-label={open ? "Закрыть мессенджеры" : "Написать в мессенджер"}
        >
          <span
            className={`absolute transition-all duration-300 ${
              open ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
            }`}
          >
            <IconChat />
          </span>
          <span
            className={`absolute transition-all duration-300 ${
              open ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
            }`}
          >
            <IconClose />
          </span>
        </button>
      </div>
    </div>
  );
}
