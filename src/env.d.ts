/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module "*.yaml?raw" {
  const content: string;
  export default content;
}

declare module "*.yml?raw" {
  const content: string;
  export default content;
}

declare module "*.svelte" {
  import type { SvelteComponentTyped } from "svelte";
  export default class Component extends SvelteComponentTyped<any, any, any> {}
}
