# Seti To-Do App

Aplicación de gestión de tareas desarrollada con **Ionic 8 + Angular 20 + Cordova** como prueba técnica para la posición de Mobile Developer.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | Ionic 8 + Angular 20 |
| Estado | Angular Signals (`signal`, `computed`) |
| Persistencia | `@ionic/storage-angular` + localforage |
| Feature Flags | Firebase Remote Config |
| Build nativo | Apache Cordova |
| Package manager | pnpm |

---

## Arquitectura

Se adoptó una arquitectura **feature-based** con separación clara de responsabilidades:

```
src/app/
├── core/
│   ├── models/          # Interfaces de dominio (Task, Category)
│   ├── repositories/    # Interfaces de repositorio (ITaskRepository)
│   └── services/        # StorageService, RemoteConfigService
├── features/
│   ├── tasks/           # Módulo de tareas (CRUD + lista + formulario)
│   └── categories/      # Módulo de categorías (CRUD + lista + formulario)
└── tabs/                # Navegación por pestañas
```

**Principios aplicados:**
- **SOLID**: Repository pattern con interfaces (`ITaskRepository`, `ICategoryRepository`). Los servicios implementan la interfaz, desacoplando la lógica de negocio del mecanismo de almacenamiento.
- **OnPush Change Detection**: Todos los componentes usan `ChangeDetectionStrategy.OnPush`, minimizando ciclos de detección de cambios.
- **Signals reactivos**: Estado manejado con `signal<T>()` y `computed()` de Angular 20, sin necesidad de RxJS/BehaviorSubject.
- **Standalone components**: Angular 20 por defecto, sin NgModules para features. Lazy loading con `loadComponent`.

---

## Funcionalidades

- **Tareas**: crear, editar, eliminar, marcar como completada
- **Categorías**: crear, editar, eliminar con color personalizable
- **Filtro por categoría**: chips en la lista de tareas para filtrar
- **Panel de estadísticas**: controlado por Firebase Remote Config (`show_statistics_panel`)
- **Persistencia local**: datos guardados en el dispositivo con localforage

---

## Firebase Remote Config — Feature Flag

El panel de estadísticas está controlado por el flag `show_statistics_panel` en Firebase Remote Config.

**Para activarlo:**
1. Ir a [Firebase Console](https://console.firebase.google.com) → proyecto `seti-todo-app`
2. Remote Config → `show_statistics_panel` → cambiar a `true` → Publicar cambios
3. Reiniciar la app (Remote Config fetches en el arranque vía `APP_INITIALIZER`)

**Implementación:**
```typescript
// remote-config.service.ts
readonly statsEnabled = signal<boolean>(false);

async init(): Promise<void> {
  await fetchAndActivate(this.remoteConfig);
  const value = getValue(this.remoteConfig, 'show_statistics_panel');
  this.statsEnabled.set(value.asBoolean());
}
```

El signal `statsEnabled` se consume directamente en el template con `*ngIf="showStats()"`.

---

## Entregables

| Archivo | Plataforma |
|---------|-----------|
| `deliverables/SetiTodoApp.apk` | Android (debug build) |
| `deliverables/SetiTodoApp-simulator.ipa` | iOS (simulator build) |

> **Nota sobre el IPA:** La generación de un IPA firmado para dispositivo físico requiere una cuenta de Apple Developer con certificado de distribución. El IPA incluido es un build de simulador, funcional en Xcode Simulator. El build de Release (`xcodebuild archive`) compila sin errores pero requiere un equipo de desarrollo seleccionado para el paso de firmado.

---

## Cómo ejecutar el proyecto

### Requisitos previos

- Node 22+ (`nvm install 22`)
- pnpm (`npm install -g pnpm`)
- Cordova CLI (`pnpm add -g cordova`)
- Android Studio con SDK (para Android)
- Xcode 15+ (para iOS)

### Instalación

```bash
pnpm install
```

### Desarrollo web

```bash
pnpm run start
# → http://localhost:8100
```

### Build Android

```bash
pnpm run build
cordova build android
# APK en: platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### Build iOS

```bash
pnpm run build
cordova build ios
# o abrir platforms/ios/App.xcworkspace en Xcode
```

---

## Preguntas del test

### 1. ¿Cuáles fueron los mayores desafíos técnicos?

**a) Compatibilidad pnpm + Cordova**
Cordova usa npm internamente a través de `arborist`. Con `pnpm-lock.yaml` presente, npm falla con `Cannot read properties of null (reading 'matches')`. Solución: instalar plugins con pnpm primero, luego registrarlos con `cordova plugin add --nofetch` para que Cordova no intente reinstalarlos con npm.

**b) Xcode 26 beta (deployment target 11.0)**
Xcode 26 (beta) rechaza `IPHONEOS_DEPLOYMENT_TARGET = 11.0` y `macCatalyst 11.0`. Se corrigieron tres archivos:
- `platforms/ios/App.xcodeproj/project.pbxproj` → `13.0`
- `platforms/ios/packages/cordova-ios-plugins/Package.swift` → `.macCatalyst("13.0")`
- `platforms/ios/packages/cordova-ios/CordovaLib/CordovaLib.xcodeproj/project.pbxproj` → `13.0`

**c) Angular 20 standalone por defecto**
Angular 20 emite componentes `standalone: true` por defecto. Los módulos de features fueron eliminados, migrando a `loadComponent()` en el router. Los componentes usados como modales no necesitan estar en el array `imports` del componente host.

### 2. ¿Qué técnicas de optimización aplicaste?

- **`ChangeDetectionStrategy.OnPush`** en todos los componentes: Angular solo revisa el árbol cuando cambia un Input o un signal.
- **Angular Signals**: eliminan la necesidad de `async pipe` y subscripciones manuales. El grafo de dependencias es preciso, evitando re-renders innecesarios.
- **`computed()` memoizado**: `filteredTasks`, `completionPercentage`, `pendingCount`, `completedCount` solo se recalculan cuando sus señales de entrada cambian.
- **Lazy loading**: cada página se carga bajo demanda con `loadComponent()`, reduciendo el bundle inicial.
- **`trackBy`** en `*ngFor`: evita re-renderizar el DOM completo al reordenar la lista.
- **`APP_INITIALIZER`**: Firebase Remote Config y Storage se inicializan antes del primer render, sin loaders intermedios.

### 3. ¿Cómo garantizas la calidad del código?

- **Interfaces de repositorio** (`ITaskRepository`, `ICategoryRepository`): el contrato está separado de la implementación. Cambiar de localforage a SQLite solo requiere reimplementar la clase, no modificar los consumidores.
- **Modelos de dominio tipados**: `Task` y `Category` con interfaces TypeScript estrictas. `Pick<Task, ...>` en los métodos de creación para evitar pasar `id`/`createdAt` manualmente.
- **Señales readonly expuestas**: los servicios exponen `signal.asReadonly()`. Los componentes no pueden mutar el estado directamente.
- **Componentes de presentación**: `TaskItemComponent` y `CategoryItemComponent` son "dumb components" (solo inputs/outputs), sin dependencias de servicios.
- **Feature flag desacoplado**: `RemoteConfigService` expone un signal booleano. El componente no sabe que viene de Firebase; podría venir de cualquier fuente.

---

## Decisiones de diseño destacadas

**¿Por qué Signals en lugar de RxJS/NgRx?**
Para una app de este tamaño, Signals ofrecen la misma reactividad con menor boilerplate. NgRx añadiría ~3KB de overhead y patrones Action/Reducer/Effect injustificados para un estado local sencillo.

**¿Por qué feature-based y no layer-based?**
Una estructura `components/services/pages` a nivel raíz no escala. Feature-based permite que cada módulo sea autónomo: mover o eliminar `features/tasks` no afecta a `features/categories`.

**¿Por qué Ionic 8 + Angular 20 en lugar de las últimas versiones?**
Angular 20 + Ionic 8 están probados juntos. Angular 21 (en beta al momento del desarrollo) no tiene soporte oficial en Ionic 8 todavía. Estabilidad sobre bleeding-edge para un entregable de producción.
