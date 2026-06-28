import { ApiClient } from "../api/client";
import { createEventsList } from "../components/dashboard/events-list";
import { createStatusCard } from "../components/dashboard/status-card";
import { createSummaryPanel } from "../components/dashboard/summary-panel";

export async function renderDashboardPage(container: HTMLElement, api: ApiClient): Promise<void> {
  container.innerHTML = "";

  const loading = document.createElement("p");
  loading.className = "muted";
  loading.textContent = "読み込み中...";
  container.appendChild(loading);

  try {
    const [{ state }, { events }] = await Promise.all([api.getState(), api.getEvents(20)]);

    container.innerHTML = "";
    container.append(
      createStatusCard(state),
      createSummaryPanel("全体要約", state.overallSummary),
      createSummaryPanel("最近の関係要約", state.recentSummary),
      createEventsList(events)
    );
  } catch (error) {
    loading.textContent = error instanceof Error ? error.message : "Dashboardの取得に失敗しました。";
  }
}
