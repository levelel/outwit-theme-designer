export interface Theme {
  color_scheme: string;
  display_name?: string;
  color_scheme_dark?: string;
  author?: string;
  [key: string]: string | number | boolean | undefined;
}
