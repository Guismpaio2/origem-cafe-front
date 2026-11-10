import { chromium } from 'playwright';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axeSource = require('axe-core').source;
const base = process.env.BASE_URL ?? 'http://localhost:4173';
const b = await chromium.launch();
const results = { axe: [], overflow: [], lcp: [] };

async function ctx(width, height = 900) { const c = await b.newContext({ viewport: { width, height } }); return { c, p: await c.newPage() }; }
async function loginAs(p, email, senha) {
  await p.goto(base + '/entrar', { waitUntil: 'networkidle' });
  await p.fill('#login-email', email); await p.fill('#login-senha', senha);
  await p.getByRole('button', { name: 'Entrar na minha conta' }).click();
  await p.waitForURL(base + '/');
}
async function addCafe(p) {
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await p.click('a[href^="/produtos/"] >> nth=0');
  await p.waitForSelector('text=Adicionar ao carrinho');
  await p.locator('label[for^="moagem-"]').first().click();
  await p.locator('label[for^="peso-"]').first().click();
  await p.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await p.waitForSelector('text=Adicionado ao carrinho');
}
async function runAxe(p, label) {
  await p.addScriptTag({ content: axeSource });
  const r = await p.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    return res.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help, sample: v.nodes[0]?.target?.join(' ') ?? '' }));
  });
  results.axe.push({ label, violations: r });
}
async function overflowAt(p, width, label) {
  const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  results.overflow.push({ label, width, overflow: o });
}

// --- páginas públicas, 1440 e 360
const publicPages = ['/', '/entrar', '/cadastro'];
for (const width of [360, 1440]) {
  const { c, p } = await ctx(width);
  for (const path of publicPages) {
    await p.goto(base + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
    await overflowAt(p, width, path);
    if (width === 1440) await runAxe(p, path);
  }
  await c.close();
}
// --- produto, carrinho e fluxo logado
{
  const { c, p } = await ctx(1440);
  await addCafe(p);
  const productUrl = p.url();
  await p.goto(p.url(), { waitUntil: 'networkidle' }); await p.waitForTimeout(300);
  await runAxe(p, '/produtos/:id');
  await p.goto(base + '/carrinho', { waitUntil: 'networkidle' }); await runAxe(p, '/carrinho (visitante)');
  await loginAs(p, 'cliente@origemcafe.test', 'Cliente#2026');
  for (const path of ['/checkout', '/conta', '/assinatura', '/pedidos']) {
    await p.goto(base + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(300);
    await runAxe(p, path);
  }
  await c.close();
}
// --- admin
{
  const { c, p } = await ctx(1440);
  await loginAs(p, 'admin@origemcafe.test', 'Admin#2026');
  for (const path of ['/admin', '/admin/produtos', '/admin/pedidos']) {
    await p.goto(base + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(300);
    await runAxe(p, path);
  }
  await c.close();
}
// --- largura em 5 tamanhos (RNF008)
for (const width of [360, 390, 768, 1024, 1440]) {
  const { c, p } = await ctx(width);
  for (const path of ['/', '/carrinho', '/entrar', '/cadastro']) {
    await p.goto(base + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(200);
    await overflowAt(p, width, path);
  }
  await c.close();
}
// --- LCP do catálogo com 4G simulado e CPU 4x mais lenta (RNF006)
for (let run = 1; run <= 3; run += 1) {
  const { c, p } = await ctx(390, 844);
  const cdp = await c.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.addInitScript(() => {
    window.__lcp = 0;
    new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await p.goto(base + '/', { waitUntil: 'load' });
  await p.waitForSelector('text=Blend da Casa', { timeout: 30000 });
  await p.waitForTimeout(1500);
  results.lcp.push(Math.round(await p.evaluate(() => window.__lcp)));
  await c.close();
}
await b.close();
console.log(JSON.stringify(results, null, 2));
