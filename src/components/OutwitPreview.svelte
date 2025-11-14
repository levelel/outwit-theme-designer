<script>
  let { theme = {} } = $props();

  // Font stacks（候选项字体/标签字体/注释字体）
  let previewFont = $derived(
    theme.font_face ||
      "Microsoft YaHei UI, Microsoft YaHei, Segoe UI, Noto Sans CJK SC, Arial, sans-serif",
  );
  let labelFont = $derived(theme.label_font_face || previewFont);
  let commentFont = $derived(theme.comment_font_face || previewFont);
  let fontSize = $derived(
    theme.font_point ? Math.max(10, Number(theme.font_point)) : 14,
  );
  let labelFontSize = $derived(
    theme.label_font_point
      ? Math.max(8, Number(theme.label_font_point))
      : fontSize,
  );
  let commentFontSize = $derived(
    theme.comment_font_point
      ? Math.max(8, Number(theme.comment_font_point))
      : Math.max(10, fontSize - 2),
  );
  const PREEDIT_FIXED_SIZE = 16; // 预编辑区字号固定，不随字体大小变化

  // 布局参数（仅作用外层面板）
  let cornerRadius = $derived(theme.corner_radius ?? 8);
  let borderWidth = $derived(theme.border_width ?? 2);
  let marginX = $derived(theme.margin_x ?? 12);
  let marginY = $derived(theme.margin_y ?? 8);
  let candidateGap = $derived(theme.candidate_spacing ?? 22);
  let rowSpacing = $derived(theme.spacing ?? 13);
  let hilitePadding = $derived(theme.hilite_padding ?? 8);
  let shadowRadius = $derived(theme.shadow_radius ?? 10);
  let shadowOffsetX = $derived(theme.shadow_offset_x ?? 0);
  let shadowOffsetY = $derived(theme.shadow_offset_y ?? 6);
  let shadowColor = $derived(theme.shadow_color || "rgba(0,0,0,0.25)");
  let candidateCorner = $derived(theme.round_corner ?? 8);

  // 明暗推断用于输入框配色
  function parseHex(c) {
    if (!c || c[0] !== "#") return [255, 255, 255];
    return [
      parseInt(c.slice(1, 3), 16),
      parseInt(c.slice(3, 5), 16),
      parseInt(c.slice(5, 7), 16),
    ];
  }
  function luminance([r, g, b]) {
    r /= 255;
    g /= 255;
    b /= 255;
    const a = [r, g, b].map((v) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
    );
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  let bg = $derived(theme.back_color || "#eceeee");
  let L = $derived(luminance(parseHex(bg)));
  let inputBg = $derived(
    L > 0.6 ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.10)",
  );
  let inputBorder = $derived(
    L > 0.6 ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.18)",
  );

  // 预览宽度缩放（当前：横版 100%，竖版 75%）
  const H_SCALE = 1;
  const V_SCALE = 0.75;
  const H_BASE_WIDTH = 560;
  const V_BASE_WIDTH = 260;
  let hWidth = $derived(Math.round(H_BASE_WIDTH * H_SCALE));
  let vWidth = $derived(Math.round(V_BASE_WIDTH * V_SCALE));

  // 数据集
  const sharedCandidates = [
    { text: "几维", label: "1", code: "wn wv" },
    { text: "极为", label: "2", code: "ma dx" },
    { text: "几位", label: "3", code: "wn vi" },
    { text: "即为", label: "4", code: "rp dx" },
    { text: "继位", label: "5", code: "wx vi" },
  ];
  const sampleHorizontal = {
    candidates: sharedCandidates,
    highlighted: 0,
    preedit: "ji wei;ww 输入法",
  };
  const sampleVertical = {
    preedit: "ji wei;ww 输入法",
    candidates: sharedCandidates.map((c) => ({ ...c })),
    highlighted: 0,
  };

  // 将 preedit 拆分为「拼音」与「后缀」两部分，光标在拼音末尾
  function splitPreedit(text) {
    const i = text.lastIndexOf(" ");
    return i === -1
      ? { py: text, tail: "" }
      : { py: text.slice(0, i), tail: text.slice(i + 1) };
  }
  let hPre = $derived(splitPreedit(sampleHorizontal.preedit));
  let vPre = $derived(splitPreedit(sampleVertical.preedit));

  // 横版专用：更紧凑的间距与内边距
  let compactGap = $derived(Math.max(4, Math.round(candidateGap * 0.28)));
  const CHIP_PAD_X_H = 6;

  const CHIP_PAD_X = 8;
  let BAR_HEIGHT = $derived(Math.max(28, Math.round(fontSize * 2.2)));

  function numericOr(value, fallback) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return fallback;
  }

  let panelPadding = $derived(numericOr(theme.padding, 4));

  function shadowStyle(color) {
    if (!color || color === "#00000000") return "none";
    return `0 1px 2px ${color}`;
  }
  function isTransparent(color) {
    if (!color) return true;
    if (color === "transparent") return true;
    if (color.toLowerCase && color.toLowerCase() === "#00000000") return true;
    return /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0(?:\.0+)?\s*\)$/i.test(
      String(color),
    );
  }
  function borderCss(color) {
    return isTransparent(color) ? "none" : `1px solid ${color}`;
  }
</script>

<div class="preview-container">
  <h2>主题预览</h2>

  <div class="layout-previews">
    <div class="layout-preview section">
      <h4>横版布局</h4>
      <div class="canvas-wrapper">
        <div
          class="mock-horizontal"
          style="background-color:{theme.back_color}; border-color:{theme.border_color}; border-width:{theme.border_width}px; border-radius:{theme.corner_radius}px; gap:{theme.spacing}px; padding:{panelPadding}px;"
        >
          <!-- 拼音固定在候选面板左上角，模拟输入框+光标（光标位于拼音末尾） -->
          <div
            class="preedit-in"
            style="font-family:{previewFont}; color:{theme.text_color ||
              'var(--text)'}; font-size:{PREEDIT_FIXED_SIZE}px;"
          >
            <span
              class="searchbox"
              style="background-color:{inputBg}; border-color:{inputBorder};"
            >
              <span class="underline">{hPre.py}</span><span
                class="caret"
                style="background:{theme.text_color || 'var(--text)'}"
              ></span><span>{hPre.tail ? " " + hPre.tail : ""}</span>
            </span>
          </div>
          <!-- 紧凑化间距，防止超出边框 -->
          <div class="chips" style="height:100%; padding-right:{marginX}px;">
            {#each sampleHorizontal.candidates as candidate, index}
              <div
                class="chip"
                class:highlighted={index === sampleHorizontal.highlighted}
                style="
                  margin-left:{index === 0
                  ? index === sampleHorizontal.highlighted
                    ? 0
                    : marginX
                  : compactGap}px;
                  color: {index === sampleHorizontal.highlighted
                  ? theme.hilited_candidate_text_color || '#ffffff'
                  : theme.candidate_text_color || '#000000'};
                  background-color: {index === sampleHorizontal.highlighted
                  ? theme.hilited_candidate_back_color || '#0a5d9e'
                  : theme.candidate_back_color || 'transparent'};
                  border: {borderCss(
                  index === sampleHorizontal.highlighted
                    ? theme.hilited_candidate_border_color || 'transparent'
                    : theme.candidate_border_color || 'transparent',
                )};
                  box-shadow: {index === sampleHorizontal.highlighted
                  ? shadowStyle(theme.hilited_candidate_shadow_color)
                  : shadowStyle(theme.candidate_shadow_color)};
                  border-radius: {candidateCorner}px;
                  padding: 6px {CHIP_PAD_X_H}px;
                "
              >
                {#if index === sampleHorizontal.highlighted && theme.hilited_mark_color}
                  <span
                    class="mark"
                    style="background:{theme.hilited_mark_color};"
                  ></span>
                {/if}
                <span
                  class="chip-label"
                  style="font-family: {labelFont}; font-size:{labelFontSize -
                    1}px; color: {index === sampleHorizontal.highlighted
                    ? theme.hilited_label_color ||
                      theme.hilited_candidate_text_color ||
                      '#ffffff'
                    : theme.label_color || '#666666'};">{candidate.label}</span
                >
                <span
                  class="chip-text"
                  style="font-family: {previewFont}; font-size:{fontSize}px;"
                  >{candidate.text}</span
                >
                <span
                  class="chip-code"
                  style="font-family: {commentFont}; font-size:{commentFontSize}px; color: {index ===
                  sampleHorizontal.highlighted
                    ? theme.hilited_comment_text_color ||
                      theme.comment_text_color ||
                      '#7c6bf0'
                    : theme.comment_text_color || '#7c6bf0'};"
                  >{candidate.code}</span
                >
              </div>
            {/each}
            <!-- 去除翻页符号 -->
          </div>
        </div>
      </div>
    </div>

    <div class="layout-preview section">
      <h4>竖版布局</h4>
      <div class="canvas-wrapper">
        <div
          class="mock-vertical"
          style="background-color:{theme.back_color}; border-color:{theme.border_color}; border-width:{theme.border_width}px; border-radius:{theme.corner_radius}px; gap:{theme.spacing}px; padding:{panelPadding}px;"
        >
          <!-- 拼音固定在候选面板左上角，模拟输入框+光标（光标位于拼音末尾） -->
          <div
            class="preedit-in"
            style="font-family:{previewFont}; color:{theme.text_color ||
              'var(--text)'}; font-size:{PREEDIT_FIXED_SIZE}px;"
          >
            <span
              class="searchbox"
              style="background-color:{inputBg}; border-color:{inputBorder};"
            >
              <span class="underline">{vPre.py}</span><span
                class="caret"
                style="background:{theme.text_color || 'var(--text)'}"
              ></span><span>{vPre.tail ? " " + vPre.tail : ""}</span>
            </span>
          </div>
          <div
            class="candidates vertical"
            style="row-gap: {Math.max(2, Math.floor(rowSpacing / 4))}px;"
          >
            {#each sampleVertical.candidates as candidate, index}
              <div
                class="row"
                class:highlighted={index === sampleVertical.highlighted}
                style="
                  background-color: {index === sampleVertical.highlighted
                  ? theme.hilited_candidate_back_color || '#0a5d9e'
                  : theme.candidate_back_color || 'transparent'};
                  color: {index === sampleVertical.highlighted
                  ? theme.hilited_candidate_text_color || '#ffffff'
                  : theme.candidate_text_color || '#000000'};
                  border: {borderCss(
                  index === sampleVertical.highlighted
                    ? theme.hilited_candidate_border_color || 'transparent'
                    : theme.candidate_border_color || 'transparent',
                )};
                  box-shadow: {index === sampleVertical.highlighted
                  ? shadowStyle(theme.hilited_candidate_shadow_color)
                  : shadowStyle(theme.candidate_shadow_color)};
                  border-radius: {candidateCorner}px;
                  padding: {index === sampleVertical.highlighted
                  ? Math.max(8, hilitePadding / 1.5)
                  : 6}px {index === sampleVertical.highlighted
                  ? Math.max(8, hilitePadding)
                  : 8}px;
                "
              >
                {#if index === sampleVertical.highlighted && theme.hilited_mark_color}
                  <span
                    class="mark"
                    style="background:{theme.hilited_mark_color};"
                  ></span>
                {/if}
                <span
                  class="v-label"
                  style="font-family: {labelFont}; font-size:{labelFontSize -
                    1}px; color: {index === sampleVertical.highlighted
                    ? theme.hilited_label_color ||
                      theme.hilited_candidate_text_color ||
                      '#ffffff'
                    : theme.label_color || '#666666'};">{candidate.label}.</span
                >
                <span
                  class="v-text"
                  style="font-family: {previewFont}; font-size:{fontSize}px;"
                  >{candidate.text}</span
                >
                <span
                  class="v-code"
                  style="font-family:{commentFont}; font-size:{commentFontSize}px; color:{index ===
                  sampleVertical.highlighted
                    ? theme.hilited_comment_text_color ||
                      theme.comment_text_color ||
                      '#7c6bf0'
                    : theme.comment_text_color || '#7c6bf0'}; opacity:.9;"
                  >{candidate.code}</span
                >
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
