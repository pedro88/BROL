/**
 * Tests E2E pour les objets - M001.
 * Couvre: création d'objets, validation, edge cases.
 *
 * @note FEATURE MANQUANTE: Déplacer un objet entre collections (API non implémentée).
 */

import { test, expect } from "@playwright/test";

// ============================================
// HELPERS
// ============================================

/**
 * Génère un nom unique pour les tests.
 */
function uniqueName(prefix: string = "Test"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * Crée une collection et retourne son ID.
 */
async function createCollection(page: any, name: string): Promise<string> {
  await page.goto("/collections");
  await page.getByRole("button", { name: /nouvelle/i }).click();
  await page.getByLabel(/nom/i).fill(name);
  await page.getByRole("button", { name: /créer/i }).click();
  await page.waitForSelector(`a[aria-label*="${name}"]`);
  const link = page.locator(`a[aria-label*="${name}"]`).first();
  const href = await link.getAttribute("href");
  return href?.split("/collections/")[1] || "";
}

// ============================================
// ADD OBJECT PAGE
// ============================================

test.describe("Add Object Page", () => {
  test("page loads with form", async ({ page }) => {
    await page.goto("/objects/add");

    await expect(page.getByRole("heading", { name: /ajouter un objet/i })).toBeVisible();
    await expect(page.getByLabel(/nom.*objet/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /ajouter/i })).toBeVisible();
  });

  test("back link navigates to collections", async ({ page }) => {
    await page.goto("/objects/add");

    await page.getByRole("link", { name: /retour/i }).click();
    await expect(page).toHaveURL(/\/collections/);
  });

  test("shows collection dropdown when no collectionId", async ({ page }) => {
    await page.goto("/objects/add");

    // Le select de collection devrait être visible
    await expect(page.locator("select")).toBeVisible();
  });

  test("responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/objects/add");

    await expect(page.getByRole("heading", { name: /ajouter un objet/i })).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
  });
});

// ============================================
// CREATE OBJECT
// ============================================

test.describe("Create Object", () => {
  test("creates object with minimal fields", async ({ page }) => {
    const collectionName = uniqueName("Collection");
    const objectName = uniqueName("Objet");

    const collectionId = await createCollection(page, collectionName);

    // Aller sur la page d'ajout d'objet
    await page.goto(`/objects/add?collectionId=${collectionId}`);
    await page.getByLabel(/nom.*objet/i).fill(objectName);
    await page.getByRole("button", { name: /ajouter/i }).click();

    // Devrait naviguer vers la collection
    await expect(page).toHaveURL(new RegExp(`/collections/${collectionId}`));

    // L'objet devrait apparaître dans la liste
    await expect(page.getByText(objectName)).toBeVisible();
  });

  test("creates object with all fields", async ({ page }) => {
    const collectionName = uniqueName("Collection");
    const objectName = uniqueName("Objet Complet");
    const author = "Auteur de test";
    const edition = "Édition 2024";

    const collectionId = await createCollection(page, collectionName);

    await page.goto(`/objects/add?collectionId=${collectionId}`);
    await page.getByLabel(/nom.*objet/i).fill(objectName);
    await page.getByLabel(/auteur/i).fill(author);
    await page.getByLabel(/édition/i).fill(edition);

    // Sélectionner une condition en cliquant sur le label
    await page.getByText("Comme neuf").click();

    await page.getByRole("button", { name: /ajouter/i }).click();

    await expect(page).toHaveURL(new RegExp(`/collections/${collectionId}`));
    await expect(page.getByText(objectName)).toBeVisible();
  });

  test("shows validation error for empty name", async ({ page }) => {
    const collectionName = uniqueName("Collection");

    const collectionId = await createCollection(page, collectionName);

    await page.goto(`/objects/add?collectionId=${collectionId}`);
    await page.getByLabel(/nom.*objet/i).fill("");
    await page.getByRole("button", { name: /ajouter/i }).click();

    // Le formulaire ne devrait pas être soumis
    await expect(page.getByRole("heading", { name: /ajouter un objet/i })).toBeVisible();
    await expect(page.getByText(/au moins|at least|required/i)).toBeVisible();
  });

  test("handles special characters", async ({ page }) => {
    const collectionName = uniqueName("Collection");
    const objectName = uniqueName("Special");

    const collectionId = await createCollection(page, collectionName);

    await page.goto(`/objects/add?collectionId=${collectionId}`);
    await page.getByLabel(/nom.*objet/i).fill(`${objectName} <Best> & « Special »`);
    await page.getByRole("button", { name: /ajouter/i }).click();

    await expect(page.getByText(objectName)).toBeVisible();
  });
});

// ============================================
// OBJECT CONDITION SELECTOR
// ============================================

test.describe("Object Condition", () => {
  test("displays all condition options", async ({ page }) => {
    const collectionName = uniqueName("Collection");

    const collectionId = await createCollection(page, collectionName);

    await page.goto(`/objects/add?collectionId=${collectionId}`);

    // Vérifier que toutes les conditions sont présentes
    await expect(page.getByText("Neuf").first()).toBeVisible();
    await expect(page.getByText("Comme neuf").first()).toBeVisible();
    await expect(page.getByText("Bon").first()).toBeVisible();
    await expect(page.getByText("Correct").first()).toBeVisible();
    await expect(page.getByText("Mauvais").first()).toBeVisible();
  });

  test("selects condition by clicking", async ({ page }) => {
    const collectionName = uniqueName("Collection");

    const collectionId = await createCollection(page, collectionName);

    await page.goto(`/objects/add?collectionId=${collectionId}`);

    // Cliquer sur "Neuf" en utilisant le label
    await page.getByText("Neuf").first().click();
    await expect(page.locator('input[type="radio"][value="NEW"]')).toBeChecked();
  });
});

// ============================================
// OBJECT LIST IN COLLECTION
// ============================================

test.describe("Object List in Collection", () => {
  test("displays objects with correct info", async ({ page }) => {
    const collectionName = uniqueName("Collection");
    const objectName = uniqueName("Objet Test");

    const collectionId = await createCollection(page, collectionName);

    // Créer un objet
    await page.goto(`/objects/add?collectionId=${collectionId}`);
    await page.getByLabel(/nom.*objet/i).fill(objectName);
    await page.locator('input[type="radio"][value="GOOD"]').check();
    await page.getByRole("button", { name: /ajouter/i }).click();

    // Vérifier l'affichage dans la liste
    await expect(page.getByText(objectName)).toBeVisible();
    await expect(page.getByText("Bon")).toBeVisible(); // Badge de condition
  });

  test("shows 'Disponible' for available objects", async ({ page }) => {
    const collectionName = uniqueName("Collection");
    const objectName = uniqueName("Objet Disponible");

    const collectionId = await createCollection(page, collectionName);

    await page.goto(`/objects/add?collectionId=${collectionId}`);
    await page.getByLabel(/nom.*objet/i).fill(objectName);
    await page.getByRole("button", { name: /ajouter/i }).click();

    // Le badge "Disponible" est un span, pas le nom de l'objet
    await expect(page.getByText(/Disponible/).first()).toBeVisible();
  });

  test("object count updates in stats", async ({ page }) => {
    const collectionName = uniqueName("Collection");

    const collectionId = await createCollection(page, collectionName);

    // Aller sur la page de la collection
    await page.goto(`/collections/${collectionId}`);

    // Devrait afficher 0 objets au départ
    await expect(page.getByText(/0.*objets|objets.*0/)).toBeVisible();

    // Ajouter un objet
    await page.goto(`/objects/add?collectionId=${collectionId}`);
    await page.getByLabel(/nom.*objet/i).fill(uniqueName("Objet"));
    await page.getByRole("button", { name: /ajouter/i }).click();

    // Devrait maintenant afficher 1 objet
    await expect(page.getByText(/1.*objet|objet.*1/)).toBeVisible();
  });
});

// ============================================
// OBJECT CARD INTERACTIONS
// ============================================

test.describe("Object Card", () => {
  test("card links to object detail", async ({ page }) => {
    const collectionName = uniqueName("Collection");
    const objectName = uniqueName("Objet Détail");

    const collectionId = await createCollection(page, collectionName);

    // Créer l'objet
    await page.goto(`/objects/add?collectionId=${collectionId}`);
    await page.getByLabel(/nom.*objet/i).fill(objectName);
    await page.getByRole("button", { name: /ajouter/i }).click();

    // Cliquer sur le lien de l'objet (éviter le bouton "Ajouter un objet")
    await page.locator(`a[href^="/objects/"]`).filter({ hasText: objectName }).click();

    // Devrait naviguer vers la page détail
    await expect(page).toHaveURL(/\/objects\/.+/);
  });

  test("displays condition badge", async ({ page }) => {
    const collectionName = uniqueName("Collection");

    const collectionId = await createCollection(page, collectionName);

    // Créer un objet avec état "Comme neuf" en utilisant le label
    await page.goto(`/objects/add?collectionId=${collectionId}`);
    await page.getByLabel(/nom.*objet/i).fill(uniqueName("Objet"));
    await page.getByText("Comme neuf").first().click();
    await page.getByRole("button", { name: /ajouter/i }).click();

    await expect(page.getByText("Comme neuf").first()).toBeVisible();
  });
});

// ============================================
// EDGE CASES
// ============================================

test.describe("Edge Cases", () => {
  test("handles notes field with newlines", async ({ page }) => {
    const collectionName = uniqueName("Collection");
    const objectName = uniqueName("Objet Notes");

    const collectionId = await createCollection(page, collectionName);

    await page.goto(`/objects/add?collectionId=${collectionId}`);
    await page.getByLabel(/nom.*objet/i).fill(objectName);
    await page.locator("textarea").fill("Ligne 1\nLigne 2\nLigne 3");
    await page.getByRole("button", { name: /ajouter/i }).click();

    // Les notes sont stockées mais pas affichées sur la carte
    await expect(page.getByText(objectName)).toBeVisible();
  });

  test("handles multiple objects in collection", async ({ page }) => {
    const collectionName = uniqueName("Collection");

    const collectionId = await createCollection(page, collectionName);

    // Créer 3 objets
    for (let i = 0; i < 3; i++) {
      await page.goto(`/objects/add?collectionId=${collectionId}`);
      await page.getByLabel(/nom.*objet/i).fill(uniqueName(`Objet-${i}`));
      await page.getByRole("button", { name: /ajouter/i }).click();
    }

    // Devrait afficher 3 objets
    await expect(page.getByText(/3.*objets|objets.*3/)).toBeVisible();
  });
});

// ============================================
// MISSING FEATURE: Move object between collections
// ============================================

/**
 * @note FEATURE MANQUANTE: Déplacer un objet d'une collection à une autre.
 *
 * L'API tRPC objectsRouter n'a pas de mutation `move` ou `transfer`.
 * Pour implémenter cette fonctionnalité:
 *
 * 1. Ajouter un endpoint dans packages/api/src/routers/objects.ts:
 *    move: dbProcedure
 *      .input(z.object({ id: z.string().cuid(), collectionId: z.string().cuid() }))
 *      .mutation(async ({ ctx, input }) => {
 *        return ctx.prisma.object.update({
 *          where: { id: input.id },
 *          data: { collectionId: input.collectionId },
 *        });
 *      }),
 *
 * 2. Ajouter un bouton/UI dans la page détail objet pour changer de collection.
 * 3. Ajouter les tests E2E correspondants.
 */
