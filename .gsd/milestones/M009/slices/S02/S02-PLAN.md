# S02: S02

**Goal:** Ajouter un selecteur ObjectType dans CreateCollectionDialog et EditCollectionPage. La collection stocke son type.
**Demo:** Après S02 : quand on crée ou modifie une collection, un sélecteur de type est visible

## Must-Haves

- CreateCollectionDialog : select avec 7 options + icônes
- EditCollectionPage : select modifiable
- Collection.update accepte type
- UI affiche le type dans la card collection

## Proof Level

- This slice proves: Vérification manuelle + screenshot

## Integration Closure

S03 utilise collection.type pour adapter le formulaire objet

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Type selector ajouté dans create/edit collection**
