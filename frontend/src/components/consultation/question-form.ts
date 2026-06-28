interface QuestionFormOptions {
  onSubmit: (question: string) => Promise<void>;
}

export function createQuestionForm(options: QuestionFormOptions): HTMLElement {
  const form = document.createElement("form");
  form.className = "card form";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = "相談を入力";

  const textarea = document.createElement("textarea");
  textarea.className = "textarea";
  textarea.rows = 6;
  textarea.placeholder = "例: 最近返信が遅いのですが、どう受け止めるべきでしょうか？";

  const button = document.createElement("button");
  button.className = "primary-button";
  button.type = "submit";
  button.textContent = "相談する";

  const status = document.createElement("p");
  status.className = "muted";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = textarea.value.trim();
    if (!question) {
      status.textContent = "相談内容を入力してください。";
      return;
    }

    button.disabled = true;
    status.textContent = "AIに問い合わせ中...";
    try {
      await options.onSubmit(question);
      textarea.value = "";
      status.textContent = "相談を送信しました。";
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "送信に失敗しました。";
    } finally {
      button.disabled = false;
    }
  });

  form.append(title, textarea, button, status);
  return form;
}
