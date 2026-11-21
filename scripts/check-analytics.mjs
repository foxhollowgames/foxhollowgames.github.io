import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../viewer/analytics.js', import.meta.url), 'utf8');
function setup({ hostname = 'wayfinder.josephnewelldesign.com', search = '?q=private', pathname = '/bible/john.html', saved = null, webdriver = false, blockedStorage = false, mode = 'enabled', menu = false } = {}) {
  const elements = [], listeners = {}, scripts = [];
  function element(tag) {
    const e = { tag, hidden: false, children: [], handlers: {}, append(...children) { this.children.push(...children); if (tag === 'head') scripts.push(...children.filter(c => c.tag === 'script')); }, setAttribute() {}, addEventListener(type, fn) { this.handlers[type] = fn; }, focus() {}, textContent: '' };
    elements.push(e); return e;
  }
  const location = { hostname, origin: 'https://' + hostname, pathname, search, reload() { location.reloaded = true; } };
  const storage = new Map(saved ? [['wayfinder.analytics-consent.v1', JSON.stringify(saved)]] : []);
  const menuPanel = menu ? element('section') : null;
  const context = { window: {}, document: { head: element('head'), body: element('body'), cookie: '', createElement: element, querySelector: s => s === '.settings-panel' ? menuPanel : null, getElementById: () => null }, location, navigator: { webdriver }, URLSearchParams, localStorage: { getItem(k) { if (blockedStorage) throw Error(); return storage.get(k); }, setItem(k,v) { if (blockedStorage) throw Error(); storage.set(k,v); } } };
  context.window.addEventListener = (type, fn) => { listeners[type] = fn; };
  vm.runInNewContext(source.replace(/const collectionMode = '[^']+';/, `const collectionMode = '${mode}';`), context);
  return { ...context, menuPanel, scripts, storage, elements, listeners, click(text) { elements.find(e => e.textContent === text).handlers.click(); }, commands() { return (context.window.dataLayer || []).map(a => Array.from(a)); } };
}
const future = Date.now() + 100000;
for (const mode of ['paused', 'verification']) { const gated = setup({ mode, saved: { value: 'accepted', expires: future } }); assert.equal(gated.scripts.length, 0); }
let t = setup({ mode: 'paused', search: '?analytics_debug=1', saved: { value: 'accepted', expires: future } }); assert.equal(t.scripts.length, 0);
t = setup({ mode: 'verification', search: '?analytics_debug=1', saved: { value: 'accepted', expires: future } }); assert.equal(t.scripts.length, 1);
t = setup(); assert.equal(t.scripts.length, 0); assert.equal(t.commands().length, 0);
t.click('Decline analytics'); assert.equal(t.scripts.length, 0);
t = setup(); t.click('Accept analytics'); assert.equal(t.scripts.length, 1);
assert.equal(t.scripts[0].referrerPolicy, 'no-referrer');
let config = t.commands().find(c => c[0] === 'config')[2];
assert.equal(config.page_location, 'https://wayfinder.josephnewelldesign.com/bible/');
assert.ok(t.commands().findIndex(c => c[0] === 'set' && typeof c[1] === 'object') < t.commands().findIndex(c => c[0] === 'js'));
assert.equal(t.commands().find(c => c[0] === 'event')[2].page_location, config.page_location);
assert.equal(config.page_title, 'Wayfinder | Bible'); assert.equal(config.page_referrer, '');
assert.equal(config.allow_google_signals, false); assert.equal(config.allow_ad_personalization_signals, false); assert.equal(config.send_page_view, false);
assert.equal(t.commands().filter(c => c[0] === 'event' && c[1] === 'page_view').length, 1);
t.click('Accept analytics'); assert.equal(t.scripts.length, 1);
t.click('Decline analytics'); assert.equal(t.window['ga-disable-G-DB54M9BCZM'], true); assert.equal(t.location.reloaded, true);
t = setup({ saved: { value: 'accepted', expires: future } }); assert.equal(t.scripts.length, 1);
t = setup({ saved: { value: 'declined', expires: future } }); assert.equal(t.scripts.length, 0);
t = setup({ saved: { value: 'accepted', expires: 1 } }); assert.equal(t.scripts.length, 0);
for (const hostname of ['localhost', '127.0.0.1', 'preview.example.org']) { t = setup({ hostname, saved: { value: 'accepted', expires: future } }); assert.equal(t.scripts.length, 0); }
t = setup({ webdriver: true, saved: { value: 'accepted', expires: future } }); assert.equal(t.scripts.length, 0);
t = setup({ webdriver: true, search: '?analytics_debug=1&q=secret' }); t.click('Accept analytics'); config = t.commands().find(c => c[0] === 'config')[2]; assert.equal(config.debug_mode, true); assert.equal(config.traffic_type, 'verification'); assert.ok(!JSON.stringify(t.commands()).includes('secret'));
t = setup({ blockedStorage: true }); assert.equal(t.scripts.length, 0); t.click('Accept analytics'); assert.equal(t.scripts.length, 1);
t = setup({ saved: { value: 'accepted', expires: future } }); t.storage.clear(); t.listeners.storage({key: null}); assert.equal(t.window['ga-disable-G-DB54M9BCZM'], true); assert.equal(t.location.reloaded, true);
for (const section of ['book-of-mormon', 'doctrine-and-covenants', 'timeline', '']) { t = setup({ pathname: '/' + section + '/private', saved: { value: 'accepted', expires: future } }); config = t.commands().find(c => c[0] === 'config')[2]; assert.equal(config.page_location, t.location.origin + (section ? '/' + section + '/' : '/')); }
const floating = t => t.elements.find(e => e.id === 'wf-analytics-settings');
const panelOf = t => t.elements.find(e => e.id === 'wf-analytics-panel');
t = setup({ menu: true }); assert.equal(floating(t).hidden, false); assert.equal(panelOf(t).hidden, false); assert.equal(t.menuPanel.children[0].textContent, 'Analytics choices');
t.click('Decline analytics'); assert.equal(floating(t).hidden, true); assert.equal(panelOf(t).hidden, true);
t.menuPanel.children[0].handlers.click(); assert.equal(panelOf(t).hidden, false);
t = setup({ menu: true, saved: { value: 'accepted', expires: future } }); assert.equal(floating(t).hidden, true); assert.equal(panelOf(t).hidden, true);
t.storage.clear(); t.listeners.storage({ key: null }); assert.equal(floating(t).hidden, false); assert.equal(panelOf(t).hidden, false);
t = setup({ saved: { value: 'declined', expires: future } }); assert.equal(floating(t).hidden, false); assert.equal(panelOf(t).hidden, true);
console.log('Analytics checks passed: menu placement after a choice, opt-in/decline, withdrawal, expiry, blocked storage, cross-tab revocation, local/bot exclusion, debug labeling, sanitization, and single pageview.');
