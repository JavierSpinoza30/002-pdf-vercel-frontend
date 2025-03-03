# Frontend de la Aplicación de Gestión de PDFs

Este es el frontend de la aplicación de gestión de PDFs, desarrollado con Next.js y conectado al backend de FastAPI.

## Requisitos

- Node.js 14+ y npm

## Configuración local

1. Clona este repositorio
2. Navega al directorio del frontend: `cd pdf-app`
3. Instala las dependencias: `npm install`
4. Crea un archivo `.env.local` con la siguiente variable:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   (Asegúrate de que esta URL apunte a tu backend local)
5. Inicia el servidor de desarrollo: `npm run dev`
6. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## Despliegue en Vercel

1. Crea una cuenta en [Vercel](https://vercel.com/)
2. Instala la CLI de Vercel: `npm i -g vercel`
3. Inicia sesión: `vercel login`
4. Despliega la aplicación: `vercel`
5. Configura las variables de entorno en el panel de Vercel:
   - `NEXT_PUBLIC_API_URL`: URL de tu backend desplegado

## Despliegue en Netlify

1. Crea una cuenta en [Netlify](https://www.netlify.com/)
2. Instala la CLI de Netlify: `npm install -g netlify-cli`
3. Inicia sesión: `netlify login`
4. Despliega la aplicación: `netlify deploy`
5. Configura las variables de entorno en el panel de Netlify:
   - `NEXT_PUBLIC_API_URL`: URL de tu backend desplegado

## Funcionalidades

- Ver lista de PDFs
- Subir nuevos PDFs
- Seleccionar/deseleccionar PDFs
- Eliminar PDFs
- Filtrar PDFs por estado de selección

## Estructura del proyecto

- `components/`: Componentes de React
  - `pdf.js`: Componente para mostrar un PDF individual
  - `pdf-list.js`: Componente para mostrar la lista de PDFs
  - `layout.js`: Componente de diseño principal
- `pages/`: Páginas de Next.js
  - `index.js`: Página principal
  - `_app.js`: Componente raíz de la aplicación
- `styles/`: Estilos CSS
- `public/`: Archivos estáticos

## Conexión con el backend

El frontend se conecta al backend a través de la variable de entorno `NEXT_PUBLIC_API_URL`. Asegúrate de que esta variable apunte a la URL correcta de tu backend.
