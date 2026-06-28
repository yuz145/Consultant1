export function createHeader(title: string): HTMLElement {
  const header = document.createElement("header");
  header.className = "app-header";

  const heading = document.createElement("h1");
  heading.className = "app-title";
  heading.textContent = title;

  const note = document.createElement("p");
  note.className = "app-note";
  note.textContent = "相手の気持ちは断定せず、事実と推測を分けて扱う補助ツール";

  header.append(heading, note);
  return header;
}
