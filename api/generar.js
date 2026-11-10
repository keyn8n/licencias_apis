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

  const { pass } = req.query;

  if (pass !== 'MiClaveSecretaParaCrearLicencias123') {
    return res.status(401).json({ error: 'No autorizado. Contraseña incorrecta.' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('licencias_db');
    const coleccion = db.collection('licencias');

    const codigoAleatorio = 'PRO-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    await coleccion.insertOne({
      codigo: codigoAleatorio,
      usado: false,
      fecha: new Date()
    });

    return res.status(200).json({
      status: 'success',
      mensaje: 'Licencia creada con éxito',
      codigo: codigoAleatorio
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error de base de datos', detalle: error.message });
  }
}