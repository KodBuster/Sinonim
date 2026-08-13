"use client";

import Script from "next/script";
import { useEffect } from "react";
import { MANGO_WIDGET_ID } from "@/lib/mango-office";
import { openMessengerFab } from "@/lib/messenger-fab";

const GAP_PX = 20;

function isMangoUi(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "[class*='mgo-'], [id*='mgo-'], [class*='mango'], [id*='mango']"
    )
  );
}

function findMangoLaunchers(): HTMLElement[] {
  const fab = document.getElementById("messenger-fab-root");
  const nodes = new Set<HTMLElement>();

  document
    .querySelectorAll<HTMLElement>(
      "[class*='mgo-'], [id*='mgo-'], [class*='mango'], [id*='mango']"
    )
    .forEach((el) => {
      let current: HTMLElement | null = el;
      while (current && current !== document.body) {
        if (fab?.contains(current)) break;
        const style = window.getComputedStyle(current);
        if (style.position === "fixed") {
          const rect = current.getBoundingClientRect();
          if (
            rect.width >= 36 &&
            rect.width <= 96 &&
            rect.height >= 36 &&
            rect.height <= 96 &&
            rect.bottom > window.innerHeight - 220 &&
            rect.right > window.innerWidth - 140
          ) {
            nodes.add(current);
          }
          break;
        }
        current = current.parentElement;
      }
    });

  // Fallback: any fixed circular control in the FAB corner that is not our FAB
  if (nodes.size === 0) {
    document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
      if (fab?.contains(el)) return;
      const style = window.getComputedStyle(el);
      if (style.position !== "fixed") return;
      if (style.visibility === "hidden" || style.display === "none") return;
      const rect = el.getBoundingClientRect();
      if (
        rect.width < 40 ||
        rect.width > 80 ||
        rect.height < 40 ||
        rect.height > 80
      ) {
        return;
      }
      if (rect.bottom < window.innerHeight - 180) return;
      if (rect.right < window.innerWidth - 120) return;
      nodes.add(el);
    });
  }

  return [...nodes];
}

function positionMangoAboveFab() {
  const fab = document.getElementById("messenger-fab-root");
  if (!fab) return;

  const fabRect = fab.getBoundingClientRect();
  if (fabRect.height <= 0) return;

  // CSS bottom: distance from viewport bottom to the element's bottom edge.
  // Place chat button bottom edge just above FAB top.
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
    const interval = window.setInterval(positionMangoAboveFab, 1000);
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
      attributeFilter: ["style", "class"],
    });
    window.addEventListener("resize", positionMangoAboveFab);
    document.addEventListener("pointerdown", onInteract, true);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
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
