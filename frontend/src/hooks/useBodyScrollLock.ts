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

export interface BodyScrollLockOptions {
  allowTouchMoveWithin?: string;
}

let activeLocks = 0;
let snapshot: ScrollSnapshot | null = null;
const allowedTouchMoveSelectors = new Set<string>();

function isAllowedTouchMoveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;

  return Array.from(allowedTouchMoveSelectors).some((selector) =>
    target.closest(selector),
  );
}

function stopWheel(event: Event) {
  event.preventDefault();
}

function stopTouchMove(event: TouchEvent) {
  if (isAllowedTouchMoveTarget(event.target)) return;
  event.preventDefault();
}

function updateTouchAction() {
  if (!snapshot) return;

  if (allowedTouchMoveSelectors.size > 0) {
    document.body.style.touchAction = snapshot.bodyTouchAction;
    document.documentElement.style.touchAction = snapshot.htmlTouchAction;
    return;
  }

  document.body.style.touchAction = "none";
  document.documentElement.style.touchAction = "none";
}

function lockScroll(allowTouchMoveWithin?: string) {
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
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";

    window.addEventListener("wheel", stopWheel, { passive: false });
    document.addEventListener("touchmove", stopTouchMove, {
      passive: false,
      capture: true,
    });
  }

  activeLocks += 1;

  if (allowTouchMoveWithin) {
    allowedTouchMoveSelectors.add(allowTouchMoveWithin);
  }

  updateTouchAction();
}

function unlockScroll(allowTouchMoveWithin?: string) {
  if (activeLocks <= 0) return;

  if (allowTouchMoveWithin) {
    allowedTouchMoveSelectors.delete(allowTouchMoveWithin);
  }

  activeLocks -= 1;

  if (activeLocks !== 0) {
    updateTouchAction();
    return;
  }

  if (!snapshot) return;

  const previous = snapshot;
  snapshot = null;

  window.removeEventListener("wheel", stopWheel);
  document.removeEventListener("touchmove", stopTouchMove, {
    capture: true,
  });

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

export function useBodyScrollLock(
  open: boolean,
  options: BodyScrollLockOptions = {},
) {
  const allowTouchMoveWithin = options.allowTouchMoveWithin;

  useEffect(() => {
    if (!open) return undefined;

    lockScroll(allowTouchMoveWithin);

    return () => {
      unlockScroll(allowTouchMoveWithin);
    };
  }, [allowTouchMoveWithin, open]);
}
