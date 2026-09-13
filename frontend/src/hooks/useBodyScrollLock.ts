import { useEffect } from "react";

type ScrollSnapshot = {
  bodyOverflow: string;
  htmlOverflow: string;
  bodyTouchAction: string;
  htmlTouchAction: string;
  bodyOverscrollBehavior: string;
  htmlOverscrollBehavior: string;
  scrollX: number;
  scrollY: number;
};

let activeLocks = 0;
let snapshot: ScrollSnapshot | null = null;

function lockScroll() {
  if (activeLocks === 0) {
    snapshot = {
      bodyOverflow: document.body.style.overflow,
      htmlOverflow: document.documentElement.style.overflow,
      bodyTouchAction: document.body.style.touchAction,
      htmlTouchAction: document.documentElement.style.touchAction,
      bodyOverscrollBehavior: document.body.style.overscrollBehavior,
      htmlOverscrollBehavior: document.documentElement.style.overscrollBehavior,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.touchAction = "none";
    document.documentElement.style.overscrollBehavior = "none";
  }

  activeLocks += 1;
}

function unlockScroll() {
  if (activeLocks <= 0) return;

  activeLocks -= 1;

  if (activeLocks !== 0 || !snapshot) return;

  const previous = snapshot;
  snapshot = null;

  document.body.style.overflow = previous.bodyOverflow;
  document.body.style.touchAction = previous.bodyTouchAction;
  document.body.style.overscrollBehavior = previous.bodyOverscrollBehavior;

  document.documentElement.style.overflow = previous.htmlOverflow;
  document.documentElement.style.touchAction = previous.htmlTouchAction;
  document.documentElement.style.overscrollBehavior =
    previous.htmlOverscrollBehavior;

  window.scrollTo({
    top: previous.scrollY,
    left: previous.scrollX,
    behavior: "auto",
  });
}

export function useBodyScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return undefined;

    lockScroll();

    const stopWheel = (event: Event) => {
      event.preventDefault();
    };

    const stopTouchMove = (event: Event) => {
      event.preventDefault();
    };

    window.addEventListener("wheel", stopWheel, { passive: false });
    document.addEventListener("touchmove", stopTouchMove, {
      passive: false,
      capture: true,
    });

    return () => {
      window.removeEventListener("wheel", stopWheel);
      document.removeEventListener("touchmove", stopTouchMove, {
        capture: true,
      });

      unlockScroll();
    };
  }, [open]);
}
