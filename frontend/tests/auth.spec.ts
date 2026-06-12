import { test, expect } from "@playwright/test";

test.describe("Simulador Psicosocial", () => {
  test("login page renders with institutional branding", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Simulador Psicosocial" })).toBeVisible();
    await expect(page.getByLabel("Correo institucional")).toBeVisible();
    await expect(page.getByRole("button", { name: /Ingresar/i })).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
  });

  test("teacher login redirects to teacher panel", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo institucional").fill("docente@agora.com");
    await page.getByLabel("Contraseña").fill("Agora12345*");
    await page.getByRole("button", { name: /Ingresar/i }).click();
    await expect(page).toHaveURL(/\/teacher/);
    await expect(page.getByRole("heading", { name: "Centro de supervisión clínica" }).first()).toBeVisible();
  });

  test("can navigate to register page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /Solicitar acceso/i }).click();
    await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible();
  });
});
