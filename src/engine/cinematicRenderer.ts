import { VideoClip, ProjectState, ArtisticFilter, CameraMotion } from '../types/video';

export class CinematicRenderer {
  private imageCache: Map<string, HTMLImageElement> = new Map();

  public preloadClipImages(clips: VideoClip[]) {
    clips.forEach(clip => {
      if (clip.imageUrl && !this.imageCache.has(clip.imageUrl)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = clip.imageUrl;
        img.onload = () => {
          this.imageCache.set(clip.imageUrl, img);
        };
      }
    });
  }

  public getImage(url: string): HTMLImageElement | null {
    if (!url) return null;
    let img = this.imageCache.get(url);
    if (!img) {
      img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      this.imageCache.set(url, img);
    }
    return img.complete && img.naturalWidth > 0 ? img : null;
  }

  public renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    project: ProjectState,
    currentTime: number
  ) {
    const { clips, globalFilter, vfxOverlays, aspectRatio } = project;

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    if (clips.length === 0) {
      // Empty state
      ctx.fillStyle = '#64748b';
      ctx.font = '16px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Aucun plan dans la séquence. Cliquez sur Générer pour créer votre vidéo.', width / 2, height / 2);
      return;
    }

    // Determine current active clip and time within clip
    let accumulatedTime = 0;
    let activeClipIndex = -1;
    let timeInClip = 0;

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      if (currentTime >= accumulatedTime && currentTime < accumulatedTime + clip.duration) {
        activeClipIndex = i;
        timeInClip = currentTime - accumulatedTime;
        break;
      }
      accumulatedTime += clip.duration;
    }

    // Handle end of video (hold last frame)
    if (activeClipIndex === -1 && currentTime >= accumulatedTime) {
      activeClipIndex = clips.length - 1;
      timeInClip = clips[activeClipIndex].duration;
    }

    const currentClip = clips[activeClipIndex];
    if (!currentClip) return;

    const clipProgress = Math.min(Math.max(timeInClip / currentClip.duration, 0), 1);
    const filterToUse = currentClip.filter || globalFilter || 'neo_noir';
    const filterIntensity = (currentClip.filterIntensity ?? 80) / 100;

    // Check transition with previous clip
    const transitionDuration = currentClip.transitionDuration || 0.6;
    const isTransitioning = timeInClip < transitionDuration && activeClipIndex > 0;
    const prevClip = isTransitioning ? clips[activeClipIndex - 1] : null;

    ctx.save();

    // Render base clip visual with camera motion
    if (isTransitioning && prevClip) {
      const transProgress = timeInClip / transitionDuration;
      // Draw previous clip
      this.drawClipVisual(ctx, width, height, prevClip, 1.0, filterToUse, filterIntensity);

      // Handle transition effects
      ctx.save();
      switch (currentClip.transitionIn) {
        case 'flash_white':
          ctx.globalAlpha = Math.sin(transProgress * Math.PI) * 0.9;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
          ctx.save();
          ctx.globalAlpha = transProgress;
          this.drawClipVisual(ctx, width, height, currentClip, clipProgress, filterToUse, filterIntensity);
          break;

        case 'wipe_left': {
          ctx.beginPath();
          ctx.rect(0, 0, width * transProgress, height);
          ctx.clip();
          this.drawClipVisual(ctx, width, height, currentClip, clipProgress, filterToUse, filterIntensity);
          break;
        }

        case 'glitch': {
          ctx.globalAlpha = transProgress;
          // Random scanline shift
          const glitchOffset = (Math.random() - 0.5) * 30 * (1 - transProgress);
          ctx.translate(glitchOffset, 0);
          this.drawClipVisual(ctx, width, height, currentClip, clipProgress, filterToUse, filterIntensity);
          break;
        }

        case 'cross_dissolve':
        default:
          ctx.globalAlpha = transProgress;
          this.drawClipVisual(ctx, width, height, currentClip, clipProgress, filterToUse, filterIntensity);
          break;
      }
      ctx.restore();
    } else {
      this.drawClipVisual(ctx, width, height, currentClip, clipProgress, filterToUse, filterIntensity);
    }

    ctx.restore();

    // Render Artistic Filter Shaders & Color Grading Overlay
    this.applyArtisticColorGrade(ctx, width, height, filterToUse, filterIntensity, currentClip.colorGrading);

    // Render Atmospheric VFX Overlays
    if (vfxOverlays.filmGrain) {
      this.renderFilmGrain(ctx, width, height, currentClip.colorGrading.grain || 35);
    }

    if (vfxOverlays.anamorphicFlares) {
      this.renderAnamorphicFlare(ctx, width, height, clipProgress);
    }

    if (vfxOverlays.vhsScanlines) {
      this.renderVhsScanlines(ctx, width, height);
    }

    // Subtitles / Captions
    this.renderSubtitles(ctx, width, height, currentClip, timeInClip);

    // Aspect Ratio Letterbox Mask (Cinemascope 21:9 or chosen aspect)
    this.renderAspectRatioLetterbox(ctx, width, height, aspectRatio, vfxOverlays.letterbox);
  }

  private drawClipVisual(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    clip: VideoClip,
    progress: number,
    _filter: ArtisticFilter,
    _filterIntensity: number
  ) {
    const img = this.getImage(clip.imageUrl);

    ctx.save();

    // Apply Camera Motion Transforms (Dolly, Pan, Tilt, Orbit, Zoom)
    const { motion = 'dolly_in', speed = 1.0, intensity = 0.8 } = clip.camera || {};
    const motionProgress = progress * speed;

    let scale = 1.0;
    let translateX = 0;
    let translateY = 0;

    switch (motion as CameraMotion) {
      case 'dolly_in':
        scale = 1.0 + motionProgress * 0.25 * intensity;
        break;
      case 'dolly_out':
        scale = 1.25 - motionProgress * 0.22 * intensity;
        break;
      case 'pan_left':
        scale = 1.15;
        translateX = (1 - motionProgress) * 60 * intensity;
        break;
      case 'pan_right':
        scale = 1.15;
        translateX = -motionProgress * 60 * intensity;
        break;
      case 'tilt_up':
        scale = 1.15;
        translateY = (1 - motionProgress) * 45 * intensity;
        break;
      case 'tilt_down':
        scale = 1.15;
        translateY = -motionProgress * 45 * intensity;
        break;
      case 'orbit':
        scale = 1.18;
        translateX = Math.sin(motionProgress * Math.PI * 1.5) * 35 * intensity;
        translateY = Math.cos(motionProgress * Math.PI * 1.5) * 20 * intensity;
        break;
      case 'zoom_in':
        scale = 1.0 + Math.pow(motionProgress, 1.3) * 0.35 * intensity;
        break;
      case 'handheld': {
        scale = 1.1;
        const time = Date.now() / 1000;
        translateX = Math.sin(time * 2.2) * 8 * intensity;
        translateY = Math.cos(time * 1.7) * 6 * intensity;
        break;
      }
      case 'static':
      default:
        scale = 1.05;
        break;
    }

    ctx.translate(width / 2 + translateX, height / 2 + translateY);
    ctx.scale(scale, scale);

    if (img) {
      // Draw image to cover canvas while maintaining aspect ratio
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;
      let drawW = width;
      let drawH = height;

      if (imgRatio > canvasRatio) {
        drawH = height;
        drawW = height * imgRatio;
      } else {
        drawW = width;
        drawH = width / imgRatio;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      // Fallback procedural visual gradient representing the scene
      const grad = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(-width / 2, -height / 2, width, height);

      // Scene Title Tag
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 24px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.fillText(clip.title.toUpperCase(), 0, -20);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(clip.description, 0, 20);
    }

    ctx.restore();
  }

  private applyArtisticColorGrade(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    filter: ArtisticFilter,
    intensity: number,
    grading?: { brightness: number; contrast: number; saturation: number; temperature: number; vignette: number }
  ) {
    if (intensity <= 0) return;

    ctx.save();

    // 1. Filter-specific tone overlays
    switch (filter) {
      case 'neo_noir': {
        // Cyan in shadows, Magenta in highlights
        const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.8);
        grad.addColorStop(0, `rgba(236, 72, 153, ${0.18 * intensity})`);
        grad.addColorStop(1, `rgba(6, 182, 212, ${0.28 * intensity})`);
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, width, height);

        // Deep contrast boost
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgba(10, 10, 25, ${0.25 * intensity})`;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'blade_runner': {
        // Heavy amber / orange atmospheric haze
        const amberGrad = ctx.createLinearGradient(0, 0, 0, height);
        amberGrad.addColorStop(0, `rgba(245, 158, 11, ${0.22 * intensity})`);
        amberGrad.addColorStop(1, `rgba(217, 119, 6, ${0.35 * intensity})`);
        ctx.fillStyle = amberGrad;
        ctx.globalCompositeOperation = 'color';
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'wes_anderson': {
        // Warm pastel yellow/ivory tint and vintage soft saturation
        ctx.fillStyle = `rgba(254, 240, 138, ${0.22 * intensity})`;
        ctx.globalCompositeOperation = 'color-burn';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = `rgba(251, 146, 60, ${0.12 * intensity})`;
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'kodak_35mm': {
        // Kodak Portra warm skin tones & gentle halation
        ctx.fillStyle = `rgba(251, 191, 36, ${0.14 * intensity})`;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = `rgba(180, 83, 9, ${0.1 * intensity})`;
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'nolan_imax': {
        // High contrast, deep blacks, cold steel-blue shadows
        const nolanGrad = ctx.createLinearGradient(0, 0, width, height);
        nolanGrad.addColorStop(0, `rgba(30, 58, 138, ${0.25 * intensity})`);
        nolanGrad.addColorStop(1, `rgba(15, 23, 42, ${0.35 * intensity})`);
        ctx.fillStyle = nolanGrad;
        ctx.globalCompositeOperation = 'color-burn';
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'golden_hour': {
        // Sunset bloom radiating from upper corner
        const sunGrad = ctx.createRadialGradient(width * 0.8, height * 0.15, 10, width * 0.8, height * 0.15, width * 0.9);
        sunGrad.addColorStop(0, `rgba(253, 224, 71, ${0.45 * intensity})`);
        sunGrad.addColorStop(0.4, `rgba(249, 115, 22, ${0.28 * intensity})`);
        sunGrad.addColorStop(1, `rgba(120, 53, 15, ${0.1 * intensity})`);
        ctx.fillStyle = sunGrad;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'bw_noir': {
        // Pure monochrome high-contrast
        ctx.fillStyle = '#000000';
        ctx.globalCompositeOperation = 'color';
        ctx.fillRect(0, 0, width, height);

        // Shadow crunch
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * intensity})`;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'matrix_phosphor': {
        // CRT Phosphor green
        ctx.fillStyle = `rgba(34, 197, 94, ${0.25 * intensity})`;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = `rgba(5, 46, 22, ${0.35 * intensity})`;
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'vintage_vhs': {
        // VHS color bleed & tint
        ctx.fillStyle = `rgba(168, 85, 247, ${0.15 * intensity})`;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'clean_cinema':
      default:
        // Subtle film contrast
        ctx.fillStyle = `rgba(15, 23, 42, ${0.1 * intensity})`;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(0, 0, width, height);
        break;
    }

    // 2. Custom Vignette Shading
    const vignetteAmount = (grading?.vignette ?? 40) / 100;
    if (vignetteAmount > 0) {
      const vignetteGrad = ctx.createRadialGradient(
        width / 2, height / 2, width * 0.35,
        width / 2, height / 2, width * 0.75
      );
      vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGrad.addColorStop(1, `rgba(0,0,0,${0.85 * vignetteAmount})`);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }

  private renderFilmGrain(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) {
    if (amount <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = Math.min(amount / 200, 0.35);

    // Procedural noise speckles
    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = 120;
    grainCanvas.height = 120;
    const grainCtx = grainCanvas.getContext('2d');
    if (grainCtx) {
      const imgData = grainCtx.createImageData(120, 120);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 40;
      }
      grainCtx.putImageData(imgData, 0, 0);

      const pattern = ctx.createPattern(grainCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);
      }
    }

    ctx.restore();
  }

  private renderAnamorphicFlare(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const flareY = height * 0.45 + Math.sin(progress * Math.PI) * 15;

    // Horizontal blue streak flare
    const streakGrad = ctx.createLinearGradient(0, flareY, width, flareY);
    streakGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    streakGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.15)');
    streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
    streakGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.15)');
    streakGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.fillStyle = streakGrad;
    ctx.fillRect(0, flareY - 3, width, 6);

    // Glow core
    const coreGrad = ctx.createRadialGradient(width * 0.5, flareY, 2, width * 0.5, flareY, 120);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    coreGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.2)');
    coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(width * 0.5, flareY, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderVhsScanlines(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }
    ctx.restore();
  }

  private renderSubtitles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    clip: VideoClip,
    _timeInClip: number
  ) {
    if (!clip.voiceover || clip.voiceover.trim().length === 0) return;

    ctx.save();
    const text = clip.voiceover;
    const fontSize = Math.max(Math.floor(height * 0.042), 16);

    ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const y = height * 0.88;

    // Background pill for pristine contrast & legibility
    const metrics = ctx.measureText(text);
    const paddingX = 24;
    const paddingY = 10;
    const boxW = Math.min(metrics.width + paddingX * 2, width * 0.88);
    const boxH = fontSize + paddingY * 2;

    ctx.fillStyle = 'rgba(10, 12, 18, 0.75)';
    ctx.beginPath();
    ctx.roundRect((width - boxW) / 2, y - boxH + 4, boxW, boxH, 8);
    ctx.fill();

    // Text rendering with drop shadow
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    ctx.fillText(text, width / 2, y - paddingY / 2);

    ctx.restore();
  }

  private renderAspectRatioLetterbox(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    aspect: string,
    forceLetterbox: boolean
  ) {
    ctx.save();
    ctx.fillStyle = '#000000';

    if (aspect === '21:9' || forceLetterbox) {
      // 2.39:1 Cinemascope bars
      const targetRatio = 2.39;
      const visibleHeight = width / targetRatio;
      const barHeight = Math.max((height - visibleHeight) / 2, 0);

      if (barHeight > 0) {
        ctx.fillRect(0, 0, width, barHeight);
        ctx.fillRect(0, height - barHeight, width, barHeight);
      }
    } else if (aspect === '9:16') {
      // Vertical mask (pillars on left and right)
      const targetRatio = 9 / 16;
      const visibleWidth = height * targetRatio;
      const pillarWidth = Math.max((width - visibleWidth) / 2, 0);

      if (pillarWidth > 0) {
        ctx.fillRect(0, 0, pillarWidth, height);
        ctx.fillRect(width - pillarWidth, 0, pillarWidth, height);
      }
    } else if (aspect === '1:1') {
      // Square mask
      const size = Math.min(width, height);
      const pillarX = Math.max((width - size) / 2, 0);
      const barY = Math.max((height - size) / 2, 0);

      if (pillarX > 0) {
        ctx.fillRect(0, 0, pillarX, height);
        ctx.fillRect(width - pillarX, 0, pillarX, height);
      }
      if (barY > 0) {
        ctx.fillRect(0, 0, width, barY);
        ctx.fillRect(0, height - barY, width, barY);
      }
    }

    ctx.restore();
  }
}

export const cinematicRenderer = new CinematicRenderer();
