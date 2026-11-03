// Čísla pro výrobní dokumentaci. Vzorce jsou stejné jako v podrobném výpočtu na obrazovce.

const LAMELA_3D_MM = 106;
const LAMELA_3D_CM = 10.6;
const LAMELA_2D_MM = 112;
const ZKOSENI_2D_CM = 2.8;

const plochaPlotu = (fences) => fences
  .reduce((s, f) => s + (parseFloat(f.width) / 1000) * (parseFloat(f.height) / 1000) * (f.quantity || 1), 0);

const klicDilce = (f) => `${f.height}x${f.width}x${f.selectedGap?.lamellas}`;

export function listDilce(fence, fenceType) {
  const vyska = parseInt(fence.height, 10);
  const sirka = parseInt(fence.width, 10);
  const lamel = fence.selectedGap?.lamellas ?? 0;
  if (fenceType === '3D') {
    // Stejný postup v cm jako v FenceDetailCalc, jinak by se krajní hodnoty zaokrouhlily jinak než na obrazovce
    const vyskaCm = vyska / 10;
    const mezeraCm = lamel > 1 ? (vyskaCm - lamel * LAMELA_3D_CM) / (lamel - 1) : 0;
    const mezeraMm = mezeraCm * 10;
    const pozice = Array.from({ length: lamel }, (_, i) => (
      i === lamel - 1 ? vyskaCm : Math.round(((i + 1) * LAMELA_3D_CM + i * mezeraCm) * 10) / 10
    ));
    return { vyska, sirka, lamel, lamelaMm: LAMELA_3D_MM, mezeraMm, mezeraCm, zbytekMm: vyska - lamel * LAMELA_3D_MM, soucetMm: LAMELA_3D_MM + mezeraMm, pozice };
  }
  const mezeraCm = fence.selectedGap?.gap ?? 0;
  return { vyska, sirka, lamel, lamelaMm: LAMELA_2D_MM, mezeraMm: mezeraCm * 10, mezeraCm, zkoseniCm: ZKOSENI_2D_CM, celkovaMezeraCm: mezeraCm + ZKOSENI_2D_CM, pozice: [] };
}

// Stejné rozměry se dělají podle jednoho listu, proto jsou sloučené
export function unikatniDilce(fences, fenceType) {
  const mapa = new Map();
  fences.forEach((f) => {
    const klic = klicDilce(f);
    if (!mapa.has(klic)) mapa.set(klic, { ...listDilce(f, fenceType), kusu: 0 });
    mapa.get(klic).kusu += Number(f.quantity) || 1;
  });
  return [...mapa.values()];
}

export function souhrnPlanu(fences, result) {
  const { summary } = result;
  return {
    dilcu: fences.reduce((s, f) => s + (Number(f.quantity) || 0), 0),
    lamel: fences.reduce((s, f) => s + (f.selectedGap?.lamellas ?? 0) * (Number(f.quantity) || 0), 0),
    plocha: plochaPlotu(fences),
    baleniLamel: summary.totalLamellaPackages,
    baleniProfilu: summary.totalProfilePackages,
    odpadLamel: summary.totalLamellaWaste,
    odpadProfilu: summary.totalProfileWaste,
  };
}
