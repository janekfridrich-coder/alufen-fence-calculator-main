// PDF se tvoří v prohlížeči, knihovna se načte až při stažení.
export async function stahniRezaciPlanPdf({ udaje, fences, fenceType, result }) {
  const [{ pdf }, { RezaciPlanPdf, registrujFonty }, { createElement }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./rezaciPlanPdf.jsx'),
    import('react'),
  ]);
  registrujFonty();
  const blob = await pdf(createElement(RezaciPlanPdf, { udaje, fences, fenceType, result })).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rezaci-plan-${udaje.cisloDokumentu || 'navrh'}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
