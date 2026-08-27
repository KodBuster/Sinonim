"use client";

import { useEffect } from "react";
import { MANGO_WIDGET_ID } from "@/lib/mango-office";

const MANGO_LOAD_DELAY_MS = 800;

function syncMangoOpenClass() {
  const open = Boolean(
    document.querySelector(".mgo-mcw-widget.mgo-mcw_state-window-open"),
  );
  document.body.classList.toggle("mango-chat-open", open);
}

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
      window.setTimeout(syncMangoOpenClass, 500);
      window.setTimeout(syncMangoOpenClass, 1500);
      window.setTimeout(syncMangoOpenClass, 3000);
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
    syncMangoOpenClass();
    // Observe class only — never rewrite Mango inline styles (breaks taps on iOS).
    const observer = new MutationObserver(() => {
      syncMangoOpenClass();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      document.body.classList.remove("mango-chat-open");
    };
  }, []);

  return null;
}
