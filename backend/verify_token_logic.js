import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const gestor = { id: 1, email: 'admin@gestorleads.com', rol: 'admin' };
const token = jwt.sign({ id: gestor.id, email: gestor.email, rol: gestor.rol }, JWT_SECRET, { expiresIn: '8h' });

console.log('Token:', token);

jwt.verify(token, JWT_SECRET, (err, decoded) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Decoded Payload:', JSON.stringify(decoded, null, 2));
    console.log('isAdmin Check (payload.rol === "admin"):', decoded.rol === 'admin');
  }
});
