// ============================================================
// BACKPANEL — Main Application Entry (TypeScript)
// Strict mode, full type safety, skeleton loaders, error handling
// ============================================================

/// <reference types="typescript" />

// ── Types ──────────────────────────────────────────────────
interface GoogleFormConfig {
  readonly endpoint: string;
  readonly fields: {
    readonly name: string;
    readonly email: string;
    readonly org: string;
    readonly ack: string;
  };
}

interface LeadFormData {
  name: string;
  company: string;
  email: string;
  hood: string;
  brief: string;
  ts: string;
}

interface PitchFormData {
  founder_name: string;
  company: string;
  pitch_url: string;
}

interface ReachResult {
  totalImpressions: number;
  estimatedCost: number;
  cpm: number;
}

// ── Constants ──────────────────────────────────────────────
const GF_CONFIG: GoogleFormConfig = {
  endpoint:
    "https://docs.google.com/forms/d/e/1FAIpQLSfgtJ-DBn2ffEC1tH8hfSKvpRihmWqV5s_uPVz9Vjdi3vqGkA/formResponse",
  fields: {
    name: "entry.2092238618",
    email: "entry.1556369182",
    org: "entry.479301265",
    ack: "entry.2109138769",
  },
};

const IMPRESSIONS_PER_AUTO_PER_DAY = 10_000; // benchmark midpoint (range 8,000–12,000)
const IMPRESSIONS_LO_PER_DAY = 8_000;
const IMPRESSIONS_HI_PER_DAY = 12_000;
const COST_PER_AUTO_PER_MONTH = 1_600; // all-in reference rate (Neighbourhood ₹40K / 25 autos)

// ── Navigation Scroll Effect ───────────────────────────────
function initNavScroll(): void {
  const nav = document.getElementById("nav");
  if (!nav) return;

  const onScroll = (): void => {
    nav.setAttribute("data-scrolled", String(window.scrollY > 20));
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}

// ── Reach Estimator ────────────────────────────────────────
// CPM is DERIVED here, not assumed:
//   CPM = monthly cost ÷ (autos × benchmark impressions × days ÷ 1,000)
// Same formula as the published math in #math. Check it.
function calcReach(autos: number, days: number): ReachResult {
  const totalImpressions = autos * IMPRESSIONS_PER_AUTO_PER_DAY * days;
  const estimatedCost = autos * COST_PER_AUTO_PER_MONTH * (days / 30);
  const perThousand = (impr: number): number =>
    impr > 0 ? (estimatedCost / impr) * 1000 : 0;
  const cpm = perThousand(totalImpressions);
  const cpmLo = perThousand(autos * IMPRESSIONS_HI_PER_DAY * days);
  const cpmHi = perThousand(autos * IMPRESSIONS_LO_PER_DAY * days);
  return { totalImpressions, estimatedCost, cpm, cpmLo, cpmHi };
}

function calc(): void {
  const autosEl = document.getElementById("autos") as HTMLInputElement | null;
  const daysEl = document.getElementById("days") as HTMLInputElement | null;
  const reachOutEl = document.getElementById("reachOut");

  if (!autosEl || !daysEl || !reachOutEl) return;

  const autos = parseInt(autosEl.value, 10) || 0;
  const days = parseInt(daysEl.value, 10) || 0;

  const result = calcReach(autos, days);

  reachOutEl.textContent = `\u2248 ${result.totalImpressions.toLocaleString("en-IN")} impressions \u00B7 \u2248 \u20B9${Math.round(result.estimatedCost).toLocaleString("en-IN")} all-in (\u20B91,600/auto/month) \u2192 \u2248\u20B9${result.cpm.toFixed(2)} CPM (\u20B9${result.cpmLo.toFixed(2)}\u2013${result.cpmHi.toFixed(2)} across the 8\u201312K benchmark range)`;
}

// ── Google Form Push (best-effort) ─────────────────────────
async function pushGoogle(map: Partial<Record<string, string>>): Promise<void> {
  const p = new URLSearchParams();
  if (map.name) p.set(GF_CONFIG.fields.name, map.name);
  if (map.email) p.set(GF_CONFIG.fields.email, map.email);
  if (map.org) p.set(GF_CONFIG.fields.org, map.org);
  p.set(GF_CONFIG.fields.ack, "Yes");

  try {
    await fetch(GF_CONFIG.endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: p.toString(),
    });
  } catch {
    // best-effort, swallow error
  }
}

// ── Backend Push ───────────────────────────────────────────
async function pushBackend(
  path: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  try {
    await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
}

// ── Lead Form Handler ──────────────────────────────────────
async function sendLead(e: Event): Promise<boolean> {
  e.preventDefault();

  const f = e.target as HTMLFormElement;
  const getName = (n: string): string =>
    (f.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "";

  const data: LeadFormData = {
    name: getName("name"),
    company: getName("company"),
    email: getName("email"),
    hood: getName("hood"),
    brief: getName("brief"),
    ts: new Date().toISOString(),
  };

  try {
    localStorage.setItem(`backpanel_lead_${Date.now()}`, JSON.stringify(data));
  } catch {
    // storage may be full
  }

  await Promise.all([
    pushBackend("/api/leads", data as unknown as Record<string, unknown>),
    pushGoogle({ name: data.name, email: data.email, org: data.company }),
  ]);

  const subject = encodeURIComponent(`BACKPANEL brief: ${data.company}`);
  const body = encodeURIComponent(
    `Name: ${data.name}\nCompany: ${data.company}\nEmail: ${data.email}\nHood: ${data.hood}\nBrief: ${data.brief}`
  );
  window.location.href = `mailto:founders@backpanel.in?subject=${subject}&body=${body}`;

  const formMsg = document.getElementById("formMsg");
  if (formMsg) formMsg.textContent = "Brief sent \u2014 we'll email you back within 24 hours.";
  f.reset();
  return false;
}

// ── Pitch Form Handler ─────────────────────────────────────
async function sendPitch(e: Event): Promise<boolean> {
  e.preventDefault();

  const f = e.target as HTMLFormElement;
  const getName = (n: string): string =>
    (f.elements.namedItem(n) as HTMLInputElement | null)?.value ?? "";

  const payload: PitchFormData = {
    founder_name: getName("founder_name"),
    company: getName("company"),
    pitch_url: getName("pitch_url"),
  };

  const msg = document.getElementById("pitchMsg");

  await Promise.all([
    pushBackend("/api/pitch", payload as unknown as Record<string, unknown>),
    pushGoogle({ name: payload.founder_name, org: payload.company }),
  ]);

  const subject = encodeURIComponent(`Pitch on Wheels: ${payload.company}`);
  const body = encodeURIComponent(
    `Founder: ${payload.founder_name}\nCompany: ${payload.company}\nPitch: ${payload.pitch_url}`
  );
  window.location.href = `mailto:founders@backpanel.in?subject=${subject}&body=${body}`;

  if (msg) msg.textContent = "Pitch submitted \u2014 if it wins, we wrap 50 autos.";
  f.reset();
  return false;
}

// ── Social Badge Auto-dismiss ──────────────────────────────
function initSocialBadge(): void {
  setTimeout(() => {
    const badge = document.getElementById("socialBadge");
    if (badge) {
      badge.style.opacity = "0";
      setTimeout(() => {
        badge.style.display = "none";
      }, 300);
    }
  }, 8000);

  const closeBtn = document.querySelector(".social-badge .close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      const badge = document.getElementById("socialBadge");
      if (badge) badge.style.display = "none";
    });
  }
}

// ── External Link Security ─────────────────────────────────
function secureExternalLinks(): void {
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.setAttribute("rel", "noopener noreferrer");
  });
}

// ── Skeleton Loader Helpers ────────────────────────────────
function showSkeleton(elementId: string, count: number = 3): void {
  const el = document.getElementById(elementId);
  if (!el) return;

  const skeletons = Array.from({ length: count }, () => {
    const div = document.createElement("div");
    div.className = "skeleton skeleton-text";
    div.style.marginBottom = "12px";
    return div;
  });

  el.innerHTML = "";
  skeletons.forEach((s) => el.appendChild(s));
}

function removeSkeleton(elementId: string): void {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = "";
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initNavScroll();
  initSocialBadge();
  secureExternalLinks();
  calc();

  const leadForm = document.getElementById("leadForm");
  if (leadForm) leadForm.addEventListener("submit", sendLead);

  const pitchForm = document.getElementById("pitchForm");
  if (pitchForm) pitchForm.addEventListener("submit", sendPitch);
});
