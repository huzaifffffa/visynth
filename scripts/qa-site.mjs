import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/manzo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"
);

const baseUrl = process.env.VISYNTH_QA_URL || "http://localhost:3111";
const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const results = {};

async function closeContext(context) {
  await context.close();
}

try {
  const responsive = [];
  for (const width of [320, 375, 414, 768, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width < 500 ? 740 : 900 } });
    const page = await context.newPage();
    const errors = [];
    const failedRequests = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("requestfailed", (request) => {
      failedRequests.push({ url: request.url(), error: request.failure()?.errorText });
    });
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    const started = Date.now();
    try {
      await page.locator('[data-testid="site-preloader"]').waitFor({ state: "hidden", timeout: 7000 });
    } catch (error) {
      const diagnostic = await page.evaluate(() => {
        const preloader = document.querySelector('[data-testid="site-preloader"]');
        return {
          readiness: preloader?.getAttribute("data-readiness"),
          exiting: preloader?.getAttribute("data-exiting"),
          htmlClass: document.documentElement.className,
          framesReady: document.documentElement.dataset.visynthFramesReady,
          bodyOverflow: getComputedStyle(document.body).overflow,
          sessionComplete: window.sessionStorage.getItem("visynth_preload_complete"),
          scripts: Array.from(document.scripts).map((script) => script.src).filter(Boolean),
          nextResources: performance
            .getEntriesByType("resource")
            .map((entry) => entry.name)
            .filter((name) => name.includes("/_next/")),
          hasNextRoot: Boolean(document.querySelector("next-route-announcer")),
        };
      });
      console.error("PRELOADER_DIAGNOSTIC", JSON.stringify({ width, diagnostic, errors, failedRequests }, null, 2));
      throw error;
    }
    const preloadMs = Date.now() - started;
    const metrics = await page.evaluate(() => ({
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      h1: document.querySelectorAll("h1").length,
      ctaInViewport: (() => {
        const element = document.querySelector('[data-hero="cta"]');
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      })(),
    }));
    if (width === 375 || width === 1440) {
      await page.screenshot({ path: `performance/qa-home-${width}.png`, fullPage: false });
    }
    responsive.push({ width, preloadMs, errors, ...metrics });
    await closeContext(context);
  }
  results.responsive = responsive;

  const interactionContext = await browser.newContext({ viewport: { width: 375, height: 740 } });
  const interactionPage = await interactionContext.newPage();
  await interactionPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await interactionPage.locator('[data-testid="site-preloader"]').waitFor({ state: "hidden", timeout: 7000 });

  const menuButton = interactionPage.getByRole("button", { name: "Open navigation menu" });
  await menuButton.click();
  await interactionPage.waitForFunction(() => document.activeElement?.closest('#mobile-navigation-drawer'));
  const menuOpen = await interactionPage.evaluate(() => ({
    focused: document.activeElement?.textContent?.trim().slice(0, 80),
    mainInert: document.querySelector("main")?.hasAttribute("inert"),
  }));
  await interactionPage.locator("body").press("Escape");
  const menuClosed = await interactionPage.evaluate(() => ({
    focusedLabel: document.activeElement?.getAttribute("aria-label"),
    mainInert: document.querySelector("main")?.hasAttribute("inert"),
  }));

  await interactionPage.evaluate(() => {
    document.querySelector("form")?.requestSubmit();
  });
  const formInvalid = await interactionPage.evaluate(() => ({
    focusedId: document.activeElement?.id,
    nameInvalid: document.querySelector("#contact-name")?.getAttribute("aria-invalid"),
    nameError: document.querySelector("#contact-name-error")?.textContent?.trim(),
    submitEnabled: !(document.querySelector('button[type="submit"]'))?.hasAttribute("disabled"),
    autocompleteName: document.querySelector("#contact-name")?.getAttribute("autocomplete"),
    autocompleteEmail: document.querySelector("#contact-email")?.getAttribute("autocomplete"),
  }));
  results.interactions = { menuOpen, menuClosed, formInvalid };
  await interactionPage.reload({ waitUntil: "domcontentloaded" });
  results.repeatLoad = { introVisible: await interactionPage.locator('[data-testid="site-preloader"]').isVisible() };
  for (const success of [false, true]) {
    await interactionPage.route("https://api.web3forms.com/submit", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({ status: success ? 200 : 500, contentType: "application/json", body: JSON.stringify({ success }) });
    });
    await interactionPage.locator('#contact-name').fill('QA Test', { force: true });
    await interactionPage.locator('#contact-email').fill('qa@example.com', { force: true });
    await interactionPage.locator('#contact-message').fill('Local verification only.', { force: true });
    await interactionPage.evaluate(() => document.querySelector('form')?.requestSubmit());
    await interactionPage.waitForFunction(() => document.querySelector('button[type="submit"]')?.disabled || document.body.textContent.includes('pending activation'));
    await interactionPage.waitForTimeout(700);
    results[success ? 'mockFormSuccess' : 'mockFormFailure'] = await interactionPage.evaluate(() => ({ success: document.body.textContent.includes('INQUIRY RECEIVED'), error: document.querySelector('[role="alert"]')?.textContent?.trim() }));
    await interactionPage.unroute("https://api.web3forms.com/submit");
  }
  await closeContext(interactionContext);

  const portfolioContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const portfolioPage = await portfolioContext.newPage();
  await portfolioPage.goto(`${baseUrl}/portfolio`, { waitUntil: "networkidle" });
  const brandingTab = portfolioPage.getByRole("tab", { name: "Branding" }).last();
  await brandingTab.click();
  const brandingUrl = portfolioPage.url();
  const selectedAfterClick = await brandingTab.getAttribute("aria-selected");
  await portfolioPage.goBack();
  const allWorkSelected = await portfolioPage.getByRole("tab", { name: "All Work" }).last().getAttribute("aria-selected");
  await portfolioPage.goForward();
  const restoredSelected = await portfolioPage.getByRole("tab", { name: "Branding" }).last().getAttribute("aria-selected");
  await portfolioPage.reload({ waitUntil: "networkidle" });
  const refreshSelected = await portfolioPage.getByRole("tab", { name: "Branding" }).last().getAttribute("aria-selected");
  await portfolioPage.goto(`${baseUrl}/portfolio?discipline=not-a-real-filter`, { waitUntil: "networkidle" });
  const invalidFallback = await portfolioPage.getByRole("tab", { name: "All Work" }).last().getAttribute("aria-selected");
  const imageMetrics = await portfolioPage.evaluate(() => ({
    images: Array.from(document.querySelectorAll("img")).map((image) => ({
      alt: image.alt,
      width: image.getAttribute("width"),
      height: image.getAttribute("height"),
    })),
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    h1: document.querySelectorAll("h1").length,
  }));
  await portfolioPage.screenshot({ path: "performance/qa-portfolio-375.png", fullPage: false });
  results.portfolio = {
    brandingUrl,
    selectedAfterClick,
    allWorkSelected,
    restoredSelected,
    refreshSelected,
    invalidFallback,
    imageMetrics,
  };
  await closeContext(portfolioContext);

  const reducedContext = await browser.newContext({
    viewport: { width: 375, height: 740 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  const reducedStart = Date.now();
  await reducedPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await reducedPage.locator('[data-testid="site-preloader"]').waitFor({ state: "hidden", timeout: 6000 });
  results.reducedMotion = { preloadMs: Date.now() - reducedStart };
  await closeContext(reducedContext);

  const failureContext = await browser.newContext({ viewport: { width: 375, height: 740 } });
  await failureContext.route("**/frames-mobile/frame_001.webp", (route) => route.abort());
  const failurePage = await failureContext.newPage();
  const failureStart = Date.now();
  await failurePage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await failurePage.locator('[data-testid="site-preloader"]').waitFor({ state: "hidden", timeout: 7000 });
  results.failedCriticalAsset = {
    releasedMs: Date.now() - failureStart,
    h1Visible: await failurePage.locator("h1").first().isVisible(),
  };
  await closeContext(failureContext);

  const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 740 } });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  results.noJavaScript = {
    preloaderVisible: await noJsPage.locator('[data-testid="site-preloader"]').isVisible(),
    h1Visible: await noJsPage.locator("h1").first().isVisible(),
  };
  await closeContext(noJsContext);
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
writeFileSync('performance/qa-results.json', JSON.stringify(results, null, 2));
