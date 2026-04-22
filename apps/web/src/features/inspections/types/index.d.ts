/**
 * @typedef {Object} InspectionChecklist
 * @property {boolean} base_plates - Da li su baze stabilne
 * @property {boolean} uprights - Da li su stubovi vertikalni
 * @property {boolean} guard_rails - Da li su ograde na mestu
 * @property {boolean} toe_boards - Da li su daske (toe boards) osigurane
 * @property {boolean} platform_boards - Stanje radnih platformi
 */

/**
 * @typedef {Object} ScaffoldInspection
 * @property {string} id - Unique ID (PocketBase)
 * @property {string} scaffold_id - ID skele na koju se odnosi
 * @property {string} inspector_id - ID korisnika koji je uradio audit
 * @property {'pass' | 'fail'} status - Status inspekcije
 * @property {InspectionChecklist} checklist - Detaljna lista provere
 * @property {string} notes - Dodatne napomene
 * @property {string} created - Datum kreiranja (ISO string)
 * @property {string} next_inspection_date - Datum sledeće inspekcije (ISO string)
 */

export {};
