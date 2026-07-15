-- Selo do slide da vitrine: 'novo' | 'destaque' | null (campanha simples).
alter table public.vitrine add column if not exists badge text;
