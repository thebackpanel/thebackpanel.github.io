"use strict";
// ============================================================
// BACKPANEL — Application Entry (TypeScript Strict Transpiled)
// Anti-Cutoff Aware | Skeleton Loaders | Reduced Motion Safe
// ============================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// ── Constants ──────────────────────────────────────────────
var GF_CONFIG = {
    endpoint: "https://docs.google.com/forms/d/e/1FAIpQLSfgtJ-DBn2ffEC1tH8hfSKvpRihmWqV5s_uPVz9Vjdi3vqGkA/formResponse",
    fields: {
        name: "entry.2092238618",
        email: "entry.1556369182",
        org: "entry.479301265",
        ack: "entry.2109138769"
    }
};
var IMPRESSIONS_PER_AUTO_PER_DAY = 10000;
var CPM_MODELED = 0.33;
// ── Navigation Scroll Effect ───────────────────────────────
function initNavScroll() {
    var nav = document.getElementById("nav");
    if (!nav)
        return;
    var onScroll = function () {
        nav.setAttribute("data-scrolled", String(window.scrollY > 20));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
}
// ── Reach Estimator ────────────────────────────────────────
function calcReach(autos, days) {
    var totalImpressions = autos * IMPRESSIONS_PER_AUTO_PER_DAY * days;
    var estimatedCost = (totalImpressions / 1000) * CPM_MODELED;
    return { totalImpressions: totalImpressions, estimatedCost: estimatedCost, cpm: CPM_MODELED };
}
function calc() {
    var autosEl = document.getElementById("autos");
    var daysEl = document.getElementById("days");
    var reachOutEl = document.getElementById("reachOut");
    if (!autosEl || !daysEl || !reachOutEl)
        return;
    var autos = parseInt(autosEl.value, 10) || 0;
    var days = parseInt(daysEl.value, 10) || 0;
    var result = calcReach(autos, days);
    reachOutEl.textContent = "\u2248 " + result.totalImpressions.toLocaleString("en-IN") + " impressions \u00B7 est. media cost \u20B9" + Math.round(result.estimatedCost).toLocaleString("en-IN") + " (from \u20B9" + result.cpm + " CPM, modeled)";
}
// ── Google Form Push (best-effort) ─────────────────────────
function pushGoogle(map) {
    return __awaiter(this, void 0, void 0, function () {
        var p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    p = new URLSearchParams();
                    if (map.name)
                        p.set(GF_CONFIG.fields.name, map.name);
                    if (map.email)
                        p.set(GF_CONFIG.fields.email, map.email);
                    if (map.org)
                        p.set(GF_CONFIG.fields.org, map.org);
                    p.set(GF_CONFIG.fields.ack, "Yes");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, fetch(GF_CONFIG.endpoint, {
                            method: "POST",
                            mode: "no-cors",
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: p.toString()
                        })];
                case 2:
                    _a.sent();
                    return [3, 4];
                case 3:
                    _a.sent();
                    return [2];
            }
        });
    });
}
// ── Backend Push ───────────────────────────────────────────
function pushBackend(path, payload) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, fetch(path, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                        })];
                case 1:
                    _a.sent();
                    return [2, true];
                case 2:
                    _a.sent();
                    return [2, false];
            }
        });
    });
}
// ── Lead Form Handler ──────────────────────────────────────
function sendLead(e) {
    return __awaiter(this, void 0, void 0, function () {
        var f, getName, data, subject, body, formMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    f = e.target;
                    getName = function (n) {
                        var _a;
                        return ((_a = f.elements.namedItem(n)) === null || _a === void 0 ? void 0 : _a.value) || "";
                    };
                    data = {
                        name: getName("name"),
                        company: getName("company"),
                        email: getName("email"),
                        hood: getName("hood"),
                        brief: getName("brief"),
                        ts: new Date().toISOString()
                    };
                    try {
                        localStorage.setItem("backpanel_lead_" + Date.now(), JSON.stringify(data));
                    }
                    catch (_b) { }
                    return [4, Promise.all([
                            pushBackend("/api/leads", data),
                            pushGoogle({ name: data.name, email: data.email, org: data.company })
                        ])];
                case 1:
                    _a.sent();
                    subject = encodeURIComponent("BACKPANEL brief: " + data.company);
                    body = encodeURIComponent("Name: " + data.name + "\nCompany: " + data.company + "\nEmail: " + data.email + "\nHood: " + data.hood + "\nBrief: " + data.brief);
                    window.location.href = "mailto:founders@backpanel.in?subject=" + subject + "&body=" + body;
                    formMsg = document.getElementById("formMsg");
                    if (formMsg)
                        formMsg.textContent = "Brief sent \u2014 we'll email you back within 24 hours.";
                    f.reset();
                    return [2, false];
            }
        });
    });
}
// ── Pitch Form Handler ─────────────────────────────────────
function sendPitch(e) {
    return __awaiter(this, void 0, void 0, function () {
        var f, getName, payload, msg, subject, body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    f = e.target;
                    getName = function (n) {
                        var _a;
                        return ((_a = f.elements.namedItem(n)) === null || _a === void 0 ? void 0 : _a.value) || "";
                    };
                    payload = {
                        founder_name: getName("founder_name"),
                        company: getName("company"),
                        pitch_url: getName("pitch_url")
                    };
                    msg = document.getElementById("pitchMsg");
                    return [4, Promise.all([
                            pushBackend("/api/pitch", payload),
                            pushGoogle({ name: payload.founder_name, org: payload.company })
                        ])];
                case 1:
                    _a.sent();
                    subject = encodeURIComponent("Pitch on Wheels: " + payload.company);
                    body = encodeURIComponent("Founder: " + payload.founder_name + "\nCompany: " + payload.company + "\nPitch: " + payload.pitch_url);
                    window.location.href = "mailto:founders@backpanel.in?subject=" + subject + "&body=" + body;
                    if (msg)
                        msg.textContent = "Pitch submitted \u2014 if it wins, we wrap 50 autos.";
                    f.reset();
                    return [2, false];
            }
        });
    });
}
// ── Skeleton Loader Helpers ────────────────────────────────
function showSkeleton(elementId, count) {
    if (count === void 0) { count = 3; }
    var el = document.getElementById(elementId);
    if (!el)
        return;
    var skeletons = Array.from({ length: count }, function () {
        var div = document.createElement("div");
        div.className = "skeleton skeleton-text";
        div.style.marginBottom = "12px";
        div.setAttribute("aria-hidden", "true");
        return div;
    });
    el.innerHTML = "";
    skeletons.forEach(function (s) { return el.appendChild(s); });
}
function removeSkeleton(elementId) {
    var el = document.getElementById(elementId);
    if (el)
        el.innerHTML = "";
}
// ── Social Badge Auto-dismiss ──────────────────────────────
function initSocialBadge() {
    setTimeout(function () {
        var badge = document.getElementById("socialBadge");
        if (badge) {
            badge.style.opacity = "0";
            setTimeout(function () {
                badge.style.display = "none";
            }, 300);
        }
    }, 8000);
    var closeBtn = document.querySelector(".social-badge .close");
    if (closeBtn) {
        closeBtn.addEventListener("click", function () {
            var badge = document.getElementById("socialBadge");
            if (badge)
                badge.style.display = "none";
        });
    }
}
// ── External Link Security ─────────────────────────────────
function secureExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
        link.setAttribute("rel", "noopener noreferrer");
    });
}
// ── Init ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
    initNavScroll();
    initSocialBadge();
    secureExternalLinks();
    calc();
    var leadForm = document.getElementById("leadForm");
    if (leadForm)
        leadForm.addEventListener("submit", sendLead);
    var pitchForm = document.getElementById("pitchForm");
    if (pitchForm)
        pitchForm.addEventListener("submit", sendPitch);
});
