import { chromium } from 'playwright';
const base = process.env.BASE_URL ?? 'http://localhost:5173';
const out = process.argv[2];
const browser = await chromium.launch();
const errors = [];
const log = [];
async function ctx(width = 1280) {
  const c = await browser.newContext({ viewport: { width, height: 900 } });
  const p = await c.newPage();
  p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('401')) errors.push('console: ' + m.text()); });
  return { c, p };
}
async function login(p) {
  await p.goto(base + '/entrar', { waitUntil: 'networkidle' });
  await p.fill('#login-email', 'cliente@origemcafe.test');
  await p.fill('#login-senha', 'Cliente#2026');
  await p.getByRole('button', { name: 'Entrar na minha conta' }).click();
  await p.waitForURL(base + '/');
}
async function addBlend(p) {
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await p.click('a[href^="/produtos/"] >> nth=0');
  await p.waitForSelector('text=Adicionar ao carrinho');
  await p.locator('label[for^="moagem-"]').first().click();
  await p.locator('label[for^="peso-"]').first().click();
  await p.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await p.waitForSelector('text=Adicionado ao carrinho');
}
function nextMonday() {
  const d = new Date(); d.setDate(d.getDate() + 3);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-CA');
}
// 1) anônimo é levado ao login e volta ao checkout
{
  const { c, p } = await ctx();
  await p.goto(base + '/checkout', { waitUntil: 'networkidle' });
  log.push('anônimo em /checkout -> ' + new URL(p.url()).pathname + new URL(p.url()).search);
  await c.close();
}
// 2) entrega aprovada
{
  const { c, p } = await ctx();
  await login(p);
  await addBlend(p);
  await p.goto(base + '/checkout', { waitUntil: 'networkidle' });
  await p.waitForSelector('text=Confirmar pedido');
  await p.fill('#end-cep', '37500-000');
  await p.fill('#end-logradouro', 'Rua Teste');
  await p.fill('#end-numero', '10');
  await p.fill('#end-cidade', 'Itajubá');
  await p.fill('#end-uf', 'mg');
  await p.waitForFunction(() => document.body.innerText.includes('Frete'));
  await p.screenshot({ path: `${out}/checkout-entrega.png`, fullPage: true });
  await p.getByRole('button', { name: 'Confirmar pedido' }).click();
  await p.waitForSelector('h1:has-text("Pedido")', { timeout: 15000 });
  log.push('entrega -> ' + (await p.locator('h1').first().innerText()));
  await p.screenshot({ path: `${out}/pedido-entrega.png`, fullPage: true });
  await c.close();
}
// 3) retirada com horário + pagamento recusado (simulado, só em dev)
{
  const { c, p } = await ctx();
  await login(p);
  await addBlend(p);
  await p.goto(base + '/checkout', { waitUntil: 'networkidle' });
  await p.waitForSelector('text=Confirmar pedido');
  await p.getByLabel('Retirar na loja').check({ force: true });
  await p.fill('#retirada-data', nextMonday());
  await p.locator('label[for^="horario-"]').first().waitFor({ timeout: 15000 });
  await p.locator('label[for^="horario-"]').first().click();
  await p.getByLabel('Simular pagamento recusado').check();
  await p.screenshot({ path: `${out}/checkout-retirada.png`, fullPage: true });
  await p.getByRole('button', { name: 'Confirmar pedido' }).click();
  await p.waitForSelector('h1:has-text("Pedido")', { timeout: 15000 });
  log.push('retirada recusada -> ' + (await p.locator('h1').first().innerText()));
  await p.screenshot({ path: `${out}/pedido-recusado.png`, fullPage: true });
  await c.close();
}
// 4) 360px sem rolagem horizontal no checkout
{
  const { c, p } = await ctx(360);
  await login(p);
  await addBlend(p);
  await p.goto(base + '/checkout', { waitUntil: 'networkidle' });
  await p.waitForSelector('text=Confirmar pedido');
  log.push('checkout 360 overflow=' + (await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)));
  await c.close();
}
await browser.close();
console.log(log.join('\n'));
console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
