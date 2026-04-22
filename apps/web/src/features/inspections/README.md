# Safety Inspections Module (Scaffold Tagging)

Ovaj modul upravlja bezbednosnim inspekcijama skela. Svaka skela mora biti redovno pregledana kako bi zadržala status "Safe to Use" (Zeleni Tag).

## 1. PocketBase Schema: `inspections` kolekcija

Za funkcionisanje ovog modula potrebna je nova kolekcija u PocketBase-u:

| Polje | Tip | Opis |
| :--- | :--- | :--- |
| `scaffold_id` | Relation | Veza sa `scaffold_requests` ili `scaffolds` |
| `inspector_id` | Relation (users) | Ko je izvršio pregled |
| `status` | Select (`pass`, `fail`) | `pass` = Zeleni Tag, `fail` = Crveni Tag |
| `checklist` | JSON | Lista provera (npr. base_plates, guard_rails, boards) |
| `notes` | Text | Dodatne primedbe ili razlozi odbijanja |
| `next_inspection_date` | Date | Rok do sledećeg obaveznog pregleda |

## 2. Biznis Pravila
- Skela dobija **Zeleni Tag** (`pass`) ako su sve kritične stavke provere ispravne.
- Ako inspekcija istekne (prođe `next_inspection_date`), status se automatski smatra "Invalid" dok se ne uradi novi pregled.
- Svaki `fail` status automatski šalje notifikaciju supervizoru.

## 3. Integracija
Ovaj modul koristi postojeće **Tailwind CSS** klase za dosledan UI i minimalno termičko opterećenje sistema.
