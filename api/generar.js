import { LicenciaDB } from '../db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { pass } = req.query;

  if (pass !== 'MiClaveSecretaParaCrearLicencias123')
    return res.status(401).json({ error: 'No autorizado. Contraseña incorrecta.' });

  const codigo = 'PRO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const licencia = await LicenciaDB.crear(codigo);

  return res.status(200).json({
    status: 'success',
    mensaje: 'Licencia creada con éxito',
    codigo: licencia.codigo
  });
}