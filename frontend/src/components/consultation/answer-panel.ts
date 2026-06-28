export function createAnswerPanel(answerText: string): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "card";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = "AI回答";

  const answer = document.createElement("pre");
  answer.className = "answer-block";
  answer.textContent = answerText || "まだ回答はありません。";

  const caution = document.createElement("p");
  caution.className = "muted";
  caution.textContent = "注意: 回答は補助情報です。事実と推測を分けて判断してください。";

  panel.append(title, answer, caution);
  return panel;
}
