import { loadCubismCore } from "@/lib/load-cubism-core";

type PixiModule = typeof import("pixi.js");
type Live2DModelClass = typeof import("pixi-live2d-display/cubism4").Live2DModel;

type Live2DConfig = typeof import("pixi-live2d-display/cubism4").config;

let runtimePromise: Promise<{
  PIXI: PixiModule;
  Live2DModel: Live2DModelClass;
  config: Live2DConfig;
}> | null = null;

let globalTickerRegistered = false;

/** Ticker global para la sesión de juego (una sola instancia → expresiones Cubism). */
export function registerLive2DGlobalTicker(PIXI: PixiModule, Live2DModel: Live2DModelClass) {
  if (!globalTickerRegistered) {
    Live2DModel.registerTicker(PIXI.Ticker);
    globalTickerRegistered = true;
  }
}

export function ensureLive2DRuntime(): Promise<{
  PIXI: PixiModule;
  Live2DModel: Live2DModelClass;
  config: Live2DConfig;
}> {
  if (runtimePromise) return runtimePromise;

  runtimePromise = (async () => {
    await loadCubismCore();

    const PIXI = await import("pixi.js");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).PIXI = PIXI;

    try {
      PIXI.Application.registerPlugin(PIXI.TickerPlugin);
    } catch {
      // ya registrado
    }

    try {
      const { InteractionManager } = await import("@pixi/interaction");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (PIXI.Renderer as any).registerPlugin?.("interaction", InteractionManager);
    } catch {
      // optional
    }

    const { Live2DModel, config } = await import("pixi-live2d-display/cubism4");
    return { PIXI, Live2DModel, config };
  })();

  return runtimePromise;
}

let modelLoadChain: Promise<void> = Promise.resolve();

export function enqueueLive2DModelLoad<T>(task: () => Promise<T>): Promise<T> {
  const run = modelLoadChain.then(task);
  modelLoadChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}
