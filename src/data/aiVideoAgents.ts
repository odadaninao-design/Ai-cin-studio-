import { AiVideoAgent, AiVideoAgentId } from '../types/agents';

export const AI_VIDEO_AGENTS: AiVideoAgent[] = [
  {
    id: 'google_veo_2',
    name: 'Google Veo 2',
    version: '2.0 Pro',
    provider: 'Google DeepMind',
    category: 'cinema',
    badge: 'Cinéma 4K & Physique',
    tagline: 'Le summum de la cohérence cinématographique 4K et de la physique réaliste.',
    description:
      'Modèle vidéo phare de Google DeepMind entraîné sur une compréhension profonde de la physique du monde réel, des trajectoires d\'éclairage cinématographique et des plans anamorphiques 4K sans déformation.',
    capabilities: [
      'Résolution native 4K Ultra-HD',
      'Physique des fluides et drapés réalistes',
      'Trajectoires caméra complexes (Dolly / Grue)',
      'Cohérence temporelle longue durée',
      'Compréhension du vocabulaire de réalisation'
    ],
    maxDurationSeconds: 60,
    maxResolution: '4k',
    supportedAspectRatios: ['16:9', '9:16', '21:9', '1:1'],
    metrics: {
      motionQuality: 98,
      photorealism: 99,
      renderSpeed: 88,
      cameraControl: 96,
      temporalCoherence: 98
    },
    status: 'online',
    themeColor: {
      accent: '#4285F4',
      border: 'border-blue-500/40',
      bgGlow: 'from-blue-500/10 via-cyan-500/5 to-transparent',
      badgeBg: 'bg-blue-500/20',
      badgeText: 'text-blue-300'
    },
    samplePrompts: [
      'Plan large anamorphique au crépuscule d\'un explorateur observant une cité flottante en verre, lumière rasante dorée, brume volumétrique, lentilles 70mm.',
      'Vue aérienne en plongée continue longeant une rivière de lave basaltique traversant un canyon d\'obsidienne étincelant.'
    ],
    defaultConfig: {
      motionScale: 6,
      promptAdherence: 8,
      fps: 30,
      cameraMovement: 'cinematic' as any,
      generationMode: 'director_sequence',
      upscaling: true,
      enhancePrompt: true,
      negativePrompt: 'flou, déformation, artefacts, saccades, basse résolution, glitch'
    }
  },
  {
    id: 'openai_sora',
    name: 'OpenAI Sora',
    version: 'Sora Turbo',
    provider: 'OpenAI',
    category: 'realism',
    badge: 'Simulateur de Monde',
    tagline: 'Simulation de monde physique et scènes narratives multi-angles.',
    description:
      'L\'agent vidéo d\'OpenAI capable d\'interpréter des invites complexes, de simuler des personnages avec permanence d\'identité à travers plusieurs plans et d\'interagir avec l\'environnement 3D.',
    capabilities: [
      'Maintien d\'identité des personnages',
      'Interactions multi-plans complexes',
      'Profondeur de champ naturelle',
      'Simulation de matériaux et reflets',
      'Génération vidéo jusqu\'à 60 secondes'
    ],
    maxDurationSeconds: 60,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    metrics: {
      motionQuality: 96,
      photorealism: 97,
      renderSpeed: 82,
      cameraControl: 92,
      temporalCoherence: 96
    },
    status: 'online',
    themeColor: {
      accent: '#10A37F',
      border: 'border-emerald-500/40',
      bgGlow: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300'
    },
    samplePrompts: [
      'Une jeune femme en trench-coat marchant sous les néons de Tokyo en 1980, reflets des enseignes lumineuses sur le trottoir mouillé, regard caméra intense.',
      'Gros plan macro sur les yeux d\'un tigre du Bengale dans une jungle tropicale brumeuse, gouttes de pluie perlant sur les vibrisses.'
    ],
    defaultConfig: {
      motionScale: 7,
      promptAdherence: 8.5,
      fps: 30,
      cameraMovement: 'dolly',
      generationMode: 'director_sequence',
      upscaling: true,
      enhancePrompt: true,
      negativePrompt: 'morphing, déformation anatomique, texte flou, saccade'
    }
  },
  {
    id: 'runway_gen3',
    name: 'Runway Gen-3 Alpha',
    version: 'Gen-3 Alpha Turbo',
    provider: 'RunwayML',
    category: 'motion',
    badge: 'Contrôle Caméra & Motion Brush',
    tagline: 'Vitesse de mouvement exceptionnelle et maîtrise vectorielle de caméra.',
    description:
      'Le modèle vidéo favori des créateurs hollywoodiens, réputé pour sa fidélité aux mouvements de caméra personnalisés, son pinceau de mouvement et ses transitions photoréalistes ultra-dynamiques.',
    capabilities: [
      'Contrôle caméra précis (Pan, Tilt, Zoom, Roll)',
      'Motion Brush dynamique',
      'Transitions de scène fluides',
      'Vitesse de génération fulgurante',
      'Rendu de vitesse et accélérations cinétiques'
    ],
    maxDurationSeconds: 15,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '21:9'],
    metrics: {
      motionQuality: 97,
      photorealism: 94,
      renderSpeed: 95,
      cameraControl: 99,
      temporalCoherence: 94
    },
    status: 'online',
    themeColor: {
      accent: '#E53E3E',
      border: 'border-rose-500/40',
      bgGlow: 'from-rose-500/10 via-orange-500/5 to-transparent',
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-300'
    },
    samplePrompts: [
      'Travelling avant rapide rasant le sol dans une course-poursuite de bolides futuristes entre d\'immenses gratte-ciels en miroir.',
      'Zoom punch dramatique sur un chef d\'orchestre au moment du climax musical, poussières dorées flottant dans le faisceau d\'un projecteur.'
    ],
    defaultConfig: {
      motionScale: 8,
      promptAdherence: 7.5,
      fps: 30,
      cameraMovement: 'fpv_drone',
      generationMode: 'director_sequence',
      upscaling: false,
      enhancePrompt: true,
      negativePrompt: 'statique, saccadé, perte de mise au point, artefacts visuels'
    }
  },
  {
    id: 'kling_1_5',
    name: 'Kling AI 1.5 Pro',
    version: '1.5 High-Def',
    provider: 'Kuaishou AI',
    category: 'realism',
    badge: 'Photoréalisme Humain & Dynamisme',
    tagline: 'Expressions humaines photoréalistes et chorégraphies d\'action époustouflantes.',
    description:
      'Agent d\'intelligence artificielle vidéo de pointe, excellant particulièrement dans la précision des expressions faciales, les mouvements corporels complexes et l\'élasticité des textures vivantes.',
    capabilities: [
      'Anatomie et motricité humaine parfaite',
      'Éclairage cutané et subsurface scattering',
      'Durée étendue jusqu\'à 10 secondes par shot',
      'Gestion des acrobaties et cascades cinétiques',
      'Contrôle de fin de plan (End-Frame)'
    ],
    maxDurationSeconds: 30,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    metrics: {
      motionQuality: 96,
      photorealism: 98,
      renderSpeed: 87,
      cameraControl: 90,
      temporalCoherence: 95
    },
    status: 'online',
    themeColor: {
      accent: '#FF7A00',
      border: 'border-amber-500/40',
      bgGlow: 'from-amber-500/10 via-yellow-500/5 to-transparent',
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-300'
    },
    samplePrompts: [
      'Un maître forgeron frappant une lame d\'acier incandescente, étincelles projetées en slow-motion 120 FPS, sueur sur le visage et muscles en tension.',
      'Gros plan émotionnel sur une astronaute retirant son casque, larmes en apesanteur captant la lumière bleue de la Terre.'
    ],
    defaultConfig: {
      motionScale: 6.5,
      promptAdherence: 8,
      fps: 30,
      cameraMovement: 'pan',
      generationMode: 'director_sequence',
      upscaling: true,
      enhancePrompt: true,
      negativePrompt: 'doigts supplémentaires, visage asymétrique, déformation physique, bruit'
    }
  },
  {
    id: 'luma_dream_machine',
    name: 'Luma Dream Machine',
    version: '1.5 Next-Gen',
    provider: 'Luma AI',
    category: 'motion',
    badge: 'Dynamisme & Physique Naturelle',
    tagline: 'Vitesse de rendu fulgurante et simulation de mouvement organique.',
    description:
      'Générateur vidéo haute performance basé sur un transformateur de diffusion vidéo direct, spécialisé dans les changements de perspective audacieux, la physique de l\'eau et les environnements ouverts.',
    capabilities: [
      'Génération ultra-rapide (<30 secondes)',
      'Transitions spatiales à 360 degrés',
      'Rendu des vagues, nuages et explosions',
      'Continuité de mouvement fluide',
      'Keyframing de départ et d\'arrivée'
    ],
    maxDurationSeconds: 15,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '21:9', '1:1'],
    metrics: {
      motionQuality: 95,
      photorealism: 92,
      renderSpeed: 96,
      cameraControl: 94,
      temporalCoherence: 93
    },
    status: 'online',
    themeColor: {
      accent: '#8B5CF6',
      border: 'border-purple-500/40',
      bgGlow: 'from-purple-500/10 via-indigo-500/5 to-transparent',
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-300'
    },
    samplePrompts: [
      'Survol vertigineux au ras des crêtes de falaises irlandaises battues par des rouleaux d\'écume blanche sous un ciel d\'orage zébré d\'éclairs.',
      'Course effrénée d\'un léopard des neiges dévalant une pente rocheuse escarpée dans l\'Himalaya.'
    ],
    defaultConfig: {
      motionScale: 8.5,
      promptAdherence: 7.8,
      fps: 30,
      cameraMovement: 'orbit',
      generationMode: 'director_sequence',
      upscaling: false,
      enhancePrompt: true,
      negativePrompt: 'instabilité, texture plastique, saccades, distorsion'
    }
  },
  {
    id: 'minimax_hailuo',
    name: 'Minimax Hailuo AI',
    version: 'Video-01 Director',
    provider: 'MiniMax',
    category: 'cinema',
    badge: 'Action Cinématographique & Richesse',
    tagline: 'Esthétique cinématographique orientale et action à haute fréquence d\'images.',
    description:
      'L\'agent vidéo reconnu pour son grain cinématographique riche, ses chorégraphies d\'arts martiaux impeccables et sa gestion spectaculaire des foules et ambiances urbaines denses.',
    capabilities: [
      'Mouvements d\'action rapides et nets',
      'Scènes de combat et de danse coordonnées',
      'Éclairage volumétrique feutré',
      'Rendu des étoffes et soieries en mouvement',
      'Cadence élevée sans flou de mouvement baveux'
    ],
    maxDurationSeconds: 20,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16'],
    metrics: {
      motionQuality: 96,
      photorealism: 95,
      renderSpeed: 91,
      cameraControl: 91,
      temporalCoherence: 94
    },
    status: 'online',
    themeColor: {
      accent: '#06B6D4',
      border: 'border-cyan-500/40',
      bgGlow: 'from-cyan-500/10 via-sky-500/5 to-transparent',
      badgeBg: 'bg-cyan-500/20',
      badgeText: 'text-cyan-300'
    },
    samplePrompts: [
      'Combat de sabres sous les cerisiers en fleurs la nuit, pétales virevoltant dans le vent, reflets de lune sur les lames métalliques.',
      'Marché de nuit cyberpunk dense avec des vendeurs de rue préparant des nouilles fumantes sous des lanternes hologrammes multicolores.'
    ],
    defaultConfig: {
      motionScale: 7.5,
      promptAdherence: 8.2,
      fps: 30,
      cameraMovement: 'handheld',
      generationMode: 'director_sequence',
      upscaling: true,
      enhancePrompt: true,
      negativePrompt: 'mains floues, visage déformé, artefacts de compression'
    }
  },
  {
    id: 'pika_2',
    name: 'Pika 2.0',
    version: '2.0 Effects Studio',
    provider: 'Pika Labs',
    category: 'vfx',
    badge: 'Effets Spéciaux & Stylisation',
    tagline: 'VFX créatifs, Pikaffects modulables et dynamisme stylistique.',
    description:
      'Agent d\'animation et de vidéo IA pionnier des effets spéciaux fantastiques (Melt, Inflate, Explode, Crushed) et des mouvements caméra funambulesques pour les clips et la publicité.',
    capabilities: [
      'Effets VFX intégrés (Pikaffects)',
      'Modulation de vitesse d\'action (Speed Ramps)',
      'Synchronisation audio & bruitages d\'impact',
      'Stylisation pop, anime et cinéma rétro',
      'Inpainting et modification d\'objets'
    ],
    maxDurationSeconds: 15,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    metrics: {
      motionQuality: 93,
      photorealism: 89,
      renderSpeed: 94,
      cameraControl: 93,
      temporalCoherence: 91
    },
    status: 'online',
    themeColor: {
      accent: '#EC4899',
      border: 'border-pink-500/40',
      bgGlow: 'from-pink-500/10 via-fuchsia-500/5 to-transparent',
      badgeBg: 'bg-pink-500/20',
      badgeText: 'text-pink-300'
    },
    samplePrompts: [
      'Une horloge ancienne en bronze fondant doucement dans une bibliothèque victorienne surréaliste, rouages flottant dans l\'air.',
      'Un graffiti urbain sur un mur de briques qui prend vie et s\'anime en danseur de breakdance fluorescent.'
    ],
    defaultConfig: {
      motionScale: 9,
      promptAdherence: 8,
      fps: 24,
      cameraMovement: 'orbit',
      generationMode: 'director_sequence',
      upscaling: false,
      enhancePrompt: true,
      negativePrompt: 'flou, décoloration, saccades'
    }
  },
  {
    id: 'wan_2_1',
    name: 'Wan 2.1 Video',
    version: 'Wan 2.1 14B',
    provider: 'Alibaba Wanx Open',
    category: 'open_source',
    badge: 'Open Weights & Précision Textuelle',
    tagline: 'La référence ouverte de pointe en fidélité de prompt et netteté optique.',
    description:
      'Dernière avancée majeure en modèle vidéo open-weights, Wan 2.1 rivalise avec les meilleurs modèles fermés par sa précision géométrique et sa clarté de textures à haute définition.',
    capabilities: [
      'Respect scrupuleux des prompts détaillés',
      'Précision typographique et panneaux lisibles',
      'Modèle 14B paramètres haute fidélité',
      'Excellente gestion de la profondeur de champ',
      'Transparence et contrôle complet des poids'
    ],
    maxDurationSeconds: 20,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    metrics: {
      motionQuality: 94,
      photorealism: 96,
      renderSpeed: 89,
      cameraControl: 91,
      temporalCoherence: 95
    },
    status: 'online',
    themeColor: {
      accent: '#F97316',
      border: 'border-orange-500/40',
      bgGlow: 'from-orange-500/10 via-amber-500/5 to-transparent',
      badgeBg: 'bg-orange-500/20',
      badgeText: 'text-orange-300'
    },
    samplePrompts: [
      'Plan moyen d\'un violoncelliste jouant sur une falaise face à l\'océan déchaîné, partition s\'envolant au vent, éclairage dramatique chiaroscuro.',
      'Une capsule spatiale traversant l\'atmosphère supérieure avec ionisation rose et orange des gaz sur le bouclier thermique.'
    ],
    defaultConfig: {
      motionScale: 6,
      promptAdherence: 9,
      fps: 30,
      cameraMovement: 'dolly',
      generationMode: 'director_sequence',
      upscaling: true,
      enhancePrompt: true,
      negativePrompt: 'déformation, artefacts de diffusion, bruit chromatique'
    }
  },
  {
    id: 'stable_video',
    name: 'Stable Video XT',
    version: 'SVD-XT 1.1',
    provider: 'Stability AI',
    category: 'open_source',
    badge: 'Diffusion Latente & Grain Film',
    tagline: 'Modèle de diffusion stable avec contrôle de seed et esthétique argentique.',
    description:
      'L\'architecture de référence issue de Stability AI, optimisée pour transformer des images clés en vidéos cinématographiques organiques avec contrôle fin du Motion Bucket et du grain argentique.',
    capabilities: [
      'Image-to-Video haute fidélité',
      'Paramétrage du Motion Bucket (1-255)',
      'Esthétique argentique 35mm naturelle',
      'Reproductibilité exacte par Seed',
      'Faible consommation et haute réactivité'
    ],
    maxDurationSeconds: 10,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    metrics: {
      motionQuality: 90,
      photorealism: 92,
      renderSpeed: 93,
      cameraControl: 88,
      temporalCoherence: 90
    },
    status: 'online',
    themeColor: {
      accent: '#14B8A6',
      border: 'border-teal-500/40',
      bgGlow: 'from-teal-500/10 via-emerald-500/5 to-transparent',
      badgeBg: 'bg-teal-500/20',
      badgeText: 'text-teal-300'
    },
    samplePrompts: [
      'Portrait cinématique d\'une femme aux cheveux flottants dans un champ de blé doré caressé par la brise d\'été, lumière rasante douce.',
      'Brume matinale se dissipant au-dessus d\'un temple japonais entouré de bambous centenaires, gouttes de rosée scintillantes.'
    ],
    defaultConfig: {
      motionScale: 5,
      promptAdherence: 7.5,
      fps: 24,
      cameraMovement: 'pan',
      generationMode: 'director_sequence',
      upscaling: false,
      enhancePrompt: false,
      negativePrompt: 'distorsion, morphing excessif, flou'
    }
  },
  {
    id: 'meta_movie_gen',
    name: 'Meta Movie Gen',
    version: '30B Audio-Video',
    provider: 'Meta AI Research',
    category: 'multimodal',
    badge: 'Audio-Vidéo Fondamental 30B',
    tagline: 'Génération conjointe 1080p et bande-son Foley synchronisée par un modèle 30B.',
    description:
      'Modèle de fondation multimodal de 30 milliards de paramètres conçu par Meta AI, capable de générer simultanément des scènes cinématiques 1080p photoréalistes et leur environnement sonore spatialisé complet (ambiances, musique, bruitages d\'impact Foley).',
    capabilities: [
      'Génération conjointe vidéo et Foley spatialisé',
      'Modèle de fondation de 30B paramètres',
      'Synchronisation labiale et bruitages cinétiques',
      'Personnalisation précise de personnages',
      'Édition précise par prompt de réalisation'
    ],
    maxDurationSeconds: 16,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '1:1', '21:9'],
    metrics: {
      motionQuality: 98,
      photorealism: 97,
      renderSpeed: 87,
      cameraControl: 95,
      temporalCoherence: 97
    },
    status: 'online',
    themeColor: {
      accent: '#0668E1',
      border: 'border-blue-600/40',
      bgGlow: 'from-blue-600/10 via-indigo-600/5 to-transparent',
      badgeBg: 'bg-blue-600/20',
      badgeText: 'text-blue-300'
    },
    samplePrompts: [
      'Un astronaute marchant sur le régolithe lunaire soulevant de fines poussières d\'argent, avec résonance sourde des pas et respiration spatiale.',
      'Un cascadeur sautant d\'un train à vapeur en pleine vitesse dans les Rocheuses sous un ciel crépusculaire flamboyant.'
    ],
    defaultConfig: {
      motionScale: 7.5,
      promptAdherence: 8.5,
      fps: 30,
      cameraMovement: 'cinematic' as any,
      generationMode: 'director_sequence',
      upscaling: true,
      enhancePrompt: true,
      negativePrompt: 'déformation, artefacts sonores, désynchronisation, saccades'
    }
  },
  {
    id: 'tencent_hunyuan',
    name: 'Tencent Hunyuan Video',
    version: 'Hunyuan 13B V2',
    provider: 'Tencent AI Lab',
    category: 'open_source',
    badge: 'Open Foundation 13B & 3D VAE',
    tagline: 'Le modèle vidéo ouvert de référence avec compression temporelle 3D et 1080p natif.',
    description:
      'Moteur vidéo ouvert de 13 milliards de paramètres de Tencent. Doté d\'un auto-encodeur variationnel 3D réduisant drastiquement les artefacts temporels, il offre une clarté de textures et une anatomie humaine d\'une fidélité inégalée.',
    capabilities: [
      'Poids ouverts 13B avec architecture Transformer DiT',
      'Compression temporelle 3D VAE haute fidélité',
      'Rendu des matières, cheveux et reflets liquides',
      'Contrôle de trajectoire de caméra multi-axes',
      'Alignement sémantique bilingue avancé'
    ],
    maxDurationSeconds: 25,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '21:9'],
    metrics: {
      motionQuality: 96,
      photorealism: 96,
      renderSpeed: 89,
      cameraControl: 93,
      temporalCoherence: 96
    },
    status: 'online',
    themeColor: {
      accent: '#0052D9',
      border: 'border-indigo-500/40',
      bgGlow: 'from-indigo-500/10 via-blue-500/5 to-transparent',
      badgeBg: 'bg-indigo-500/20',
      badgeText: 'text-indigo-300'
    },
    samplePrompts: [
      'Plan moyen d\'un artisan calligraphe traçant des caractères à l\'encre de chine sur papier de soie, reflets de lanterne en papier rouge.',
      'Vue cinématique d\'une nef spatiale amarrant à une station orbitale géante avec éclairage solaire direct et étoiles lointaines.'
    ],
    defaultConfig: {
      motionScale: 6.5,
      promptAdherence: 8.8,
      fps: 30,
      cameraMovement: 'dolly',
      generationMode: 'director_sequence',
      upscaling: true,
      enhancePrompt: true,
      negativePrompt: 'visages déformés, anatomie incorrecte, bruit de compression'
    }
  },
  {
    id: 'genmo_mochi_1',
    name: 'Mochi 1 HD',
    version: 'Mochi 1 AsymmDiT',
    provider: 'Genmo AI',
    category: 'motion',
    badge: 'Diffusion Asymétrique & Mouvement Liquide',
    tagline: 'Architecture Asymmetric Diffusion Transformer 10B pour une cinétique fluide et naturelle.',
    description:
      'Mochi 1 redéfinit la physique cinématique grâce à son transformateur de diffusion asymétrique (AsymmDiT). Il élimine le flou de mouvement artificiel pour une clarté optique cristalline sur les mouvements complexes et rapides.',
    capabilities: [
      'Architecture Asymmetric Diffusion Transformer (10B)',
      'Cinétique organique et mouvements liquides naturels',
      'Netteté absolue sur les particules et gouttelettes',
      'Excellente tenue sur les mouvements de rotation rapide',
      'Rendu photoréaliste anamorphique'
    ],
    maxDurationSeconds: 15,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    metrics: {
      motionQuality: 99,
      photorealism: 95,
      renderSpeed: 91,
      cameraControl: 94,
      temporalCoherence: 95
    },
    status: 'online',
    themeColor: {
      accent: '#84CC16',
      border: 'border-lime-500/40',
      bgGlow: 'from-lime-500/10 via-emerald-500/5 to-transparent',
      badgeBg: 'bg-lime-500/20',
      badgeText: 'text-lime-300'
    },
    samplePrompts: [
      'Une goutte d\'eau tombant au ralenti 240 FPS sur la surface d\'un lac miroitant, couronnes d\'ondes concentriques parfaites sous la lueur de l\'aube.',
      'Danseuse contemporaine exécutant une pirouette rapide sous un jet de poudre dorée dans un théâtre abandonné.'
    ],
    defaultConfig: {
      motionScale: 8.5,
      promptAdherence: 8,
      fps: 30,
      cameraMovement: 'orbit',
      generationMode: 'director_sequence',
      upscaling: false,
      enhancePrompt: true,
      negativePrompt: 'saccades, déformation, texture plastique'
    }
  },
  {
    id: 'zhipu_cogvideox',
    name: 'CogVideoX-5B',
    version: 'CogVideoX 5B Pro',
    provider: 'Zhipu AI & THUDM',
    category: 'open_source',
    badge: 'Compression Spatio-Temporelle 3D',
    tagline: 'Architecture VAE 3D spatio-temporelle et interprétation cinématographique profonde.',
    description:
      'Pionnier des transformateurs de diffusion vidéo 3D, CogVideoX compresse les vidéos le long des axes spatiaux et temporels, permettant de capturer l\'atmosphère et l\'intensité dramatique d\'une scène avec un grain cinéma très soigné.',
    capabilities: [
      'Encodeur 3D VAE avec compression 4x4x8',
      'Interprétation fine de prompts métaphoriques',
      'Éclairage volumétrique clair-obscur dramatique',
      'Stabilité temporelle sur les plans fixes et lents',
      'Modèle ouvert hautement optimisé'
    ],
    maxDurationSeconds: 20,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    metrics: {
      motionQuality: 93,
      photorealism: 94,
      renderSpeed: 93,
      cameraControl: 91,
      temporalCoherence: 94
    },
    status: 'online',
    themeColor: {
      accent: '#6366F1',
      border: 'border-violet-500/40',
      bgGlow: 'from-violet-500/10 via-purple-500/5 to-transparent',
      badgeBg: 'bg-violet-500/20',
      badgeText: 'text-violet-300'
    },
    samplePrompts: [
      'Plan séquence lent dans les couloirs d\'une abbaye médiévale éclairée par des cierges tremblotants, ombres projetées sur la pierre usée.',
      'Un astrophysicien observant un pulsar tournoyant sur un écran holographique géant dans un dôme d\'observation arctique.'
    ],
    defaultConfig: {
      motionScale: 6,
      promptAdherence: 8.5,
      fps: 30,
      cameraMovement: 'pan',
      generationMode: 'director_sequence',
      upscaling: true,
      enhancePrompt: true,
      negativePrompt: 'bruit vidéo, distorsion, membres surnuméraires'
    }
  },
  {
    id: 'lightricks_ltx',
    name: 'LTX Video',
    version: 'LTX 0.9.5 Realtime',
    provider: 'Lightricks Research',
    category: 'cinema',
    badge: 'DiT Temps-Réel & 50 FPS',
    tagline: 'Le moteur DiT ultra-rapide générant des plans cinématiques en temps quasi-réel.',
    description:
      'Développé par Lightricks, LTX Video combine un DiT ultra-efficace et un décodeur vidéo haute cadence pour offrir une génération quasi instantanée, conçue pour les réalisateurs recherchant l\'itération interactive et le montage direct.',
    capabilities: [
      'Vitesse record (génération en temps quasi-réel)',
      'Haute cadence d\'images fluide (jusqu\'à 50 FPS)',
      'Précision spatiale pour les travellings et plans de drone',
      'Pipeline ultra-léger et réactif',
      'Idéal pour le prototypage rapide de séquences'
    ],
    maxDurationSeconds: 15,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '21:9'],
    metrics: {
      motionQuality: 94,
      photorealism: 93,
      renderSpeed: 99,
      cameraControl: 95,
      temporalCoherence: 93
    },
    status: 'online',
    themeColor: {
      accent: '#F43F5E',
      border: 'border-rose-500/40',
      bgGlow: 'from-rose-500/10 via-pink-500/5 to-transparent',
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-300'
    },
    samplePrompts: [
      'Survol en drone FPV ultra-rapide longeant un train de marchandises serpentant dans les gorges d\'un fleuve au lever du jour.',
      'Travelling caméra épaule suivant un skateur fendant la foule sur les quais de San Francisco au soleil couchant.'
    ],
    defaultConfig: {
      motionScale: 8,
      promptAdherence: 8,
      fps: 30,
      cameraMovement: 'fpv_drone',
      generationMode: 'director_sequence',
      upscaling: false,
      enhancePrompt: true,
      negativePrompt: 'flou d\'artefact, saccade, perte de textures'
    }
  },
  {
    id: 'shengshu_vidu_2',
    name: 'Vidu 2.0',
    version: 'Vidu 2.0 Universal',
    provider: 'ShengShu AI & Tsinghua',
    category: 'realism',
    badge: 'Universal Visual & 4K Multi-Vue',
    tagline: 'Architecture Universal Visual Model pour une génération 4K ultra-détaillée et multi-perspectives.',
    description:
      'Propulsé par l\'architecture Universal Visual Model (UVM), Vidu 2.0 génère des séquences cinématographiques 4K jusqu\'à 32 secondes avec une compréhension native des lois de l\'optique, de la réfraction et de la continuité tridimensionnelle.',
    capabilities: [
      'Résolution native 4K Ultra-HD avec optique anamorphique',
      'Génération de plans longs jusqu\'à 32 secondes',
      'Gestion photoréaliste des éclairages solaires et ombres',
      'Stabilité parfaite des visages et perspectives à 360°',
      'Transitions dynamiques multi-angles fluides'
    ],
    maxDurationSeconds: 32,
    maxResolution: '4k',
    supportedAspectRatios: ['16:9', '9:16', '21:9', '1:1'],
    metrics: {
      motionQuality: 97,
      photorealism: 98,
      renderSpeed: 92,
      cameraControl: 96,
      temporalCoherence: 97
    },
    status: 'online',
    themeColor: {
      accent: '#0EA5E9',
      border: 'border-sky-500/40',
      bgGlow: 'from-sky-500/10 via-cyan-500/5 to-transparent',
      badgeBg: 'bg-sky-500/20',
      badgeText: 'text-sky-300'
    },
    samplePrompts: [
      'Vue majestueuse d\'une baleine bleue émergeant des eaux arctiques devant un glacier millénaire sous un arc-en-ciel d\'embruns.',
      'Plan anamorphique au crépuscule dans une ruelle de Venise avec reflets miroitants des gondoles sur le Grand Canal.'
    ],
    defaultConfig: {
      motionScale: 7,
      promptAdherence: 8.5,
      fps: 30,
      cameraMovement: 'dolly',
      generationMode: 'director_sequence',
      upscaling: true,
      enhancePrompt: true,
      negativePrompt: 'déformation optique, grain artificiel, saccades'
    }
  },
  {
    id: 'bytedance_jimeng',
    name: 'ByteDance Jimeng AI',
    version: 'Jimeng 2.0 Pro',
    provider: 'ByteDance AI Lab',
    category: 'cinema',
    badge: 'Animation Dynamique & Narration',
    tagline: 'Le moteur cinématique de ByteDance pour des mouvements fluides et une expressivité narrative forte.',
    description:
      'Modèle vidéo de pointe de ByteDance (architecture PixelDance 2.0), Jimeng excelle dans les scènes d\'action vives, les interactions émotionnelles fines entre personnages et le rendu stylisé des grandes productions publicitaires et cinématographiques.',
    capabilities: [
      'Animation continue de personnages en mouvement complexe',
      'Contrôle expressif du regard et de la gestuelle',
      'Gestion dynamique des variations de cadence (Speed Ramp)',
      'Émulation des objectifs optiques 35mm et 85mm portrait',
      'Cohérence narrative d\'une scène à l\'autre'
    ],
    maxDurationSeconds: 20,
    maxResolution: '1080p',
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    metrics: {
      motionQuality: 97,
      photorealism: 96,
      renderSpeed: 90,
      cameraControl: 94,
      temporalCoherence: 96
    },
    status: 'online',
    themeColor: {
      accent: '#10B981',
      border: 'border-emerald-500/40',
      bgGlow: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300'
    },
    samplePrompts: [
      'Course-poursuite à moto la nuit dans un tunnel futuriste aux lumières stroboscopiques, reflets sur la visière du pilote.',
      'Gros plan sur une chanteuse de jazz dans un club feutré, fumée de cigare bleue s\'élevant sous un spot doré tamisé.'
    ],
    defaultConfig: {
      motionScale: 7.5,
      promptAdherence: 8.5,
      fps: 30,
      cameraMovement: 'handheld',
      generationMode: 'director_sequence',
      upscaling: true,
      enhancePrompt: true,
      negativePrompt: 'visage flou, membres déformés, artefacts'
    }
  },
  {
    id: 'cineai_neural',
    name: 'CineAI Neural Engine',
    version: 'Gemini 3.8 + Realtime Audio',
    provider: 'CineAI Studio Studio Core',
    category: 'cinema',
    badge: 'Instantané & Zéro Latence',
    tagline: 'Réalisateur autonome complet, synchronisation audio multi-pistes et rendu instantané.',
    description:
      'Le moteur natif de CineAI Studio combinant le raisonnement de réalisateur de cinéma de Gemini avec le moteur de synthèse procédural 60 FPS, synchronisation des bruitages SFX et génération musicale en temps réel.',
    capabilities: [
      'Génération instantanée en 1 clic (<1 seconde)',
      'Découpage automatique multi-plans complet',
      'Bande originale adaptative 5 stems synchronisée',
      '100% Gratuit, Illimité & Fonctionne Hors-ligne (PWA)',
      'Rendu canvas matériel 60 FPS sans attente'
    ],
    maxDurationSeconds: 60,
    maxResolution: '4k',
    supportedAspectRatios: ['16:9', '9:16', '21:9', '1:1'],
    metrics: {
      motionQuality: 95,
      photorealism: 95,
      renderSpeed: 100,
      cameraControl: 98,
      temporalCoherence: 99
    },
    status: 'online',
    themeColor: {
      accent: '#A855F7',
      border: 'border-purple-500/40',
      bgGlow: 'from-purple-500/10 via-violet-500/5 to-transparent',
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-300'
    },
    samplePrompts: [
      'Séquence complète de film d\'action spatiale avec intro mystérieuse, montée en tension et explosion finale au ralenti.',
      'Bande-annonce dramatique avec voix-off percutante, montées de violons et plans au millimètre sous la pluie.'
    ],
    defaultConfig: {
      motionScale: 8,
      promptAdherence: 9,
      fps: 30,
      cameraMovement: 'cinematic' as any,
      generationMode: 'director_sequence',
      upscaling: true,
      enhancePrompt: true,
      negativePrompt: 'images floues, bruit'
    }
  }
];

export const getAgentById = (id: AiVideoAgentId): AiVideoAgent => {
  return AI_VIDEO_AGENTS.find(a => a.id === id) || AI_VIDEO_AGENTS[0];
};
