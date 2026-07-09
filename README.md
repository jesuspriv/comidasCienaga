# 🍽️ ComidasCiénaga

Directorio gastronómico digital de Ciénaga, Magdalena, Colombia. Un solo lugar donde cualquier persona que venda comida puede registrar su negocio, y cualquier cliente puede buscar lo que quiere comer y descubrir dónde conseguirlo.

## ¿Qué problema resuelve?

El cliente quiere comer algo específico pero no sabe dónde conseguirlo en Ciénaga. Los negocios están dispersos en Instagram, Facebook o simplemente no tienen presencia digital. ComidasCiénaga centraliza todo en un buscador por plato o producto.

**Ejemplo:** Una persona quiere una hamburguesa. Entra a la plataforma, escribe "hamburguesa" y le aparecen todos los locales de Ciénaga que la venden — con fotos, horarios y contacto directo por WhatsApp.

## 🚀 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Estilos | Tailwind CSS |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Almacenamiento | Supabase Storage |
| Despliegue | Vercel |

## ✨ Funcionalidades

- 🔍 Búsqueda de locales por plato o producto
- 🗂️ Filtro por categorías (comida rápida, bebidas, postres, típica, parrilla)
- 🟢 Badge "Abierto ahora" en tiempo real
- ⭐ Sistema de calificaciones y reseñas
- 📋 Registro de negocio en 4 pasos
- 📸 Galería de fotos de comida
- 📄 Carta del menú en foto o PDF
- 💬 Contacto directo por WhatsApp
- 🧑‍💼 Panel del dueño para gestionar su negocio

## 🗂️ Estructura del proyecto

```
comidas-cienaga/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── registro/
│   ├── (public)/
│   │   ├── page.js           # Pantalla principal
│   │   ├── buscar/           # Resultados de búsqueda
│   │   └── negocio/[id]/     # Perfil del negocio
│   ├── dashboard/            # Panel del dueño
│   │   └── editar/
│   ├── sitemap.js
│   └── robots.js
├── components/
│   ├── ui/
│   │   ├── NegocioCard.js
│   │   ├── Buscador.js
│   │   ├── TagPill.js
│   │   └── BackButton.js
│   └── forms/
│       └── RegistroNegocio.js
└── lib/
    └── supabase/
        ├── client.js
        └── server.js
```

## ⚙️ Instalación local

**1. Clona el repositorio**
```bash
git clone https://github.com/TU_USUARIO/comidas-cienaga.git
cd comidas-cienaga
```

**2. Instala dependencias**
```bash
npm install
```

**3. Configura las variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:
```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

Encuentra estos valores en **Supabase → Settings → API**.

**4. Configura la base de datos**

En **Supabase → SQL Editor**, ejecuta el archivo `cienaga_database.sql` que encontrarás en la raíz del proyecto.

Luego crea estos buckets en **Supabase → Storage** (todos públicos):
- `fotos-comida`
- `cartas-menu`
- `fotos-locales`

**5. Corre el proyecto**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🗄️ Base de datos

| Tabla | Descripción |
|---|---|
| `usuarios` | Perfil del dueño del negocio |
| `negocios` | Información del local |
| `tags` | Productos que vende cada negocio |
| `fotos_comida` | Galería de fotos del local |
| `cartas` | Carta del menú (foto o PDF) |
| `calificaciones` | Reseñas de los clientes |

La función RPC `buscar_por_tag(termino)` maneja el buscador principal usando full-text search en PostgreSQL.

## 🌐 Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto en Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase |

## 📦 Deploy en Vercel

1. Sube el proyecto a GitHub
2. Entra a [vercel.com](https://vercel.com) y conecta el repositorio
3. Agrega las variables de entorno en Vercel → Settings → Environment Variables
4. Vercel despliega automáticamente con cada push a `main`

## 🗺️ Roadmap

- [ ] Sistema de calificaciones visible para el cliente
- [ ] Filtro por "Abierto ahora"
- [ ] Registro de clientes
- [ ] Notificaciones por WhatsApp
- [ ] Panel de estadísticas para el dueño
- [ ] Versión PWA (instalable en celular)

## 👨‍💻 Autor

Desarrollado por **Jesus David** — Ciénaga, Magdalena, Colombia.

---

*ComidasCiénaga — Hecho con ❤️ para Ciénaga*
