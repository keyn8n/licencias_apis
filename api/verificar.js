import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let clientPromise;

if (!uri) {
  throw new Error('MONGODB_URI no está definida en las variables de entorno de Vercel');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { codigo } = req.query;

  if (!codigo) return res.status(400).json({ status: "error", message: "Falta el código" });

  try {
    const client = await clientPromise;
    const db = client.db('licencias_db');
    const coleccion = db.collection('licencias');

    const licencia = await coleccion.findOne({ codigo: codigo.trim() });

    if (!licencia) {
      return res.status(404).json({ status: "error", message: "Código no existe" });
    }

    if (licencia.usado === true) {
      return res.status(403).json({ status: "error", message: "Este código ya fue usado" });
    }

    await coleccion.updateOne(
      { codigo: codigo.trim() },
      { $set: { usado: true } }
    );

    return res.status(200).json({ status: "success", message: "Licencia activada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error de base de datos', detalle: error.message });
  }
}