import test from 'node:test';
import assert from 'node:assert/strict';
import { listDilce, souhrnPlanu, unikatniDilce } from '../src/lib/kalkulace/montazniList.js';

const plot = (height, width, quantity, gap, lamellas) => ({ height: String(height), width: String(width), quantity, selectedGap: { gap, lamellas } });

test('3D: hodnoty montážního listu jsou stejné jako na obrazovce', () => {
  const d = listDilce(plot(1533, 3100, 1, 0.4, 14), '3D');
  assert.equal(d.zbytekMm, 49);
  assert.equal(d.mezeraMm.toFixed(1), '3.8');
  assert.equal(d.mezeraCm.toFixed(1), '0.4');
  assert.equal(d.soucetMm.toFixed(1), '109.8');
  assert.deepEqual(d.pozice, [10.6, 21.6, 32.6, 43.5, 54.5, 65.5, 76.5, 87.4, 98.4, 109.4, 120.4, 131.3, 142.3, 153.3]);
});

test('3D: krajní pozice se zaokrouhlí jako v podrobném výpočtu', () => {
  // 31,95 cm je v plovoucí čárce o kousek níž, obrazovka proto ukazuje 31,9
  assert.equal(listDilce(plot(533, 1000, 1, 0.1, 5), '3D').pozice[2], 31.9);
});

test('2D: mezera se zkosením', () => {
  const d = listDilce(plot(1500, 2000, 1, 2, 12), '2D');
  assert.equal(d.mezeraMm, 20);
  assert.equal(d.mezeraCm, 2);
  assert.equal(d.celkovaMezeraCm, 4.8);
});

test('stejné dílce se sloučí a souhrn sedí', () => {
  const fences = [plot(1800, 2500, 4, 2.5, 14), plot(1800, 2500, 1, 2.5, 14), plot(1000, 950, 3, 1.5, 9)];
  assert.deepEqual(unikatniDilce(fences, '3D').map((d) => d.kusu), [5, 3]);
  const summary = { totalLamellaPackages: 2, totalProfilePackages: 1, totalLamellaWaste: 10, totalProfileWaste: 20 };
  const souhrn = souhrnPlanu(fences, { summary });
  assert.equal(souhrn.dilcu, 8);
  assert.equal(souhrn.lamel, 97);
  assert.ok(Math.abs(souhrn.plocha - (2.5 * 1.8 * 5 + 0.95 * 3)) < 1e-9);
});
