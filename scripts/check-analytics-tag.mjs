// Read-only integration check for the Google-hosted container's privacy settings.
// This does not send a visit or execute the downloaded script.
import assert from 'node:assert/strict';
const response = await fetch('https://www.googletagmanager.com/gtag/js?id=G-DB54M9BCZM');
assert.equal(response.status, 200, 'Google tag download failed');
const text = await response.text();
const start = text.indexOf('"resource":');
const end = text.indexOf(',"runtime"', start);
assert.ok(start >= 0 && end > start, 'Google changed its container format; review the configuration manually');
const { resource } = JSON.parse('{' + text.slice(start, end).trim() + '}');
const tags = resource.tags;
const events = tags.find(t => t.function === '__ogt_auto_events');
assert.ok(events, 'Automatic event settings not found');
for (const key of ['vtp_enableOutboundClick', 'vtp_enableScroll', 'vtp_enableDownload', 'vtp_enableHistoryEvents', 'vtp_enableForm', 'vtp_enableVideo']) assert.equal(events[key], false, key + ' must remain off');
assert.equal(tags.find(t => t.function === '__ogt_1p_data_v2')?.vtp_isEnabled, false, 'Automatic personal-data collection must remain off');
const destination = tags.find(t => t.function === '__dest_ga' && t.vtp_destinationId === 'G-DB54M9BCZM');
const settings = destination?.vtp_configSettingsTable?.slice(1) || [];
assert.ok(settings.some(row => row.includes('send_page_view') && row.includes('false')), 'Destination automatic pageviews must remain off');
console.log(`Google container version ${resource.version}: auto interactions off, personal-data capability off, destination automatic pageviews off.`);
