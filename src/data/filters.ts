import { ArtisticFilter } from '../types/video';

export interface FilterPreset {
  id: ArtisticFilter;
  name: string;
  category: string;
  description: string;
  accentColor: string;
  previewGradient: string;
  tag: string;
}

export const ARTISTIC_FILTERS: FilterPreset[] = [
  {
    id: 'neo_noir',
    name: 'Neo Noir Cyberpunk',
    category: 'Sci-Fi / Nuit',
    description: 'Ombres cyan glaciales, reflets magenta intenses et contrastes profonds style Blade Runner.',
    accentColor: '#ec4899',
    previewGradient: 'linear-gradient(135deg, #083344 0%, #ec4899 100%)',
    tag: 'Tendance'
  },
  {
    id: 'blade_runner',
    name: 'Blade Runner 2049',
    category: 'Cinéma Auteur',
    description: 'Brumes sépia incandescentes, atmosphère poussiéreuse et lueur anamorphique ambrée.',
    accentColor: '#f59e0b',
    previewGradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
    tag: 'Cinéaste'
  },
  {
    id: 'wes_anderson',
    name: 'Pastel Wes Anderson',
    category: 'Auteur / Rétro',
    description: 'Couleurs pastel chaleureuses, teinte ivoire vintage et saturation douce et symétrique.',
    accentColor: '#fde047',
    previewGradient: 'linear-gradient(135deg, #fb923c 0%, #fef08a 100%)',
    tag: 'Artistique'
  },
  {
    id: 'kodak_35mm',
    name: 'Kodak Portra 400',
    category: 'Argentique 35mm',
    description: 'Grain argentique authentique, halation dorée sur les hautes lumières et douceur de peau.',
    accentColor: '#fbbf24',
    previewGradient: 'linear-gradient(135deg, #92400e 0%, #fde68a 100%)',
    tag: 'Vintage'
  },
  {
    id: 'nolan_imax',
    name: 'Christopher Nolan IMAX',
    category: 'Blockbuster',
    description: 'Bleus aciers tranchants, ombres denses et dynamisme optique ultra-net.',
    accentColor: '#38bdf8',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
    tag: '70mm IMAX'
  },
  {
    id: 'golden_hour',
    name: 'Heure Dorée Magique',
    category: 'Lumière Naturelle',
    description: 'Lumière de soleil couchant enveloppante, diffusion vaporeuse et lueurs cuivrées.',
    accentColor: '#f97316',
    previewGradient: 'linear-gradient(135deg, #ea580c 0%, #fde047 100%)',
    tag: 'Sublime'
  },
  {
    id: 'bw_noir',
    name: 'Noir & Blanc 1940',
    category: 'Classique',
    description: 'Clair-obscur dramatique, halogénure d\'argent profond et contrastes sculptés.',
    accentColor: '#94a3b8',
    previewGradient: 'linear-gradient(135deg, #000000 0%, #ffffff 100%)',
    tag: 'Hitchcock'
  },
  {
    id: 'matrix_phosphor',
    name: 'Phosphore Matrix',
    category: 'Cybertech',
    description: 'Teinte verte industrielle de moniteur cathodique, ambiance hacker des années 90.',
    accentColor: '#22c55e',
    previewGradient: 'linear-gradient(135deg, #052e16 0%, #22c55e 100%)',
    tag: 'Cyber'
  },
  {
    id: 'vintage_vhs',
    name: 'Rétro Cassette VHS',
    category: 'Analogique',
    description: 'Scanlines de bande magnétique, décalage chromatique RGB et léger bruit de tracking.',
    accentColor: '#c084fc',
    previewGradient: 'linear-gradient(135deg, #4c1d95 0%, #c084fc 100%)',
    tag: 'Lo-Fi 80s'
  },
  {
    id: 'clean_cinema',
    name: 'Master Rec.709 Neutre',
    category: 'Studio',
    description: 'Étalonnage cinéma pur sans dérive colorimétrique, fidélité optique maximale.',
    accentColor: '#e2e8f0',
    previewGradient: 'linear-gradient(135deg, #334155 0%, #94a3b8 100%)',
    tag: 'Neutre'
  }
];
