import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Built-in presets for free instant offline or fallback generation
const CINEMATIC_PRESETS: Record<string, any> = {
  cyberpunk: {
    title: "NEON PROTOCOL : TOKYO 2088",
    tagline: "Dans les profondeurs du cyber-espace, la mémoire est une marchandise.",
    directorNote: "Esthétique Neo-Noir avec néons saturés magenta/cyan, reflets sur asphalte mouillé et cadrages anamorphiques cinémascope.",
    globalFilter: "neo_noir",
    colorGrade: "neo_noir",
    soundtrack: {
      mood: "cyberpunk_synth",
      bpm: 110,
      scale: "minor",
    },
    clips: [
      {
        title: "Survol de la Mégalopole",
        description: "Vue aérienne plongeante d'une métropole futuriste baignée d'hologrammes géants sous une pluie fine nocturne.",
        visualPrompt: "Cinematic drone view of Neo-Tokyo futuristic megacity at night, rain-slicked skyscrapers, massive neon holographic billboards, flying vehicles, Blade Runner 2049 aesthetic, photorealistic 8k, anamorphic lens flare.",
        camera: { motion: "tilt_down", speed: 1.0, intensity: 0.8 },
        filter: "neo_noir",
        filterIntensity: 85,
        duration: 4.5,
        voiceover: "La ville ne dort jamais. Elle calcule, elle vend, elle efface.",
        sfxCue: { type: "riser", time: 0.2 },
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "L'Hacker Solitaire",
        description: "Gros plan sur le regard d'un opérateur cyborg devant un mur de terminaux phosphorescents.",
        visualPrompt: "Extreme close-up on cyborg cyber-hacker eyes reflecting glowing cyber terminal code, neon blue and violet reflections, volumetric mist, high detail cinema camera, shallow depth of field.",
        camera: { motion: "dolly_in", speed: 1.2, intensity: 0.9 },
        filter: "neo_noir",
        filterIntensity: 90,
        duration: 4.0,
        voiceover: "Chaque donnée est une étincelle volée au néant.",
        sfxCue: { type: "glitch", time: 1.5 },
        imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "L'Allée des Secrets",
        description: "Plan américain dans une ruelle étroite éclairée par des enseignes lumineuses vacillantes.",
        visualPrompt: "Medium wide shot of a lone trenchcoat figure walking through a misty cyberpunk alleyway with flickering neon kanji signs, steam rising from grates, wet pavement.",
        camera: { motion: "pan_right", speed: 0.8, intensity: 0.7 },
        filter: "blade_runner",
        filterIntensity: 80,
        duration: 4.5,
        voiceover: "Le signal a été transmis. Il n'y a plus aucun retour en arrière.",
        sfxCue: { type: "boom", time: 3.5 },
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "L'Ascension Digitale",
        description: "Plan large contre-plongée vers la flèche de la tour corpo fendant les nuages d'orage.",
        visualPrompt: "Dramatic low angle shot looking up at monolithic corporate megatower spire piercing thunderous clouds, laser beams scanning the night sky, futuristic sci-fi epic.",
        camera: { motion: "zoom_in", speed: 1.1, intensity: 0.8 },
        filter: "neo_noir",
        filterIntensity: 95,
        duration: 5.0,
        voiceover: "Le protocole Oméga est désormais activé.",
        sfxCue: { type: "hit", time: 0.5 },
        imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80"
      }
    ]
  },
  cinema_noir: {
    title: "L'OMBRE DU SOUPÇON",
    tagline: "À minuit, toutes les vérités deviennent grises.",
    directorNote: "Style Noir classique intemporel avec fort clair-obscur, ombres vénitiennes tranchées et grain 35mm d'époque.",
    globalFilter: "bw_noir",
    colorGrade: "bw_noir",
    soundtrack: {
      mood: "dark_suspense",
      bpm: 82,
      scale: "minor",
    },
    clips: [
      {
        title: "La Ruelle Sous la Pluie",
        description: "Pavés luisants sous la lueur d'un réverbère à gaz, silhouettes furtives dans la brume.",
        visualPrompt: "Classic film noir scene, wet cobblestone street at night, vintage lamppost casting long dramatic shadows, silhouetted detective in fedora, heavy contrast, 35mm grain.",
        camera: { motion: "pan_left", speed: 0.7, intensity: 0.6 },
        filter: "bw_noir",
        filterIntensity: 100,
        duration: 4.0,
        voiceover: "Paris ne pardonne pas à ceux qui posent trop de questions.",
        sfxCue: { type: "whoosh", time: 0.1 },
        imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "Le Bureau du Détective",
        description: "Lumière filtrée à travers des stores vénitiens, fumée de cigare montant vers le ventilateur de plafond.",
        visualPrompt: "Interior 1940s detective office, venetian blinds casting shadow lines across vintage mahogany desk, typewriter, swirling cigarette smoke in dramatic shaft of light.",
        camera: { motion: "dolly_in", speed: 0.9, intensity: 0.7 },
        filter: "bw_noir",
        filterIntensity: 95,
        duration: 4.5,
        voiceover: "Le dossier était scellé depuis dix ans. Jusqu'à cette nuit.",
        sfxCue: { type: "boom", time: 2.0 },
        imageUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "Le Dernier Rendez-vous",
        description: "Gros plan sur une montre à gousset et une lettre scellée à la cire rouge.",
        visualPrompt: "Close-up macro shot of antique pocket watch ticking near a handwritten letter on aged parchment, dramatic single source chiaroscuro lighting.",
        camera: { motion: "zoom_in", speed: 0.8, intensity: 0.5 },
        filter: "bw_noir",
        filterIntensity: 100,
        duration: 4.0,
        voiceover: "Le compte à rebours avait commencé avant même mon arrivée.",
        sfxCue: { type: "hit", time: 1.0 },
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80"
      }
    ]
  },
  epic_nature: {
    title: "LES DERNIERS GÉANTS",
    tagline: "Là où la terre rencontre le ciel, l'éternité prend forme.",
    directorNote: "Prises de vues grandioses en lumière naturelle dorée, caméras gyrostabilisées et sensation d'immensité atmosphérique.",
    globalFilter: "golden_hour",
    colorGrade: "golden_hour",
    soundtrack: {
      mood: "epic_orchestral",
      bpm: 96,
      scale: "major",
    },
    clips: [
      {
        title: "Le Réveil des Cimes",
        description: "Survol drone majestueux au-dessus des crêtes enneigées caressées par les premiers rayons du soleil.",
        visualPrompt: "Magnificent cinematic drone sweep over majestic snow-capped mountain peaks during golden hour sunrise, alpine mist drifting in deep valleys, golden rays, IMAX 70mm style.",
        camera: { motion: "dolly_out", speed: 1.0, intensity: 0.8 },
        filter: "golden_hour",
        filterIntensity: 80,
        duration: 5.0,
        voiceover: "À cette altitude, le temps cesse d'avoir une prise sur les choses.",
        sfxCue: { type: "riser", time: 0.5 },
        imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "Le Miroir Émeraude",
        description: "Plan fluide au ras de l'eau d'un lac glaciaire turquoise reflétant la forêt boréale.",
        visualPrompt: "Low-angle smooth camera glide skimming mirror-like turquoise glacial lake reflecting pristine pine forest, golden sun flare, photorealistic 8k, serene cinematic.",
        camera: { motion: "dolly_in", speed: 1.1, intensity: 0.7 },
        filter: "kodak_35mm",
        filterIntensity: 75,
        duration: 4.5,
        voiceover: "Chaque reflet raconte dix mille ans d'histoire silencieuse.",
        sfxCue: { type: "whoosh", time: 2.0 },
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "L'Océan d'Or",
        description: "Plan d'ensemble panoramique révélant un coucher de soleil incandescent au-dessus des brumes.",
        visualPrompt: "Grand panoramic sunset over rugged sea cliffs, powerful ocean waves breaking into golden spray, warm sunset bloom, breathtaking cinematic masterpiece.",
        camera: { motion: "pan_right", speed: 0.8, intensity: 0.7 },
        filter: "golden_hour",
        filterIntensity: 90,
        duration: 5.0,
        voiceover: "La nature nous rappelle qui nous sommes vraiment.",
        sfxCue: { type: "boom", time: 3.0 },
        imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1600&q=80"
      }
    ]
  }
};

// POST /api/ai/director - Transform user prompt into full cinematic project structure
app.post('/api/ai/director', async (req, res) => {
  try {
    const {
      prompt,
      style = 'cinematic',
      duration = 15,
      filter = 'neo_noir',
      aspectRatio = '16:9',
      agentId = 'google_veo_2'
    } = req.body;

    const gemini = getGeminiClient();

    // Try generating with Gemini models (with fallback across standard models if high demand/503)
    if (gemini && process.env.GEMINI_API_KEY) {
      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      const systemInstruction = `Tu es un réalisateur de cinéma primé et un monteur vidéo de légende (style Christopher Nolan, Denis Villeneuve, Ridley Scott).
Ton travail est de transformer l'idée brute d'un utilisateur en une séquence cinématographique professionnelle découpée en plans prêts pour le montage.
Chaque plan doit comporter des instructions de cadrage cinématographique précises (mouvement de caméra, éclairage, prompt visuel haute définition, voix-off percutante en français).
Tu dois répondre STRICTEMENT en JSON conforme au schéma demandé.`;

      const userPrompt = `Voici la vision de l'utilisateur : "${prompt || 'Une séquence cinématographique futuriste et poétique'}".
Durée cible totale : environ ${duration} secondes.
Style souhaité : ${style}.
Filtre artistique initial : ${filter}.
Rapport de cadre : ${aspectRatio}.

Génère une production cinématographique complète avec 3 à 5 plans détaillés.
Pour chaque plan :
- title: titre poétique ou technique du plan (ex: "L'Entrée dans la Nébuleuse")
- description: description visuelle en français
- visualPrompt: prompt de rendu visuel en anglais très détaillé, photoréaliste, avec mots-clés de caméra de cinéma (ex: "anamorphic lens, 8k resolution, photorealistic cinematic lighting, 35mm film grain")
- camera: { motion: une des valeurs "dolly_in" | "dolly_out" | "pan_left" | "pan_right" | "tilt_up" | "tilt_down" | "orbit" | "zoom_in" | "handheld", speed: nombre entre 0.6 et 1.5, intensity: nombre entre 0.5 et 1.0 }
- filter: une des valeurs ("neo_noir" | "blade_runner" | "wes_anderson" | "kodak_35mm" | "nolan_imax" | "golden_hour" | "bw_noir" | "matrix_phosphor" | "vintage_vhs" | "clean_cinema")
- filterIntensity: nombre entre 60 et 100
- duration: durée du plan en secondes (généralement entre 3.0 et 5.5)
- voiceover: texte de narration ou voix-off percutant en français (1 à 2 phrases courtes puissantes)
- sfxCue: { type: "boom" | "whoosh" | "riser" | "glitch" | "hit", time: nombre de secondes }

Pour la bande-son adaptative :
- mood: "epic_orchestral" | "cyberpunk_synth" | "lofi_ambient" | "dark_suspense" | "uplifting_cinema" | "action_hybrid"
- bpm: nombre entre 75 et 130
- scale: "minor" ou "major"`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          tagline: { type: Type.STRING },
          directorNote: { type: Type.STRING },
          globalFilter: { type: Type.STRING },
          colorGrade: { type: Type.STRING },
          soundtrack: {
            type: Type.OBJECT,
            properties: {
              mood: { type: Type.STRING },
              bpm: { type: Type.NUMBER },
              scale: { type: Type.STRING }
            },
            required: ['mood', 'bpm', 'scale']
          },
          clips: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                visualPrompt: { type: Type.STRING },
                camera: {
                  type: Type.OBJECT,
                  properties: {
                    motion: { type: Type.STRING },
                    speed: { type: Type.NUMBER },
                    intensity: { type: Type.NUMBER }
                  },
                  required: ['motion', 'speed', 'intensity']
                },
                filter: { type: Type.STRING },
                filterIntensity: { type: Type.NUMBER },
                duration: { type: Type.NUMBER },
                voiceover: { type: Type.STRING },
                sfxCue: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    time: { type: Type.NUMBER }
                  },
                  required: ['type', 'time']
                }
              },
              required: ['title', 'description', 'visualPrompt', 'camera', 'duration', 'voiceover']
            }
          }
        },
        required: ['title', 'tagline', 'directorNote', 'soundtrack', 'clips']
      };

      for (const modelName of candidateModels) {
        try {
          const response = await gemini.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema,
            }
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            const stockImages = [
              "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
              "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
              "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80",
              "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
              "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80",
              "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80",
              "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1600&q=80"
            ];

            parsed.id = `proj_${Date.now()}`;
            parsed.globalFilter = parsed.globalFilter || parsed.colorGrade || filter || 'neo_noir';
            parsed.colorGrade = parsed.globalFilter;
            parsed.aspectRatio = aspectRatio || '16:9';
            parsed.activeAgentId = agentId;
            parsed.clips = (parsed.clips || []).map((clip: any, index: number) => ({
              ...clip,
              id: clip.id || `clip_${Date.now()}_${index}`,
              filter: clip.filter || parsed.globalFilter || 'neo_noir',
              imageUrl: clip.imageUrl || stockImages[index % stockImages.length],
              generatedByAgent: clip.generatedByAgent || agentId,
            }));

            return res.json({ success: true, project: parsed, source: 'gemini', model: modelName });
          }
        } catch (_err) {
          // Model busy/unavailable, will try next candidate or fall back gracefully
          continue;
        }
      }
      console.log('[AI Director] High demand on AI models, seamlessly engaged procedural director.');
    }

    // High quality intelligent fallback (100% Free, Instant & Fully Working)
    const promptLower = (prompt || '').toLowerCase();
    let selectedPreset = CINEMATIC_PRESETS.cyberpunk;

    if (promptLower.includes('noir') || promptLower.includes('detective') || promptLower.includes('nuit') || promptLower.includes('mystere')) {
      selectedPreset = CINEMATIC_PRESETS.cinema_noir;
    } else if (promptLower.includes('nature') || promptLower.includes('montagne') || promptLower.includes('ocean') || promptLower.includes('foret') || promptLower.includes('soleil')) {
      selectedPreset = CINEMATIC_PRESETS.epic_nature;
    }

    // Customize the preset with the user's specific prompt
    const customized = JSON.parse(JSON.stringify(selectedPreset));
    customized.id = `proj_${Date.now()}`;
    customized.aspectRatio = aspectRatio || '16:9';
    customized.activeAgentId = agentId;
    if (filter) {
      customized.globalFilter = filter;
      customized.colorGrade = filter;
    }
    customized.clips = (customized.clips || []).map((clip: any, index: number) => ({
      ...clip,
      id: clip.id || `clip_${Date.now()}_${index}`,
      filter: clip.filter || customized.globalFilter || 'neo_noir',
      generatedByAgent: clip.generatedByAgent || agentId,
    }));

    if (prompt && prompt.trim().length > 0) {
      customized.tagline = `« ${prompt.trim()} »`;
    }

    return res.json({ success: true, project: customized, source: 'procedural' });
  } catch (error: any) {
    console.error('Error in /api/ai/director:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors de la génération' });
  }
});

// POST /api/ai/enhance-prompt - Enhance simple text into high-end cinematic prompt
app.post('/api/ai/enhance-prompt', async (req, res) => {
  try {
    const { text, style } = req.body;
    const gemini = getGeminiClient();

    if (gemini && process.env.GEMINI_API_KEY && text) {
      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      const promptContent = `Transform this short idea into a breathtaking 2-sentence Hollywood movie director description and lighting prompt (in French) with cinematic camera terminology: "${text}". Style: ${style || 'cinematographique'}. Return only the enriched text.`;

      for (const modelName of candidateModels) {
        try {
          const response = await gemini.models.generateContent({
            model: modelName,
            contents: promptContent,
          });
          if (response.text && response.text.trim()) {
            return res.json({ enhanced: response.text.trim() });
          }
        } catch (_err) {
          continue;
        }
      }
    }

    // Procedural enhancement fallback
    return res.json({
      enhanced: `${text || 'Scène'} — Cadrage anamorphique 35mm, éclairage volumétrique haute précision, atmosphère feutrée et palette colorimétrique travaillée avec soin.`
    });
  } catch (_err) {
    return res.json({
      enhanced: `${req.body?.text || 'Scène'} — Plan de cinéma 4K HDR, éclairage cinématographique précis.`
    });
  }
});

// Server configuration for Dev (Vite middleware) and Prod (Static)
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Vite Dev Server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 CineAI Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
