"use client";

import Script from "next/script";
import { useEffect } from "react";

const MANGO_WIDGET_ID = 80702;

function offsetMangoButtons() {
  const bottom = window.matchMedia("(min-width: 768px)").matches ? "6rem" : "5.5rem";
  const right = window.matchMedia("(min-width: 768px)").matches ? "1.5rem" : "1.25rem";

  const nodes = document.querySelectorAll<HTMLElement>(
    [
      ".mgo-widget-call_button",
      ".mgo-widget-online-button",
      ".mgo-widget-callback_button",
      "[class*='mgo-widget']",
      "[id^='mgo-']",
    ].join(",")
  );

  nodes.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.position !== "fixed") return;
    el.style.setProperty("bottom", bottom, "important");
    el.style.setProperty("right", right, "important");
  });
}

export function MangoOfficeChat() {
  useEffect(() => {
    offsetMangoButtons();
    const observer = new MutationObserver(offsetMangoButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", offsetMangoButtons);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", offsetMangoButtons);
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
