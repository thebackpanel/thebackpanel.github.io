// ============================================================
// BACKPANEL — useResponsive Hook
// Viewport-aware, prefers-reduced-motion detection
// ============================================================

interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isReducedMotion: boolean;
  isTouchDevice: boolean;
}

declare function useState<T>(initial: T): [T, (v: T) => void];
declare function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
declare function useCallback<T extends (...args: unknown[]) => unknown>(fn: T, deps: unknown[]): T;

function useResponsive(): ViewportInfo {
  const getViewport = (): ViewportInfo => ({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    isMobile: typeof window !== "undefined" ? window.innerWidth < 640 : false,
    isTablet: typeof window !== "undefined" ? window.innerWidth >= 640 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
    isReducedMotion: typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
    isTouchDevice: typeof window !== "undefined"
      ? "ontouchstart" in window || navigator.maxTouchPoints > 0
      : false,
  });

  const [viewport, setViewport] = useState<ViewportInfo>(getViewport);

  useEffect(() => {
    const handleResize = (): void => {
      setViewport(getViewport());
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (): void => {
      setViewport((prev) => ({
        ...prev,
        isReducedMotion: motionQuery.matches,
      }));
    };

    window.addEventListener("resize", handleResize, { passive: true });
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return viewport;
}

export default useResponsive;
export type { ViewportInfo };
