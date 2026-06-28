import type { KeyEvent } from "../../types";

export function createEventsList(events: KeyEvent[]): HTMLElement {
  const section = document.createElement("section");
  section.className = "card";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = "主要イベント";

  const list = document.createElement("ul");
  list.className = "list";

  if (events.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "イベントはまだありません。";
    section.append(title, empty);
    return section;
  }

  events.forEach((event) => {
    const item = document.createElement("li");
    item.className = "list-item";

    const head = document.createElement("p");
    head.className = "list-title";
    head.textContent = `[${event.eventDate}] ${event.title} (重要度 ${event.importance})`;

    const desc = document.createElement("p");
    desc.className = "muted";
    desc.textContent = event.description;

    item.append(head, desc);
    list.appendChild(item);
  });

  section.append(title, list);
  return section;
}
