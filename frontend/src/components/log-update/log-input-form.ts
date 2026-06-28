interface LogInputFormOptions {
  onSubmit: (input: {
    sourceType: "manual" | "line_txt";
    content: string;
    fileName?: string;
  }) => Promise<void>;
}

export function createLogInputForm(options: LogInputFormOptions): HTMLElement {
  const form = document.createElement("form");
  form.className = "card form";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = "ログ更新";

  const sourceType = document.createElement("select");
  sourceType.className = "input";

  const manualOption = document.createElement("option");
  manualOption.value = "manual";
  manualOption.textContent = "manual";

  const lineOption = document.createElement("option");
  lineOption.value = "line_txt";
  lineOption.textContent = "line_txt";

  sourceType.append(manualOption, lineOption);

  const fileName = document.createElement("input");
  fileName.className = "input";
  fileName.type = "text";
  fileName.placeholder = "ファイル名（任意）";

  const content = document.createElement("textarea");
  content.className = "textarea";
  content.rows = 8;
  content.placeholder = "ログまたは手動メモを入力";

  const button = document.createElement("button");
  button.type = "submit";
  button.className = "primary-button";
  button.textContent = "要約更新を実行";

  const status = document.createElement("p");
  status.className = "muted";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      sourceType: sourceType.value as "manual" | "line_txt",
      content: content.value.trim(),
      fileName: fileName.value.trim() || undefined
    };

    if (!payload.content) {
      status.textContent = "content を入力してください。";
      return;
    }

    button.disabled = true;
    status.textContent = "更新中...";
    try {
      await options.onSubmit(payload);
      status.textContent = "更新に成功しました。";
      content.value = "";
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "更新に失敗しました。";
    } finally {
      button.disabled = false;
    }
  });

  form.append(title, sourceType, fileName, content, button, status);
  return form;
}
