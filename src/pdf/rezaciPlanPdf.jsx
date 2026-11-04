// Výrobní dokumentace pro dílnu: řezací plán a montážní listy. Ceny se do ní nedostanou.
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { souhrnPlanu, unikatniDilce } from '@/lib/kalkulace/montazniList';

const ZELENA = '#00A06B';
const ZELENA_TMAVA = '#067A54';
const ZELENA_SVETLA = '#E6F6F0';
const MODRA = '#2563EB';
const MODRA_SVETLA = '#E8EFFE';
const JANTAR = '#F5C451';
const JANTAR_TMAVA = '#92600A';
const TMAVA = '#12181B';
const TEXT = '#1F2328';
const SEDA = '#646B73';
const LINKA = '#D9DCE0';
const POZADI = '#F4F6F5';

const FIRMA = { nazev: 'Aluminium Fences s.r.o.', web: 'www.alufen.cz' };

export function registrujFonty(cesta = '/fonts') {
  // Volá se před každým PDF. Font sdílený mezi dokumenty ztrácel v dalším PDF písmena.
  delete Font.getRegisteredFonts().Inter;
  Font.register({
    family: 'Inter',
    fonts: [
      { src: `${cesta}/Inter-Regular.ttf`, fontWeight: 400 },
      { src: `${cesta}/Inter-Bold.ttf`, fontWeight: 700 },
    ],
  });
  // Bez dělení slov: anglické dělení by česká slova lámalo chybně
  Font.registerHyphenationCallback((slovo) => [slovo]);
}

const formatDatum = (d) => (d ? new Date(d).toLocaleDateString('cs-CZ') : '–');
// Zaokrouhluje jako toFixed na obrazovce, toLocaleString by krajní hodnoty zaokrouhlil jinak
const cislo = (n, mista = 0) => {
  const [cele, desetiny] = Number(n).toFixed(mista).split('.');
  return Number(cele).toLocaleString('cs-CZ') + (desetiny ? `,${desetiny}` : '');
};

const s = StyleSheet.create({
  stranka: { fontFamily: 'Inter', fontSize: 9, color: TEXT, paddingTop: 66, paddingHorizontal: 36, paddingBottom: 48 },
  hlavicka: { position: 'absolute', top: 22, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: ZELENA, paddingBottom: 8 },
  logo: { width: 70, height: 26, objectFit: 'contain', objectPositionX: 0 },
  hlavickaText: { textAlign: 'right', fontSize: 8, color: SEDA },
  hlavickaTucne: { fontWeight: 700, color: TEXT, fontSize: 9 },
  paticka: { position: 'absolute', bottom: 20, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', color: SEDA, fontSize: 7.5, borderTopWidth: 0.5, borderTopColor: LINKA, paddingTop: 6 },
  hero: { backgroundColor: TMAVA, color: '#FFFFFF', borderRadius: 6, padding: 18, marginBottom: 12 },
  heroRadek: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nadtitul: { color: '#3DDBA3', fontSize: 8, fontWeight: 700, letterSpacing: 1.2, marginBottom: 5 },
  titul: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  zakaznik: { fontSize: 13 },
  stavOk: { backgroundColor: ZELENA, color: '#FFFFFF', fontSize: 8, fontWeight: 700, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 3 },
  stavNavrh: { backgroundColor: JANTAR, color: TMAVA, fontSize: 8, fontWeight: 700, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 3 },
  meta: { flexDirection: 'row', marginTop: 14, borderTopWidth: 0.5, borderTopColor: '#3A444A', paddingTop: 10 },
  metaBunka: { flex: 1, paddingRight: 6 },
  metaPopis: { color: '#9AA5AB', fontSize: 7, marginBottom: 2 },
  metaHodnota: { fontWeight: 700, fontSize: 9.5 },
  dlazdice: { flexDirection: 'row', marginBottom: 14 },
  dlazdiceBunka: { flex: 1, backgroundColor: POZADI, borderRadius: 4, padding: 9, marginRight: 6 },
  dlazdicePosledni: { flex: 1, backgroundColor: POZADI, borderRadius: 4, padding: 9 },
  dlazdiceCislo: { fontSize: 16, fontWeight: 700, color: ZELENA_TMAVA },
  dlazdicePopis: { fontSize: 7.5, color: SEDA, marginTop: 2 },
  nadpis: { fontSize: 11, fontWeight: 700, marginBottom: 6 },
  popis: { fontSize: 8, color: SEDA, marginBottom: 8, lineHeight: 1.35 },
  zahlavi: { flexDirection: 'row', backgroundColor: TMAVA, color: '#FFFFFF', paddingVertical: 5, paddingHorizontal: 6, fontSize: 7.5, fontWeight: 700, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  radek: { flexDirection: 'row', paddingVertical: 4.5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: LINKA },
  radekSudy: { flexDirection: 'row', paddingVertical: 4.5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: LINKA, backgroundColor: POZADI },
  bunka: { flex: 1 },
  bunkaPrava: { flex: 1, textAlign: 'right' },
  tucne: { fontWeight: 700 },
  dveKolony: { flexDirection: 'row', marginTop: 14 },
  kolona: { flex: 1, marginRight: 10 },
  kolonaPosledni: { flex: 1 },
  potrebaRadek: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 7, borderRadius: 3, marginBottom: 2.5 },
  podpisy: { flexDirection: 'row', marginTop: 18 },
  podpis: { flex: 1, marginRight: 10, borderTopWidth: 0.5, borderTopColor: SEDA, paddingTop: 4, fontSize: 7.5, color: SEDA },
  podpisPosledni: { flex: 1, borderTopWidth: 0.5, borderTopColor: SEDA, paddingTop: 4, fontSize: 7.5, color: SEDA },
  legenda: { flexDirection: 'row', marginBottom: 9 },
  legendaPolozka: { flexDirection: 'row', alignItems: 'center', marginRight: 12, fontSize: 7.5, color: SEDA },
  legendaBarva: { width: 9, height: 9, borderRadius: 1.5, marginRight: 4 },
  baleni: { borderWidth: 0.5, borderColor: LINKA, borderRadius: 4, padding: 8, marginBottom: 7 },
  baleniHlava: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  odznak: { width: 18, height: 18, borderRadius: 3, color: '#FFFFFF', fontWeight: 700, fontSize: 9, textAlign: 'center', paddingTop: 4, marginRight: 7 },
  baleniNazev: { flex: 1, fontWeight: 700 },
  odpad: { fontSize: 8, color: JANTAR_TMAVA, fontWeight: 700, marginRight: 10 },
  hotovo: { flexDirection: 'row', alignItems: 'center', fontSize: 7.5, color: SEDA },
  ctverec: { width: 10, height: 10, borderWidth: 0.8, borderColor: SEDA, borderRadius: 1.5, marginLeft: 4 },
  pruh: { flexDirection: 'row', height: 20, borderRadius: 2.5, overflow: 'hidden', marginBottom: 6, backgroundColor: POZADI },
  segment: { height: 20, alignItems: 'center', justifyContent: 'center', borderRightWidth: 0.75, borderRightColor: '#FFFFFF' },
  segmentText: { color: '#FFFFFF', fontSize: 7.5, fontWeight: 700 },
  zbytek: { height: 20, backgroundColor: JANTAR, alignItems: 'center', justifyContent: 'center' },
  zbytekText: { color: TMAVA, fontSize: 7, fontWeight: 700 },
  stitky: { flexDirection: 'row', flexWrap: 'wrap' },
  stitek: { fontSize: 8, fontWeight: 700, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, marginRight: 4, marginBottom: 2 },
  listHlava: { backgroundColor: TMAVA, color: '#FFFFFF', borderRadius: 6, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listTitul: { fontSize: 16, fontWeight: 700, marginTop: 2 },
  kusu: { fontSize: 20, fontWeight: 700, color: '#3DDBA3', textAlign: 'right' },
  kusuPopis: { fontSize: 7.5, color: '#9AA5AB', textAlign: 'right' },
  rozmery: { flexDirection: 'row', marginBottom: 12 },
  rozmerVyska: { flex: 1, backgroundColor: ZELENA, color: '#FFFFFF', padding: 9, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rozmerSirka: { flex: 1, backgroundColor: ZELENA_TMAVA, color: '#FFFFFF', padding: 9, borderTopRightRadius: 4, borderBottomRightRadius: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rozmerPopis: { fontSize: 8, fontWeight: 700, letterSpacing: 0.6 },
  rozmerHodnota: { fontSize: 15, fontWeight: 700 },
  obsah: { flexDirection: 'row' },
  schema: { width: 214, marginRight: 16 },
  schemaRam: { backgroundColor: POZADI, borderRadius: 4, padding: 12, alignItems: 'center' },
  schemaPopis: { fontSize: 7.5, color: SEDA, marginTop: 6, textAlign: 'center' },
  udaje: { flex: 1 },
  udajRadek: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 7, borderBottomWidth: 0.5, borderBottomColor: LINKA },
  udajPopis: { color: SEDA },
  zvyrazneni: { backgroundColor: JANTAR, fontWeight: 700, paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 2.5 },
  pozice: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  poziceBunka: { width: '50%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, paddingHorizontal: 7, borderBottomWidth: 0.5, borderBottomColor: LINKA },
  poziceCislo: { color: SEDA },
});

function Stranka({ udaje, children }) {
  const { cisloDokumentu, logo } = udaje;
  return (
    <Page size="A4" style={s.stranka}>
      <View style={s.hlavicka} fixed>
        <Image src={logo} style={s.logo} />
        <View style={s.hlavickaText}>
          <Text style={s.hlavickaTucne}>Řezací plán{cisloDokumentu ? ` · ${cisloDokumentu}` : ''}</Text>
          <Text>{udaje.zakaznik || udaje.nazev || ''}</Text>
        </View>
      </View>
      {children}
      <View style={s.paticka} fixed>
        <Text>{FIRMA.nazev} · {FIRMA.web} · Interní výrobní dokumentace</Text>
        <Text render={({ pageNumber, totalPages }) => `Strana ${pageNumber} z ${totalPages}`} />
      </View>
    </Page>
  );
}

function Prehled({ udaje, fences, fenceType, result }) {
  const souhrn = souhrnPlanu(fences, result);
  const { summary } = result;
  const dlazdice = [
    [cislo(souhrn.dilcu), 'Dílců celkem'],
    [cislo(souhrn.lamel), 'Lamel celkem'],
    [`${cislo(souhrn.plocha, 1)} m²`, 'Plocha plotu'],
    [cislo(souhrn.baleniLamel), 'Balení lamel'],
    [cislo(souhrn.baleniProfilu), 'Balení profilů'],
  ];
  const meta = [
    ['Zakázka', udaje.cisloDokumentu || 'Bez zakázky'],
    ['Položka', udaje.polozka || udaje.nazev || '–'],
    ['Typ plotu', fenceType],
    ['Vytištěno', formatDatum(new Date().toISOString())],
  ];
  return (
    <Stranka udaje={udaje}>
      <View style={s.hero}>
        <View style={s.heroRadek}>
          <View>
            <Text style={s.nadtitul}>VÝROBNÍ DOKUMENTACE</Text>
            <Text style={s.titul}>Řezací plán</Text>
            <Text style={s.zakaznik}>{udaje.zakaznik || udaje.nazev || 'Bez zákazníka'}</Text>
          </View>
          {udaje.uzamcenoAt
            ? <Text style={s.stavOk}>UZAMČENO · VERZE {udaje.verze || 1} · {formatDatum(udaje.uzamcenoAt)}</Text>
            : <Text style={s.stavNavrh}>NÁVRH · NENÍ UZAMČENÝ</Text>}
        </View>
        <View style={s.meta}>
          {meta.map(([popis, hodnota]) => (
            <View key={popis} style={s.metaBunka}>
              <Text style={s.metaPopis}>{popis}</Text>
              <Text style={s.metaHodnota}>{hodnota}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.dlazdice}>
        {dlazdice.map(([hodnota, popis], i) => (
          <View key={popis} style={i === dlazdice.length - 1 ? s.dlazdicePosledni : s.dlazdiceBunka}>
            <Text style={s.dlazdiceCislo}>{hodnota}</Text>
            <Text style={s.dlazdicePopis}>{popis}</Text>
          </View>
        ))}
      </View>

      <Text style={s.nadpis}>Přehled dílců</Text>
      <View style={s.zahlavi}>
        {['#', 'Výška', 'Šířka', 'Mezera', 'Lamel/ks'].map((t) => <Text key={t} style={s.bunka}>{t}</Text>)}
        <Text style={s.bunkaPrava}>Počet</Text>
        <Text style={s.bunkaPrava}>Lamel celkem</Text>
      </View>
      {fences.map((f, i) => (
        <View key={i} wrap={false} style={i % 2 ? s.radekSudy : s.radek}>
          <Text style={s.bunka}>{i + 1}</Text>
          <Text style={s.bunka}>{cislo(f.height)} mm</Text>
          <Text style={s.bunka}>{cislo(f.width)} mm</Text>
          <Text style={s.bunka}>{cislo(f.selectedGap?.gap ?? 0, 1)} cm</Text>
          <Text style={s.bunka}>{f.selectedGap?.lamellas}</Text>
          <Text style={s.bunkaPrava}>{f.quantity}</Text>
          <Text style={[s.bunkaPrava, s.tucne]}>{(f.selectedGap?.lamellas ?? 0) * f.quantity}</Text>
        </View>
      ))}

      <View style={s.dveKolony} wrap={false}>
        <Potreba nazev="Potřebné lamely" radky={summary.cuts} barva={ZELENA_TMAVA} pozadi={ZELENA_SVETLA} styl={s.kolona} />
        <Potreba nazev="Potřebné profily" radky={summary.profiles} barva={MODRA} pozadi={MODRA_SVETLA} styl={s.kolonaPosledni} />
      </View>

      <View style={s.podpisy} wrap={false}>
        <Text style={s.podpis}>Připravil</Text>
        <Text style={s.podpis}>Zkontroloval</Text>
        <Text style={s.podpisPosledni}>Datum</Text>
      </View>
    </Stranka>
  );
}

function Potreba({ nazev, radky, barva, pozadi, styl }) {
  return (
    <View style={styl}>
      <Text style={s.nadpis}>{nazev}</Text>
      {Object.entries(radky).map(([delka, pocet]) => (
        <View key={delka} style={[s.potrebaRadek, { backgroundColor: pozadi }]}>
          <Text>{cislo(delka)} mm</Text>
          <Text style={[s.tucne, { color: barva }]}>{pocet} ks</Text>
        </View>
      ))}
    </View>
  );
}

function Baleni({ baleni, poradi, barva, pozadi }) {
  const delka = baleni.pkgLength || 6500;
  const segmenty = baleni.rawCuts || baleni.cuts.map((c) => c.length);
  return (
    <View style={s.baleni} wrap={false}>
      <View style={s.baleniHlava}>
        <Text style={[s.odznak, { backgroundColor: barva }]}>{poradi}</Text>
        <Text style={s.baleniNazev}>Balení {poradi} · {cislo(delka)} mm</Text>
        <Text style={s.odpad}>Zbytek {cislo(baleni.waste)} mm</Text>
        <View style={s.hotovo}><Text>Hotovo</Text><View style={s.ctverec} /></View>
      </View>
      <View style={s.pruh}>
        {segmenty.map((delkaRezu, i) => (
          <View key={i} style={[s.segment, { width: `${(delkaRezu / delka) * 100}%`, backgroundColor: barva }]}>
            {delkaRezu / delka > 0.07 && <Text style={s.segmentText}>{delkaRezu}</Text>}
          </View>
        ))}
        {baleni.waste > 0 && (
          <View style={[s.zbytek, { width: `${(baleni.waste / delka) * 100}%` }]}>
            {baleni.waste / delka > 0.09 && <Text style={s.zbytekText}>{baleni.waste}</Text>}
          </View>
        )}
      </View>
      <View style={s.stitky}>
        {baleni.cuts.map((c, i) => <Text key={i} style={[s.stitek, { backgroundColor: pozadi, color: barva }]}>{cislo(c.length)} mm × {c.count} ks</Text>)}
      </View>
    </View>
  );
}

function Rezani({ udaje, nazev, popis, baleni, barva, pozadi, odpad }) {
  return (
    <Stranka udaje={udaje}>
      <Text style={[s.nadpis, { fontSize: 14 }]}>{nazev}</Text>
      <Text style={s.popis}>{popis} Celkem {baleni.length} balení, zbytek {cislo(odpad)} mm. Zbytky ulož a označ štítkem.</Text>
      <View style={s.legenda}>
        <View style={s.legendaPolozka}><View style={[s.legendaBarva, { backgroundColor: barva }]} /><Text>Řez (mm)</Text></View>
        <View style={s.legendaPolozka}><View style={[s.legendaBarva, { backgroundColor: JANTAR }]} /><Text>Zbytek (mm)</Text></View>
      </View>
      {baleni.map((b, i) => <Baleni key={i} baleni={b} poradi={i + 1} barva={barva} pozadi={pozadi} />)}
    </Stranka>
  );
}

// Lamely i mezery jsou v měřítku podle skutečných rozměrů dílce
function Schema({ dilec }) {
  const { vyska, sirka, lamel, lamelaMm, mezeraMm } = dilec;
  const meritko = Math.min(186 / sirka, 250 / vyska);
  const v = vyska * meritko;
  const sir = sirka * meritko;
  const profil = Math.max(4, 50 * meritko);
  const krok = lamel > 1 ? (vyska - lamelaMm) / (lamel - 1) : 0;
  return (
    <View style={s.schema}>
      <View style={s.schemaRam}>
        <View style={{ width: sir, height: v, position: 'relative' }}>
          {Array.from({ length: lamel }, (_, i) => (
            <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: i * krok * meritko, height: Math.max(1.5, lamelaMm * meritko), backgroundColor: ZELENA, borderRadius: 0.5 }} />
          ))}
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: profil, backgroundColor: TMAVA }} />
          <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: profil, backgroundColor: TMAVA }} />
        </View>
        <Text style={s.schemaPopis}>{cislo(sirka)} × {cislo(vyska)} mm · {lamel} lamel, mezera {cislo(mezeraMm, 1)} mm</Text>
        <Text style={s.schemaPopis}>Schéma pro orientaci, řiď se čísly.</Text>
      </View>
    </View>
  );
}

function Udaj({ popis, children }) {
  return (
    <View style={s.udajRadek}>
      <Text style={s.udajPopis}>{popis}</Text>
      {children}
    </View>
  );
}

function MontazniList({ udaje, dilec, poradi, fenceType }) {
  const trojD = fenceType === '3D';
  return (
    <Stranka udaje={udaje}>
      <View style={s.listHlava}>
        <View>
          <Text style={s.nadtitul}>MONTÁŽNÍ LIST</Text>
          <Text style={s.listTitul}>Dílec {poradi}</Text>
        </View>
        <View>
          <Text style={s.kusu}>{dilec.kusu} ks</Text>
          <Text style={s.kusuPopis}>Plot {fenceType}</Text>
        </View>
      </View>
      <View style={s.rozmery}>
        <View style={s.rozmerVyska}><Text style={s.rozmerPopis}>VÝŠKA</Text><Text style={s.rozmerHodnota}>{cislo(dilec.vyska)} mm</Text></View>
        <View style={s.rozmerSirka}><Text style={s.rozmerPopis}>ŠÍŘKA</Text><Text style={s.rozmerHodnota}>{cislo(dilec.sirka)} mm</Text></View>
      </View>
      <View style={s.obsah}>
        <Schema dilec={dilec} />
        <View style={s.udaje}>
          <Text style={s.nadpis}>Hodnoty pro výrobu</Text>
          <Udaj popis="Počet lamel"><Text style={s.tucne}>{dilec.lamel} ks</Text></Udaj>
          <Udaj popis="Mezera">
            <Text>{cislo(dilec.mezeraMm, 1)} mm  <Text style={s.zvyrazneni}> {cislo(dilec.mezeraCm, 1)} cm </Text></Text>
          </Udaj>
          {trojD && <Udaj popis="Zbytek"><Text style={s.tucne}>{cislo(dilec.zbytekMm)} mm</Text></Udaj>}
          {trojD && <Udaj popis="Konečný součet"><Text style={s.tucne}>{cislo(dilec.soucetMm, 1)} mm</Text></Udaj>}
          {!trojD && (
            <Udaj popis="Celková mezera se zkosením">
              <Text>{cislo(dilec.mezeraCm, 1)} + {cislo(dilec.zkoseniCm, 1)} cm  <Text style={s.zvyrazneni}> {cislo(dilec.celkovaMezeraCm, 1)} cm </Text></Text>
            </Udaj>
          )}
          {dilec.pozice.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={s.nadpis}>Pozice lamel (cm)</Text>
              <View style={s.pozice}>
                {dilec.pozice.map((p, i) => (
                  <View key={i} style={s.poziceBunka}>
                    <Text style={s.poziceCislo}>{i + 1}.</Text>
                    <Text style={s.tucne}>{cislo(p, 1)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </Stranka>
  );
}

export function RezaciPlanPdf({ udaje, fences, fenceType, result, logo = '/alufen-logo.png' }) {
  const vse = { ...udaje, logo };
  const { lamellaPlan, profilePlan, summary } = result;
  const nazevDokumentu = `Řezací plán ${udaje.cisloDokumentu || udaje.nazev || ''}`.trim();
  return (
    <Document title={nazevDokumentu} author={FIRMA.nazev}>
      <Prehled udaje={vse} fences={fences} fenceType={fenceType} result={result} />
      <Rezani udaje={vse} nazev="Řezací plán lamel" popis="Každý řez dá balík 4 lamel, po nařezání balík označ štítkem." baleni={lamellaPlan.packages} barva={ZELENA_TMAVA} pozadi={ZELENA_SVETLA} odpad={summary.totalLamellaWaste} />
      <Rezani udaje={vse} nazev="Řezací plán profilů" popis="Dva profily na každý dílec." baleni={profilePlan.packages} barva={MODRA} pozadi={MODRA_SVETLA} odpad={summary.totalProfileWaste} />
      {unikatniDilce(fences, fenceType).map((dilec, i) => <MontazniList key={i} udaje={vse} dilec={dilec} poradi={i + 1} fenceType={fenceType} />)}
    </Document>
  );
}
