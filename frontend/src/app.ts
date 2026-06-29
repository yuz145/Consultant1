import { ApiClient } from "./api/client";
import { createHeader } from "./components/layout/header";
import { createNavTabs } from "./components/layout/nav-tabs";
import { isApiBaseUrlConfigured } from "./lib/api";
import { renderConsultationPage } from "./pages/consultation";
import { renderDashboardPage } from "./pages/dashboard";
import { renderLogUpdatePage } from "./pages/log-update";
import type { AppTab } from "./types";

const appRoot = document.getElementById("app");
if (!appRoot) {
  throw new Error("#app element not found");
}

const api = new ApiClient();

function createAuthScreen(onAuthenticated: () => void): HTMLElement {
  const section = document.createElement("section");
  section.className = "auth-card";

  const title = document.createElement("h2");
  title.textContent = "管理トークンを入力";

  const desc = document.createElement("p");
  desc.className = "muted";
  desc.textContent = "ADMIN_TOKEN はこのセッションのメモリのみで保持されます。";

  const nodes: Node[] = [title, desc];

  if (!isApiBaseUrlConfigured()) {
    const warning = document.createElement("p");
    warning.className = "muted";
    warning.textContent = "VITE_API_BASE_URL is not configured";
    nodes.push(warning);
  }

  const input = document.createElement("input");
  input.type = "password";
  input.className = "input";
  input.placeholder = "ADMIN_TOKEN";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "primary-button";
  button.textContent = "認証";

  const status = document.createElement("p");
  status.className = "muted";

  button.addEventListener("click", async () => {
    const token = input.value.trim();
    if (!token) {
      status.textContent = "トークンを入力してください。";
      return;
    }

    button.disabled = true;
    status.textContent = "確認中...";

    try {
      await api.postAdminLogin(token);
      api.setAdminToken(token);
      onAuthenticated();
    } catch (error) {
      api.clearAdminToken();
      status.textContent = error instanceof Error ? error.message : "トークンが正しくありません";
      button.disabled = false;
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      button.click();
    }
  });

  section.append(...nodes, input, button, status);
  return section;
}

async function mountApp(): Promise<void> {
  appRoot.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "app-shell";

  const header = createHeader("Relationship Advisor");
  const content = document.createElement("main");
  content.className = "app-main";

  let activeTab: AppTab = "dashboard";

  const tabs = createNavTabs(async (tab) => {
    activeTab = tab;
    tabs.setActive(tab);
    await renderActiveTab();
  });

  async function renderActiveTab(): Promise<void> {
    if (activeTab === "dashboard") {
      await renderDashboardPage(content, api);
      return;
    }

    if (activeTab === "consultation") {
      await renderConsultationPage(content, api);
      return;
    }

    await renderLogUpdatePage(content, api);
  }

  const signOut = document.createElement("button");
  signOut.type = "button";
  signOut.className = "secondary-button sign-out";
  signOut.textContent = "トークンを破棄";
  signOut.addEventListener("click", () => {
    api.clearAdminToken();
    bootstrap();
  });

  const topBar = document.createElement("div");
  topBar.className = "top-bar";
  topBar.append(tabs.root, signOut);

  shell.append(header, topBar, content);
  appRoot.appendChild(shell);

  tabs.setActive(activeTab);
  await renderActiveTab();
}

function bootstrap(): void {
  appRoot.innerHTML = "";

  if (!api.hasAdminToken()) {
    const auth = createAuthScreen(() => {
      void mountApp();
    });
    appRoot.appendChild(auth);
    return;
  }

  void mountApp();
}

bootstrap();
