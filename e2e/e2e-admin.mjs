import { chromium } from 'playwright';
const base = process.env.BASE_URL ?? 'http://localhost:5173';
const b = await chromium.launch();
const errors = []; const log = [];
async function login(p, email, senha) {
  await p.goto(base + '/entrar', { waitUntil: 'networkidle' });
  await p.fill('#login-email', email); await p.fill('#login-senha', senha);
  await p.getByRole('button', { name: 'Entrar na minha conta' }).click();
  await p.waitForURL(base + '/');
}
const ctx = async () => { const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage(); p.on('pageerror', (e) => errors.push(e.message)); p.on('console', (m) => { if (m.type()==='error' && !/401|403|404|422/.test(m.text())) errors.push(m.text()); }); return { c, p }; };
{
  const { c, p } = await ctx();
  await login(p, 'cliente@origemcafe.test', 'Cliente#2026');
  await p.goto(base + '/admin', { waitUntil: 'networkidle' });
  log.push('cliente em /admin -> ' + (await p.locator('h1').first().innerText()));
  await c.close();
}
{
  const { c, p } = await ctx();
  await login(p, 'admin@origemcafe.test', 'Admin#2026');
  await p.goto(base + '/admin', { waitUntil: 'networkidle' });
  await p.waitForSelector('text=Faturamento aprovado');
  log.push('admin resumo -> ' + (await p.locator('dl').first().innerText()).replace(/\n/g, ' | '));
  await p.screenshot({ path: process.argv[2], fullPage: true });
  await p.goto(base + '/admin/pedidos', { waitUntil: 'networkidle' });
  await p.waitForSelector('text=Status atual', { timeout: 10000 }).catch(() => {});
  log.push('admin pedidos: ' + (await p.locator('text=Status atual').count()) + ' pedidos listados');
  await p.goto(base + '/admin/produtos', { waitUntil: 'networkidle' });
  await p.waitForSelector('text=Cadastrar produto');
  log.push('admin produtos: formulário presente');
  await c.close();
}
await b.close();
console.log(log.join('\n')); console.log('errors:', errors.length ? errors : 'none');
