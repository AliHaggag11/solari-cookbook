import { llmFallback, type LlmAction } from "./fallback";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AutomatablePage = any;

export async function applyLlmAction(
  page: AutomatablePage,
  action: LlmAction,
): Promise<boolean> {
  try {
    switch (action.action) {
      case "click":
        if (!action.selector) return false;
        await page.locator(action.selector).first().click({ timeout: 10_000 });
        return true;
      case "type":
        if (!action.selector || action.text === undefined) return false;
        await page.locator(action.selector).first().fill(action.text, { timeout: 10_000 });
        return true;
      case "navigate":
        if (!action.url) return false;
        await page.goto(action.url, { waitUntil: "load", timeout: 90_000 });
        return true;
      case "press":
        if (!action.keys?.length) return false;
        await page.keyboard.press(action.keys.join("+"));
        return true;
      case "wait":
        await page.waitForTimeout(2500);
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

export async function runLlmGoal(
  page: AutomatablePage,
  goal: string,
  maxSteps = 3,
): Promise<boolean> {
  for (let i = 0; i < maxSteps; i++) {
    const screenshot = await page.screenshot({ type: "jpeg", quality: 60 });
    const pageText = await page.locator("body").innerText().catch(() => "");
    const action = await llmFallback({
      screenshotBase64: screenshot.toString("base64"),
      pageText,
      goal,
    });
    if (!action) return i > 0;
    const applied = await applyLlmAction(page, action);
    if (!applied) return i > 0;
    if (action.action === "wait") continue;
    await page.waitForTimeout(1500);
  }
  return true;
}
