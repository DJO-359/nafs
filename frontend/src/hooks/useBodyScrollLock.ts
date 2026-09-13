import { useEffect } from "react";

export function useBodyScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousHtmlTouchAction = document.documentElement.style.touchAction;
    const previousBodyOverscrollBehavior =
      document.body.style.overscrollBehavior;
    const previousHtmlOverscrollBehavior =
      document.documentElement.style.overscrollBehavior;

    const previousScrollX = window.scrollX;
    const previousScrollY = window.scrollY;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.touchAction = "none";
    document.documentElement.style.overscrollBehavior = "none";

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

      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.body.style.overscrollBehavior = previousBodyOverscrollBehavior;

      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.touchAction = previousHtmlTouchAction;
      document.documentElement.style.overscrollBehavior =
        previousHtmlOverscrollBehavior;

      window.scrollTo({
        top: previousScrollY,
        left: previousScrollX,
        behavior: "auto",
      });
    };
  }, [open]);
}
