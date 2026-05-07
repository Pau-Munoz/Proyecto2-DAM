# Proyecto de DAM - Gestión de Empresas e Interacciones (CRM)

Este es nuestro segundo proyecto para el ciclo de **Desarrollo de Aplicaciones Multiplataforma (DAM)**. Consiste en una aplicación web tipo CRM para gestionar clientes, empresas y los contactos asociados, además de llevar un control de qué se ha hablado con cada uno.

---

## 🚀 Tecnologías que hemos usado

Para este proyecto hemos montado un entorno **MERN** (bueno, casi, porque usamos SQLite en vez de MongoDB):

### **Frontend**
*   **React 19**: Para toda la interfaz y los componentes.
*   **Vite**: Para que el desarrollo sea más rápido.
*   **React Router**: Para movernos entre las páginas (Buscador, Ficha de empresa, Login, etc.).
*   **Axios**: Para hacer las peticiones a la API del backend.
*   **Lucide React**: Para los iconos de la web.

### **Backend**
*   **Node.js y Express**: Para crear el servidor y todos los endpoints de la API.
*   **Prisma ORM**: Para manejar la base de datos de forma más fácil sin escribir SQL puro.
*   **SQLite**: La base de datos, que es un archivo `.db` y así es más fácil de mover.
*   **JWT y Bcrypt**: Para que el login sea seguro y las contraseñas estén encriptadas.

---

## 🧠 ¿Cómo funciona el proyecto?

La idea principal es que los **Gestores** (nosotros) podamos dar de alta **Empresas** que son posibles clientes.

1.  **Usuarios y Roles**: Hemos creado dos tipos de usuarios. El "Admin" que puede ver todo y borrar cosas, y el "Gestor" que es el que trabaja con las empresas.
2.  **Gestión de Empresas**: Cada empresa tiene sus datos (web, teléfono, email) y un **Estado** (si ya hemos hablado con ellos, si son clientes, etc.).
3.  **Contactos**: Dentro de cada empresa podemos añadir a las personas que trabajan allí.
4.  **Interacciones**: Hemos programado un sistema de mensajes para apuntar cada vez que llamamos a una empresa o nos mandan un mail. Así no se nos olvida nada.
5.  **Etiquetas (Intereses)**: Se pueden poner etiquetas tanto a empresas como a contactos para luego buscarlos más rápido (por ejemplo: "Tecnología", "Interesado en cursos").

---

## 🛠️ Cómo hacerlo funcionar

Si quieres probarlo en tu ordenador, sigue estos pasos:

### 1. Preparar el Backend
Entra en la carpeta del backend, instala las librerías y levanta el servidor:
```bash
cd backend
npm install
npx prisma generate
npm run dev
```
*Nota: El servidor corre en el puerto 3001.*

### 2. Preparar el Frontend
En otra terminal, entra en la carpeta del frontend:
```bash
cd frontend
npm install
npm run dev
```
*La web se abrirá normalmente en el puerto 5173.*

---

## 📂 Estructura de carpetas
- `backend/`: Todo el código del servidor, la base de datos SQLite y el esquema de Prisma.
- `frontend/`: El código de React, las páginas y los estilos CSS.

---

Este proyecto nos ha servido para aprender mucho sobre cómo conectar un frontend con una base de datos real y manejar la autenticación con tokens. ¡Esperamos que os guste!
