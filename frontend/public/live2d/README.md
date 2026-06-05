# Live2D — assets oficiales de muestra

## Modelos

| Carpeta | Personaje | Uso en simulador |
|---------|-----------|------------------|
| `patient/` | **Natori** (masculino) | Depresión, familia, casos custom masculinos |
| `haru/` | **Haru** (femenino) | Ansiedad, crisis, casos custom femeninos |

Copias de [Live2D/CubismWebSamples](https://github.com/Live2D/CubismWebSamples) (`Samples/Resources/`).

Licencia: [Live2D Free Material License](https://www.live2d.com/eula/live2d-free-material-license-agreement_en.html) (ver `LICENSE.md` del repositorio oficial).

## Core en `core/`

`live2dcubismcore.min.js` — runtime **Cubism Core** (licencia propietaria Live2D).

Se carga en el navegador con `loadCubismCore()` (`src/lib/load-cubism-core.ts`), no con `next/script` en layouts anidados (no funciona en App Router).

Para actualizar: descarga el [Cubism SDK for Web](https://www.live2d.com/download/cubism-sdk/download-web/) y copia `Core/live2dcubismcore.min.js` → `public/live2d/core/`.

## Uso en React

```tsx
import { Live2DPatientAvatar } from "@/components/simulator/Live2DPatientAvatar";

<Live2DPatientAvatar expression="Sad" motionGroup="Idle" />
```

Expresiones disponibles: `Normal`, `Sad`, `Smile`, `Angry`, `Blushing`, `Surprised`, `exp_01` … `exp_05`.
