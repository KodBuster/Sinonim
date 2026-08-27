"use client";

import { useEffect } from "react";
import { MANGO_WIDGET_ID } from "@/lib/mango-office";

const GAP_PX = 20;
/** Above Messenger FAB (z-50) so the green button receives taps on iOS. */
const MANGO_BUTTON_Z = "55";
const MANGO_OPEN_Z = "60";

function clearPositionOverrides(el: HTMLElement) {
  [
    "position",
    "top",
    "left",
    "right",
    "bottom",
    "transform",
    "z-index",
    "margin",
    "pointer-events",
  ].forEach((prop) => el.style.removeProperty(prop));
}

function ensureTappable(el: HTMLElement) {
  el.style.setProperty("pointer-events", "auto", "important");
  el.style.setProperty("touch-action", "manipulation", "important");
  el.style.setProperty("-webkit-tap-highlight-color", "transparent");
}

function positionMangoAboveFab() {
  const fab = document.getElementById("messenger-fab-root");
  if (!fab) return;

  const fabRect = fab.getBoundingClientRect();
  if (fabRect.height <= 0) return;

  const widgets = document.querySelectorAll<HTMLElement>(".mgo-mcw-widget");
  let hasOpenWidget = false;

  widgets.forEach((widget) => {
    const button =
      widget.querySelector<HTMLElement>(
        ".mgo-mcw__button_main, .mgo-mcw__button_chat, .mgo-mcw__button, .mgo-mcw__button-icon, button, a"
      ) ?? widget;

    ensureTappable(widget);
    ensureTappable(button);

    // Open chat must sit above Messenger FAB, otherwise send/clicks are blocked.
    if (widget.classList.contains("mgo-mcw_state-window-open")) {
      hasOpenWidget = true;
      clearPositionOverrides(widget);
      widget.style.setProperty("z-index", MANGO_OPEN_Z, "important");
      ensureTappable(widget);
      return;
    }

    const buttonWidth = Math.max(button.getBoundingClientRect().width || 56, 40);
    const fabCenterX = fabRect.left + fabRect.width / 2;
    const bottomPx = Math.max(
      0,
      Math.round(window.innerHeight - fabRect.top + GAP_PX)
    );
    const rightPx = Math.max(
      0,
      Math.round(window.innerWidth - (fabCenterX + buttonWidth / 2))
    );

    widget.style.setProperty("position", "fixed", "important");
    widget.style.setProperty("top", "auto", "important");
    widget.style.setProperty("left", "auto", "important");
    widget.style.setProperty("bottom", `${bottomPx}px`, "important");
    widget.style.setProperty("right", `${rightPx}px`, "important");
    widget.style.setProperty("transform", "none", "important");
    widget.style.setProperty("margin", "0", "important");
    widget.style.setProperty("z-index", MANGO_BUTTON_Z, "important");
    ensureTappable(widget);
    ensureTappable(button);
  });

  document.body.classList.toggle("mango-chat-open", hasOpenWidget);
}

const MANGO_LOAD_DELAY_MS = 1200;

function loadMangoWidget() {
  if (document.getElementById("mango-js")) return;

  type MangoStub = {
    (...config: unknown[]): void;
    q?: IArguments[];
    u?: string;
    t?: number;
  };
  const w = window as Window & { MangoObject?: string; mgo?: MangoStub };

  w.MangoObject = "mgo";
  w.mgo =
    w.mgo ||
    function mangoStub() {
      (w.mgo!.q = w.mgo!.q || []).push(arguments);
    };
  w.mgo.u = "https://widgets.mango-office.ru/widgets/mango.js";
  w.mgo.t = Date.now();

  const script = document.createElement("script");
  script.async = true;
  script.id = "mango-js";
  script.src = "https://widgets.mango-office.ru/widgets/mango.js";
  script.charset = "utf-8";
  const first = document.getElementsByTagName("script")[0];
  first?.parentNode?.insertBefore(script, first);

  w.mgo({
    multichannel: { id: MANGO_WIDGET_ID, domain: "synonym-jewelry.ru" },
  });
}

export function MangoOfficeChat() {
  useEffect(() => {
    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      loadMangoWidget();
      // Widget mounts async — pin it once it appears.
      window.setTimeout(positionMangoAboveFab, 400);
      window.setTimeout(positionMangoAboveFab, 1200);
      window.setTimeout(positionMangoAboveFab, 2500);
    };

    const timeoutId = window.setTimeout(load, MANGO_LOAD_DELAY_MS);
    const idleId =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(load, { timeout: MANGO_LOAD_DELAY_MS })
        : 0;

    window.addEventListener("scroll", load, { once: true, passive: true });
    window.addEventListener("pointerdown", load, { once: true });

    return () => {
      window.clearTimeout(timeoutId);
      if (idleId) window.cancelIdleCallback(idleId);
      window.removeEventListener("scroll", load);
      window.removeEventListener("pointerdown", load);
    };
  }, []);

  useEffect(() => {
    positionMangoAboveFab();
    // Rarely enough not to interrupt iOS taps, often enough to follow FAB.
    const interval = window.setInterval(positionMangoAboveFab, 2000);
    let raf = 0;
    const observer = new MutationObserver(() => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        positionMangoAboveFab();
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    window.addEventListener("resize", positionMangoAboveFab);
    window.addEventListener("orientationchange", positionMangoAboveFab);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", positionMangoAboveFab);
      window.removeEventListener("orientationchange", positionMangoAboveFab);
      document.body.classList.remove("mango-chat-open");
    };
  }, []);

  return null;
}
