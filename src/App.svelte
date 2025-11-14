<script lang="ts">
  import { onDestroy } from "svelte";
  import ColorControls from "./components/ColorControls.svelte";
  import OutwitPreview from "./components/OutwitPreview.svelte";
  import CustomSelect from "./components/common/CustomSelect.svelte";
  import { DEFAULT_THEME } from "./constants/themeDefaults";
  import { themeStore } from "./stores/themeStore";
  import type { Theme } from "./types/theme";

  let currentTheme = $state<Theme>(DEFAULT_THEME);
  let activePresetId = $state<string | null>(themeStore.getActivePresetId());
  const presetOptions = themeStore.getPresetOptions();

  type ThemeValue = string | number | boolean | undefined;

  function stringOr(value: ThemeValue, fallback: string) {
    return typeof value === "string" && value.trim()
      ? value
      : fallback;
  }

  function parseHex(color: string) {
    if (!color || color[0] !== "#") return [255, 255, 255];
    return [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16),
    ];
  }

  function luminance([r, g, b]: number[]) {
    r /= 255;
    g /= 255;
    b /= 255;
    const a = [r, g, b].map((v) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
    );
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  function idealTextColor(hex: string) {
    try {
      const L = luminance(parseHex(hex));
      return L > 0.6 ? "#111111" : "#f2f2f2";
    } catch {
      return "#f2f2f2";
    }
  }

  function blendColors(base: string, overlay: string, alpha: number) {
    const [br, bg, bb] = parseHex(base);
    const [or, og, ob] = parseHex(overlay);
    const r = Math.round(or * alpha + br * (1 - alpha));
    const g = Math.round(og * alpha + bg * (1 - alpha));
    const b = Math.round(ob * alpha + bb * (1 - alpha));
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  function applyThemeVariables(theme: Theme) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const bg = stringOr(theme.back_color, "#242424");
    const lightness = luminance(parseHex(bg));
    const isLight = lightness > 0.6;

    const text = stringOr(theme.text_color, idealTextColor(bg));
    const label = stringOr(theme.label_color, text);
    const comment = stringOr(theme.comment_text_color, "#999999");
    const accent = stringOr(theme.hilited_candidate_back_color, "#4CAF50");
    const accentText = stringOr(
      theme.hilited_comment_text_color,
      stringOr(theme.hilited_candidate_text_color, idealTextColor(accent)),
    );
    const tabActiveText = stringOr(theme.candidate_text_color, label);
    const panel = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";
    const panelBorder = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)";
    const inputBg = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
    const inputBgFocus = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)";
    const inputBorder = panelBorder;
    const translucentDropdown = isLight
      ? "rgba(0,0,0,0.08)"
      : "rgba(255,255,255,0.08)";
    const dropdownSurface = blendColors(
      bg,
      isLight ? "#000000" : "#ffffff",
      isLight ? 0.25 : 0.18,
    );

    root.style.setProperty("--bg", bg);
    root.style.setProperty("--text", text);
    root.style.setProperty("--label", label);
    root.style.setProperty("--comment", comment);
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-text", accentText);
    root.style.setProperty("--theme-color", accent);
    root.style.setProperty("--tab-active-text", tabActiveText);
    root.style.setProperty("--panel", panel);
    root.style.setProperty("--panel-border", panelBorder);
    root.style.setProperty("--input-bg", inputBg);
    root.style.setProperty("--input-bg-focus", inputBgFocus);
    root.style.setProperty("--input-border", inputBorder);
    root.style.setProperty("--select-dropdown", translucentDropdown);
    root.style.setProperty("--select-dropdown-surface", dropdownSurface);
    const appFont = stringOr(theme.font_face, "Inter, system-ui");
    root.style.setProperty("--app-font", appFont);

    document.body.style.backgroundColor = bg;
    document.body.style.color = text;
    document.body.style.fontFamily = appFont;

    try {
      localStorage.setItem("otd-theme", JSON.stringify(theme));
    } catch (error) {
      console.warn("Failed to persist theme state", error);
    }
  }

  applyThemeVariables(DEFAULT_THEME);

  const unsubscribe = themeStore.subscribe((theme) => {
    currentTheme = theme;
    activePresetId = themeStore.getActivePresetId();
    applyThemeVariables(theme);
  });

  onDestroy(() => unsubscribe());

  function handlePresetChange(value: string) {
    if (!value) {
      themeStore.reset();
      return;
    }
    themeStore.loadPreset(value);
  }

  function handleReset() {
    themeStore.reset();
  }

  function handleExport() {
    const result = themeStore.exportTheme();
    if (!result) return;

    const blob = new Blob([result.content], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleThemeNameInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    themeStore.setThemeName(value);
  }

  function handleDisplayNameInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    themeStore.setDisplayName(value);
  }
</script>

<main class="app-root">
  <section class="app-content">
    <div class="preview-pane">
      <OutwitPreview theme={currentTheme} />
    </div>

    <div class="settings-pane">
      <section class="panel">
        <h2>主题信息</h2>
        <div class="field">
          <label for="themePreset">预设主题</label>
          <CustomSelect
            id="themePreset"
            options={[{ value: "", label: "-- 选择预设主题 --" }, ...presetOptions]}
            value={activePresetId || ""}
            on_change={handlePresetChange}
          />
        </div>
        <div class="field">
          <label for="themeId">主题标识 (color_scheme)</label>
          <input
            id="themeId"
            type="text"
            class="text-input"
            value={currentTheme.color_scheme || ""}
            oninput={handleThemeNameInput}
            placeholder="例如 amber_tea"
          />
        </div>
        <div class="field">
          <label for="themeDisplay">显示名称</label>
          <input
            id="themeDisplay"
            type="text"
            class="text-input"
            value={currentTheme.display_name || ""}
            oninput={handleDisplayNameInput}
            placeholder="例如 琥珀茶韵／Amber Tea"
          />
        </div>
        <div class="panel-actions">
          <button class="btn-secondary" onclick={handleReset}>重置</button>
          <button class="btn-primary" onclick={handleExport}>导出配置</button>
        </div>
      </section>

      <section class="panel">
        <h2>颜色设置</h2>
        <ColorControls theme={currentTheme} />
      </section>
    </div>
  </section>
</main>

