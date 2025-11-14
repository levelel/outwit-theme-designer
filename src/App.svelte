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

  const unsubscribe = themeStore.subscribe((theme) => {
    currentTheme = theme;
    activePresetId = themeStore.getActivePresetId();
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
  <header class="app-header">
    <h1>几维 Outwit 输入法主题设计工具</h1>
    <p>为几维输入法 (Outwit) 和 Rime 平台快速定制配色，实时预览横纵版界面，并可一键导出 YAML 主题文件。</p>
  </header>

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

