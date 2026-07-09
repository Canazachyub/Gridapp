# GridApp - Sistema de Estudio con Tarjetas Oclusivas

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-Backend-4285F4?logo=google)](https://developers.google.com/apps-script)

Sistema de estudio interactivo con tarjetas oclusivas conectado a Google Sheets como base de datos y Google Drive para almacenamiento de imágenes.

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
│                     React + TypeScript + Vite                               │
│                    (GitHub Pages / Vercel)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS (fetch)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE APPS SCRIPT                                   │
│                          (REST API Bridge)                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ GET /topics │  │ POST /topic │  │GET /cards   │  │POST /upload │        │
│  │ Listar hojas│  │ Crear hoja  │  │Obtener filas│  │Subir imagen │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│        GOOGLE SHEETS          │   │        GOOGLE DRIVE           │
│       (Base de Datos)         │   │   (Almacenamiento Imágenes)   │
│                               │   │                               │
│  ┌─────────────────────────┐  │   │  ┌─────────────────────────┐  │
│  │ Sheet: "Latín-Sufijos"  │  │   │  │ Folder: "GridApp-Images"│  │
│  │ Col A  │ Col B │ Col C  │  │   │  │ - image1.png            │  │
│  │ Sufijo │ Signif│ Ejemplo│  │   │  │ - image2.jpg            │  │
│  │ -a     │ agente│ escriba│  │   │  │ - ...                   │  │
│  └─────────────────────────┘  │   │  └─────────────────────────┘  │
│                               │   │                               │
│  ┌─────────────────────────┐  │   │                               │
│  │ Sheet: "_config"        │  │   │                               │
│  │ (Metadatos de columnas) │  │   │                               │
│  └─────────────────────────┘  │   │                               │
└───────────────────────────────┘   └───────────────────────────────┘
```

---

## Estructura del Proyecto

```
14_GRIDAPP/
├── README.md                    # Este archivo
├── package.json                 # Dependencias del proyecto
├── vite.config.ts              # Configuración de Vite
├── tailwind.config.js          # Configuración de Tailwind CSS
├── tsconfig.json               # Configuración de TypeScript
├── index.html                  # Entry point HTML
├── .env.example                # Variables de entorno ejemplo
│
├── src/
│   ├── main.tsx                # Entry point React
│   ├── App.tsx                 # Componente principal
│   ├── index.css               # Estilos globales + Tailwind
│   │
│   ├── types/                  # Definiciones TypeScript
│   │   └── index.ts            # Tipos compartidos
│   │
│   ├── services/               # Capa de servicios
│   │   ├── api.ts              # Cliente API para Google Apps Script
│   │   └── storage.ts          # LocalStorage/Cache manager
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useTopics.ts        # Hook para gestión de temas
│   │   ├── useStudySession.ts  # Hook para sesiones de estudio
│   │   └── useKeyboard.ts      # Hook para atajos de teclado
│   │
│   ├── components/             # Componentes reutilizables
│   │   ├── ui/                 # Componentes UI base
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Spinner.tsx
│   │   │
│   │   ├── FlipCard.tsx        # Tarjeta con animación flip
│   │   ├── TopicCard.tsx       # Card de tema en dashboard
│   │   ├── NavigationBar.tsx   # Barra de navegación inferior
│   │   ├── IndexSidebar.tsx    # Índice lateral desplegable
│   │   ├── ImageUploader.tsx   # Componente subida de imágenes
│   │   ├── ColumnEditor.tsx    # Editor de columnas
│   │   └── StatsPanel.tsx      # Panel de estadísticas
│   │
│   ├── views/                  # Vistas principales
│   │   ├── Dashboard.tsx       # Vista principal con temas
│   │   ├── TopicCreator.tsx    # Crear nuevo tema
│   │   ├── TopicEditor.tsx     # Editar tema existente
│   │   ├── StudyMode.tsx       # Modo estudio (slides)
│   │   └── Settings.tsx        # Configuración de la app
│   │
│   ├── contexts/               # React Contexts
│   │   ├── ThemeContext.tsx    # Dark/Light mode
│   │   └── AppContext.tsx      # Estado global de la app
│   │
│   └── utils/                  # Utilidades
│       ├── constants.ts        # Constantes de la app
│       └── helpers.ts          # Funciones auxiliares
│
├── google-apps-script/         # Backend GAS
│   ├── Code.gs                 # Script principal
│   ├── appsscript.json         # Manifest del proyecto
│   └── README.md               # Guía de despliegue GAS
│
└── public/                     # Assets estáticos
    ├── favicon.ico
    └── manifest.json
```

---

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+ instalado
- Cuenta de Google
- Acceso a Google Sheets y Google Drive

### Paso 1: Clonar e Instalar Dependencias

```bash
cd c:\PROGRAMACION\14_GRIDAPP
npm install
```

### Paso 2: Configurar Google Apps Script

1. Ir a [Google Apps Script](https://script.google.com/)
2. Crear nuevo proyecto: "GridApp Backend"
3. Copiar el contenido de `google-apps-script/Code.gs`
4. Configurar las variables en el script:
   ```javascript
   const SPREADSHEET_ID = '1UCRrS5N-g4fLuJ5wo_bwH_htKKmGt4271EKnKRJ5AI4';
   const DRIVE_FOLDER_ID = '15YZ1GFYpBrIKjGvS4JxtaCw-n_I2Ru3d';
   ```
5. Desplegar como Web App:
   - Ejecutar como: "Yo"
   - Acceso: "Cualquier persona"
6. Copiar la URL del Web App

### Paso 3: Configurar Variables de Entorno

Crear archivo `.env`:
```env
VITE_GAS_URL=https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec
```

### Paso 4: Ejecutar en Desarrollo

```bash
npm run dev
```

---

## API Reference (Google Apps Script)

### Endpoints

| Método | Acción | Descripción |
|--------|--------|-------------|
| `GET` | `action=getTopics` | Obtener lista de todos los temas (hojas) |
| `GET` | `action=getCards&topic=NombreHoja` | Obtener tarjetas de un tema |
| `POST` | `action=createTopic` | Crear nuevo tema (hoja) |
| `POST` | `action=addCard` | Agregar tarjeta a un tema |
| `POST` | `action=updateCard` | Actualizar tarjeta existente |
| `POST` | `action=deleteCard` | Eliminar tarjeta |
| `POST` | `action=uploadImage` | Subir imagen a Drive |

### Ejemplos de Uso

```typescript
// Obtener todos los temas
const topics = await api.getTopics();

// Obtener tarjetas de un tema
const cards = await api.getCards('Latín - Sufijos');

// Crear nuevo tema
await api.createTopic({
  title: 'Griego - Raíces',
  columns: [
    { name: 'Raíz', type: 'text' },
    { name: 'Significado', type: 'text' },
    { name: 'Ejemplo', type: 'text' },
    { name: 'Imagen', type: 'image' }
  ]
});

// Subir imagen
const imageUrl = await api.uploadImage(base64Data, 'mi-imagen.png');
```

---

## Estructura de la Hoja de Cálculo

### Hoja de Configuración (`_config`)
Almacena metadatos de cada tema:

| topic_id | column_name | column_type | column_order |
|----------|-------------|-------------|--------------|
| lat-suf  | Sufijo      | text        | 1            |
| lat-suf  | Significado | text        | 2            |
| lat-suf  | Ejemplo     | formula     | 3            |
| lat-suf  | Imagen      | image       | 4            |

### Hoja de Índice (`ÍNDICE`)
Permite importar temas desde un Excel estructurado. Opcional; si existe, enriquece los temas con nombre visible y número de flashcards:

| CLASE             | TEMA            | NÚMERO DE FLASHCARDS |
|-------------------|-----------------|----------------------|
| Clase_01_DISNEA   | Disnea          | 13                   |
| Clase_02_EDEMA    | Edema           | 14                   |

### Hojas de Temas
Cada tema es una hoja separada:

**Hoja: "Latín - Sufijos"**
| Sufijo | Significado | Ejemplo | Imagen |
|--------|-------------|---------|--------|
| -a     | agente      | escriba | [URL]  |
| -alis  | relación    | vital   | [URL]  |

---

## Características Principales

### Dashboard
- Vista de todos los temas disponibles
- Indicador de progreso por tema
- Búsqueda y filtrado de temas
- Sincronización con Google Sheets

### Creador de Temas
- Definir columnas personalizadas
- Tipos de columna: texto, imagen, fórmula
- Vista previa antes de guardar
- Importar desde CSV (opcional)

### Modo Estudio (Grid Oclusivo / Memorización)
- Cuadrícula adaptable tipo Bento que aprovecha el espacio de pantalla
- Detección automática de roles de memorización por nombre de columna:
  - `Concepto`, `Patología`, `Término` → Concepto clave
  - `Pregunta`, `Flashcard` → Pregunta de active recall
  - `Respuesta`, `Resumen`, `Validación` → Respuesta / validación
  - `Nemotecnia`, `Anclaje` → Nemotecnia
  - `Palabra Clave` → Palabra clave
  - `Imagen` → Imagen
  - `Bloque / Hora / Sesión` → Metadato (se muestra en el header)
- Modos de estudio: **Aprender**, **Active Recall**, **Examen**
- Tiles vacíos se ocultan automáticamente
- Imágenes por URL con fallback si no cargan
- Índice lateral desplegable
- Barra de progreso
- Atajos de teclado:
  - `←` / `→`: Navegar entre filas
  - `Espacio`: Revelar todas las tarjetas
  - `R`: Resetear tarjetas
  - `1` / `2` / `3`: Cambiar modo de estudio
  - `I`: Abrir/cerrar índice
  - `Esc`: Volver al dashboard

### Subida de Imágenes
- Drag & drop
- Preview antes de subir
- Compresión automática
- Almacenamiento en Google Drive
- URL automática en la hoja

### Modo Offline
- Cache local de datos
- Sincronización cuando hay conexión
- Indicador de estado de conexión

---

## Guía de Uso

### Crear un Nuevo Tema

1. Clic en "Crear Hoja" desde el Dashboard
2. Escribir nombre del tema (ej: "Biología - Células")
3. Agregar columnas necesarias:
   - Columna 1: "Término" (texto)
   - Columna 2: "Definición" (texto)
   - Columna 3: "Imagen" (imagen)
4. Clic en "Guardar"
5. El tema aparece en el Dashboard y en Google Sheets

### Agregar Tarjetas

1. Desde el Dashboard, clic en el icono de configuración del tema
2. En el Editor, clic en "+ Nueva Fila"
3. Completar cada celda
4. Para imágenes: clic en el icono de cámara y seleccionar archivo
5. Clic en "Guardar" - los datos se sincronizan con Google Sheets

### Estudiar

1. Clic en "Estudiar" en cualquier tema
2. Las tarjetas aparecen ocultas (grises)
3. Clic en cada tarjeta para revelar su contenido
4. Usar navegación inferior o atajos de teclado
5. El índice lateral permite saltar a cualquier fila

---

## Despliegue

### Frontend (Vercel)

```bash
npm run build
vercel deploy
```

### Frontend (GitHub Pages)

```bash
npm run build
# Configurar vite.config.ts con base: '/14_GRIDAPP/'
# Push a gh-pages branch
```

### Backend (Google Apps Script)

1. Abrir el proyecto en script.google.com
2. Clic en "Implementar" > "Nueva implementación"
3. Tipo: "Aplicación web"
4. Ejecutar como: "Yo"
5. Acceso: "Cualquier persona"
6. Copiar URL y actualizar `.env`

---

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_GAS_URL` | URL del Web App de Google Apps Script | `https://script.google.com/macros/s/xxx/exec` |
| `VITE_APP_NAME` | Nombre de la aplicación | `GridApp` |

---

## Solución de Problemas

### Error CORS
Google Apps Script maneja CORS automáticamente. Si hay problemas:
- Verificar que el Web App esté desplegado como "Cualquier persona"
- Usar `mode: 'no-cors'` solo para pruebas

### Imágenes no cargan
- Verificar permisos de la carpeta de Drive
- La carpeta debe ser pública o compartida
- El script debe tener permisos de Drive

### Datos no sincronizan
- Verificar URL del Web App en `.env`
- Comprobar que el Spreadsheet ID es correcto
- Revisar logs en Google Apps Script

---

## Roadmap

- [ ] Modo examen con puntuación
- [ ] Repetición espaciada (SRS)
- [ ] Exportar a Anki
- [ ] Colaboración en tiempo real
- [ ] App móvil (React Native)
- [ ] Reconocimiento de voz

---

## Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

---

## Recursos

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite](https://vitejs.dev)
