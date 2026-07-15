// Logo (marca) associada a cada grupo, exibida como tag nos cards.
// Os arquivos ficam em /public.
const BRANDS = {
  bradesco_sa: 'logo-bradesco.png',
  bradesco_financiamentos: 'logo-bradesco.png',
  bsc: 'logo-bradesco.png',
  rcbitapeva_divzero: 'itapeva-logo.png',
};

export const brandFor = (role) => {
  const file = BRANDS[String(role || '').trim().toLowerCase()];
  return file ? `${import.meta.env.BASE_URL}${file}` : null;
};
