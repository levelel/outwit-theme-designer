import type { Theme } from "../types/theme";

export function hexToRgba(hex: string): string {
  if (!hex || hex[0] !== "#") return "0x00000000";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = hex.length >= 9 ? parseInt(hex.slice(7, 9), 16) : 255;
  return `0x${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}${a
    .toString(16)
    .padStart(2, "0")}`;
}

function normalizeColor(
  value: string,
  colorFormat: string
): string | null {
  const m = value.trim().match(/^0x([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
  if (!m) return null;
  const hex = m[1];
  if (hex.length === 6) {
    return `#${hex.toLowerCase()}ff`;
  }
  const lower = colorFormat.toLowerCase();
  if (lower === "rgba") {
    const rr = hex.slice(0, 2);
    const gg = hex.slice(2, 4);
    const bb = hex.slice(4, 6);
    const aa = hex.slice(6, 8);
    return `#${rr}${gg}${bb}${aa}`.toLowerCase();
  }
  if (lower === "argb") {
    const aa = hex.slice(0, 2);
    const rr = hex.slice(2, 4);
    const gg = hex.slice(4, 6);
    const bb = hex.slice(6, 8);
    return `#${rr}${gg}${bb}${aa}`.toLowerCase();
  }
  const aa = hex.slice(0, 2);
  const rr = hex.slice(6, 8);
  const gg = hex.slice(4, 6);
  const bb = hex.slice(2, 4);
  return `#${rr}${gg}${bb}${aa}`.toLowerCase();
}

export function parseThemeYaml(yamlText: string, baseTheme: Theme): Theme {
  const result: Theme = { ...baseTheme };
  const mPreset = yamlText.match(/(?:^|\n)preset_color_schemes:\s*\n([\s\S]*)/);
  const afterPreset = mPreset ? mPreset[1] : yamlText;
  const nameMatch = afterPreset.match(/^[\t ]{2}([A-Za-z0-9_\-]+):\s*$/m);
  if (!nameMatch) return result;
  const themeName = nameMatch[1];
  const themeBlockMatch = afterPreset.match(
    new RegExp(
      `(^[\t ]+${themeName}:\s*\n)([\s\S]*?)(^[\t ]{2}[A-Za-z0-9_\-]+:\s*$|\Z)`,
      "m"
    )
  );
  const themeBlock = themeBlockMatch ? themeBlockMatch[2] : afterPreset;
  let colorFormat = "abgr";
  const cfMatch = themeBlock.match(/^[\t ]{4}color_format:\s*([a-zA-Z]+)\s*$/m);
  if (cfMatch) colorFormat = cfMatch[1].toLowerCase();
  const nameFieldMatch = themeBlock.match(/^[\t ]{4}name:\s*"([^"]*)"/m);
  if (nameFieldMatch) {
    result.display_name = nameFieldMatch[1];
  }
  const lineRegex = /^[\t ]{4}([a-zA-Z0-9_]+):\s*(0x[0-9a-fA-F]{6,8})\s*$/gm;
  let m;
  while ((m = lineRegex.exec(themeBlock))) {
    const key = m[1];
    const valHex = normalizeColor(m[2], colorFormat);
    if (valHex) {
      result[key] = valHex.toUpperCase();
    }
  }
  result.color_scheme = themeName;
  return result;
}

export function serializeThemeToYaml(theme: Theme, name: string): string {
  const keys: string[] = [
    "text_color",
    "shadow_color",
    "label_color",
    "comment_text_color",
    "border_color",
    "back_color",
    "candidate_text_color",
    "hilited_text_color",
    "hilited_back_color",
    "hilited_shadow_color",
    "hilited_candidate_text_color",
    "hilited_candidate_border_color",
    "hilited_candidate_back_color",
    "hilited_candidate_shadow_color",
    "hilited_label_color",
    "hilited_comment_text_color",
    "hilited_mark_color",
    "nextpage_color",
    "prevpage_color"
  ];
  const lines = keys
    .filter((k) => theme[k])
    .map((k) => `    ${k}: ${hexToRgba(theme[k] as string)}`);
  const displayName = theme.display_name || name;
  return `preset_color_schemes:\n  ${name}:\n    name: "${displayName}"\n    author: "几维输入法"\n    color_format: rgba\n${lines.join("\n")}\n`;
}
