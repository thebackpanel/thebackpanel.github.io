// BACKPANEL site interactions — psychology-driven

// Nav scroll effect
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// Reach estimator: 8k-12k impressions/auto/day (transit OOH benchmark, modelled)
function calc() {
  const autos = parseInt(document.getElementById('autos').value) || 0;
  const days = parseInt(document.getElementById('days').value) || 0;
  const perDay = 10000;
  const total = autos * perDay * days;
  const cpm = 0.33;
  const cost = (total / 1000) * cpm;
  document.getElementById('reachOut').textContent =
    `≈ ${total.toLocaleString('en-IN')} impressions · est. media cost ₹${Math.round(cost).toLocaleString('en-IN')} (from ₹${cpm} CPM, modeled)`;
}

// --- shared: push a row to the Google Form (best-effort, no-cors) ---
const GF_FORM = "https://docs.google.com/forms/d/e/1FAIpQLSfgtJ-DBn2ffEC1tH8hfSKvpRihmWqV5s_uPVz9Vjdi3vqGkA/formResponse";
const GF = { name: "entry.2092238618", email: "entry.1556369182", org: "entry.479301265", ack: "entry.2109138769" };
async function pushGoogle(map) {
  const p = new URLSearchParams();
  if (map.name) p.set(GF.name, map.name);
  if (map.email) p.set(GF.email, map.email);
  if (map.org) p.set(GF.org, map.org);
  p.set(GF.ack, "Yes");
  try {
    await fetch(GF_FORM, { method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: p.toString() });
  } catch (_) {}
}
async function pushBackend(path, payload) {
  try {
    await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    return true;
  } catch (_) { return false; }
}

// Lead capture
async function send(e) {
  e.preventDefault();
  const f = e.target;
  const data = {
    name: f.name.value, company: f.company.value, email: f.email.value,
    hood: f.hood.value, brief: f.brief.value, ts: new Date().toISOString()
  };
  try { localStorage.setItem('backpanel_lead_' + Date.now(), JSON.stringify(data)); } catch (_) {}
  await Promise.all([
    pushBackend('/api/leads', data),
    pushGoogle({ name: data.name, email: data.email, org: data.company })
  ]);
  const subject = encodeURIComponent('BACKPANEL brief: ' + data.company);
  const body = encodeURIComponent(
    `Name: ${data.name}\nCompany: ${data.company}\nEmail: ${data.email}\n` +
    `Hood: ${data.hood}\nBrief: ${data.brief}`
  );
  window.location.href = `mailto:founders@backpanel.in?subject=${subject}&body=${body}`;
  document.getElementById('formMsg').textContent = 'Brief sent — we\'ll email you back within 24 hours.';
  f.reset();
  return false;
}

// Pitch-on-Wheels
async function sendPitch(e) {
  e.preventDefault();
  const f = e.target;
  const payload = {
    founder_name: f.founder_name.value,
    company: f.company.value,
    pitch_url: f.pitch_url.value
  };
  const msg = document.getElementById('pitchMsg');
  await Promise.all([
    pushBackend('/api/pitch', payload),
    pushGoogle({ name: payload.founder_name, org: payload.company })
  ]);
  const subject = encodeURIComponent('Pitch on Wheels: ' + payload.company);
  const body = encodeURIComponent(`Founder: ${payload.founder_name}\nCompany: ${payload.company}\nPitch: ${payload.pitch_url}`);
  window.location.href = `mailto:founders@backpanel.in?subject=${subject}&body=${body}`;
  msg.textContent = 'Pitch submitted — if it wins, we wrap 50 autos.';
  f.reset();
  return false;
}

// Auto-dismiss social badge after 8s
setTimeout(() => {
  const badge = document.getElementById('socialBadge');
  if (badge) badge.style.opacity = '0';
}, 8000);

document.addEventListener('DOMContentLoaded', calc);
