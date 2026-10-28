import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createGzip } from "node:zlib";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const url = process.argv[2] ?? "http://127.0.0.1:3100";
const label = process.argv[3] ?? "trace";
const outputDirectory = resolve(process.argv[4] ?? "performance");
const port = 9223;
const profileDirectory = mkdtempSync(join(tmpdir(), "visynth-trace-"));

mkdirSync(outputDirectory, { recursive: true });

const chrome = spawn(
  CHROME_PATH,
  [
    "--headless=new",
    "--disable-gpu-vsync",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDirectory}`,
    "--window-size=1440,900",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

async function waitForDebugger() {
  const endpoint = `http://127.0.0.1:${port}/json/version`;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error("Chrome DevTools Protocol did not become available.");
}

class CdpClient {
  constructor(webSocketUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(webSocketUrl);
  }

  async open() {
    await new Promise((resolveOpen, rejectOpen) => {
      this.socket.addEventListener("open", resolveOpen, { once: true });
      this.socket.addEventListener("error", rejectOpen, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pendingRequest = this.pending.get(message.id);
        if (!pendingRequest) return;
        this.pending.delete(message.id);
        if (message.error) pendingRequest.reject(new Error(message.error.message));
        else pendingRequest.resolve(message.result ?? {});
        return;
      }
      const handlers = this.listeners.get(message.method);
      if (handlers) handlers.forEach((handler) => handler(message.params ?? {}));
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolveRequest, rejectRequest) => {
      this.pending.set(id, { resolve: resolveRequest, reject: rejectRequest });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  once(method) {
    return new Promise((resolveEvent) => {
      const handler = (params) => {
        this.listeners.get(method)?.delete(handler);
        resolveEvent(params);
      };
      if (!this.listeners.has(method)) this.listeners.set(method, new Set());
      this.listeners.get(method).add(handler);
    });
  }

  close() {
    this.socket.close();
  }
}

async function evaluate(client, expression, awaitPromise = false) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text ?? "Page evaluation failed.");
  }
  return response.result?.value;
}

async function waitForExperience(client) {
  const ready = await evaluate(
    client,
    `new Promise((resolve) => {
      const started = performance.now();
      const check = () => {
        const ready = document.documentElement.classList.contains('visynth-preloaded') &&
          document.scrollingElement.scrollHeight > innerHeight * 2;
        if (ready || performance.now() - started > 45000) resolve(ready);
        else requestAnimationFrame(check);
      };
      check();
    })`,
    true,
  );
  await delay(1000);
  if (!ready) {
    const diagnostics = await evaluate(
      client,
      `({
        title: document.title,
        url: location.href,
        htmlClass: document.documentElement.className,
        bodyOverflow: getComputedStyle(document.body).overflow,
        scrollHeight: document.scrollingElement?.scrollHeight,
        viewportHeight: innerHeight,
        preloader: Boolean(document.querySelector('[data-testid="site-preloader"]'))
      })`,
    );
    throw new Error(`VISYNTH did not become scrollable: ${JSON.stringify(diagnostics)}`);
  }
}

async function mark(client, name) {
  await evaluate(client, `performance.mark(${JSON.stringify(name)})`);
}

async function resetScroll(client) {
  await evaluate(client, "window.scrollTo({ top: 0, behavior: 'instant' })");
  await delay(600);
}

async function sampleCatchUp(client) {
  const samples = [];
  let previousOffset = 0;
  for (const offset of [0, 100, 300, 600, 1200]) {
    await delay(offset - previousOffset);
    previousOffset = offset;
    samples.push({
      afterInputMs: offset,
      scrollY: await evaluate(client, "window.scrollY"),
    });
  }
  return samples;
}

async function runWheel(client) {
  await mark(client, "visynth-wheel-start");
  for (let index = 0; index < 18; index += 1) {
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY: 90,
    });
    await delay(18);
  }
  const samples = await sampleCatchUp(client);
  await mark(client, "visynth-wheel-end");
  return samples;
}

async function runTouch(client) {
  await client.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 1,
  });
  await mark(client, "visynth-touch-start");
  for (let gesture = 0; gesture < 5; gesture += 1) {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 720, y: 700, radiusX: 8, radiusY: 8, force: 1 }],
    });
    for (let step = 1; step <= 8; step += 1) {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: 720, y: 700 - step * 55, radiusX: 8, radiusY: 8, force: 1 }],
      });
      await delay(18);
    }
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await delay(120);
  }
  const samples = await sampleCatchUp(client);
  await mark(client, "visynth-touch-end");
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: false });
  return samples;
}

async function runKeyboard(client) {
  await mark(client, "visynth-keyboard-start");
  for (let index = 0; index < 18; index += 1) {
    await client.send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "ArrowDown",
      code: "ArrowDown",
      windowsVirtualKeyCode: 40,
      nativeVirtualKeyCode: 40,
    });
    await client.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "ArrowDown",
      code: "ArrowDown",
      windowsVirtualKeyCode: 40,
      nativeVirtualKeyCode: 40,
    });
    await delay(40);
  }
  const samples = await sampleCatchUp(client);
  await mark(client, "visynth-keyboard-end");
  return samples;
}

function percentile(values, ratio) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
}

function pairAsyncDurations(events, name, beginPhase, endPhase) {
  const starts = new Map();
  const durations = [];
  for (const event of events) {
    const asyncId = event.id2?.local ?? event.id;
    if (event.name !== name || asyncId === undefined) continue;
    const key = `${event.pid}:${asyncId}`;
    if (event.ph === beginPhase) starts.set(key, event);
    if (event.ph === endPhase && starts.has(key)) {
      const start = starts.get(key);
      durations.push({
        durationMs: (event.ts - start.ts) / 1000,
        type: start.args?.event_latency?.event_type ?? "unknown",
      });
      starts.delete(key);
    }
  }
  return durations;
}

function summarizeTrace(trace, gestureSamples) {
  const events = trace.traceEvents ?? [];
  const rendererTasks = events
    .filter((event) => event.name === "RunTask" && event.ph === "X" && event.dur)
    .map((event) => event.dur / 1000);
  const longTasks = rendererTasks.filter((duration) => duration > 50);
  const animationFrames = pairAsyncDurations(events, "AnimationFrame", "s", "f").map(
    (entry) => entry.durationMs,
  );
  const eventLatencies = pairAsyncDurations(events, "EventLatency", "b", "e");
  const inputEvents = events.filter(
    (event) => event.name === "EventDispatch" && event.ph === "X" && event.dur,
  );
  const inputDurations = inputEvents.map((event) => event.dur / 1000);

  return {
    label,
    url,
    traceEventCount: events.length,
    rendererTaskCount: rendererTasks.length,
    rendererTaskP95Ms: Number(percentile(rendererTasks, 0.95).toFixed(2)),
    longTaskCount: longTasks.length,
    longestTaskMs: Number(Math.max(0, ...rendererTasks).toFixed(2)),
    animationFrameCount: animationFrames.length,
    animationFrameP95Ms: Number(percentile(animationFrames, 0.95).toFixed(2)),
    animationFramesOver20Ms: animationFrames.filter((duration) => duration > 20).length,
    animationFramesOver50Ms: animationFrames.filter((duration) => duration > 50).length,
    eventDispatchCount: inputEvents.length,
    eventDispatchP95Ms: Number(percentile(inputDurations, 0.95).toFixed(2)),
    longestEventDispatchMs: Number(Math.max(0, ...inputDurations).toFixed(2)),
    eventLatencyByType: Object.fromEntries(
      [...new Set(eventLatencies.map((entry) => entry.type))].map((type) => {
        const durations = eventLatencies
          .filter((entry) => entry.type === type)
          .map((entry) => entry.durationMs);
        return [
          type,
          {
            count: durations.length,
            p50Ms: Number(percentile(durations, 0.5).toFixed(2)),
            p95Ms: Number(percentile(durations, 0.95).toFixed(2)),
            maxMs: Number(Math.max(0, ...durations).toFixed(2)),
          },
        ];
      }),
    ),
    gestureCatchUp: gestureSamples,
  };
}

async function main() {
  await waitForDebugger();
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const pageTarget = targets.find((target) => target.type === "page");
  if (!pageTarget) throw new Error("No Chrome page target was created.");

  const client = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await client.open();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  const loaded = client.once("Page.loadEventFired");
  await client.send("Page.navigate", { url });
  await loaded;
  await waitForExperience(client);
  const preparedFrames = await evaluate(client,
    "Number(document.documentElement.dataset.visynthFramesReady || 0)");
  console.log(JSON.stringify({ preparedFrames }));

  await client.send("Tracing.start", {
    categories: [
      "blink.user_timing",
      "cc",
      "devtools.timeline",
      "disabled-by-default-devtools.timeline",
      "input",
      "toplevel",
    ].join(","),
    options: "sampling-frequency=10000",
    transferMode: "ReturnAsStream",
  });

  await resetScroll(client);
  const gestureSamples = {};
  gestureSamples.wheel = await runWheel(client);
  await resetScroll(client);
  gestureSamples.touch = await runTouch(client);
  await resetScroll(client);
  gestureSamples.keyboard = await runKeyboard(client);

  // Check the actual rendered canvas across the full story, in both directions.
  const canvasFrames = [];
  const maxScroll = await evaluate(client, "document.scrollingElement.scrollHeight - innerHeight");
  for (const progress of [0, 0.25, 0.5, 0.75, 1, 0.5, 0]) {
    await evaluate(client, `window.scrollTo({top:${maxScroll * progress},behavior:'instant'})`);
    await delay(150);
    const signature = await evaluate(client, `(() => {
      const canvas = document.querySelector('canvas');
      const pixels = canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
      let hash = 2166136261;
      for (let i=0;i<pixels.length;i+=1024) hash=Math.imul(hash ^ pixels[i],16777619);
      return hash >>> 0;
    })()`);
    canvasFrames.push({progress,signature});
  }
  console.log(JSON.stringify({ canvasFrames }));
  if (new Set(canvasFrames.map(frame => frame.signature)).size < 4) {
    throw new Error("Canvas sequence did not advance across the story.");
  }

  const tracingComplete = client.once("Tracing.tracingComplete");
  await client.send("Tracing.end");
  const { stream } = await tracingComplete;
  let traceJson = "";
  while (true) {
    const chunk = await client.send("IO.read", { handle: stream });
    traceJson += chunk.data;
    if (chunk.eof) break;
  }
  await client.send("IO.close", { handle: stream });
  client.close();

  const trace = JSON.parse(traceJson);
  const tracePath = join(outputDirectory, `${label}-chrome-trace.json.gz`);
  const metricsPath = join(outputDirectory, `${label}-metrics.json`);
  const gzip = createGzip({ level: 9 });
  gzip.pipe(createWriteStream(tracePath));
  gzip.end(traceJson);
  await new Promise((resolveGzip, rejectGzip) => {
    gzip.on("end", resolveGzip);
    gzip.on("error", rejectGzip);
  });
  const metrics = summarizeTrace(trace, gestureSamples);
  metrics.preparedFrames = preparedFrames;
  metrics.canvasFrames = canvasFrames;
  writeFileSync(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
  console.log(JSON.stringify({ tracePath, metricsPath, metrics }, null, 2));
}

try {
  await main();
} finally {
  chrome.kill();
  await new Promise((resolveExit) => {
    if (chrome.exitCode !== null) resolveExit();
    else chrome.once("exit", resolveExit);
  });
  rmSync(profileDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
