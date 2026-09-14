import { ProjectState } from '../types/video';
import { cinematicRenderer } from './cinematicRenderer';
import { adaptiveAudio } from '../audio/adaptiveAudioEngine';

export interface ExportProgress {
  progress: number; // 0 to 100
  status: string;
  currentSecond: number;
  totalSeconds: number;
}

export async function exportVideo(
  project: ProjectState,
  onProgress: (progress: ExportProgress) => void
): Promise<{ blob: Blob; downloadUrl: string; filename: string }> {
  const totalDuration = project.clips.reduce((acc, c) => acc + c.duration, 0);
  if (totalDuration <= 0) {
    throw new Error('La vidéo ne contient aucun plan.');
  }

  // Determine export canvas resolution
  let exportWidth = 1920;
  let exportHeight = 1080;

  if (project.aspectRatio === '9:16') {
    exportWidth = 1080;
    exportHeight = 1920;
  } else if (project.aspectRatio === '1:1') {
    exportWidth = 1080;
    exportHeight = 1080;
  } else if (project.aspectRatio === '21:9') {
    exportWidth = 2560;
    exportHeight = 1080;
  }

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Impossible d\'initialiser le contexte de rendu 2D.');
  }

  // Preload images
  onProgress({ progress: 5, status: 'Préchargement des éléments cinématographiques...', currentSecond: 0, totalSeconds: totalDuration });
  cinematicRenderer.preloadClipImages(project.clips);
  await new Promise(r => setTimeout(r, 600));

  // Initialize audio stream
  adaptiveAudio.init();
  adaptiveAudio.updateSoundtrackConfig(project.soundtrack);
  const audioStream = adaptiveAudio.getAudioStream();

  // Capture canvas video stream
  const canvasStream = exportCanvas.captureStream(30);

  // Combine video + audio streams
  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
  if (audioStream) {
    audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
  }

  // Check supported mime types
  let mimeType = 'video/webm;codecs=vp9,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
  }

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 6000000 // 6 Mbps high quality
  });

  recorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<{ blob: Blob; downloadUrl: string; filename: string }>((resolve, reject) => {
    recorder.onstop = () => {
      adaptiveAudio.pause();
      const finalBlob = new Blob(recordedChunks, { type: mimeType });
      const downloadUrl = URL.createObjectURL(finalBlob);
      const cleanTitle = (project.title || 'CineAI_Video').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${cleanTitle}_${Date.now()}.webm`;
      resolve({ blob: finalBlob, downloadUrl, filename });
    };

    recorder.onerror = err => {
      adaptiveAudio.pause();
      reject(err);
    };
  });

  recorder.start(100);
  adaptiveAudio.seek(0);
  adaptiveAudio.play();

  // Render loop in real-time
  const fps = 30;
  const frameIntervalMs = 1000 / fps;
  let currentTime = 0;

  await new Promise<void>(resolve => {
    const interval = setInterval(() => {
      currentTime += 1 / fps;

      // Render frame
      cinematicRenderer.renderFrame(ctx, exportWidth, exportHeight, project, currentTime);

      const percent = Math.min(Math.round((currentTime / totalDuration) * 90) + 5, 98);
      onProgress({
        progress: percent,
        status: `Rendu cinématographique en cours (${currentTime.toFixed(1)}s / ${totalDuration.toFixed(1)}s)...`,
        currentSecond: Math.min(currentTime, totalDuration),
        totalSeconds: totalDuration
      });

      if (currentTime >= totalDuration) {
        clearInterval(interval);
        onProgress({
          progress: 99,
          status: 'Finalisation et assemblage du fichier vidéo...',
          currentSecond: totalDuration,
          totalSeconds: totalDuration
        });
        setTimeout(() => {
          recorder.stop();
          resolve();
        }, 300);
      }
    }, frameIntervalMs);
  });

  return await recordingPromise;
}
