"use client";

import Script from "next/script";
import { useEffect } from "react";
import { MANGO_WIDGET_ID } from "@/lib/mango-office";
import { openMessengerFab } from "@/lib/messenger-fab";

function isMangoUi(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      ".mgo-widget-call_button, .mgo-widget-online-button, .mgo-widget-callback_button, [class*='mgo-widget-call'], [class*='mgo-multichannel']"
    )
  );
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

    document.addEventListener("pointerdown", onInteract, true);
    return () => document.removeEventListener("pointerdown", onInteract, true);
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
