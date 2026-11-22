const SCROLL_OFFSET = 92;

export const PENDING_SCROLL_KEY = "oreo:pending-scroll";

/** easeInOutCubic */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeAnimation: number | null = null;
let detachActive: (() => void) | null = null;

export function cancelScrollAnimation() {
    if (activeAnimation !== null) {
        cancelAnimationFrame(activeAnimation);
        activeAnimation = null;
    }
    detachActive?.();
    detachActive = null;
}

interface Options {
    duration?: number;
    offset?: number;
}

export function smoothScrollTo(target: string | HTMLElement | number, options: Options = {}) {
    if (typeof window === "undefined") return;

    const offset = options.offset ?? SCROLL_OFFSET;
    let destination: number;

    if (typeof target === "number") {
        destination = target;
    } else {
        const element =
            typeof target === "string"
                ? document.getElementById(target.replace(/^#/, ""))
                : target;
        if (!element) return;
        destination = element.getBoundingClientRect().top + window.scrollY - offset;
    }

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    destination = Math.max(0, Math.min(destination, maxScroll));

    const start = window.scrollY;
    const distance = destination - start;
    if (Math.abs(distance) < 2) return;

    cancelScrollAnimation();

    if (prefersReducedMotion()) {
        window.scrollTo(0, destination);
        return;
    }

    const duration =
        options.duration ?? Math.min(1150, Math.max(450, Math.abs(distance) * 0.55));

    const startTime = performance.now();

    const abort = () => {
        cancelScrollAnimation();
        detach();
    };
    const detach = () => {
        window.removeEventListener("wheel", abort);
        window.removeEventListener("touchstart", abort);
        window.removeEventListener("keydown", abort);
        if (detachActive === detach) detachActive = null;
    };
    detachActive = detach;
    window.addEventListener("wheel", abort, { passive: true });
    window.addEventListener("touchstart", abort, { passive: true });
    window.addEventListener("keydown", abort);

    const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        window.scrollTo(0, start + distance * ease(progress));

        if (progress < 1) {
            activeAnimation = requestAnimationFrame(step);
        } else {
            activeAnimation = null;
            detach();
        }
    };

    activeAnimation = requestAnimationFrame(step);
}
