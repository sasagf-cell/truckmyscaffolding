/**
 * @typedef {import('../../types').ScaffoldInspection} ScaffoldInspection
 */

import pb from '../../../../lib/pocketbaseClient';

/**
 * Servis za upravljanje inspekcijama skela.
 * Primenjuje robusnu validaciju i error handling.
 */
export const inspectionService = {
  /**
   * Dobavlja sve inspekcije za specifičnu skelu.
   * @param {string} scaffoldId 
   * @returns {Promise<ScaffoldInspection[]>}
   */
  async getByScaffoldId(scaffoldId) {
    if (!scaffoldId) throw new Error('scaffoldId je obavezan.');

    try {
      return await pb.collection('inspections').getFullList({
        filter: `scaffold_id = "${scaffoldId}"`,
        sort: '-created',
      });
    } catch (error) {
      console.error('[inspectionService] Greška pri dobavljanju inspekcija:', error);
      throw new Error('Nije moguće učitati istoriju inspekcija. Proverite mrežnu konekciju.');
    }
  },

  /**
   * Dobavlja poslednju (aktivnu) inspekciju.
   * @param {string} scaffoldId 
   * @returns {Promise<ScaffoldInspection | null>}
   */
  async getLatest(scaffoldId) {
    try {
      const records = await pb.collection('inspections').getList(1, 1, {
        filter: `scaffold_id = "${scaffoldId}"`,
        sort: '-created',
      });
      return records.items[0] || null;
    } catch (error) {
      console.error('[inspectionService] Greška pri dobavljanju poslednje inspekcije:', error);
      return null; // Vraćamo null kako ne bismo prekinuli UI, ali logujemo grešku
    }
  },

  /**
   * Kreira novi zapis o inspekciji.
   * @param {Partial<ScaffoldInspection>} data 
   * @returns {Promise<ScaffoldInspection>}
   */
  async create(data) {
    // Osnovna validacija pre slanja na server
    if (!data.scaffold_id || !data.status) {
      throw new Error('Nedostaju obavezni podaci (scaffold_id ili status).');
    }

    try {
      return await pb.collection('inspections').create({
        ...data,
        inspector_id: pb.authStore.model?.id, // Automatsko dodeljivanje trenutnog korisnika
      });
    } catch (error) {
      console.error('[inspectionService] Greška pri kreiranju inspekcije:', error);
      // Detaljnija poruka ako PocketBase vrati specifičan error
      const message = error.data?.message || 'Došlo je do greške pri čuvanju inspekcije.';
      throw new Error(message);
    }
  }
};
