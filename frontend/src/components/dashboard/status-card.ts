import type { RelationshipState } from "../../types";

export function createStatusCard(state: RelationshipState): HTMLElement {
  const card = document.createElement("section");
  card.className = "card";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = "現在の関係ステータス";

  const status = document.createElement("p");
  status.className = "status-text";
  status.textContent = state.currentStatus || "未設定";

  const mood = document.createElement("p");
  mood.className = "muted";
  mood.textContent = `温度感スコア: ${state.moodScore}`;

  const updatedAt = document.createElement("p");
  updatedAt.className = "muted";
  updatedAt.textContent = `最終更新: ${new Date(state.updatedAt).toLocaleString("ja-JP")}`;

  card.append(title, status, mood, updatedAt);
  return card;
}
