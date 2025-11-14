<script>
  let { options = [], value = "", on_change = () => {}, placeholder = "", id = "", disabled = false } = $props();
  let is_open = $state(false);
  let selected_label = $state("");
  let highlighted_index = $state(-1);

  function update_selected_label() {
    const selected_option = options.find(option => 
      typeof option === 'object' ? option.value === value : option === value
    );
    if (selected_option) {
      selected_label = typeof selected_option === 'object' ? selected_option.label : selected_option;
    } else {
      selected_label = placeholder;
    }
  }

  function handle_option_click(option) {
    const option_value = typeof option === 'object' ? option.value : option;
    on_change(option_value);
    is_open = false;
    update_selected_label();
  }

  function handle_click_outside(event) {
    if (is_open && !event.target.closest('.custom-select')) {
      is_open = false;
    }
  }

  function handle_keydown(event) {
    if (disabled) return;
    if (!is_open) {
      if (event.key === ' ' || event.key === 'Enter' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        is_open = true;
        const current_index = options.findIndex(option => 
          (typeof option === 'object' ? option.value : option) === value
        );
        highlighted_index = current_index >= 0 ? current_index : 0;
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        highlighted_index = (highlighted_index + 1) % options.length;
        scroll_to_highlighted();
        if (highlighted_index >= 0 && highlighted_index < options.length) {
          const option = options[highlighted_index];
          const option_value = typeof option === 'object' ? option.value : option;
          on_change(option_value);
          update_selected_label();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        highlighted_index = (highlighted_index - 1 + options.length) % options.length;
        scroll_to_highlighted();
        if (highlighted_index >= 0 && highlighted_index < options.length) {
          const option = options[highlighted_index];
          const option_value = typeof option === 'object' ? option.value : option;
          on_change(option_value);
          update_selected_label();
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        is_open = false;
        break;
      case 'Escape':
        event.preventDefault();
        is_open = false;
        break;
      case 'Home':
        event.preventDefault();
        highlighted_index = 0;
        scroll_to_highlighted();
        if (options.length > 0) {
          const option = options[0];
          const option_value = typeof option === 'object' ? option.value : option;
          on_change(option_value);
          update_selected_label();
        }
        break;
      case 'End':
        event.preventDefault();
        highlighted_index = options.length - 1;
        scroll_to_highlighted();
        if (options.length > 0) {
          const option = options[options.length - 1];
          const option_value = typeof option === 'object' ? option.value : option;
          on_change(option_value);
          update_selected_label();
        }
        break;
    }
  }

  function scroll_to_highlighted() {
    setTimeout(() => {
      const dropdown = document.querySelector('.custom-select .select-dropdown');
      const highlighted = dropdown?.querySelector('.select-option.highlighted');
      if (highlighted && dropdown) {
        const dropdown_rect = dropdown.getBoundingClientRect();
        const option_rect = highlighted.getBoundingClientRect();
        if (option_rect.bottom > dropdown_rect.bottom || option_rect.top < dropdown_rect.top) {
          highlighted.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }, 0);
  }

  update_selected_label();

  $effect(() => {
    update_selected_label();
  });

  $effect(() => {
    if (is_open) {
      document.addEventListener('click', handle_click_outside);
    } else {
      document.removeEventListener('click', handle_click_outside);
    }
    return () => {
      document.removeEventListener('click', handle_click_outside);
    };
  });

  $effect(() => {
    if (is_open) {
      const current_index = options.findIndex(option => 
        (typeof option === 'object' ? option.value : option) === value
      );
      highlighted_index = current_index >= 0 ? current_index : 0;
    } else {
      highlighted_index = -1;
    }
  });
</script>

<div
  class="custom-select"
  class:id={id}
  class:disabled={disabled}
  class:open={is_open}
  role="combobox"
  aria-haspopup="listbox"
  aria-expanded={is_open}
  aria-controls={id ? `${id}-listbox` : undefined}
  tabindex={disabled ? -1 : 0}
  onkeydown={handle_keydown}
>
  <button
    type="button"
    class="select-trigger"
    class:open={is_open}
    class:disabled={disabled}
    onclick={() => !disabled && (is_open = !is_open)}
  >
    <span class="select-value">{selected_label || placeholder}</span>
    <span class="select-arrow">▼</span>
  </button>

  {#if is_open}
    <ul
      class="select-dropdown"
      role="listbox"
      id={id ? `${id}-listbox` : undefined}
    >
      {#each options as option, index}
        <li role="presentation">
          <button
            type="button"
            class="select-option"
            class:selected={value === (typeof option === 'object' ? option.value : option)}
            class:highlighted={index === highlighted_index}
            role="option"
            aria-selected={value === (typeof option === 'object' ? option.value : option)}
            onclick={() => handle_option_click(option)}
            onmouseenter={() => highlighted_index = index}
            onfocus={() => highlighted_index = index}
            id={id ? `${id}-option-${index}` : undefined}
          >
            {typeof option === 'object' ? option.label : option}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
