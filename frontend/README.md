# Simulador Psicosocial

Plataforma académica profesional de simulación psicosocial interactiva para formación clínica.

## Stack tecnológico

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind CSS v4
- **UI:** shadcn/ui (componentes Radix)
- **Estado:** Zustand
- **Datos:** TanStack Query (mock services)
- **Animaciones:** Framer Motion
- **Testing:** Playwright

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Flujo de demostración

1. Ir a `/login`
2. Usar una cuenta demo (botones rápidos) o credenciales:
   - **Estudiante:** `estudiante@uni.edu` / `password` → `/dashboard`
   - **Docente:** `docente@uni.edu` / `password` → `/teacher`
   - **Admin:** `admin@uni.edu` / `password` → `/admin`
3. El rol se determina automáticamente — no hay selección manual de rol

## Arquitectura

```
src/
├── app/                    # Rutas Next.js (App Router)
│   ├── (auth)/             # Login, registro, recuperación, rol
│   └── (platform)/         # Plataforma autenticada
├── modules/                # Features desacoplados
│   ├── auth/
│   ├── simulator/
│   ├── evaluation/
│   ├── teacher/
│   ├── admin/
│   └── shared/
├── components/ui/          # Design system (shadcn)
├── layouts/                # Sidebar, Navbar, layouts
├── store/                  # Zustand stores
├── services/               # API mock (futuro: Spring Boot)
├── hooks/                  # TanStack Query hooks
├── mocks/                  # Datos de prueba
├── providers/              # Context providers
└── types/                  # TypeScript types
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright E2E |

## Integración futura

La capa `services/api.ts` está preparada para conectar con backend Spring Boot + JWT + PostgreSQL. Los tipos en `src/types/` reflejan el contrato de datos esperado.

## Diseño

- Dark mode elegante por defecto
- Paleta académica: azul petróleo, cyan suave, grises profesionales
- Tipografías: Inter, Geist, Plus Jakarta Sans
- Inspiración: Linear, Notion, plataformas médicas modernas
