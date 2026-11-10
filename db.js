import { kv } from '@vercel/kv';

export class LicenciaDB {
  static async init() {
    // Inicializar si no existe
    const exists = await kv.has('licencias');
    if (!exists) {
      await kv.set('licencias', []);
    }
  }

  static async buscar(codigo) {
    const licencias = await this.getAll();
    return licencias.find(l => l.codigo === codigo) || null;
  }

  static async crear(codigo, usado = false) {
    await this.init();
    const licencias = await this.getAll();
    const nueva = { codigo, usado, fecha: new Date().toISOString() };
    licencias.push(nueva);
    await kv.set('licencias', licencias);
    return nueva;
  }

  static async marcarUsado(codigo) {
    await this.init();
    const licencias = await this.getAll();
    const licencia = licencias.find(l => l.codigo === codigo);
    if (licencia) {
      licencia.usado = true;
      await kv.set('licencias', licencias);
      return true;
    }
    return false;
  }

  static async getAll() {
    const data = await kv.get('licencias');
    return data || [];
  }

  static async listarTodas() {
    return this.getAll();
  }

  static async borrar(codigo) {
    await this.init();
    const licencias = await this.getAll();
    const filtradas = licencias.filter(l => l.codigo !== codigo);
    await kv.set('licencias', filtradas);
    return true;
  }
}