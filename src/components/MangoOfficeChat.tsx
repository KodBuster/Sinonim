"use client";

import Script from "next/script";
import { useEffect } from "react";
import { MANGO_WIDGET_ID } from "@/lib/mango-office";

const GAP_PX = 20;
const MOBILE_PANEL_MARGIN = 8;
const MOBILE_MAX = 767.98;

function isMobileViewport() {
  return window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches;
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

function findMangoPanels(): HTMLElement[] {
  const fab = document.getElementById("messenger-fab-root");
  const launchers = new Set(findMangoLaunchers());
  const panels = new Set<HTMLElement>();

  const candidates = document.querySelectorAll<HTMLElement>(
    [
      "[class*='mgo-'][class*='panel']",
      "[class*='mgo-'][class*='window']",
      "[class*='mgo-'][class*='dialog']",
      "[class*='mgo-multichannel']",
      "[id*='mgo-']",
      "iframe[src*='mango']",
    ].join(",")
  );

  candidates.forEach((el) => {
    if (fab?.contains(el)) return;
    if (launchers.has(el)) return;

    let current: HTMLElement | null = el;
    while (current && current !== document.body) {
      if (fab?.contains(current)) return;
      if (launchers.has(current)) return;

      const style = window.getComputedStyle(current);
      if (style.position === "fixed" || style.position === "absolute") {
        const rect = current.getBoundingClientRect();
        if (
          rect.width >= 180 &&
          rect.height >= 220 &&
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          Number.parseFloat(style.opacity || "1") > 0.05
        ) {
          panels.add(current);
        }
        break;
      }
      current = current.parentElement;
    }
  });

  return [...panels];
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

function fitMangoPanelsToViewport() {
  if (!isMobileViewport()) return;

  const margin = MOBILE_PANEL_MARGIN;
  const width = Math.max(0, window.innerWidth - margin * 2);
  const height = Math.max(0, window.innerHeight - margin * 2);

  findMangoPanels().forEach((el) => {
    el.style.setProperty("position", "fixed", "important");
    el.style.setProperty("top", `${margin}px`, "important");
    el.style.setProperty("left", `${margin}px`, "important");
    el.style.setProperty("right", `${margin}px`, "important");
    el.style.setProperty("bottom", `${margin}px`, "important");
    el.style.setProperty("width", `${width}px`, "important");
    el.style.setProperty("height", `${height}px`, "important");
    el.style.setProperty("max-width", `${width}px`, "important");
    el.style.setProperty("max-height", `${height}px`, "important");
    el.style.setProperty("transform", "none", "important");
    el.style.setProperty("margin", "0", "important");
    el.style.setProperty("z-index", "60", "important");
    el.style.setProperty("box-sizing", "border-box", "important");
    el.style.setProperty("overflow", "hidden", "important");

    el.querySelectorAll<HTMLElement>("iframe").forEach((child) => {
      child.style.setProperty("width", "100%", "important");
      child.style.setProperty("height", "100%", "important");
      child.style.setProperty("max-width", "100%", "important");
      child.style.setProperty("max-height", "100%", "important");
    });
  });
}

function syncMangoLayout() {
  positionMangoAboveFab();
  fitMangoPanelsToViewport();
}

export function MangoOfficeChat() {
  useEffect(() => {
    syncMangoLayout();
    const interval = window.setInterval(syncMangoLayout, 1000);
    let raf = 0;
    const observer = new MutationObserver(() => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        syncMangoLayout();
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    window.addEventListener("resize", syncMangoLayout);
    window.addEventListener("orientationchange", syncMangoLayout);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", syncMangoLayout);
      window.removeEventListener("orientationchange", syncMangoLayout);
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
