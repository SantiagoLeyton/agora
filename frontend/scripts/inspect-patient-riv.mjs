/**
 * Introspection of public/rive/patient.riv — run: node scripts/inspect-patient-riv.mjs
 * Requires: npm install canvas (dev, one-time)
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createCanvas, Canvas } from "canvas";

// Minimal DOM stubs for @rive-app/canvas in Node
global.HTMLCanvasElement = Canvas;
global.document = {
  createElement: (tag) => {
    if (tag === "canvas") return createCanvas(1, 1);
    return {};
  },
};

const require = createRequire(import.meta.url);
const { Rive, RiveFile, StateMachineInputType } = require("@rive-app/canvas");

const RIV_PATH = path.resolve("public/rive/patient.riv");

function loadBuffer() {
  const buf = fs.readFileSync(RIV_PATH);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

function inputTypeLabel(type) {
  if (type === StateMachineInputType.Number || type === 56) return "Number";
  if (type === StateMachineInputType.Trigger || type === 58) return "Trigger";
  if (type === StateMachineInputType.Boolean || type === 59) return "Boolean";
  return String(type);
}

function loopLabel(loopValue) {
  if (loopValue === 0) return "one-shot";
  if (loopValue === 1) return "loop";
  if (loopValue === 2) return "ping-pong";
  return `unknown(${loopValue})`;
}

async function inspectRiveFile(buffer) {
  const riveFile = new RiveFile({ buffer });
  await riveFile.init();
  const file = riveFile.getInstance();

  const artboards = [];
  for (let i = 0; i < file.artboardCount(); i++) {
    const ab = file.artboardByIndex(i);
    const animations = [];
    for (let a = 0; a < ab.animationCount(); a++) {
      const anim = ab.animationByIndex(a);
      animations.push({
        name: anim.name,
        loop: loopLabel(anim.loopValue),
      });
    }

    const stateMachines = [];
    for (let s = 0; s < ab.stateMachineCount(); s++) {
      const sm = ab.stateMachineByIndex(s);
      stateMachines.push({ name: sm.name });
    }

    artboards.push({
      name: ab.name,
      width: ab.artboardWidth,
      height: ab.artboardHeight,
      bounds: ab.bounds
        ? {
            minX: ab.bounds.minX,
            minY: ab.bounds.minY,
            maxX: ab.bounds.maxX,
            maxY: ab.bounds.maxY,
          }
        : null,
      hasAudio: ab.hasAudio,
      animations,
      stateMachines,
    });
    ab.delete();
  }

  const viewModels = [];
  for (let v = 0; v < file.viewModelCount(); v++) {
    const vm = file.viewModelByIndex(v);
    const properties = (vm.properties ?? []).map((p) => ({
      name: p.name,
      type: p.type,
    }));
    const instances = [];
    for (const instName of vm.instanceNames ?? []) {
      const inst = vm.instanceByName(instName);
      instances.push({
        name: instName,
        properties: (inst?.getProperties?.() ?? []).map((p) => ({
          name: p.name,
          type: p.type,
        })),
      });
    }
    let defaultInstanceProperties = [];
    try {
      defaultInstanceProperties = (vm.defaultInstance()?.getProperties?.() ?? []).map(
        (p) => ({ name: p.name, type: p.type })
      );
    } catch {
      // ignore
    }
    viewModels.push({
      name: vm.name,
      instanceCount: vm.instanceCount,
      instanceNames: vm.instanceNames,
      properties,
      defaultInstanceProperties,
      instances,
    });
  }

  const enums = (file.enums?.() ?? []).map((e) => ({
    name: e.name,
    values: e.values,
  }));

  file.unref();
  riveFile.cleanup();

  return { artboards, viewModels, enums, viewModelCount: viewModels.length };
}

async function inspectRiveRuntime(buffer) {
  const canvas = createCanvas(400, 500);

  return new Promise((resolve, reject) => {
    const rive = new Rive({
      buffer,
      canvas,
      autoplay: false,
      onLoad: () => {
        try {
          const smInputsByName = {};
          for (const ab of rive.contents?.artboards ?? []) {
            for (const sm of ab.stateMachines ?? []) {
              const runtimeInputs = rive.stateMachineInputs(sm.name) ?? [];
              smInputsByName[sm.name] = runtimeInputs.map((inp) => ({
                name: inp.name,
                type: inputTypeLabel(inp.type),
                defaultValue: inp.value,
              }));
            }
          }

          resolve({
            contents: rive.contents,
            activeArtboard: rive.activeArtboard,
            artboardWidth: rive.artboardWidth,
            artboardHeight: rive.artboardHeight,
            animationNames: rive.animationNames,
            stateMachineNames: rive.stateMachineNames,
            viewModelCount: rive.viewModelCount,
            defaultViewModel: rive.defaultViewModel()
              ? {
                  name: rive.defaultViewModel().name,
                  properties: (rive.defaultViewModel().properties ?? []).map((p) => ({
                    name: p.name,
                    type: p.type,
                  })),
                }
              : null,
            viewModels: Array.from({ length: rive.viewModelCount }, (_, i) => {
              const vm = rive.viewModelByIndex(i);
              if (!vm) return null;
              return {
                name: vm.name,
                properties: (vm.properties ?? []).map((p) => ({
                  name: p.name,
                  type: p.type,
                })),
                instanceNames: vm.instanceNames,
              };
            }).filter(Boolean),
            enums: (rive.enums() ?? []).map((e) => ({ name: e.name, values: e.values })),
            runtimeStateMachineInputs: smInputsByName,
          });
        } catch (err) {
          reject(err);
        } finally {
          rive.cleanup();
        }
      },
      onLoadError: (err) => reject(err?.data ?? err),
    });
  });
}

async function inspectAnimationDurations(buffer) {
  /** @type {import('@rive-app/canvas').RiveFile} */
  const riveFile = new RiveFile({ buffer });
  await riveFile.init();
  const file = riveFile.getInstance();

  const { RuntimeLoader } = require("@rive-app/canvas");
  const runtime = await new Promise((resolve, reject) => {
    RuntimeLoader.getInstance((rt) => (rt ? resolve(rt) : reject(new Error("no runtime"))));
  });

  const durations = [];
  for (let i = 0; i < file.artboardCount(); i++) {
    const ab = file.artboardByIndex(i);
    for (let a = 0; a < ab.animationCount(); a++) {
      const anim = ab.animationByIndex(a);
      try {
        const inst = new runtime.LinearAnimationInstance(anim, ab);
        durations.push({
          artboard: ab.name,
          name: inst.name,
          durationSec: Number(inst.duration.toFixed(4)),
          fps: inst.fps,
          loop: loopLabel(inst.loopValue),
          workStart: inst.workStart,
          workEnd: inst.workEnd,
        });
        inst.delete();
      } catch (e) {
        durations.push({
          artboard: ab.name,
          name: anim.name,
          loop: loopLabel(anim.loopValue),
          error: String(e),
        });
      }
    }

    for (let s = 0; s < ab.stateMachineCount(); s++) {
      const sm = ab.stateMachineByIndex(s);
      try {
        const smi = new runtime.StateMachineInstance(sm, ab);
        const inputs = [];
        for (let inp = 0; inp < smi.inputCount(); inp++) {
          const input = smi.input(inp);
          inputs.push({
            name: input.name,
            type: inputTypeLabel(input.type),
            defaultValue: input.value,
          });
        }
        durations.push({
          kind: "stateMachine",
          artboard: ab.name,
          name: smi.name,
          inputs,
        });
        smi.delete();
      } catch (e) {
        durations.push({
          kind: "stateMachine",
          artboard: ab.name,
          name: sm.name,
          error: String(e),
        });
      }
    }
    ab.delete();
  }

  file.unref();
  riveFile.cleanup();
  return durations;
}

function extractStringsFromBinary() {
  const buf = fs.readFileSync(RIV_PATH);
  const text = buf.toString("latin1");
  const matches = new Set();
  const re = /[\x20-\x7E]{4,}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const s = m[0].trim();
    if (/^[A-Za-z][A-Za-z0-9 _\-]{2,}$/.test(s)) matches.add(s);
  }
  return [...matches].sort();
}

async function main() {
  const buffer = loadBuffer();
  const fileSizeBytes = fs.statSync(RIV_PATH).size;

  const [fileInspect, runtimeInspect, animationDetails] = await Promise.all([
    inspectRiveFile(buffer).catch((e) => ({ error: String(e) })),
    inspectRiveRuntime(buffer).catch((e) => ({ error: String(e) })),
    inspectAnimationDurations(buffer).catch((e) => ({ error: String(e) })),
  ]);

  const report = {
    generatedAt: new Date().toISOString(),
    sourceFile: RIV_PATH,
    fileSizeBytes,
    fileInspect,
    runtimeInspect,
    animationDetails,
    binaryStringsSample: extractStringsFromBinary().filter((s) =>
      /head|blush|smile|poke|state|machine|idle|blink|speak|eye|mood|anxiety|bind|view/i.test(s)
    ),
  };

  const outPath = path.resolve("scripts/patient-riv-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
