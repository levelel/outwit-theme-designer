import { DEFAULT_THEME } from "../constants/themeDefaults";
import type { Theme } from "../types/theme";
import { parseThemeYaml } from "../utils/themeParser";

export interface ThemePreset {
  id: string;
  label: string;
  filename: string;
  content: string;
  theme: Theme;
}

const modules = import.meta.glob("./themes/*.yaml", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;

function cloneTheme(theme: Theme): Theme {
  return JSON.parse(JSON.stringify(theme));
}

export const PRESETS: ThemePreset[] = Object.entries(modules)
  .map(([path, content]) => {
    const parsed = parseThemeYaml(content, DEFAULT_THEME);
    const filename = path.split("/").pop() ?? "theme.yaml";
    const id = parsed.color_scheme || filename.replace(/\.yaml$/i, "");
    const label = parsed.display_name || id;
    return {
      id,
      label,
      filename,
      content,
      theme: cloneTheme(parsed)
    } satisfies ThemePreset;
  })
  .sort((a, b) => a.label.localeCompare(b.label, "zh-Hans"));

export function findPresetById(id: string): ThemePreset | undefined {
  return PRESETS.find((preset) => preset.id === id);
}

