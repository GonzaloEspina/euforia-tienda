import type { Salida } from "@/types/salida";

function similarityScore(current: Salida, candidate: Salida): number {
  let score = 0;

  if (
    current.categoria &&
    candidate.categoria &&
    current.categoria === candidate.categoria
  ) {
    score += 4;
  }

  if (
    current.destino &&
    candidate.destino &&
    current.destino.toLowerCase() === candidate.destino.toLowerCase()
  ) {
    score += 3;
  }

  if (
    current.pais &&
    candidate.pais &&
    current.pais.toLowerCase() === candidate.pais.toLowerCase()
  ) {
    score += 2;
  }

  for (const sub of candidate.subcategorias) {
    if (current.subcategorias.includes(sub)) score += 1;
  }

  for (const tag of candidate.etiquetas) {
    if (current.etiquetas.includes(tag)) score += 1;
  }

  return score;
}

export function getSimilaresSalidas(
  current: Salida,
  catalog: Salida[],
  limit = 3
): Salida[] {
  const others = catalog.filter(
    (s) => s.id !== current.id && s.isInStock && s.isPurchasable
  );

  const ranked = others
    .map((s) => ({ salida: s, score: similarityScore(current, s) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.salida.destacado !== b.salida.destacado) {
        return a.salida.destacado ? -1 : 1;
      }
      return a.salida.titulo.localeCompare(b.salida.titulo);
    });

  const withScore = ranked.filter((r) => r.score > 0).map((r) => r.salida);
  const picked: Salida[] = [...withScore];

  if (picked.length < limit) {
    for (const { salida } of ranked) {
      if (picked.length >= limit) break;
      if (!picked.some((s) => s.id === salida.id)) picked.push(salida);
    }
  }

  return picked.slice(0, limit);
}
