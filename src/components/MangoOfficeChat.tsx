"use client";

import Script from "next/script";
import { useEffect } from "react";
import { MANGO_WIDGET_ID } from "@/lib/mango-office";

const GAP_PX = 20;

function findMangoLaunchers(): HTMLElement[] {
  const fab = document.getElementById("messenger-fab-root");
  const nodes = new Set<HTMLElement>();

  document
    .querySelectorAll<HTMLElement>(
      [
        ".mgo-widget-call_button",
        ".mgo-widget-online-button",
        ".mgo-widget-callback_button",
        "[class*='mgo-widget'][class*='button']",
        "[class*='mgo-multichannel'][class*='button']",
      ].join(",")
    )
    .forEach((el) => {
      if (fab?.contains(el)) return;
      const style = window.getComputedStyle(el);
      if (style.position !== "fixed" && style.position !== "absolute") {
        // Prefer the nearest fixed ancestor that looks like the launcher shell.
        let current: HTMLElement | null = el;
        while (current && current !== document.body) {
          if (fab?.contains(current)) return;
          const currentStyle = window.getComputedStyle(current);
          if (currentStyle.position === "fixed") {
            const rect = current.getBoundingClientRect();
            if (
              rect.width >= 36 &&
              rect.width <= 96 &&
              rect.height >= 36 &&
              rect.height <= 96
            ) {
              nodes.add(current);
            }
            return;
          }
          current = current.parentElement;
        }
        return;
      }

      const rect = el.getBoundingClientRect();
      if (rect.width < 24 || rect.height < 24) return;
      if (rect.width > 120 || rect.height > 120) return;
      nodes.add(el);
    });

  return [...nodes];
}

function positionMangoAboveFab() {
  const fab = document.getElementById("messenger-fab-root");
  if (!fab) return;

  const fabRect = fab.getBoundingClientRect();
  if (fabRect.height <= 0) return;

  const bottomPx = Math.max(
    0,
    Math.round(window.innerHeight - fabRect.top + GAP_PX)
  );
  const rightPx = Math.round(window.innerWidth - fabRect.right);

  findMangoLaunchers().forEach((el) => {
    el.style.setProperty("position", "fixed", "important");
    el.style.setProperty("top", "auto", "important");
    el.style.setProperty("left", "auto", "important");
    el.style.setProperty("bottom", `${bottomPx}px`, "important");
    el.style.setProperty("right", `${rightPx}px`, "important");
    el.style.setProperty("transform", "none", "important");
    el.style.setProperty("z-index", "49", "important");
    el.style.setProperty("margin", "0", "important");
  });
}

export function MangoOfficeChat() {
  useEffect(() => {
    positionMangoAboveFab();
    const interval = window.setInterval(positionMangoAboveFab, 1500);
    let raf = 0;
    const observer = new MutationObserver(() => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        positionMangoAboveFab();
      });
    });
    // Only watch DOM inserts — rewriting styles on attribute changes fights the open animation.
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    window.addEventListener("resize", positionMangoAboveFab);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", positionMangoAboveFab);
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
