import type { KeyEvent, RelationshipState } from "../../types";

export function createUpdateResult(input: {
  state: RelationshipState;
  events: KeyEvent[];
}): HTMLElement {
  const section = document.createElement("section");
  section.className = "card";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = "更新結果";

  const stateText = document.createElement("p");
  stateText.className = "body-text";
  stateText.textContent = `ステータス: ${input.state.currentStatus} / mood: ${input.state.moodScore}`;

  const summary = document.createElement("p");
  summary.className = "muted";
  summary.textContent = input.state.recentSummary || "recentSummary は未設定";

  const eventsTitle = document.createElement("p");
  eventsTitle.className = "list-title";
  eventsTitle.textContent = "抽出イベント";

  const list = document.createElement("ul");
  list.className = "list";

  input.events.slice(0, 5).forEach((event) => {
    const item = document.createElement("li");
    item.className = "list-item";
    item.textContent = `[${event.eventDate}] ${event.title} (${event.importance})`;
    list.appendChild(item);
  });

  if (list.children.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "抽出イベントはありません。";
    section.append(title, stateText, summary, eventsTitle, empty);
    return section;
  }

  section.append(title, stateText, summary, eventsTitle, list);
  return section;
}
