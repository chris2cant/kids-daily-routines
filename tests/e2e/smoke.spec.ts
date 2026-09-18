import { expect, test } from "@playwright/test";

test("parents can pick and advance a routine", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 8, 14, 17, 30));
  await page.goto("/");

  await page.getByRole("button", { name: "Ouvrir les commandes parents" }).click();
  await page.getByRole("button", { name: "🌙 Soir" }).click();
  await page.getByRole("button", { name: /Suivante/ }).click();

  await expect(page.getByRole("heading", { name: "Devoirs" })).toBeVisible();
  await expect(page.getByText("Douche", { exact: true })).toBeVisible();
});

test("shows the current time and updates it at the next minute", async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 8, 14, 18, 20, 30) });
  await page.goto("/");

  await expect(page.locator("time.routine-clock")).toHaveText("18:20");
  await page.clock.fastForward("00:00:31");
  await expect(page.locator("time.routine-clock")).toHaveText("18:21");
});

test("an early advance keeps the following step on schedule", async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 8, 14, 18, 20) });
  await page.goto("/");

  await page.getByRole("button", { name: "Passer à l’étape suivante : Douche" }).click();

  await expect(page.getByRole("heading", { name: "Douche" })).toBeVisible();
  await expect(page.getByLabel("Environ 45 minutes restantes")).toBeVisible();
  await page.clock.fastForward("00:45:00");
  await expect(page.getByRole("heading", { name: "Repas" })).toBeVisible();
});

test("uses the width of widescreen displays", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 8, 14, 18, 20));

  for (const viewport of [
    { width: 1920, height: 1080, minimumImageWidth: 800 },
    { width: 3440, height: 1440, minimumImageWidth: 1200 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const illustration = page.locator(".step-illustration");
    const details = page.locator(".step-details");
    await expect(illustration).toBeVisible();

    const illustrationBox = await illustration.boundingBox();
    const detailsBox = await details.boundingBox();
    expect(illustrationBox).not.toBeNull();
    expect(detailsBox).not.toBeNull();
    expect(illustrationBox!.width).toBeGreaterThan(viewport.minimumImageWidth);
    expect(illustrationBox!.x + illustrationBox!.width).toBeLessThan(detailsBox!.x);
  }
});

test("saves schedule changes locally", async ({ page }) => {
  await page.goto("/settings");

  const wakeUpTime = page.getByLabel("Heure de Réveil, Routine du matin");
  await wakeUpTime.fill("06:45");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Configuration enregistrée")).toBeVisible();

  await page.reload();
  await expect(wakeUpTime).toHaveValue("06:45");
});

test("confirms before restoring the default configuration", async ({ page }) => {
  await page.goto("/settings");

  const wakeUpTime = page.getByLabel("Heure de Réveil, Routine du matin");
  await wakeUpTime.fill("06:45");
  await page.getByRole("button", { name: "Réinitialiser", exact: true }).first().click();

  const dialog = page.getByRole("dialog", { name: "Réinitialiser la configuration ?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Annuler" }).click();
  await expect(wakeUpTime).toHaveValue("06:45");

  await page.getByRole("button", { name: "Réinitialiser", exact: true }).first().click();
  await dialog.getByRole("button", { name: "Réinitialiser", exact: true }).click();
  await expect(wakeUpTime).toHaveValue("07:00");
  await expect(page.getByText("Configuration d’origine restaurée")).toBeVisible();
});

test("creates a Wednesday flow with reusable activities", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 8, 16, 9, 10));
  await page.goto("/settings");
  await page.getByRole("button", { name: "+ Nouveau flow" }).click();
  await page.getByLabel("Nom du flow").fill("Mercredi matin");
  await page.getByText("Mer", { exact: true }).click();
  await page.getByRole("button", { name: "+ Ajouter une étape" }).click();
  await page.locator(".flow-step-row select").selectOption("shower");
  await page.getByLabel("Heure de Douche, Mercredi matin").fill("09:00");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.reload();
  await page.getByRole("button", { name: /Mercredi matin.*1 étapes/ }).click();
  await expect(page.getByLabel("Nom du flow")).toHaveValue("Mercredi matin");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Douche" })).toBeVisible();
});

test("customizes an activity across flows", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("tab", { name: "Catalogue des activités" }).click();
  const teeth = page
    .locator(".activity-card")
    .filter({ has: page.locator('input[value="Dents"]') });
  await teeth.getByRole("textbox", { name: "Nom" }).fill("Brossage des dents");
  await page.getByRole("radio", { name: "Brossage des dents : Eau" }).check();
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.reload();
  await page.getByRole("tab", { name: "Catalogue des activités" }).click();
  await expect(page.locator('.activity-card input[value="Brossage des dents"]')).toBeVisible();
});

test("imports an activity image locally", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("tab", { name: "Catalogue des activités" }).click();
  const teeth = page
    .locator(".activity-card")
    .filter({ has: page.locator('input[value="Dents"]') });
  await teeth.getByLabel("Importer une image pour Dents").setInputFiles({
    name: "dents.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await expect(teeth.locator(".activity-preview img")).toHaveAttribute(
    "src",
    /^data:image\/png;base64,/,
  );
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.reload();
  await page.getByRole("tab", { name: "Catalogue des activités" }).click();
  await expect(
    page
      .locator(".activity-card")
      .filter({ has: page.locator('input[value="Dents"]') })
      .locator(".activity-preview img"),
  ).toHaveAttribute("src", /^data:image\/png;base64,/);
});
