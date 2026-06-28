import type { Consultation } from "../../types";

export function createConsultationHistoryList(items: Consultation[]): HTMLElement {
  const section = document.createElement("section");
  section.className = "card";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = "相談履歴";

  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "履歴はまだありません。";
    section.append(title, empty);
    return section;
  }

  const list = document.createElement("ul");
  list.className = "list";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "list-item";

    const q = document.createElement("p");
    q.className = "list-title";
    q.textContent = `Q: ${item.question}`;

    const a = document.createElement("p");
    a.className = "body-text";
    a.textContent = `A: ${item.answer}`;

    const t = document.createElement("p");
    t.className = "muted";
    t.textContent = new Date(item.createdAt).toLocaleString("ja-JP");

    li.append(q, a, t);
    list.appendChild(li);
  });

  section.append(title, list);
  return section;
}
