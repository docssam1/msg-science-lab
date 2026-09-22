// 흙 언덕 물길 시뮬레이션 (화면과 무관한 순수 계산 — node로도 돌릴 수 있다)
// 높이 격자 위에서 물방울 하나하나가 비탈을 따라 굴러 내려가며, 빠르고 가파른 곳에서는 흙을 깎아 싣고(침식·운반)
// 느려지는 곳에서는 실은 흙을 내려놓는다(퇴적). 흙의 양은 보존된다(깎인 만큼 어딘가에 쌓인다).
// 색 모래는 흙 위층의 비율(sand)로 따라다닌다.
export const GRID = { x0: -1.7, x1: 3.0, z0: -1.45, z1: 1.45, nx: 96, nz: 60 };
export const SLOPES = { '완만': 0.95, '가파름': 1.7 };          // 언덕 높이
export const WATERS = { '적게': 260, '많이': 520 };              // 한 번에 붓는 물방울 수
const P = { inertia: 0.12, capacity: 5, minCap: 0.004, erode: 0.35, deposit: 0.25, evap: 0.012, gravity: 5, maxSteps: 140, floor: 0.035 };

const hash = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
function noise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const l = (a, b, t) => a + (b - a) * t;
  return l(l(hash(xi, zi), hash(xi + 1, zi), u), l(hash(xi, zi + 1), hash(xi + 1, zi + 1), u), v);
}

export function createSim(slope = '완만', seed = 1) {
  const { nx, nz, x0, x1, z0, z1 } = GRID, N = (nx + 1) * (nz + 1), dx = (x1 - x0) / nx;
  const h = new Float32Array(N), sand = new Float32Array(N), wet = new Float32Array(N), flow = new Float32Array(N), mud = new Float32Array(N);
  const HH = SLOPES[slope], SIG = 0.72;
  const X = (i) => x0 + i * dx, Z = (j) => z0 + j * dx;
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = X(i), z = Z(j), m = HH * Math.exp(-(x * x + z * z) / (2 * SIG * SIG)) + 0.14 * Math.max(0, (0.6 - x) / 2.3);   // 뒤쪽이 살짝 높아 물이 앞(쟁반 빈 곳)으로 흐른다
    const k = j * (nx + 1) + i;
    h[k] = Math.max(P.floor, m + ((noise(x * 3.1 + seed, z * 3.1) - 0.5) * 0.06 + (noise(x * 9, z * 9 + seed) - 0.5) * 0.02) * (m > 0.05 ? 1 : 0.15));
    sand[k] = m > HH * 0.8 ? Math.min(1, (m - HH * 0.8) / (HH * 0.08)) : 0;
  }
  const sim = { h, sand, wet, flow, mud, nx, nz, dx, HH, drops: [], eroded: 0, deposited: 0, poured: 0, src: { x: 0.22, z: 0 } };
  const idx = (i, j) => j * (nx + 1) + i;
  // 격자 좌표(셀 단위)에서 높이와 기울기(쌍선형)
  function sample(gx, gz) {
    const i = Math.floor(gx), j = Math.floor(gz), u = gx - i, v = gz - j;
    const a = h[idx(i, j)], b = h[idx(i + 1, j)], c = h[idx(i, j + 1)], d = h[idx(i + 1, j + 1)];
    return { hgt: a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v,
      gx: ((b - a) * (1 - v) + (d - c) * v) / dx, gz: ((c - a) * (1 - u) + (d - b) * u) / dx, i, j, u, v };
  }
  // 네 꼭짓점에 가중치로 더하기/빼기
  function put(s, amt, sandFrac) {
    const w = [(1 - s.u) * (1 - s.v), s.u * (1 - s.v), (1 - s.u) * s.v, s.u * s.v], ks = [idx(s.i, s.j), idx(s.i + 1, s.j), idx(s.i, s.j + 1), idx(s.i + 1, s.j + 1)];
    let taken = 0, sandTaken = 0;
    for (let q = 0; q < 4; q++) {
      const k = ks[q];
      if (amt < 0) { const a = Math.min(-amt * w[q], Math.max(0, h[k] - P.floor)); h[k] -= a; taken += a; sandTaken += a * sand[k]; }
      else { const a = amt * w[q], th = 0.04; sand[k] = (sand[k] * th + sandFrac * a) / (th + a); h[k] += a; mud[k] = Math.min(1, mud[k] + a * 30); }
    }
    return { taken, sandTaken };
  }
  sim.spawn = () => {
    const q = sim.poured, jx = ((q * 0.6180339) % 1) - 0.5, jz = ((q * 0.7548777) % 1) - 0.5;   // 흩어짐은 정해진 수열 — 같은 조건이면 같은 결과
    const gx = (sim.src.x - x0) / dx + jx * 1.6, gz = (sim.src.z - z0) / dx + jz * 1.6;
    sim.drops.push({ gx, gz, vx: 0, vz: 0, speed: 0.6, water: 1, sed: 0, sandSed: 0, steps: 0 });
    sim.poured++;
  };
  function settle(d) { if (d.sed > 0) { const s = sample(Math.min(nx - 1.001, Math.max(0, d.gx)), Math.min(nz - 1.001, Math.max(0, d.gz))); put(s, d.sed, d.sed ? d.sandSed / d.sed : 0); sim.deposited += d.sed; d.sed = 0; } }
  // 모든 물방울을 한 걸음씩
  sim.step = () => {
    const alive = [];
    for (const d of sim.drops) {
      const s = sample(d.gx, d.gz);
      d.vx = d.vx * P.inertia - s.gx * (1 - P.inertia); d.vz = d.vz * P.inertia - s.gz * (1 - P.inertia);
      const len = Math.hypot(d.vx, d.vz); if (len > 1e-6) { d.vx /= len; d.vz /= len; }
      const k0 = idx(Math.round(d.gx), Math.round(d.gz)); wet[k0] = 1; flow[k0] = Math.min(1, flow[k0] + 0.8);
      const ngx = d.gx + d.vx * 0.5, ngz = d.gz + d.vz * 0.5; d.steps++;
      if (len < 1e-6 || ngx < 0 || ngz < 0 || ngx >= nx - 1 || ngz >= nz - 1 || d.steps > P.maxSteps || d.water < 0.02) { settle(d); continue; }
      const dh = sample(ngx, ngz).hgt - s.hgt;
      const cap = Math.max(-dh * d.speed * d.water * P.capacity, P.minCap);
      if (d.sed > cap || dh > 0) {
        const amt = dh > 0 ? Math.min(dh, d.sed) : (d.sed - cap) * P.deposit;
        const f = d.sed ? d.sandSed / d.sed : 0; put(s, amt, f); d.sed -= amt; d.sandSed -= amt * f; sim.deposited += amt;
      } else {
        const want = Math.min((cap - d.sed) * P.erode, -dh);
        const { taken, sandTaken } = put(s, -want, 0); d.sed += taken; d.sandSed += sandTaken; sim.eroded += taken;
      }
      d.speed = Math.sqrt(Math.max(0.0001, d.speed * d.speed - dh / dx * P.gravity * 0.1));
      d.water *= 1 - P.evap; d.gx = ngx; d.gz = ngz; alive.push(d);
    }
    sim.drops = alive;
  };
  sim.decay = (dt) => { for (let k = 0; k < N; k++) { flow[k] *= Math.max(0, 1 - dt * 3); wet[k] = Math.max(0, wet[k] - dt * 0.01); } };
  sim.world = (d) => ({ x: x0 + d.gx * dx, z: z0 + d.gz * dx, y: sample(Math.min(nx - 1.001, Math.max(0, d.gx)), Math.min(nz - 1.001, Math.max(0, d.gz))).hgt });
  sim.heightAt = (x, z) => sample(Math.min(nx - 1.001, Math.max(0, (x - x0) / dx)), Math.min(nz - 1.001, Math.max(0, (z - z0) / dx))).hgt;
  return sim;
}
// 흙 부피 → 화면 숫자(칸). 부피 합(높이×셀 넓이)을 적당한 크기로.
export const toCells = (v, dx) => Math.round(v * dx * dx * 5);
