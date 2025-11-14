<script>
  import { themeStore } from '../stores/themeStore';
  let { theme = {} } = $props();

  const groups = [
    {
      title: '高亮候选区域',
      keys: {
        hilited_candidate_back_color: '高亮候选词背景色',
        hilited_candidate_text_color: '高亮候选词文字色',
        // hilited_candidate_border_color: '高亮候选词边框色',
        // hilited_candidate_shadow_color: '高亮候选词阴影色',
        hilited_label_color: '高亮标签色',
        hilited_comment_text_color: '高亮注释文字色',
        hilited_mark_color: '高亮标记色'
      }
    },
    {
      title: '普通候选区域',
      keys: {
        // candidate_back_color: '候选词背景色',
        candidate_text_color: '候选词文字色',
        // candidate_border_color: '候选词边框色',
        // candidate_shadow_color: '候选词阴影色',
        label_color: '标签色',
        comment_text_color: '注释文字色'
      }
    },
    {
      title: '编码与高亮区域',
      keys: {
        back_color: '面板背景色',
        text_color: '面板文字色',
        border_color: '面板边框色',
        hilited_back_color: '高亮编码区背景色',
        hilited_text_color: '高亮编码区文字色',
        hilited_shadow_color: '高亮编码区阴影色'
      }
    }
  ];

  function hex8ToCss(hex8){
    // supports #RRGGBB or #RRGGBBAA
    if (!hex8) return '#00000000';
    if (hex8.length === 7) return hex8;
    if (hex8.length === 9){
      const r = parseInt(hex8.slice(1,3),16);
      const g = parseInt(hex8.slice(3,5),16);
      const b = parseInt(hex8.slice(5,7),16);
      const a = parseInt(hex8.slice(7,9),16)/255;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return '#00000000';
  }
  function cssToHex8WithAlpha(css, fallback){
    // accepts #RRGGBB, #RRGGBBAA, rgb(), rgba()
    if (!css) return fallback || '#00000000';
    const v = css.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) return v + 'FF';
    if (/^#[0-9a-fA-F]{8}$/.test(v)) return v.toUpperCase();
    const m = v.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\)$/i);
    if (m){
      const r = Math.max(0, Math.min(255, parseInt(m[1])));
      const g = Math.max(0, Math.min(255, parseInt(m[2])));
      const b = Math.max(0, Math.min(255, parseInt(m[3])));
      const a = m[4] == null ? 1 : Math.max(0, Math.min(1, parseFloat(m[4])));
      const rr = r.toString(16).padStart(2,'0');
      const gg = g.toString(16).padStart(2,'0');
      const bb = b.toString(16).padStart(2,'0');
      const aa = Math.round(a*255).toString(16).padStart(2,'0');
      return `#${rr}${gg}${bb}${aa}`.toUpperCase();
    }
    return fallback || '#00000000';
  }
  function handleColorChange(colorKey, event){
    const base = (event.target.value || '#000000').toUpperCase();
    const old = theme[colorKey] || '#000000FF';
    const alpha = old.length===9 ? old.slice(7,9) : 'FF';
    themeStore.updateProperty(colorKey, (base.slice(0,7) + alpha).toUpperCase());
  }
  function handleAlphaPercentChange(colorKey, event){
    const p = Math.max(0, Math.min(100, parseInt(event.target.value)||0));
    const aa = Math.round(p/100*255).toString(16).padStart(2,'0').toUpperCase();
    const old = theme[colorKey] || '#000000FF';
    const base = (old.length>=7? old.slice(0,7) : '#000000');
    themeStore.updateProperty(colorKey, (base + aa).toUpperCase());
  }
  function handleHexChange(colorKey, event){
    let v = event.target.value.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9A-F]{6}$/i.test(v) || /^#[0-9A-F]{8}$/i.test(v)){
      themeStore.updateProperty(colorKey, v.toUpperCase());
    }
  }
</script>

<div class="container-grid">
    {#each groups as group}
      <div class="container">
        <h4>{group.title}</h4>
      {#each Object.entries(group.keys) as [key, label]}
        <div class="color-input" style:opacity={theme[key] && theme[key].endsWith('00') ? 0.5 : 1}>
          <label for={key}>{label}:</label>
          <input type="color" value={(theme[key]||'#000000').slice(0,7)} oninput={(e)=> handleColorChange(key, e)} />
          <input class="alpha-input" type="number" min="0" max="100" value={(theme[key]&&theme[key].length===9)? Math.round(parseInt(theme[key].slice(7,9),16)/255*100) : 100} oninput={(e)=> handleAlphaPercentChange(key, e)} />
          <span class="percent">%</span>
          <input class="color-value" type="text" value={theme[key] ? theme[key].replace('#', '') : ''} oninput={(e) => handleHexChange(key, e)} placeholder="RRGGBB 或 RRGGBBAA" maxlength="8" />
        </div>
      {/each}
    </div>
  {/each}
</div>



