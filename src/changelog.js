// Versão atual do portal e histórico de melhorias.
// Ao lançar mudanças, incremente APP_VERSION e adicione uma entrada no topo.

export const APP_VERSION = '1.2.0';

export const CHANGELOG = [
  {
    version: '1.2.0',
    date: '2026-07-15',
    title: 'Destaques automáticos',
    items: [
      'O carrossel destaca automaticamente o BI mais novo e o mais usado do seu grupo.',
      'Contagem de acessos por dashboard para ranquear os destaques.',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-07-15',
    title: 'Novo portal de BI',
    items: [
      'Visual repaginado com identidade Santiago e ícones Lucide.',
      'Carrossel de vitrine na home com selos de Novo e Destaque.',
      'Favoritos por usuário — os favoritos aparecem primeiro na lista.',
      'Filtro de dashboards por grupo.',
      'Painel administrativo para gerenciar dashboards, a vitrine e usuários.',
      'Miniaturas (imagens) por dashboard.',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-06-01',
    title: 'Lançamento',
    items: [
      'Portal inicial de dashboards com login e controle de acesso por grupo.',
    ],
  },
];
