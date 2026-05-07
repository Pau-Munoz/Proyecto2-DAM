import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

app.use(cors());
app.use(express.json());
 
// Global Request Logger for Debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (Object.keys(req.query).length) console.log(`  Query:`, req.query);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.4.0-admin-strict', time: new Date().toISOString() });
});

// --- MIDDLEWARES ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado.' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  const role = req.user?.rol?.toLowerCase();
  if (!req.user || role !== 'admin') {
    console.warn(`[AUTH] Acceso denegado: Usuario ${req.user?.id} intentó acción administrativa con rol '${role}'`);
    return res.status(403).json({ error: 'Permiso denegado. Se requiere rol de Administrador.' });
  }
  next();
};

// --- AUTH ENDPOINTS ---
app.post('/api/auth/login', async (req, res) => {
  const { email, contrasena } = req.body;
  try {
    const gestor = await prisma.gestor.findUnique({ where: { email } });
    if (!gestor) return res.status(400).json({ error: 'Usuario no encontrado.' });

    const validPassword = await bcrypt.compare(contrasena, gestor.contrasena);
    if (!validPassword) return res.status(403).json({ error: 'Contraseña incorrecta.' });

    const token = jwt.sign({ id: gestor.id, email: gestor.email, rol: gestor.rol }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: gestor.id, nombre: gestor.nombre, email: gestor.email, rol: gestor.rol } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const gestor = await prisma.gestor.findUnique({
      where: { id: req.user.id },
      include: { departamento: true }
    });
    res.json(gestor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/debug', authenticateToken, (req, res) => {
  res.json({
    userInToken: req.user,
    currentTime: new Date().toISOString()
  });
});

// --- EMPRESAS (LEADS) ---
app.get('/api/empresas/interactuadas', authenticateToken, async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const q = req.query.q?.trim() || '';
  const interesesParam = req.query.intereses || '';
  const interesIds = interesesParam
    ? interesesParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
    : [];

  try {
    const where = {
      mensajes: {
        some: { gestor_id: req.user.id }
      }
    };

    if (q) {
      where.nombre = { contains: q };
    }

    if (interesIds.length > 0) {
      where.intereses = {
        some: { id: { in: interesIds } }
      };
    }

    const empresas = await prisma.empresa.findMany({
      where,
      include: {
        estado: true,
        intereses: true,
        mensajes: {
          include: { gestor: { select: { nombre: true, apellidos: true } } },
          orderBy: { fecha: 'desc' },
          take: 1
        }
      },
      take: limit
    });

    const sortedEmpresas = empresas
      .sort((a, b) => {
        const dateA = a.mensajes[0]?.fecha || 0;
        const dateB = b.mensajes[0]?.fecha || 0;
        return new Date(dateB) - new Date(dateA);
      })
      .map(emp => {
        const lastMsg = emp.mensajes[0] || null;
        return {
          ...emp,
          ultimo_mensaje: lastMsg ? {
            contenido: lastMsg.mensaje,
            fecha: lastMsg.fecha,
            autor: `${lastMsg.gestor.nombre} ${lastMsg.gestor.apellidos}`
          } : null
        };
      });

    res.json(sortedEmpresas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/empresas', authenticateToken, async (req, res) => {
  const { estado_id, departamento_id, q, intereses } = req.query;
  console.log(`[FILTER] Request received - Estado: ${estado_id}, Dept: ${departamento_id}, q: ${q}, intereses: ${intereses}`);

  try {
    const where = {};
    const filters = [];

    if (estado_id && estado_id !== 'undefined' && estado_id !== '') {
      const eId = parseInt(estado_id);
      if (!isNaN(eId)) filters.push({ estado_id: eId });
    }

    if (departamento_id && departamento_id !== 'undefined' && departamento_id !== '') {
      const dId = parseInt(departamento_id);
      if (!isNaN(dId)) {
        filters.push({
          creador: {
            id_departamento: dId
          }
        });
      }
    }

    if (q && q.trim() !== '') {
      filters.push({ nombre: { contains: q.trim() } });
    }

    if (intereses && intereses !== '') {
      const interesIds = intereses.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      if (interesIds.length > 0) {
        filters.push({ intereses: { some: { id: { in: interesIds } } } });
      }
    }

    if (filters.length > 0) {
      where.AND = filters;
    }

    console.log('[FILTER] WHERE clause:', JSON.stringify(where, null, 2));

    const empresas = await prisma.empresa.findMany({
      where,
      include: { 
        estado: { select: { id: true, nombre: true } }, 
        creador: { 
          select: { 
            id: true, 
            nombre: true, 
            apellidos: true, 
            id_departamento: true,
            departamento: { select: { nombre: true } }
          } 
        }, 
        intereses: true,
        mensajes: { 
          include: { gestor: { select: { nombre: true, apellidos: true } } }, 
          orderBy: { fecha: 'desc' }, 
          take: 1 
        }
      }
    });

    console.log(`[FILTER] Matches found: ${empresas.length}`);

    const formatted = empresas
      .map(emp => {
        const lastMsg = emp.mensajes[0] || null;
        return {
          ...emp,
          ultimo_mensaje: lastMsg ? {
            contenido: lastMsg.mensaje,
            fecha: lastMsg.fecha,
            autor: `${lastMsg.gestor.nombre} ${lastMsg.gestor.apellidos}`
          } : null
        };
      })
      .sort((a, b) => {
        const dateA = a.ultimo_mensaje?.fecha ? new Date(a.ultimo_mensaje.fecha) : new Date(0);
        const dateB = b.ultimo_mensaje?.fecha ? new Date(b.ultimo_mensaje.fecha) : new Date(0);
        return dateB - dateA;
      });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/empresas/:id', authenticateToken, async (req, res) => {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
        estado: true, 
        creador: true, 
        contactos: {
          include: { intereses: true }
        }, 
        mensajes: { include: { gestor: true } }, 
        intereses: true 
      }
    });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    // Mapear contactos para compatibilidad con el frontend (nombre_completo)
    const formatted = {
      ...empresa,
      contactos: empresa.contactos.map(c => ({
        ...c,
        nombre_completo: `${c.nombre} ${c.apellidos || ''}`.trim()
      }))
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/empresas', authenticateToken, async (req, res) => {
  const { nombre, estado_id, direccion, telefono, email, web, convenio, fecha_convenio, intereses } = req.body;
  try {
    const empresa = await prisma.empresa.create({
      data: {
        nombre,
        estado_id: parseInt(estado_id),
        direccion,
        telefono,
        email,
        web,
        convenio: !!convenio,
        fecha_convenio: fecha_convenio ? new Date(fecha_convenio) : null,
        creado_por: req.user.id,
        intereses: {
          connectOrCreate: intereses?.map(name => ({ where: { nombre: name }, create: { nombre: name } }))
        }
      }
    });
    
    await prisma.log.create({
      data: { 
        gestor_id: req.user.id, 
        empresa_id: empresa.id, 
        descripcion: `Nueva empresa registrada: ${nombre}` 
      }
    });

    res.json(empresa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/empresas/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, estado_id, direccion, telefono, email, web, convenio, fecha_convenio } = req.body;
  try {
    const empresa = await prisma.empresa.findUnique({ where: { id: parseInt(id) } });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    const userRole = req.user.rol?.toLowerCase();
    const isOwner = empresa.creado_por === req.user.id;
    const isActuallyAdmin = userRole === 'admin';

    if (!isActuallyAdmin && !isOwner) {
      console.warn(`[AUTH] Bloqueo EDITAR: User ${req.user.id} (rol: ${userRole}) NO ES admin ni dueño de empresa ${id}`);
      return res.status(403).json({ error: 'No tienes permisos para editar esta empresa' });
    }

    const updated = await prisma.empresa.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        estado_id: parseInt(estado_id),
        direccion,
        telefono,
        email,
        web,
        convenio: !!convenio,
        fecha_convenio: fecha_convenio ? new Date(fecha_convenio) : null
      }
    });

    await prisma.log.create({
      data: { 
        gestor_id: req.user.id, 
        empresa_id: updated.id, 
        descripcion: `Datos de empresa actualizados: ${nombre}` 
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/empresas/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const targetId = parseInt(id);

  if (isNaN(targetId)) {
    return res.status(400).json({ error: 'ID de empresa inválido. Debe ser un número.' });
  }

  try {
    const empresa = await prisma.empresa.findUnique({ where: { id: targetId } });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    const userRole = req.user.rol?.toLowerCase();
    const isActuallyAdmin = userRole === 'admin';

    if (!isActuallyAdmin) {
      console.warn(`[AUTH] Bloqueo ELIMINAR EMPRESA: User ${req.user.id} (rol: ${userRole}) NO ES admin.`);
      return res.status(403).json({ error: 'Solo los administradores pueden eliminar empresas' });
    }

    // --- CASCADE DELETE MANUAL ---
    // 1. Eliminar contactos
    await prisma.contacto.deleteMany({ where: { empresa_id: targetId } });
    
    // 2. Eliminar mensajes (interacciones)
    await prisma.mensaje.deleteMany({ where: { empresa_id: targetId } });
    
    // 3. Desvincular logs (para no borrarlos pero permitir borrar la empresa)
    await prisma.log.updateMany({
      where: { empresa_id: targetId },
      data: { empresa_id: null }
    });

    // 4. Finalmente, borrar la empresa
    await prisma.empresa.delete({ where: { id: targetId } });

    await prisma.log.create({
      data: { 
        gestor_id: req.user.id, 
        descripcion: `Empresa eliminada permanentemente: ${empresa.nombre} (ID: ${targetId})` 
      }
    });

    res.json({ message: 'Empresa y sus datos vinculados eliminados correctamente' });
  } catch (error) {
    console.error(`[DELETE ERROR] Empresa ${id}:`, error);
    res.status(500).json({ error: `No se pudo eliminar la empresa: ${error.message}` });
  }
});

app.post('/api/empresas/:id/intereses', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { intereses_ids } = req.body;

  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    const userRole = req.user.rol?.toLowerCase();
    const isOwner = empresa.creado_por === req.user.id;
    const isActuallyAdmin = userRole === 'admin';

    if (!isActuallyAdmin && !isOwner) {
      return res.status(403).json({ error: 'No tienes permisos para editar las etiquetas de esta empresa' });
    }

    const updatedEmpresa = await prisma.empresa.update({
      where: { id: parseInt(id) },
      data: {
        intereses: {
          set: intereses_ids.map(intId => ({ id: parseInt(intId) }))
        }
      },
      include: { intereses: true }
    });

    await prisma.log.create({
      data: { 
        gestor_id: req.user.id, 
        empresa_id: updatedEmpresa.id, 
        descripcion: `Etiquetas actualizadas para la empresa ${updatedEmpresa.nombre}: ${updatedEmpresa.intereses.map(i => i.nombre).join(', ')}` 
      }
    });

    res.json(updatedEmpresa.intereses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CONTACTOS ---
app.get('/api/contactos', authenticateToken, async (req, res) => {
  const { empresa_id } = req.query;
  try {
    const where = {};
    if (empresa_id) where.empresa_id = parseInt(empresa_id);

    const contactos = await prisma.contacto.findMany({ 
      where,
      include: { intereses: true },
      orderBy: { created_at: 'desc' }
    });

    // Mapear para compatibilidad
    const formatted = contactos.map(c => ({
      ...c,
      nombre_completo: `${c.nombre} ${c.apellidos || ''}`.trim()
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contactos', authenticateToken, async (req, res) => {
  let { empresa_id, nombre, apellidos, nombre_completo, cargo, email, telefono, intereses_ids } = req.body;
  
  if (!empresa_id) return res.status(400).json({ error: 'empresa_id es obligatorio' });
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  // Validación de email básico si existe
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'El formato del email no es válido' });
  }

  try {
    const currentUserFull = await prisma.gestor.findUnique({ where: { id: req.user.id } });
    const targetEmpresa = await prisma.empresa.findUnique({
      where: { id: parseInt(empresa_id) },
      include: { creador: true }
    });

    if (!targetEmpresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    const isAdminUser = currentUserFull.rol?.toLowerCase() === 'admin';
    const isSameDept = currentUserFull.id_departamento === targetEmpresa.creador.id_departamento;

    if (!isAdminUser && !isSameDept) {
      return res.status(403).json({ error: 'No tienes permisos para añadir contactos a esta empresa' });
    }

    const data = {
      empresa_id: parseInt(empresa_id),
      nombre,
      apellidos,
      cargo,
      email,
      telefono,
      creado_por: req.user.id
    };

    if (intereses_ids && Array.isArray(intereses_ids)) {
      data.intereses = {
        connect: intereses_ids.map(id => ({ id: parseInt(id) }))
      };
    }

    const contacto = await prisma.contacto.create({
      data,
      include: { intereses: true }
    });

    const fullName = `${nombre} ${apellidos || ''}`.trim();
    const interesesTexto = contacto.intereses.map(i => i.nombre).join(', ') || 'sin intereses';

    await prisma.log.create({
      data: { 
        gestor_id: req.user.id, 
        empresa_id: parseInt(empresa_id), 
        descripcion: `Contacto añadido: ${fullName} (${cargo}). Intereses: ${interesesTexto}` 
      }
    });

    res.json({
      ...contacto,
      nombre_completo: fullName
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/contactos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  let { nombre, apellidos, nombre_completo, cargo, email, telefono, intereses_ids } = req.body;

  // Compatibilidad
  if (!nombre && nombre_completo) {
    const parts = nombre_completo.trim().split(' ');
    nombre = parts[0];
    apellidos = parts.slice(1).join(' ') || null;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'El formato del email no es válido' });
  }

  try {
    const existingContact = await prisma.contacto.findUnique({ where: { id: parseInt(id) } });
    if (!existingContact) return res.status(404).json({ error: 'Contacto no encontrado' });

    const userRole = req.user.rol?.toLowerCase();
    const isOwner = existingContact.creado_por === req.user.id;
    const isActuallyAdmin = userRole === 'admin';

    if (!isActuallyAdmin && !isOwner) {
      return res.status(403).json({ error: 'No tienes permisos para editar este contacto' });
    }

    const data = { nombre, apellidos, cargo, email, telefono };
    if (intereses_ids && Array.isArray(intereses_ids)) {
      data.intereses = {
        set: intereses_ids.map(id => ({ id: parseInt(id) }))
      };
    }

    const contacto = await prisma.contacto.update({
      where: { id: parseInt(id) },
      data,
      include: { intereses: true }
    });

    const fullName = `${contacto.nombre} ${contacto.apellidos || ''}`.trim();
    const interesesTexto = contacto.intereses.map(i => i.nombre).join(', ') || 'sin intereses';

    await prisma.log.create({
      data: { 
        gestor_id: req.user.id, 
        empresa_id: contacto.empresa_id, 
        descripcion: `Contacto actualizado: ${fullName} (${cargo}). Intereses: ${interesesTexto}` 
      }
    });

    res.json({
      ...contacto,
      nombre_completo: fullName
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/intereses', authenticateToken, async (req, res) => {
  try {
    const intereses = await prisma.interes.findMany({ orderBy: { nombre: 'asc' } });
    res.json(intereses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/intereses', authenticateToken, async (req, res) => {
  const { nombre } = req.body;
  if (!nombre || nombre.trim() === '') return res.status(400).json({ error: 'El nombre es obligatorio' });
  
  try {
    const interes = await prisma.interes.upsert({
      where: { nombre: nombre.trim() },
      update: {},
      create: { nombre: nombre.trim() }
    });
    res.json(interes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/intereses/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const interes = await prisma.interes.update({ where: { id: parseInt(id) }, data: { nombre: nombre.trim() } });
    await prisma.log.create({ data: { gestor_id: req.user.id, descripcion: `Etiqueta actualizada: ${nombre.trim()}` } });
    res.json(interes);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Ya existe una etiqueta con ese nombre' });
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/intereses/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const interes = await prisma.interes.findUnique({ where: { id: parseInt(id) } });
    if (!interes) return res.status(404).json({ error: 'Etiqueta no encontrada' });
    await prisma.interes.delete({ where: { id: parseInt(id) } });
    await prisma.log.create({ data: { gestor_id: req.user.id, descripcion: `Etiqueta eliminada: ${interes.nombre}` } });
    res.json({ message: 'Etiqueta eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contactos/:id/intereses', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const contacto = await prisma.contacto.findUnique({
      where: { id: parseInt(id) },
      include: { intereses: true }
    });
    if (!contacto) return res.status(404).json({ error: 'Contacto no encontrado' });
    res.json(contacto.intereses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contactos/:id/intereses', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { intereses_ids } = req.body; // Array de IDs [1, 2, 3]

  try {
    const contacto = await prisma.contacto.update({
      where: { id: parseInt(id) },
      data: {
        intereses: {
          set: intereses_ids.map(intId => ({ id: parseInt(intId) }))
        }
      },
      include: { intereses: true }
    });

    await prisma.log.create({
      data: { 
        gestor_id: req.user.id, 
        empresa_id: contacto.empresa_id, 
        descripcion: `Intereses actualizados para contacto ${contacto.nombre}: ${contacto.intereses.map(i => i.nombre).join(', ')}` 
      }
    });

    res.json(contacto.intereses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contactos/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const contacto = await prisma.contacto.findUnique({ where: { id: parseInt(id) } });
    if (!contacto) return res.status(404).json({ error: 'Contacto no encontrado' });

    await prisma.contacto.delete({ where: { id: parseInt(id) } });
    
    const fullName = `${contacto.nombre} ${contacto.apellidos || ''}`.trim();
    await prisma.log.create({
      data: { 
        gestor_id: req.user.id, 
        empresa_id: contacto.empresa_id, 
        descripcion: `Contacto eliminado: ${fullName}` 
      }
    });

    res.json({ message: 'Contacto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- MENSAJES (INTERACCIONES) ---
app.post('/api/mensajes', authenticateToken, async (req, res) => {
  const { empresa_id, tipo, mensaje, fijado } = req.body;
  try {
    const msg = await prisma.mensaje.create({
      data: {
        empresa_id: parseInt(empresa_id),
        gestor_id: req.user.id,
        tipo: tipo || 'normal',
        mensaje,
        fijado: !!fijado
      }
    });

    await prisma.log.create({
      data: { 
        gestor_id: req.user.id, 
        empresa_id: parseInt(empresa_id), 
        mensaje_id: msg.id,
        descripcion: `Nueva interacción registrada (Tipo: ${tipo || 'normal'})` 
      }
    });

    res.json(msg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- LOGS ---
app.get('/api/logs/me', authenticateToken, async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const logs = await prisma.log.findMany({
      where: { gestor_id: req.user.id },
      include: {
        empresa: { select: { id: true, nombre: true } },
        mensaje: { select: { id: true } }
      },
      orderBy: { fecha: 'desc' },
      take: limit
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/logs', authenticateToken, isAdmin, async (req, res) => {
  try {
    const logs = await prisma.log.findMany({ 
      include: { 
        gestor: { select: { nombre: true, apellidos: true } }, 
        empresa: { select: { nombre: true } } 
      },
      orderBy: { fecha: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CATALOGOS ---
app.get('/api/departamentos', authenticateToken, async (req, res) => {
  const deps = await prisma.departamento.findMany({ orderBy: { nombre: 'asc' } });
  res.json(deps);
});

app.post('/api/departamentos', authenticateToken, isAdmin, async (req, res) => {
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const dep = await prisma.departamento.create({ data: { nombre: nombre.trim() } });
    await prisma.log.create({ data: { gestor_id: req.user.id, descripcion: `Departamento creado: ${nombre.trim()}` } });
    res.json(dep);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Ya existe un departamento con ese nombre' });
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/departamentos/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const dep = await prisma.departamento.update({ where: { id: parseInt(id) }, data: { nombre: nombre.trim() } });
    await prisma.log.create({ data: { gestor_id: req.user.id, descripcion: `Departamento actualizado: ${nombre.trim()}` } });
    res.json(dep);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/departamentos/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const dep = await prisma.departamento.findUnique({ where: { id: parseInt(id) } });
    if (!dep) return res.status(404).json({ error: 'Departamento no encontrado' });
    await prisma.departamento.delete({ where: { id: parseInt(id) } });
    await prisma.log.create({ data: { gestor_id: req.user.id, descripcion: `Departamento eliminado: ${dep.nombre}` } });
    res.json({ message: 'Departamento eliminado' });
  } catch (error) {
    if (error.code === 'P2003') return res.status(400).json({ error: 'No se puede eliminar: hay gestores o empresas vinculadas a este departamento' });
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/estados', authenticateToken, async (req, res) => {
  const estados = await prisma.estado.findMany({ orderBy: { nombre: 'asc' } });
  res.json(estados);
});

app.post('/api/estados', authenticateToken, isAdmin, async (req, res) => {
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const estado = await prisma.estado.create({ data: { nombre: nombre.trim() } });
    await prisma.log.create({ data: { gestor_id: req.user.id, descripcion: `Estado creado: ${nombre.trim()}` } });
    res.json(estado);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Ya existe un estado con ese nombre' });
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/estados/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const estado = await prisma.estado.update({ where: { id: parseInt(id) }, data: { nombre: nombre.trim() } });
    await prisma.log.create({ data: { gestor_id: req.user.id, descripcion: `Estado actualizado: ${nombre.trim()}` } });
    res.json(estado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/estados/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const estado = await prisma.estado.findUnique({ where: { id: parseInt(id) } });
    if (!estado) return res.status(404).json({ error: 'Estado no encontrado' });
    await prisma.estado.delete({ where: { id: parseInt(id) } });
    await prisma.log.create({ data: { gestor_id: req.user.id, descripcion: `Estado eliminado: ${estado.nombre}` } });
    res.json({ message: 'Estado eliminado' });
  } catch (error) {
    if (error.code === 'P2003') return res.status(400).json({ error: 'No se puede eliminar: hay empresas con este estado' });
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gestores', authenticateToken, isAdmin, async (req, res) => {
  const { nombre, apellidos, email, contrasena, telefono, id_departamento, rol } = req.body;
  if (!nombre || !apellidos || !email || !contrasena || !id_departamento) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const gestor = await prisma.gestor.create({
      data: {
        nombre,
        apellidos,
        email,
        contrasena: hashedPassword,
        telefono: telefono || '',
        id_departamento: parseInt(id_departamento),
        rol: rol || 'gestor'
      },
      include: { departamento: true }
    });
    
    await prisma.log.create({
      data: {
        gestor_id: req.user.id,
        descripcion: `Nuevo gestor creado: ${nombre} ${apellidos}`
      }
    });

    res.json(gestor);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'El email ya está registrado' });
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/gestores/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, apellidos, email, contrasena, telefono, id_departamento, rol } = req.body;
  try {
    const data = {
      nombre,
      apellidos,
      email,
      telefono,
      id_departamento: parseInt(id_departamento),
      rol
    };
    if (contrasena && contrasena.trim() !== '') {
      data.contrasena = await bcrypt.hash(contrasena, 10);
    }

    const gestor = await prisma.gestor.update({
      where: { id: parseInt(id) },
      data,
      include: { departamento: true }
    });

    await prisma.log.create({
      data: {
        gestor_id: req.user.id,
        descripcion: `Gestor actualizado: ${nombre} ${apellidos}`
      }
    });

    res.json(gestor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gestores', authenticateToken, async (req, res) => {
  const gestores = await prisma.gestor.findMany({ 
    include: { departamento: true },
    orderBy: { nombre: 'asc' }
  });
  res.json(gestores);
});

app.delete('/api/gestores/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const targetId = parseInt(id);

  if (targetId === req.user.id) {
    return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  }

  try {
    const gestor = await prisma.gestor.findUnique({ where: { id: targetId } });
    if (!gestor) return res.status(404).json({ error: 'Gestor no encontrado' });

    await prisma.gestor.delete({ where: { id: targetId } });

    await prisma.log.create({
      data: {
        gestor_id: req.user.id,
        descripcion: `Gestor eliminado permanentemente: ${gestor.nombre} ${gestor.apellidos} (${gestor.email})`
      }
    });

    res.json({ message: 'Gestor eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar gestor. Puede estar vinculado a registros activos.' });
  }
});

// --- PETICIONES (FEEDBACK) ---
app.get('/api/peticiones', authenticateToken, async (req, res) => {
  try {
    const peticiones = await prisma.peticion.findMany({
      include: { gestor: { select: { id: true, nombre: true, apellidos: true } } },
      orderBy: { fecha: 'desc' }
    });
    res.json(peticiones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/peticiones', authenticateToken, async (req, res) => {
  const { titulo, descripcion } = req.body;
  if (!titulo || !descripcion) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const peticion = await prisma.peticion.create({
      data: {
        titulo,
        descripcion,
        gestor_id: req.user.id
      },
      include: { gestor: { select: { id: true, nombre: true, apellidos: true } } }
    });
    
    await prisma.log.create({
      data: { gestor_id: req.user.id, descripcion: `Nueva petición registrada: ${titulo}` }
    });

    res.json(peticion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/peticiones/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, estado } = req.body;

  try {
    const existing = await prisma.peticion.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Petición no encontrada' });

    const isOwner = existing.gestor_id === req.user.id;
    const isAdminUser = req.user.rol?.toLowerCase() === 'admin';

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }

    const data = {};
    if (titulo !== undefined) data.titulo = titulo;
    if (descripcion !== undefined) data.descripcion = descripcion;
    if (estado !== undefined && isAdminUser) data.estado = estado; // Solo admin puede cambiar estado

    const peticion = await prisma.peticion.update({
      where: { id: parseInt(id) },
      data,
      include: { gestor: { select: { id: true, nombre: true, apellidos: true } } }
    });

    res.json(peticion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/peticiones/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.peticion.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Petición no encontrada' });

    const isOwner = existing.gestor_id === req.user.id;
    const isAdminUser = req.user.rol?.toLowerCase() === 'admin';

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }

    await prisma.peticion.delete({ where: { id: parseInt(id) } });
    
    await prisma.log.create({
      data: { gestor_id: req.user.id, descripcion: `Petición borrada: ${existing.titulo}` }
    });

    res.json({ message: 'Petición borrada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
