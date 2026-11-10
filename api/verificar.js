import { LicenciaDB } from '../db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { codigo } = req.query;
  if (!codigo) return res.status(400).json({ status: "error", message: "Falta el código" });

  const licencia = await LicenciaDB.buscar(codigo);

  if (!licencia) return res.status(404).json({ status: "error", message: "Código inválido" });
  if (licencia.usado) return res.status(403).json({ status: "error", message: "Este código ya está en uso" });

  await LicenciaDB.marcarUsado(codigo);
  return res.status(200).json({ status: "success", message: "Licencia activada" });
}