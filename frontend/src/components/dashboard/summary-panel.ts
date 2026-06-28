export function createSummaryPanel(titleText: string, content: string): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "card";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = titleText;

  const body = document.createElement("p");
  body.className = "body-text";
  body.textContent = content || "まだ要約がありません。";

  panel.append(title, body);
  return panel;
}
