"use client";

import Script from "next/script";
import { useEffect } from "react";
import { MANGO_WIDGET_ID } from "@/lib/mango-office";
import { openMessengerFab } from "@/lib/messenger-fab";

const MANGO_LAUNCHER_SELECTORS = [
  ".mgo-widget-call_button",
  ".mgo-widget-online-button",
  ".mgo-widget-callback_button",
].join(",");

function isMangoUi(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      ".mgo-widget-call_button, .mgo-widget-online-button, .mgo-widget-callback_button, [class*='mgo-widget-call'], [class*='mgo-multichannel']"
    )
  );
}

function positionMangoAboveFab() {
  const bottom = window.matchMedia("(min-width: 768px)").matches
    ? "7.75rem"
    : "7.25rem";
  const right = window.matchMedia("(min-width: 768px)").matches
    ? "1.5rem"
    : "1.25rem";

  document.querySelectorAll<HTMLElement>(MANGO_LAUNCHER_SELECTORS).forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.position !== "fixed") return;
    el.style.setProperty("bottom", bottom, "important");
    el.style.setProperty("right", right, "important");
    el.style.setProperty("z-index", "49", "important");
  });
}

export function MangoOfficeChat() {
  useEffect(() => {
    let openedByMango = false;

    const openFabFromMango = () => {
      if (openedByMango) return;
      openedByMango = true;
      openMessengerFab({ focusOnDesktop: false });
      window.setTimeout(() => {
        openedByMango = false;
      }, 500);
    };

    const onInteract = (event: Event) => {
      if (!isMangoUi(event.target)) return;
      openFabFromMango();
    };

    positionMangoAboveFab();
    let raf = 0;
    const observer = new MutationObserver(() => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        positionMangoAboveFab();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", positionMangoAboveFab);
    document.addEventListener("pointerdown", onInteract, true);

    return () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", positionMangoAboveFab);
      document.removeEventListener("pointerdown", onInteract, true);
    };
  }, []);

  return (
    <Script
      id="mango-office-chat"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
(function(w, d, u, i, o, s, p) {
  if (d.getElementById(i)) { return; }
  w['MangoObject'] = o;
  w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
  w[o].u = u;
  w[o].t = 1 * new Date();
  s = d.createElement('script');
  s.async = 1;
  s.id = i;
  s.src = u;
  s.charset = 'utf-8';
  p = d.getElementsByTagName('script')[0];
  p.parentNode.insertBefore(s, p);
})(window, document, 'https://widgets.mango-office.ru/widgets/mango.js', 'mango-js', 'mgo');
mgo({multichannel: {id: ${MANGO_WIDGET_ID}}});
        `.trim(),
      }}
    />
  );
}
