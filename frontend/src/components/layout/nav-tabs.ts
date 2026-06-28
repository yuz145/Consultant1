import type { AppTab } from "../../types";

interface NavTabsResult {
  root: HTMLElement;
  setActive: (tab: AppTab) => void;
}

const TAB_LABELS: Record<AppTab, string> = {
  dashboard: "Dashboard",
  consultation: "Consultation",
  "log-update": "Log Update"
};

export function createNavTabs(onChange: (tab: AppTab) => void): NavTabsResult {
  const nav = document.createElement("nav");
  nav.className = "tab-nav";

  const buttons = new Map<AppTab, HTMLButtonElement>();

  (Object.keys(TAB_LABELS) as AppTab[]).forEach((tab) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab-button";
    button.textContent = TAB_LABELS[tab];
    button.addEventListener("click", () => onChange(tab));
    nav.appendChild(button);
    buttons.set(tab, button);
  });

  const setActive = (tab: AppTab): void => {
    buttons.forEach((button, key) => {
      button.classList.toggle("is-active", key === tab);
    });
  };

  return { root: nav, setActive };
}
