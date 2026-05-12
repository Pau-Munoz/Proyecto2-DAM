
Proyecto de DAM - Gestión de Empresas e Interacciones (CRM)

Este es nuestro proyecto para el ciclo de Desarrollo de Aplicaciones Multiplataforma (DAM). Consiste en una aplicación web de tipo CRM para gestionar clientes, empresas y contactos, y llevar un registro de las comunicaciones con cada uno de ellos.

Tecnologías utilizadas

El proyecto usa un stack MERN adaptado: en lugar de MongoDB, tiramos por SQLite, que nos resultaba más cómodo para este tipo de proyecto.

Frontend
React 19 para la interfaz y los componentes.
Vite como herramienta de desarrollo.
React Router para la navegación entre vistas (Buscador, Ficha de empresa, Login...).
Axios para las peticiones al backend.
Lucide React para los iconos.

Backend
Node.js con Express para el servidor y la API REST.
Prisma ORM para interactuar con la base de datos sin escribir SQL a mano.
SQLite como base de datos, guardada en un archivo .db para facilitar su portabilidad.
JWT y Bcrypt para el sistema de autenticación y el cifrado de contraseñas.

Cómo funciona
La idea es que los Gestores puedan dar de alta empresas que son posibles clientes y hacer seguimiento de cada una.

Usuarios y roles: 
hay dos tipos de usuario. El Admin tiene acceso completo y puede borrar registros; el Gestor es el perfil operativo, el que trabaja día a día con las empresas.

Gestión de empresas: 
cada empresa tiene sus datos de contacto (web, teléfono, email) y un estado que indica en qué punto del proceso está (si ya se ha contactado, si es cliente activo, etc.).

Contactos: 
dentro de cada empresa se pueden añadir las personas que trabajan allí.

Interacciones: 
hay un sistema de registro para apuntar cada llamada, email o reunión. Así queda constancia de todo lo que se ha hablado con cada empresa.

Etiquetas (Intereses): 
tanto las empresas como los contactos pueden tener etiquetas para facilitar las búsquedas (por ejemplo: "Tecnología" o "Interesado en cursos").


Cómo ponerlo en marcha
1. Backend
Desde la carpeta del backend:
bashcd backend
npm install
npx prisma generate
npx prisma db push
node seed-bulk.js
node seed_interests.js
npm run dev

2. Frontend
En otra terminal, desde la carpeta del frontend:
bashcd frontend
npm install
npm run dev

Estructura del repositorio

backend/ — servidor, base de datos SQLite y esquema de Prisma.
frontend/ — código de React, páginas y estilos CSS.


Este proyecto nos ha servido para consolidar conceptos como la conexión entre frontend y base de datos, el manejo de sesiones con tokens y la organización de una API REST. Esperamos que os sea útil de referencia.