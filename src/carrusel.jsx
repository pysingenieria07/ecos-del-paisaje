// Carrusel de renders de Ecos del Paisaje.
// Adaptado de "Warp Carousel" de Louis Studios (https://studios.lou15.com/?ref=21st-code):
// misma geometría, curva de giro y lente; las tarjetas pintan una imagen en vez de una cifra.
// Se compila a js/carrusel.js con:  npx esbuild src/carrusel.jsx --bundle --minify --alias:react=preact/compat --outfile=js/carrusel.js

import * as React from "react";
import { render } from "preact";

const TITLE_FONT = '"Big Shoulders Display", "Arial Narrow", sans-serif';
const LABEL_FONT = '"Big Shoulders Text", "Arial Narrow", sans-serif';

/* ---------- Geometría (unidades de escenario: 720 de ancho; tarjeta 256 × 320) ---------- */
const CW = 256;
const CH = 320;
const CR = 10;
const FOCAL = 734.103;
const G = {
  qA: 0.46401, XLA: 165.774, zA: 35.354, psiA: 1.44638, a1: 1.31454, a2: 1.10948,
  qB: 0.74999, XB: 204.525, ZB: 355.405, bB: 0.69311, bE: 0.04614, vC: 203.134, aC: 229.260,
  kB: 0.01087, bP: 0.99129, qPR: 1.01828, bPL: 1.00920, qPL: 1.07139,
};

function poseAt(q0) {
  let q = q0;
  if (Math.abs(q) < 1) q -= G.kB * Math.sin(Math.PI * q) ** 2;
  const s = q < 0 ? -1 : 1;
  const a = Math.abs(q);
  const half = CW / 2;
  if (a <= G.qA) {
    const t = a / G.qA;
    const xl = -half + (G.XLA + half) * Math.pow(t, G.a1);
    const zl = G.zA * t ** 4;
    const psi = G.psiA * Math.pow(t, G.a2);
    return [s * (xl + half * Math.cos(psi)), zl + half * Math.sin(psi), s * psi];
  }
  const dXL = ((G.XLA + half) * G.a1) / G.qA;
  const dZL = (G.zA * 4) / G.qA;
  const dps = (G.psiA * G.a2) / G.qA;
  let Hx;
  let Hz;
  if (a <= G.qB) {
    const L = G.qB - G.qA;
    const t = (a - G.qA) / L;
    const hx = G.XLA + CW * Math.cos(G.psiA);
    const hz = G.zA + CW * Math.sin(G.psiA);
    const dhx = dXL - CW * Math.sin(G.psiA) * dps;
    const dhz = dZL + CW * Math.cos(G.psiA) * dps;
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
    const h10 = t ** 3 - 2 * t ** 2 + t;
    const h01 = -2 * t ** 3 + 3 * t ** 2;
    const h11 = t ** 3 - t ** 2;
    Hx = h00 * hx + h10 * L * dhx * G.bB + h01 * G.XB + h11 * L * G.vC * G.bE;
    Hz = h00 * hz + h10 * L * dhz * G.bB + h01 * G.ZB;
  } else {
    const d = a - G.qB;
    Hx = G.XB + G.vC * d + G.aC * d * d;
    Hz = G.ZB;
  }
  const qP = s < 0 ? G.qPL : G.qPR;
  const bP = s < 0 ? G.bPL : G.bP;
  const LP = qP - G.qA;
  const tp = Math.min(1, (a - G.qA) / LP);
  const psi = (2 * tp ** 3 - 3 * tp ** 2 + 1) * G.psiA + (tp ** 3 - 2 * tp ** 2 + tp) * LP * dps * bP + (-2 * tp ** 3 + 3 * tp ** 2) * Math.PI;
  return [s * (Hx - half * Math.cos(psi)), Hz - half * Math.sin(psi), s * psi];
}

/* Curva de giro */
const TK = [0, 3, 6, 8, 10, 11, 12, 13, 14, 16, 18, 21, 25, 30, 36, 45, 55, 70, 88, 110];
const TB = [0, 0.02175, 0.12069, 0.22549, 0.35493, 0.43254, 0.51436, 0.5952, 0.6751, 0.83199, 0.9709, 1.12669, 1.27958, 1.40975, 1.53561, 1.68385, 1.79183, 1.89191, 1.95233, 2];
const DRIFT = 0.06511;
const REST_PHASE = 81.828;
const STEP_FRAMES = 110;

const SLOPES = (() => {
  const n = TK.length;
  const h = TK.slice(1).map((x, i) => x - TK[i]);
  const dl = h.map((hi, i) => (TB[i + 1] - TB[i]) / hi);
  const d = new Array(n).fill(0);
  for (let k = 1; k < n - 1; k++) {
    if (dl[k - 1] * dl[k] <= 0) d[k] = 0;
    else {
      const w1 = 2 * h[k] + h[k - 1];
      const w2 = h[k] + 2 * h[k - 1];
      d[k] = (w1 + w2) / (w1 / dl[k - 1] + w2 / dl[k]);
    }
  }
  const v = (dl[0] + dl[n - 2]) / 2;
  d[0] = v;
  d[n - 1] = v;
  return d;
})();

function spin(frames) {
  if (frames <= 0) return 0;
  if (frames >= STEP_FRAMES) return 1;
  let i = 0;
  while (i < TK.length - 2 && frames > TK[i + 1]) i++;
  const h = TK[i + 1] - TK[i];
  const t = (frames - TK[i]) / h;
  const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
  const h10 = t ** 3 - 2 * t ** 2 + t;
  const h01 = -2 * t ** 3 + 3 * t ** 2;
  const h11 = t ** 3 - t ** 2;
  return (h00 * TB[i] + h10 * h * SLOPES[i] + h01 * TB[i + 1] + h11 * h * SLOPES[i + 1]) / 2;
}

function spinN(frames, n) {
  if (n <= STEP_FRAMES + 0.5) return spin((frames * STEP_FRAMES) / Math.max(1, n));
  const knee = 80;
  if (frames <= knee) return spin(frames);
  return spin(knee + ((frames - knee) * (STEP_FRAMES - knee)) / (n - knee));
}

const LEAD = (STEP_FRAMES - REST_PHASE) / 30;

/** Ancho del escenario en unidades según el ancho en CSS: 720 en escritorio, más cerrado en celular. */
const stageW = (cssW) => Math.max(430, Math.min(720, cssW * 0.9));

/* ---------- Color ---------- */
function parseColor(c, fallback = [0, 0, 0]) {
  const s = (c || "").trim();
  const m = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = h.split("").map((x) => x + x).join("");
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  return fallback;
}

/* ---------- Pintor de tarjeta: imagen recortada + título ---------- */
function paintCard(cv, card, img, idx, total) {
  const w = cv.width;
  const h = cv.height;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const k = w / CW;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#3A1118";
  ctx.fillRect(0, 0, w, h);
  if (img && img.complete && img.naturalWidth) {
    // crop: [x0, y0, x1, y1] en fracciones de la imagen; dentro de esa zona se recorta a la proporción de la tarjeta
    const cr = card.crop || [0, 0, 1, 1];
    const zx = cr[0] * img.naturalWidth;
    const zy = cr[1] * img.naturalHeight;
    const zw = (cr[2] - cr[0]) * img.naturalWidth;
    const zh = (cr[3] - cr[1]) * img.naturalHeight;
    const sc = Math.max(w / zw, h / zh);
    const sw = w / sc;
    const sh = h / sc;
    const fx = card.focus === undefined ? 0.5 : card.focus;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, zx + (zw - sw) * fx, zy + (zh - sh) / 2, sw, sh, 0, 0, w, h);
  }
  let g = ctx.createLinearGradient(0, 0, 0, h * 0.42);
  g.addColorStop(0, "rgba(42, 23, 18, 0.82)");
  g.addColorStop(1, "rgba(42, 23, 18, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h * 0.42);
  g = ctx.createLinearGradient(0, h * 0.72, 0, h);
  g.addColorStop(0, "rgba(42, 23, 18, 0)");
  g.addColorStop(1, "rgba(42, 23, 18, 0.8)");
  ctx.fillStyle = g;
  ctx.fillRect(0, h * 0.72, w, h * 0.28);

  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#E0A85E";
  ctx.font = `600 11px ${LABEL_FONT}`;
  ctx.fillText(String(idx + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0"), 17, 28);
  ctx.fillStyle = "#F1E6D6";
  ctx.font = `800 27px ${TITLE_FONT}`;
  (card.title || "").toUpperCase().split("\n").slice(0, 2).forEach((ln, i) => ctx.fillText(ln, 16, 56 + i * 25));
  if (card.footer) {
    ctx.font = `600 11.5px ${LABEL_FONT}`;
    ctx.fillText(card.footer.toUpperCase(), 17, 300);
  }
}

function glowShape(pose) {
  const [px, pz, ps] = pose;
  const c = Math.cos(ps);
  const sn = Math.sin(ps);
  if (c <= 0.02) return [0, 1, 0];
  const A = px;
  const B = FOCAL + pz;
  const tNear = B - 0.5 * CW * Math.abs(sn);
  let m = 0;
  let mx = 0;
  let mxx = 0;
  for (let u = -360; u <= 360; u += 3) {
    const h = Math.exp(-((Math.abs(u - 9) / 138) ** 4));
    if (h < 0.003) continue;
    const k = u / 1.8 / FOCAL;
    const den = sn * k - c;
    if (Math.abs(den) < 1e-4) continue;
    const s = (A - B * k) / den;
    const t = B + s * sn;
    if (t < 4) continue;
    if ((u / 1.8 / FOCAL) * t * sn - t * c >= 0) continue;
    const dsdk = (B * c - A * sn) / (den * den);
    const soft = Math.min(Math.abs(dsdk / FOCAL) * 2.2, 40) + 0.5;
    const cov = Math.max(0, Math.min(1, (CW * 0.5 - Math.abs(s)) / soft + 0.5));
    if (cov <= 0) continue;
    const near = Math.min(1, FOCAL / t);
    const rel = Math.exp(-((Math.max(t - tNear, 0) / 36) ** 1.5));
    const w = cov * near * near * rel * c * h;
    m += w;
    mx += w * u;
    mxx += w * u * u;
  }
  if (m < 0.5) return [0, 1, 0];
  const mu = mx / m;
  const sd = Math.sqrt(Math.max(1, mxx / m - mu * mu));
  const r = Math.max(6, sd / 0.581);
  return [mu, r, (m * 3) / (1.813 * r)];
}

/* ---------- WebGL ---------- */
const VERT = `#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
precision highp sampler2DArray;
uniform sampler2DArray uTex;
uniform vec2 uRes;
uniform float uUnit;
uniform vec4 uPose[8];
uniform vec3 uGlowCol[8];
uniform vec3 uGlowShape[8];
uniform vec3 uBg;
uniform float uWarp;
uniform float uMix;
out vec4 outColor;

const float F = ${FOCAL.toFixed(2)};
const float CW = ${CW.toFixed(1)};
const float CH = ${CH.toFixed(1)};
const float CR = ${CR.toFixed(1)};

float lensH(float a){
  if (a <= 232.0) return a;
  float k[9] = float[9](232.0, 238.0, 245.0, 253.0, 262.0, 275.0, 295.0, 325.0, 360.0);
  float d[9] = float[9](1.1759, 1.0671, 1.0156, 1.0965, 0.6487, 0.2700, -0.1991, -0.4782, -0.0318);
  float s = 232.0;
  for (int i = 0; i < 8; i++){
    if (a <= k[i]) break;
    float x = min(a, k[i+1]);
    float t = (x - k[i]) / (k[i+1] - k[i]);
    s += (x - k[i]) * mix(1.0, mix(d[i], d[i+1], t * 0.5), uWarp);
  }
  if (a > 360.0) s += (a - 360.0) * mix(1.0, d[8], uWarp);
  return s;
}
float lensS(float a){
  float t = clamp((a - 262.0) / 93.0, 0.0, 2.0);
  return 1.0 + uWarp * (0.42 * pow(t, 1.5) + 0.045 * smoothstep(320.0, 360.0, a));
}

float sdRound(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec4 shadeCard(vec4 pose, vec2 ps, float fx, float fy, out float depth){
  depth = 1e9;
  if (pose.w < 0.0) return vec4(0.0);
  float k = ps.x / F;
  float c = cos(pose.z), sn = sin(pose.z);
  float den = sn * k - c;
  if (abs(den) < 1e-5) return vec4(0.0);
  float A = pose.x, B = F + pose.y;
  float s = (A - B * k) / den;
  float t = B + s * sn;
  if (t < 4.0) return vec4(0.0);
  float y = t * ps.y / F;
  float dsdk = (B * c - A * sn) / (den * den);
  float fs = min(abs(dsdk / F) * fx, 48.0);
  float fyc = min(t / F * fy, 48.0);
  vec2 p = vec2(s, y);
  float d = sdRound(p, vec2(CW, CH) * 0.5, CR);
  vec2 q = abs(p) - vec2(CW, CH) * 0.5 + CR;
  vec2 n = q.x > q.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  if (q.x > 0.0 && q.y > 0.0) n = normalize(q);
  float fp = length(vec2(fs * n.x, fyc * n.y)) + 1e-4;
  if (d > fp) return vec4(0.0);
  float cov = clamp(0.5 - d / fp, 0.0, 1.0);
  if (cov <= 0.0) return vec4(0.0);
  vec2 uv = vec2(s / CW + 0.5, 0.5 - y / CH);
  if (c < 0.0) uv.x = 1.0 - uv.x;
  vec4 tex = textureGrad(uTex, vec3(uv, pose.w), vec2(fs / CW, 0.0), vec2(0.0, fyc / CH));
  depth = t;
  return vec4(tex.rgb, 1.0) * cov;
}

vec4 scene(vec2 ps, float fx, float fy, int base){
  vec4 col[4];
  float dep[4];
  for (int i = 0; i < 4; i++) col[i] = shadeCard(uPose[base + i], ps, fx, fy, dep[i]);
  for (int i = 0; i < 3; i++)
    for (int j = 0; j < 3; j++)
      if (j < 3 - i && dep[j] > dep[j+1]) {
        float td = dep[j]; dep[j] = dep[j+1]; dep[j+1] = td;
        vec4 tc = col[j]; col[j] = col[j+1]; col[j+1] = tc;
      }
  vec4 acc = vec4(0.0);
  for (int i = 0; i < 4; i++) acc += (1.0 - acc.a) * col[i];
  return acc;
}

vec4 glowAt(vec2 pu, float halfH, int base){
  vec4 sum = vec4(0.0);
  float gH = min(halfH, 288.0);
  float dy = min(abs((gH - 11.0) - pu.y), abs(pu.y + (gH - 12.0)));
  if (dy > 40.0) return sum;
  for (int i = 0; i < 4; i++){
    vec3 sh = uGlowShape[base + i];
    if (sh.z <= 0.0) continue;
    float E = exp(-pow(abs(pu.x - sh.x) / sh.y, 4.0));
    if (E < 0.002) continue;
    float v = exp(-pow(dy / (18.5 * (0.45 + 0.55 * sqrt(E))), 3.0));
    float w = sh.z * E * v;
    sum += vec4(uGlowCol[base + i] * w, w);
  }
  return sum;
}

vec3 stage(vec2 pu, float halfH, int base){
  vec4 g = glowAt(pu, halfH, base);
  if (g.a <= 0.0) return uBg;
  float I = clamp(g.a, 0.0, 1.0);
  vec3 drop = uBg - g.rgb / g.a;
  return uBg - drop * pow(vec3(I), vec3(0.8, 1.6, 1.0));
}

vec3 render(vec2 pu, float halfH, int base){
  float au = min(abs(pu.x), 360.0);
  float px = 1.0 / uUnit;
  vec3 bg = stage(pu, halfH, base);
  if (au < 236.0 || uWarp <= 0.0) {
    vec4 c = scene(pu, px, px, base);
    return c.rgb + (1.0 - c.a) * bg;
  }
  float e = 0.064 * uWarp * smoothstep(275.0, 360.0, au);
  float S0 = lensS(au);
  float sg = pu.x < 0.0 ? -1.0 : 1.0;
  float blur = 1.0 + 30.0 * pow(smoothstep(240.0, 340.0, au), 1.5) * uWarp;
  float fyb = 1.0 + 15.0 * smoothstep(280.0, 352.0, au) * uWarp;
  float gain = 1.0 + 0.17 * smoothstep(285.0, 350.0, au) * uWarp;
  vec3 acc;
  for (int ch = 0; ch < 3; ch++){
    float off = uWarp * (ch == 0 ? -20.92 : (ch == 1 ? 0.0 : 11.91));
    float h = lensH(au) + off * smoothstep(289.8, 344.9, au);
    float h0 = lensH(au - 0.5) + off * smoothstep(289.8, 344.9, au - 0.5);
    float h1 = lensH(au + 0.5) + off * smoothstep(289.8, 344.9, au + 0.5);
    float fx = px * max(abs(h1 - h0), 0.02) * blur;
    float S = S0 * (ch == 0 ? 1.0 + e : (ch == 1 ? 1.0 : 1.0 - e));
    vec4 c = scene(vec2(sg * h, pu.y / S), fx, px / S * fyb, base);
    c.rgb = min(c.rgb * gain, vec3(c.a));
    acc[ch] = (c.rgb + (1.0 - c.a) * bg)[ch];
  }
  return acc;
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 pu = (fc - 0.5 * uRes) / uUnit;
  float halfH = 0.5 * uRes.y / uUnit;
  vec3 col = render(pu, halfH, 0);
  if (uMix > 0.0) col = mix(col, render(pu, halfH, 4), uMix);
  outColor = vec4(col, 1.0);
}`;

function createGL(canvas) {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  if (!gl) return null;
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT);
  const fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "aPos");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(prog));
    return null;
  }
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture();
  const loc = {};
  for (const n of ["uTex", "uRes", "uUnit", "uPose", "uGlowCol", "uGlowShape", "uBg", "uWarp", "uMix"]) loc[n] = gl.getUniformLocation(prog, n);
  const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
  return { gl, prog, tex, loc, aniso };
}

function uploadCards(st, canvases) {
  const { gl, tex } = st;
  const w = canvases[0].width;
  const h = canvases[0].height;
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
  gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, w, h, canvases.length, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  canvases.forEach((cv, i) => {
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, w, h, 1, gl.RGBA, gl.UNSIGNED_BYTE, cv);
  });
  gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  if (st.aniso) gl.texParameterf(gl.TEXTURE_2D_ARRAY, st.aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
}

/* ---------- Respaldo en Canvas 2D (sin lente) ---------- */
function drawFallback(ctx, w, h, unit, poses, canvases, bg, glows) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const gH = Math.min(h / 2 / unit, 288);
  for (const p of poses) {
    if (p.layer < 0) continue;
    const [mu, r, amp] = glowShape(p.pose);
    const a = Math.min(1, amp) * 0.9;
    if (a < 0.01) continue;
    const rx = r * 1.35 * unit;
    const col = glows[p.layer] || [164, 88, 59];
    const rgb = `${col[0]}, ${col[1]}, ${col[2]}`;
    for (const yy of [h / 2 - (gH - 11) * unit, h / 2 + (gH - 12) * unit]) {
      ctx.save();
      ctx.translate(w / 2 + mu * unit, yy);
      ctx.scale(1, (20 * unit) / rx);
      const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      rg.addColorStop(0, `rgba(${rgb}, ${a})`);
      rg.addColorStop(0.55, `rgba(${rgb}, ${a * 0.55})`);
      rg.addColorStop(1, `rgba(${rgb}, 0)`);
      ctx.fillStyle = rg;
      ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx.restore();
    }
  }
  const proj = (X, Zb, Y) => {
    const D = FOCAL + Zb;
    return [w / 2 + ((X * FOCAL) / D) * unit, h / 2 - ((Y * FOCAL) / D) * unit];
  };
  const items = poses
    .filter((p) => p.layer >= 0)
    .map((p) => ({ ...p, depth: p.pose[1] }))
    .sort((a, b) => b.depth - a.depth);
  const strips = 32;
  const eps = 1.5 / Math.max(unit, 0.25);
  const half = CW / 2;
  const edgeY = (sv) => {
    const dx = Math.abs(sv) - (half - CR);
    if (dx <= 0) return CH / 2;
    return CH / 2 - CR + Math.sqrt(Math.max(0, CR * CR - Math.min(dx, CR) ** 2));
  };
  for (const it of items) {
    const [cx, zb, psi] = it.pose;
    const cv = canvases[it.layer];
    if (!cv) continue;
    const tpu = cv.width / CW;
    const cs = Math.cos(psi);
    const sn = Math.sin(psi);
    const at = (sv, y) => proj(cx + sv * cs, zb + sv * sn, y);
    for (let i = 0; i < strips; i++) {
      const s0 = -half + (CW * i) / strips - (i > 0 ? eps : 0);
      const s1 = -half + (CW * (i + 1)) / strips + (i < strips - 1 ? eps : 0);
      if (FOCAL + zb + s0 * sn < 10 || FOCAL + zb + s1 * sn < 10) continue;
      const n = Math.abs(s0) > half - CR - 1 || Math.abs(s1) > half - CR - 1 ? 6 : 1;
      ctx.save();
      ctx.beginPath();
      for (let k = 0; k <= n; k++) {
        const sv = Math.max(-half, Math.min(half, s0 + ((s1 - s0) * k) / n));
        const pt = at(sv, edgeY(sv));
        if (k === 0) ctx.moveTo(pt[0], pt[1]);
        else ctx.lineTo(pt[0], pt[1]);
      }
      for (let k = n; k >= 0; k--) {
        const sv = Math.max(-half, Math.min(half, s0 + ((s1 - s0) * k) / n));
        const pt = at(sv, -edgeY(sv));
        ctx.lineTo(pt[0], pt[1]);
      }
      ctx.closePath();
      ctx.clip();
      const sm = (s0 + s1) / 2;
      const tl = at(s0, CH / 2);
      const tr = at(s1, CH / 2);
      const mt = at(sm, CH / 2);
      const mb = at(sm, -CH / 2);
      const sx0 = (s0 + half) * tpu;
      const sw = (s1 - s0) * tpu;
      const ov = 1.025;
      const a = (tr[0] - tl[0]) / sw;
      const b = (tr[1] - tl[1]) / sw;
      const c = ((mb[0] - mt[0]) / cv.height) * ov;
      const d = ((mb[1] - mt[1]) / cv.height) * ov;
      const smx = (sm + half) * tpu;
      const ox = (mt[0] + mb[0]) / 2 - a * smx - c * (cv.height / 2);
      const oy = (mt[1] + mb[1]) / 2 - b * smx - d * (cv.height / 2);
      ctx.setTransform(a, b, c, d, ox, oy);
      const x0 = Math.max(0, sx0 - 1);
      const x1 = Math.min(cv.width, sx0 + sw + 1);
      ctx.drawImage(cv, x0, 0, x1 - x0, cv.height, x0, 0, x1 - x0, cv.height);
      ctx.restore();
    }
  }
}

/* ---------- Componente ---------- */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

const mod = (a, n) => ((a % n) + n) % n;

export function WarpCarousel({
  cards,
  autoplay = true,
  interval = 4.5,
  step = 1,
  background = "#EDE3D3",
  warp = 0,
  glow,
  ariaLabel = "Renders del proyecto",
  onSelect,
  onFrontChange,
  onReady,
  scrollDrive = null,
  style,
}) {
  const wrapRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const reduced = usePrefersReducedMotion();
  const list = React.useMemo(() => {
    const out = [];
    while (out.length < 4) out.push(...cards);
    return out;
  }, [cards]);
  const realCount = cards.length;
  const N = list.length;
  const stepN = Math.max(1, Math.round(step));
  const gap = Math.max(0.5, interval);

  const [current, setInner] = React.useState(0);
  // 'gl' usa WebGL2; si el navegador no lo dibuja bien se pasa a '2d' con un lienzo nuevo
  const [modo, setModo] = React.useState(() => (createGL(document.createElement("canvas")) ? "gl" : "2d"));

  const live = React.useRef({
    P: 0, from: 0, to: 0, t0: 0, n: STEP_FRAMES, v: 0, mode: "rest",
    nextAuto: Infinity, autoPending: false, fadeFrom: 0, fadeT0: 0,
    dragX: 0, dragP: 0, downX: 0, moved: false, lastT: 0, visible: true, hiddenAt: 0,
  });
  const props = React.useRef({});
  props.current = { autoplay, gap, stepN, reduced, realCount, onSelect, onFrontChange, onReady, scroll: !!scrollDrive };
  const handles = React.useRef({ kick: () => {}, draw: () => {} });

  const lastIndex = React.useRef(0);
  const request = React.useCallback((next) => setInner(next), []);

  React.useEffect(() => {
    const L = live.current;
    const prev = lastIndex.current;
    lastIndex.current = current;
    if (props.current.onFrontChange) props.current.onFrontChange(mod(current, props.current.realCount));
    if (prev === current) return;
    if (props.current.scroll && !props.current.reduced) return;
    const delta = current - prev;
    const now = performance.now() / 1000;
    const fromAuto = L.autoPending;
    L.autoPending = false;
    if (props.current.reduced) {
      L.fadeFrom = L.P;
      L.P = Math.round(L.P) + delta;
      L.mode = "fade";
      L.fadeT0 = now;
    } else if (L.mode !== "spring") {
      const base = Math.round(L.P - DRIFT) + delta;
      L.from = L.P;
      L.to = base + DRIFT;
      L.t0 = now;
      L.n = fromAuto ? props.current.gap * 30 : STEP_FRAMES;
      L.mode = "spin";
    }
    if (!fromAuto) L.nextAuto = now + props.current.gap;
    handles.current.kick();
  }, [current]);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let gls = modo === "gl" ? createGL(canvas) : null;
    let ctx2d = null;
    let comprobado = false;
    if (!gls) ctx2d = canvas.getContext("2d");
    let cardCanvases = [];
    let texW = 0;
    let raf = 0;
    let disposed = false;
    const bg = parseColor(background, [237, 227, 211]);
    const glowCols = list.map((c) => parseColor(glow || c.glow || "#A4583B"));

    const imgs = list.map((card) => {
      const im = new Image();
      im.decoding = "async";
      im.src = card.image;
      return im;
    });

    const paintAll = (w) => {
      cardCanvases = list.map((card, i) => {
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = Math.round((w * CH) / CW);
        paintCard(cv, card, imgs[i], i % realCount, realCount);
        return cv;
      });
      texW = w;
      if (gls) {
        try {
          uploadCards(gls, cardCanvases);
        } catch (err) {
          console.warn(err);
          setModo("2d");
        }
      }
    };

    let W = 0;
    let H = 0;
    let unit = 1;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      W = Math.max(2, Math.round(r.width * dpr));
      H = Math.max(2, Math.round(r.height * dpr));
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;
      unit = Math.min(W / stageW(r.width), H / 400);
      const want = Math.min(2048, Math.max(512, Math.round(CW * unit * 1.6)));
      if (want !== texW) paintAll(want);
    };

    const poseSet = (P) => {
      const ids = Array.from({ length: N }, (_, c) => ({ c, q: mod(c - P + N / 2, N) - N / 2 }))
        .sort((a, b) => Math.abs(a.q) - Math.abs(b.q))
        .slice(0, 4);
      return ids.map(({ c, q }) => (Math.abs(q) > 2.05 ? { pose: [0, 0, 0], layer: -1 } : { pose: poseAt(q), layer: c }));
    };

    const L = live.current;
    const progressAt = (now) => {
      if (L.mode === "follow") {
        const dt = Math.min(0.05, Math.max(0, now - L.lastT));
        L.lastT = now;
        L.P += (L.to - L.P) * (1 - Math.exp(-dt * 7));
        if (Math.abs(L.to - L.P) < 5e-4) { L.P = L.to; L.mode = "rest"; }
        return { P: L.P, Pb: 0, mix: 0 };
      }
      if (L.mode === "spin") {
        const f = (now - L.t0) * 30;
        L.P = L.from + (L.to - L.from) * spinN(f, L.n);
        if (f >= L.n) L.mode = "rest";
      } else if (L.mode === "spring") {
        const dt = Math.min(0.034, Math.max(0, now - L.lastT));
        L.lastT = now;
        const sub = 4;
        for (let i = 0; i < sub; i++) {
          const acc = -60 * (L.P - L.to) - 13 * L.v;
          L.v += (acc * dt) / sub;
          L.P += (L.v * dt) / sub;
        }
        if (Math.abs(L.P - L.to) < 4e-4 && Math.abs(L.v) < 3e-3) {
          L.P = L.to;
          L.v = 0;
          L.mode = "rest";
        }
      } else if (L.mode === "fade") {
        const m = Math.min(1, (now - L.fadeT0) / 0.45);
        if (m >= 1) L.mode = "rest";
        return { P: L.P, Pb: L.fadeFrom, mix: 1 - m * m * (3 - 2 * m) };
      }
      return { P: L.P, Pb: 0, mix: 0 };
    };

    const poseArr = new Float32Array(32);
    const glowArr = new Float32Array(24);
    const shapeArr = new Float32Array(24);
    const fill = (set, off) => {
      set.forEach((s, i) => {
        const j = off + i;
        poseArr[j * 4] = s.pose[0];
        poseArr[j * 4 + 1] = s.pose[1];
        poseArr[j * 4 + 2] = s.pose[2];
        poseArr[j * 4 + 3] = s.layer;
        const gc = s.layer >= 0 ? glowCols[s.layer] : [255, 255, 255];
        glowArr[j * 3] = gc[0] / 255;
        glowArr[j * 3 + 1] = gc[1] / 255;
        glowArr[j * 3 + 2] = gc[2] / 255;
        const gs = s.layer >= 0 ? glowShape(s.pose) : [0, 1, 0];
        shapeArr[j * 3] = gs[0];
        shapeArr[j * 3 + 1] = gs[1];
        shapeArr[j * 3 + 2] = gs[2];
      });
    };

    const draw = (now) => {
      if (disposed) return;
      const { P, Pb, mix } = progressAt(now);
      const setA = poseSet(P);
      if (gls) {
        const { gl, prog, loc } = gls;
        gl.viewport(0, 0, W, H);
        gl.useProgram(prog);
        fill(setA, 0);
        if (mix > 0) fill(poseSet(Pb), 4);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, gls.tex);
        gl.uniform1i(loc.uTex, 0);
        gl.uniform2f(loc.uRes, W, H);
        gl.uniform1f(loc.uUnit, unit);
        gl.uniform4fv(loc.uPose, poseArr);
        gl.uniform3fv(loc.uGlowCol, glowArr);
        gl.uniform3fv(loc.uGlowShape, shapeArr);
        gl.uniform3f(loc.uBg, bg[0] / 255, bg[1] / 255, bg[2] / 255);
        gl.uniform1f(loc.uWarp, Math.max(0, Math.min(1, warp)));
        gl.uniform1f(loc.uMix, mix);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        // una sola vez, con las imágenes ya cargadas: si el centro sigue del color del fondo, WebGL no pintó la tarjeta
        if (!comprobado && L.mode === "rest" && imgs.every((im) => im.complete)) {
          comprobado = true;
          const px = new Uint8Array(4);
          gl.readPixels(W >> 1, H >> 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
          const igual = Math.abs(px[0] - bg[0]) + Math.abs(px[1] - bg[1]) + Math.abs(px[2] - bg[2]) < 12;
          if (igual || gl.getError() !== gl.NO_ERROR) setModo("2d");
          else if (props.current.onReady) props.current.onReady();
        }
      } else if (ctx2d) {
        const css = `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`;
        drawFallback(ctx2d, W, H, unit, setA, cardCanvases, css, glowCols);
        if (mix > 0) {
          ctx2d.globalAlpha = mix;
          drawFallback(ctx2d, W, H, unit, poseSet(Pb), cardCanvases, css, glowCols);
          ctx2d.globalAlpha = 1;
        }
        if (!comprobado && imgs.every((im) => im.complete && im.naturalWidth)) {
          comprobado = true;
          if (props.current.onReady) props.current.onReady();
        }
      }
    };

    const loop = () => {
      raf = 0;
      if (disposed || !L.visible) return;
      const now = performance.now() / 1000;
      const p = props.current;
      if (p.autoplay && !p.scroll && !p.reduced && L.mode !== "drag" && L.mode !== "spring" && now >= L.nextAuto) {
        L.nextAuto = Math.max(L.nextAuto + p.gap, now + p.gap * 0.5);
        L.autoPending = true;
        request(lastIndex.current + p.stepN);
      }
      draw(now);
      const busy = L.mode !== "rest" || (p.autoplay && !p.reduced);
      if (busy) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf && !disposed && L.visible) raf = requestAnimationFrame(loop);
    };
    handles.current = { kick, draw: () => draw(performance.now() / 1000) };

    const t0 = performance.now() / 1000;
    L.P = lastIndex.current + DRIFT;
    L.nextAuto = t0 + props.current.gap * 0.6;

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now() / 1000);
    });
    ro.observe(wrap);

    const setVisible = (vis) => {
      const now = performance.now() / 1000;
      if (vis === L.visible) return;
      if (!vis) L.hiddenAt = now;
      else {
        const dt = now - L.hiddenAt;
        L.t0 += dt;
        L.fadeT0 += dt;
        L.nextAuto += dt;
        L.lastT = now;
      }
      L.visible = vis;
      if (vis) kick();
    };
    let inView = true;
    const io = new IntersectionObserver((ents) => {
      inView = ents.some((e) => e.isIntersecting);
      setVisible(inView && document.visibilityState === "visible");
    });
    io.observe(wrap);
    const onVis = () => setVisible(inView && document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);

    let lost = false;
    const onLost = (e) => {
      e.preventDefault();
      lost = true;
    };
    const onRestored = () => {
      if (!lost) return;
      lost = false;
      gls = createGL(canvas);
      texW = 0;
      resize();
      kick();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    const repaint = () => {
      if (disposed) return;
      texW = 0;
      resize();
      draw(performance.now() / 1000);
    };
    imgs.forEach((im) => im.addEventListener("load", repaint));
    document.fonts?.addEventListener?.("loadingdone", repaint);
    document.fonts?.load?.(`800 27px ${TITLE_FONT}`).then(repaint, () => {});
    document.fonts?.load?.(`600 11px ${LABEL_FONT}`).then(repaint, () => {});

    draw(t0);
    kick();
    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      document.fonts?.removeEventListener?.("loadingdone", repaint);
      if (gls) {
        gls.gl.deleteTexture(gls.tex);
        gls.gl.deleteProgram(gls.prog);
      }
    };
  }, [list, background, warp, glow, N, modo]);

  React.useEffect(() => {
    handles.current.kick();
  }, [autoplay, reduced]);

  // con scrollDrive, girar la rueda es bajar por la página: cada tramo de scroll muestra un render
  React.useEffect(() => {
    if (!scrollDrive) return;
    let raf = 0;
    const leer = () => {
      raf = 0;
      const p = scrollDrive();
      if (p === null) return;
      // cada tramo de scroll es un render: al cruzar al siguiente tramo, la rueda gira sola hasta él
      live.current.nextAuto = Infinity;
      const bruto = p * realCount;
      const objetivo = Math.min(realCount - 1, Math.max(0, Math.floor(bruto)));
      const actual = mod(lastIndex.current, realCount);
      const nuevo = lastIndex.current + (objetivo - actual);
      // dentro de cada tramo la rueda se inclina apenas hacia el siguiente render (±0,1 de tarjeta): responde al scroll sin moverse de más
      const frac = Math.min(1, Math.max(0, bruto - objetivo));
      const extremo = (objetivo === 0 && frac < 0.5) || (objetivo === realCount - 1 && frac > 0.5);
      const inclina = extremo ? 0 : (frac - 0.5) * 0.2;
      const L = live.current;
      if (!props.current.reduced && L.mode !== "drag") {
        if (L.mode !== "follow") L.lastT = performance.now() / 1000;
        L.to = nuevo + DRIFT + inclina;
        L.mode = "follow";
        handles.current.kick();
      }
      if (objetivo !== actual) setInner(nuevo);
    };
    const alMover = () => { if (!raf) raf = requestAnimationFrame(leer); };
    addEventListener("scroll", alMover, { passive: true });
    addEventListener("resize", alMover);
    leer();
    return () => { removeEventListener("scroll", alMover); removeEventListener("resize", alMover); if (raf) cancelAnimationFrame(raf); };
  }, [scrollDrive, realCount]);

  /* ---------- interacción ---------- */
  const unitCss = () => {
    const r = wrapRef.current.getBoundingClientRect();
    return Math.min(r.width / stageW(r.width), r.height / 400);
  };
  const onPointerDown = (e) => {
    if (e.button > 0) return;
    const L = live.current;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    L.mode = "drag";
    L.dragX = e.clientX;
    L.downX = e.clientX;
    L.dragP = L.P;
    L.v = 0;
    L.moved = false;
    L.lastT = performance.now() / 1000;
    handles.current.kick();
  };
  const onPointerMove = (e) => {
    const L = live.current;
    if (L.mode !== "drag") return;
    const now = performance.now() / 1000;
    const P = L.dragP - (e.clientX - L.dragX) / (unitCss() * 300);
    const dt = Math.max(1 / 240, now - L.lastT);
    L.v = 0.6 * L.v + 0.4 * ((P - L.P) / dt);
    L.P = P;
    L.lastT = now;
    if (Math.abs(e.clientX - L.downX) > 5) L.moved = true;
    handles.current.draw();
  };
  const onPointerUp = (e) => {
    const L = live.current;
    if (L.mode !== "drag") return;
    const now = performance.now() / 1000;
    L.nextAuto = now + gap;
    if (!L.moved) {
      L.mode = "rest";
      const r = wrapRef.current.getBoundingClientRect();
      const u = (e.clientX - r.left - r.width / 2) / unitCss();
      if (u > 140) request(lastIndex.current + 1);
      else if (u < -140) request(lastIndex.current - 1);
      else if (props.current.onSelect) props.current.onSelect(mod(lastIndex.current, realCount));
      return;
    }
    if (now - L.lastT > 0.08) L.v = 0;
    const target = Math.round(L.P + L.v * 0.16);
    const from = Math.round(L.dragP - DRIFT);
    L.to = target;
    L.mode = "spring";
    L.lastT = now;
    const next = lastIndex.current + (target - from);
    if (next !== lastIndex.current) {
      lastIndex.current = next;
      setInner(next);
    }
    handles.current.kick();
  };
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onSelect) onSelect(mod(lastIndex.current, realCount));
      return;
    }
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    request(lastIndex.current + (e.key === "ArrowRight" ? 1 : -1));
  };

  const front = list[mod(current, N)];
  return (
    <div
      ref={wrapRef}
      role="region"
      aria-roledescription="carrusel"
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      style={{
        position: "relative", width: "100%", height: "100%", overflow: "hidden", background,
        touchAction: "pan-y", userSelect: "none", WebkitUserSelect: "none", cursor: "grab", ...style,
      }}
    >
      <canvas key={modo} ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>
        {front ? front.alt || front.title.replace("\n", " ") : ""}
      </div>
    </div>
  );
}

/* ---------- Montaje en la página ---------- */
const RENDERS = [
  { image: "img/render-plaza.jpg", title: "Plaza\nde acceso", footer: "Bajo la pérgola curva", caption: "La llegada: la plaza de acceso bajo la pérgola curva de madera.", alt: "Render exterior: plaza escalonada con jardineras de ladrillo y una pérgola curva de madera", focus: 0.42, glow: "#A4583B" },
  { image: "img/render-espejo.jpg", title: "Espejo\nde agua", footer: "Memoria al centro", caption: "El espejo de agua-memoria, centro del proyecto, frente a la biblioteca y las gradas.", alt: "Render exterior: espejo de agua circular con lotos, gradas y la fachada curva de vidrio y madera", focus: 0.5, glow: "#6F9C9F" },
  { image: "img/render-aereo.jpg", title: "El conjunto\ndesde arriba", footer: "La ladera queda verde", caption: "El conjunto construido: los volúmenes abrazan la plaza y la ladera queda verde.", alt: "Render aéreo del conjunto: volúmenes de madera alrededor de la plaza y el espejo de agua", focus: 0.5, glow: "#6E6A3A" },
  { image: "img/render-biblioteca-gradas.jpg", title: "Biblioteca", footer: "Gradas para leer", caption: "La biblioteca: estanterías de madera, gradas de lectura y la cubierta de casetones con lucernarios.", alt: "Render interior de la biblioteca con estanterías de madera, gradas y personas leyendo bajo la cubierta de casetones", focus: 0.45, glow: "#CDB99D" },
  { image: "img/render-biblioteca-mirador.jpg", title: "Mirador", footer: "Frente al paisaje", caption: "El mirador: un corredor de vidrio con jardineras, bancas de madera y vista al conjunto.", alt: "Render del mirador: corredor vidriado con jardineras, bancas de madera y vista al conjunto", focus: 0.55, glow: "#CDB99D" },
  { image: "img/render-aulas-habitadas.jpg", title: "Aulas\nhabitadas", footer: "Aprender en terrazas", caption: "Las aulas habitadas: terrazas de madera bajo la cubierta de casetones.", alt: "Render interior de las aulas con personas entre las estanterías", focus: 0.62, glow: "#C98A3E" },
  { image: "img/render-aulas.jpg", title: "Aulas", footer: "Cubierta de casetones", caption: "Las aulas: piso y estanterías de madera, celosías inclinadas y lucernarios.", alt: "Render interior de las aulas: estanterías de madera en terrazas y cubierta de casetones", focus: 0.45, glow: "#6B1E2B" },
];

const raiz = document.getElementById("carrusel-renders");
if (raiz) {
  const pie = document.getElementById("carrusel-pie");
  const abrir = (i) => {
    const visor = document.getElementById("visor");
    if (!visor) return;
    const img = visor.querySelector("img");
    img.src = RENDERS[i].image;
    img.alt = RENDERS[i].alt;
    visor.showModal();
  };
  const seccionG = raiz.closest(".galeria");
  const calmaG = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // contador «04 / 07» y una marca por render, debajo del carrusel
  let cuenta = null;
  let marcas = [];
  if (seccionG) {
    const nav = document.createElement("div");
    nav.className = "galeria__nav";
    nav.setAttribute("aria-hidden", "true");
    nav.innerHTML = '<p class="galeria__cuenta"><span class="galeria__num"><span>01</span></span><span class="galeria__total">/ ' + String(RENDERS.length).padStart(2, "0") + "</span></p>"
      + '<ol class="galeria__marcas">' + RENDERS.map(() => "<li></li>").join("") + "</ol>";
    const ancla = seccionG.querySelector(".galeria__pie");
    if (ancla) ancla.before(nav);
    cuenta = nav.querySelector(".galeria__num");
    marcas = [...nav.querySelectorAll("li")];
  }
  let previo = 0;
  let tPie = 0;
  const alFrente = (i) => {
    marcas.forEach((m, k) => { m.classList.toggle("vista", k <= i); m.classList.toggle("actual", k === i); });
    if (cuenta) {
      const nuevo = document.createElement("span");
      nuevo.textContent = String(i + 1).padStart(2, "0");
      const viejo = cuenta.lastElementChild;
      if (calmaG || !viejo || viejo.textContent === nuevo.textContent) { cuenta.replaceChildren(nuevo); }
      else {
        // el número nuevo entra en la dirección del recorrido: desde abajo al avanzar, desde arriba al volver
        const dir = i > previo ? 1 : -1;
        nuevo.style.transform = "translateY(" + (dir * 100) + "%)";
        cuenta.append(nuevo);
        nuevo.getBoundingClientRect();
        nuevo.style.transform = "";
        viejo.style.transform = "translateY(" + (-dir * 100) + "%)";
        setTimeout(() => viejo.remove(), 320);
      }
    }
    previo = i;
    if (!pie) return;
    if (calmaG) { pie.textContent = RENDERS[i].caption; return; }
    clearTimeout(tPie);
    pie.classList.add("sale");
    tPie = setTimeout(() => {
      pie.textContent = RENDERS[i].caption;
      pie.classList.remove("sale");
      pie.classList.add("entra");
      pie.getBoundingClientRect();
      pie.classList.remove("entra");
    }, 110);
  };
  const listo = () => {
    const g = raiz.closest(".galeria");
    g.classList.add("galeria--viva");
    new IntersectionObserver((ents, o) => { if (ents[0].isIntersecting) { g.classList.add("galeria--en"); o.disconnect(); } }, { threshold: 0.25 }).observe(g.querySelector(".galeria__marco"));
  };
  // cada página puede ajustar la lente y el color del halo: data-warp, data-glow, data-fondo
  const d = raiz.dataset;
  const opc = {};
  if (d.warp) opc.warp = parseFloat(d.warp);
  if (d.glow) opc.glow = d.glow;
  if (d.fondo) opc.background = d.fondo;
  const seccion = raiz.closest(".galeria");
  const calma = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (d.scroll !== undefined && seccion) {
    seccion.classList.add("galeria--scroll");
    seccion.style.setProperty("--pasos", RENDERS.length);
    const avance = seccion.querySelector(".galeria__avance");
    opc.scrollDrive = () => {
      const r = seccion.getBoundingClientRect();
      const recorrido = seccion.offsetHeight - innerHeight;
      if (recorrido <= 0) return null;
      const p = Math.min(0.9999, Math.max(0, -r.top / recorrido));
      if (avance) avance.style.transform = "scaleX(" + p.toFixed(4) + ")";
      return p;
    };
  }
  render(<WarpCarousel cards={RENDERS} onSelect={abrir} onFrontChange={alFrente} onReady={listo} {...opc} />, raiz);
}
