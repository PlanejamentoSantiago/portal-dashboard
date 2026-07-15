// Marca por grupo: logo (tag) + imagem de background padrão do card.
// Logos ficam em /public; backgrounds em /public/thumbnails.
const BRANDS = {
  bradesco_sa:             { logo: 'logo-bradesco.png', bg: 'bradescobrackground.png' },
  bradesco_financiamentos: { logo: 'logo-bradesco.png', bg: 'bradescobrackground.png' },
  bsc:                     { logo: 'logo-bradesco.png', bg: 'bradescobrackground.png' },
  rcbitapeva_divzero:      { logo: 'itapeva-logo.png',  bg: 'itapevabackground.png' },
};

// Background padrão quando o grupo não tem um específico (público, gerência, etc.)
const DEFAULT_BG = 'santiagobackground.png';

const norm = (s) => String(s || '').trim().toLowerCase();
const base = import.meta.env.BASE_URL;

// URL do logo do grupo (usado como tag). null se não houver marca.
export const brandFor = (role) => {
  const b = BRANDS[norm(role)];
  return b ? `${base}${b.logo}` : null;
};

// URL do background padrão do grupo (sempre retorna algo — cai no Santiago).
export const backgroundFor = (role) => {
  const b = BRANDS[norm(role)];
  return `${base}${b ? b.bg : DEFAULT_BG}`;
};
