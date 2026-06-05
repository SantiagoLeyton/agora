import { test, expect } from "@playwright/test";

test.describe("Simulador Psicosocial", () => {
  test("login page renders with institutional branding", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
    await expect(page.getByLabel("Correo institucional")).toBeVisible();
    await expect(page.getByRole("button", { name: /Ingresar/i })).toBeVisible();
    await expect(page.getByText("Cuentas de demostración")).toBeVisible();
  });

  test("teacher login redirects to teacher panel", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Docente" }).click();
    await page.getByRole("button", { name: /Ingresar/i }).click();
    await expect(page).toHaveURL(/\/teacher/);
    await expect(page.getByRole("heading", { name: "Panel docente" })).toBeVisible();
  });

  test("can navigate to register page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /Regístrate/i }).click();
    await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible();
  });
});
