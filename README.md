# LibrosAPI – Entrega Final (MySQL + Node + Interfaz Web)

**Materia:** Sistemas de Gestión de Datos  
**Tema:** Implementación de una base de datos sobre Libros Personales y Economía Circular  
**Alumnos:** Sara Castrillon Sanchez, Sebastian Arango, Juan Duque

---

## 1) Requisitos técnicos
- **MySQL** (servidor local)
- **Node.js LTS** (con npm)
- **Postman** (para pruebas)
- **Navegador**

## 2) Variables de entorno
Copiar `.env.example` a `.env` y ajustar credenciales:
```
PORT=3000
DB_HOST=localhost
DB_USER=libros_user
DB_PASS=libros_pass
DB_NAME=librosdb
JWT_SECRET=supersecreto
```

## 3) Base de datos
1. Abrir MySQL Workbench.
2. Ejecutar `sql/schema.sql` (crea BD y tablas exactas del diseño físico).
3. Ejecutar `sql/seed.sql` (carga datos de prueba).
4. (Opcional) Crear usuario:
```sql
CREATE USER IF NOT EXISTS 'libros_user'@'%' IDENTIFIED BY 'libros_pass';
GRANT ALL PRIVILEGES ON librosdb.* TO 'libros_user'@'%';
FLUSH PRIVILEGES;
```

## 4) Instalar y ejecutar
```bash
npm install
npm run dev   # API en http://localhost:3000
```
Interfaz web:
- Catálogo: `http://localhost:3000/index.html`
- Login: `http://localhost:3000/login.html`
- Panel: `http://localhost:3000/dashboard.html`

## 5) Descripción funcional (resumen)
- **Autenticación:** login por correo + PIN (últimos 4 dígitos del teléfono).  
- **CRUD Libros:** crear, editar, borrar y listar *mis libros*.
- **Catálogo público:** paginado y ordenado por título, búsqueda por nombre/autor.
- **Modalidades:** 
  - *Solo visible* (publicación con `precio=NULL`)
  - *Venta* (precio > 0)
  - *Intercambio* (se gestiona por solicitudes de intercambio)
- **Reseñas:** crear, buscar y listar con promedio.
- **Clubes:** crear, unirse y listar con miembros.
- **Intercambio:** solicitar, listar pendientes del dueño y aceptar (usa **transacciones**).
- **Venta/Compra:** iniciar compra y consultar órdenes (usa **transacciones**).
- **Reportes:** ver `src/routes/reportes.routes.js` (incluye todos los pedidos).

## 6) Postman
Importar `postman_collection.json`.  
Secuencia sugerida de pruebas:
1. `POST /api/auth/login` (usa un correo del seed y su PIN) → guarda token en variable `{{token}}`.
2. CRUD `libros`.
3. Publicar en `catalogo`.
4. Crear reseñas, clubes, solicitudes de intercambio, ventas.
5. Consultar endpoints de `reportes`.

## 7) Notas de credibilidad
- Código claro y comentado.
- Interfaz **Bootstrap sencilla** (estudiante creíble) pero funcional.
- README con pasos concretos.
