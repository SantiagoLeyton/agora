/** Public path to Cubism Core (from Live2D SDK for Web). */
export const CUBISM_CORE_SCRIPT = "/live2d/core/live2dcubismcore.min.js";

const LOAD_TIMEOUT_MS = 20_000;

let loadPromise: Promise<void> | null = null;

function waitForGlobal(): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (typeof window !== "undefined" && window.Live2DCubismCore) {
        resolve();
        return;
      }
      if (Date.now() - started > LOAD_TIMEOUT_MS) {
        reject(
          new Error(
            `Timeout: Live2DCubismCore no está en window tras cargar ${CUBISM_CORE_SCRIPT}`
          )
        );
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

export function loadCubismCore(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadCubismCore solo en el cliente"));
  }

  if (window.Live2DCubismCore) {
    return Promise.resolve();
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${CUBISM_CORE_SCRIPT}"]`
    );
    if (existing) {
      waitForGlobal().then(resolve).catch(reject);
      return;
    }

    const script = document.createElement("script");
    script.src = CUBISM_CORE_SCRIPT;
    script.async = true;
    script.onload = () => waitForGlobal().then(resolve).catch(reject);
    script.onerror = () =>
      reject(new Error(`No se pudo cargar ${CUBISM_CORE_SCRIPT}`));
    document.head.appendChild(script);
  });

  return loadPromise;
}
