"use client";

import Script from "next/script";
import { useEffect } from "react";
import { MANGO_WIDGET_ID } from "@/lib/mango-office";

const GAP_PX = 16;

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
  ].forEach((prop) => el.style.removeProperty(prop));
}

function positionMangoAboveFab() {
  const fab = document.getElementById("messenger-fab-root");
  if (!fab) return;

  const fabRect = fab.getBoundingClientRect();
  if (fabRect.height <= 0) return;

  const widgets = document.querySelectorAll<HTMLElement>(".mgo-mcw-widget");
  let hasOpenWidget = false;

  widgets.forEach((widget) => {
    // Open chat must sit above Messenger FAB (z-50), otherwise send/clicks are blocked.
    if (widget.classList.contains("mgo-mcw_state-window-open")) {
      hasOpenWidget = true;
      clearPositionOverrides(widget);
      widget.style.setProperty("z-index", "60", "important");
      return;
    }

    const button =
      widget.querySelector<HTMLElement>(
        ".mgo-mcw__button_main, .mgo-mcw__button_chat, .mgo-mcw__button"
      ) ?? widget;

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
    widget.style.setProperty("z-index", "49", "important");
  });

  document.body.classList.toggle("mango-chat-open", hasOpenWidget);
}

export function MangoOfficeChat() {
  useEffect(() => {
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
      attributeFilter: ["class"],
    });
    window.addEventListener("resize", positionMangoAboveFab);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", positionMangoAboveFab);
      document.body.classList.remove("mango-chat-open");
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
mgo({multichannel: {id: ${MANGO_WIDGET_ID}, domain: "synonym-jewelry.ru"}});
        `.trim(),
      }}
    />
  );
}
