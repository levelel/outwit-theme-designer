import { get, writable } from "svelte/store";
import { DEFAULT_THEME } from "../constants/themeDefaults";
import type { Theme } from "../types/theme";
import { PRESETS, findPresetById } from "../presets";
import { serializeThemeToYaml } from "../utils/themeParser";

function cloneTheme(theme: Theme): Theme {
  return JSON.parse(JSON.stringify(theme));
}

function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_\-]+/g, "")
    .toLowerCase() || "custom_theme";
}

const store = writable<Theme>(cloneTheme(DEFAULT_THEME));
let activePresetId: string | null = null;
let lastLoadedPresetId: string | null = null;

if (PRESETS.length > 0) {
  const first = PRESETS[0];
  activePresetId = first.id;
  lastLoadedPresetId = first.id;
  store.set(cloneTheme(first.theme));
}

type ThemeStore = {
  subscribe: typeof store.subscribe;
  loadPreset: (id: string) => void;
  reset: () => void;
  updateProperty: (key: string, value: string | number | boolean) => void;
  setThemeName: (value: string) => void;
  setDisplayName: (value: string) => void;
  exportTheme: () => { filename: string; content: string; theme: Theme } | null;
  getActivePresetId: () => string | null;
  getPresetOptions: () => { value: string; label: string }[];
};

function createThemeStore(): ThemeStore {
  return {
    subscribe: store.subscribe,
    loadPreset: (id: string) => {
      const preset = findPresetById(id);
      if (!preset) return;
      activePresetId = preset.id;
      lastLoadedPresetId = preset.id;
      store.set(cloneTheme(preset.theme));
    },
    reset: () => {
      if (lastLoadedPresetId) {
        const preset = findPresetById(lastLoadedPresetId);
        if (preset) {
          activePresetId = preset.id;
          store.set(cloneTheme(preset.theme));
          return;
        }
      }
      activePresetId = null;
      store.set(cloneTheme(DEFAULT_THEME));
    },
    updateProperty: (key, value) => {
      store.update((theme) => ({ ...theme, [key]: value }));
      if (key !== "color_scheme" && key !== "display_name") {
        activePresetId = null;
      }
    },
    setThemeName: (value: string) => {
      store.update((theme) => ({ ...theme, color_scheme: value }));
      activePresetId = null;
    },
    setDisplayName: (value: string) => {
      store.update((theme) => ({ ...theme, display_name: value }));
      activePresetId = null;
    },
    exportTheme: () => {
      const current = get(store);
      if (!current) return null;
      const inferredName = current.color_scheme || activePresetId || "custom_theme";
      const themeName = sanitizeFileName(inferredName);
      const content = serializeThemeToYaml(current, themeName);
      return {
        filename: `${themeName}.yaml`,
        content,
        theme: cloneTheme(current)
      };
    },
    getActivePresetId: () => activePresetId,
    getPresetOptions: () => PRESETS.map((preset) => ({ value: preset.id, label: preset.label }))
  };
}

export const themeStore = createThemeStore();

