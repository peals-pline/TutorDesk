import { chromium } from "playwright";

const appUrl = process.env.TUTORDESK_URL ?? "http://127.0.0.1:3000";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1024 } });
await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: appUrl });
const page = await context.newPage();

try {
  await page.goto(appUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole("button", { name: /Students/ }).first().click();
  await page.getByLabel("Name").fill("QA Student");
  await page.getByLabel("Subject").fill("Physics");
  await page.getByLabel("Level").fill("Grade 9");
  await page.getByLabel("Goals").fill("Build confidence with formulas");
  await page.getByLabel("Notes").fill("Prefers short practical examples.");
  await page.getByRole("button", { name: "Add student" }).last().click();
  await page.getByRole("heading", { name: "QA Student" }).waitFor();

  await page.getByRole("button", { name: /Lessons/ }).first().click();
  await page.getByLabel("Topic").fill("Forces and motion");
  await page.getByLabel("Summary").fill("Covered Newton laws with worked examples.");
  await page.getByLabel("Materials used").fill("Practice worksheet");
  await page.getByLabel("Tutor notes").fill("Review diagrams next time.");
  await page.getByRole("button", { name: "Add lesson" }).click();
  await page.getByText("Forces and motion").first().waitFor();

  await page.getByRole("button", { name: /Homework/ }).first().click();
  await page.getByLabel("Title").fill("Complete force diagrams");
  await page.getByLabel("Notes").fill("Check vector direction.");
  await page.getByRole("button", { name: "Assign homework" }).click();
  await page.getByText("Complete force diagrams").first().waitFor();

  await page.getByRole("button", { name: /Mistake Journal/ }).first().click();
  await page.getByLabel("Topic").fill("Mechanics");
  await page.getByLabel("Mistake type").fill("unit confusion");
  await page.getByLabel("Example").fill("10 N/kg written as 10 kg");
  await page.getByLabel("Correction").fill("Use N/kg for gravitational field strength.");
  await page.getByRole("button", { name: "Add mistake" }).click();
  await page.getByText(/unit confusion/).first().waitFor();

  await page.getByRole("button", { name: /Progress/ }).first().click();
  await page.getByLabel("Topic").fill("Newton laws");
  await page.getByLabel("Notes").fill("Learning with good example accuracy.");
  await page.getByRole("button", { name: "Add topic progress" }).click();
  await page.getByText("Newton laws").first().waitFor();

  await page.getByRole("button", { name: /Reports/ }).first().click();
  await page.getByText("# Progress report: QA Student").waitFor();
  await page.getByText("Forces and motion").waitFor();
  await page.getByRole("button", { name: /Copy Markdown/ }).click();
  await page.getByRole("button", { name: /Copied/ }).waitFor();

  await page.getByRole("button", { name: /Backup/ }).first().click();
  await page.getByRole("button", { name: "Export JSON" }).click();
  const backup = JSON.parse(await page.locator("textarea").inputValue());
  if (!backup.students.some((student) => student.name === "QA Student")) {
    throw new Error("Exported JSON does not include QA Student");
  }

  console.log("TutorDesk functional QA passed");
} finally {
  await browser.close();
}
