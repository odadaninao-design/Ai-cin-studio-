import React from 'react';
import { ProjectState, ArtisticFilter } from '../../types/video';
import { ARTISTIC_FILTERS } from '../../data/filters';
import { Sliders, Sparkles, Film, Sun, Palette, Check } from 'lucide-react';

interface SidebarFiltersProps {
  project: ProjectState;
  selectedClipId: string | null;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  project,
  selectedClipId,
  onUpdateProject,
}) => {
  const activeClip = project.clips.find(c => c.id === selectedClipId) || project.clips[0];

  const handleApplyFilter = (filterId: ArtisticFilter) => {
    onUpdateProject(prev => {
      if (selectedClipId) {
        return {
          ...prev,
          clips: prev.clips.map(c =>
            c.id === selectedClipId ? { ...c, filter: filterId } : c
          ),
        };
      } else {
        // Apply globally
        return {
          ...prev,
          globalFilter: filterId,
          clips: prev.clips.map(c => ({ ...c, filter: filterId })),
        };
      }
    });
  };

  const currentFilter = activeClip?.filter || project.globalFilter;
  const currentIntensity = activeClip?.filterIntensity ?? 80;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-300 select-none">
      {/* Header */}
      <div>
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span>Filtres Artistiques & Étalonnage</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {selectedClipId ? `Application au plan sélectionné (${activeClip?.title})` : 'Application globale au projet'}
        </p>
      </div>

      {/* Filter Intensity Slider */}
      <div className="p-3 rounded-xl bg-[#121520] border border-[#202538] space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-200">Intensité du Filtre</span>
          <span className="font-mono text-amber-400">{currentIntensity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={currentIntensity}
          onChange={e => {
            const val = Number(e.target.value);
            onUpdateProject(prev => ({
              ...prev,
              clips: prev.clips.map(c =>
                c.id === (activeClip?.id || '') ? { ...c, filterIntensity: val } : c
              ),
            }));
          }}
          className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#202638] rounded-lg"
        />
      </div>

      {/* Visual Filter Cards Grid */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-200">Galerie de LUTs & Filtres Cinématographiques</label>
        <div className="grid grid-cols-2 gap-2">
          {ARTISTIC_FILTERS.map(filter => {
            const isSelected = currentFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => handleApplyFilter(filter.id)}
                className={`relative p-2.5 rounded-xl text-left border transition-all overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/20 bg-[#161a28]'
                    : 'border-[#202538] hover:border-slate-600 bg-[#10131e]'
                }`}
              >
                {/* Visual Color Preview Bar */}
                <div
                  className="h-1.5 w-full rounded-full mb-2"
                  style={{ background: filter.previewGradient }}
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                    {filter.name}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </div>

                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{filter.category}</span>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">{filter.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* VFX Overlays Switches */}
      <div className="p-3.5 rounded-xl bg-[#121520] border border-[#202538] space-y-3">
        <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-cyan-400" />
          <span>Effets Optiques & Overlays Vidéo</span>
        </h4>

        <div className="space-y-2.5">
          {/* Letterbox */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-slate-300">Barres Cinémascope 2.39:1</span>
            <input
              type="checkbox"
              checked={project.vfxOverlays.letterbox}
              onChange={e =>
                onUpdateProject(prev => ({
                  ...prev,
                  vfxOverlays: { ...prev.vfxOverlays, letterbox: e.target.checked },
                }))
              }
              className="accent-violet-500 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Film Grain */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-slate-300">Grain Argentique Dynamique 35mm</span>
            <input
              type="checkbox"
              checked={project.vfxOverlays.filmGrain}
              onChange={e =>
                onUpdateProject(prev => ({
                  ...prev,
                  vfxOverlays: { ...prev.vfxOverlays, filmGrain: e.target.checked },
                }))
              }
              className="accent-violet-500 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Anamorphic Flares */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-slate-300">Reflets Bleus Anamorphiques (Lens Flare)</span>
            <input
              type="checkbox"
              checked={project.vfxOverlays.anamorphicFlares}
              onChange={e =>
                onUpdateProject(prev => ({
                  ...prev,
                  vfxOverlays: { ...prev.vfxOverlays, anamorphicFlares: e.target.checked },
                }))
              }
              className="accent-violet-500 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* VHS Scanlines */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-slate-300">Scanlines Cathodiques Rétro (CRT/VHS)</span>
            <input
              type="checkbox"
              checked={project.vfxOverlays.vhsScanlines}
              onChange={e =>
                onUpdateProject(prev => ({
                  ...prev,
                  vfxOverlays: { ...prev.vfxOverlays, vhsScanlines: e.target.checked },
                }))
              }
              className="accent-violet-500 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
