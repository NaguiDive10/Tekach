import { tekach } from "./index";

declare global {
  interface Window {
    tekach: typeof tekach;
  }
}

if (typeof window !== "undefined") {
  window.tekach = tekach;
}
