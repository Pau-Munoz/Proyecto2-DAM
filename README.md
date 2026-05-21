
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


Requerimientos alcance y coste del proyecto
En este documento detallamos el estado actual, el alcance y los requisitos del sistema de gestión de leads desarrollado para la asignatura de Proyecto intermodular del curso 2025/2026 

---

### 1. Requisitos del Cliente (Enunciado)

Nuestro objetivo es desarrollar una aplicación web para gestionar la comunicación y leads con las empresas para las prácticas de los alumnos del centro, permitiendo seguir y registrar las interacciones con las empresas

#### Requisitos Funcionales:
- **Módulo de Acceso:** Login seguro.

Home (dashboard) VIsualizacion de ultimas actividades (logs) con acceso a las acciones realizadas

- **Gestión de Empresas:** 
    - Ficha técnica completa (nombre, estado, teléfono, email, web, convenio).
    - Control de permisos: solo administradores o creadores pueden borrar registros.
    - Listados filtrables por departamento y estado.

- **Gestión de Contactos:** CRUD de personas asociadas a cada empresa, con registro de cargo e intereses.
- **Sistema de Interacciones (Mensajes):** Registro de comunicaciones y anotaciones respecto a cada empresa
- **Buscador:** Filtrado de entidades por nombre y etiquetas (tags).
- **Mantenimientos:** Herramientas para la gestión de catálogos (Estados, Departamentos, Intereses).
- **Peticiones:** Canal para reportar errores o sugerencias de mejora.

#### Requisitos No Funcionales:
- **Trazabilidad (Logs):** Logs para poder ver acciones realizadas anteriormente y por quien 
- **Seguridad:** Implementación de roles (Admin/Gestor) y 
- **Usabilidad:** Interfaz limpia, responsiva y con ordenación cronológica descendente.

---

### 2. Alcance de la Versión Actual (Entregable)

En esta primera versión del producto, se han implementado con éxito las siguientes funcionalidades:

- **Autenticación Completa:** Sistema de login basado en JWT con funcionalidad de "Recordar Usuario".
- **Dashboard de Actividad:** Panel de bienvenida que lee en tiempo real de la tabla de logs, permitiendo navegar directamente a la empresa o mensaje correspondiente.
- **Directorio de Contactos:** Gestión completa de personas con las que se ha interactuado dentro de la ficha de empresa.
- **Buscador Integrado:** Motor de búsqueda por nombre de empresa y etiquetas.
- **Panel de Mantenimiento:** Interfaz administrativa para gestionar Departamentos, Estados e Intereses sin necesidad de tener que modificar el código .
---

### 3. Qué queda por hacer (Próximas Fases)

Debido a la priorización de los módulos críticos de gestión de datos, se han identificado los siguientes puntos para su desarrollo en el próximo curso:


- **Refactorización de Pestañas Específicas:** Separación de la pestaña "Mensajes" y "Alumnos" (actualmente conviven bajo el mismo sistema diferenciadas por el campo 'tipo').

Separar las ventanas de mensajes y alumnos 

-SIstema automatizado para recuperar credenciales de inicio de sesión
- 
**Paginación Avanzada:** Extender el sistema de "Cargar más" a una paginación numérica en caso de que haya muchos datos a cargar.

---


### 4. Tiempo y Coste

- **Tiempo de Desarrollo:** El proyecto se ha desarrollado a lo largo de dos meses y medio, y aunque el desarrollo ha sido constante, la intensidad no ha sido igual todas las semanas de bido a tener que compaginar el desarrollo de este proyecto con las FCT 

**Coste del Proyecto:** Dado el contexto académico de la asignatura, **la variable COSTE no se ha tenido en cuenta**. No se han imputado gastos de consultoría, horas de desarrollo profesional ni costes de infraestructura de servidor, tratándose de un entorno de aprendizaje y desarrollo de software sin fines comerciales. 

**Coste del Proyecto:**  Debido a que el proyecto se ha hecho en un contexto educativo, no ha habido un coste monetario real, pero asumiendo un flujo de trabajo de 2 horas a la semana por cada integrante del grupo, durante  2 meses y medio, eso hace un total de 60h de trabajo, que teniendo en cuenta que un desarrollador junio  cobra entre 15 a 20€la hora (aproximadamente y dependiendo de la tecnología utilizada), hace que el coste total sea de entre 900 y 1200€ aproximadamente
