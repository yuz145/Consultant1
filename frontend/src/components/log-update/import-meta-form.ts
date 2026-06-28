interface ImportMetaFormOptions {
  onSubmit: (input: {
    sourceType: "line_txt" | "manual" | "other";
    fileName?: string;
    r2Key?: string;
    contentPreview?: string;
  }) => Promise<void>;
}

export function createImportMetaForm(options: ImportMetaFormOptions): HTMLElement {
  const form = document.createElement("form");
  form.className = "card form";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = "Importメタ情報登録（将来用）";

  const sourceType = document.createElement("select");
  sourceType.className = "input";
  ["manual", "line_txt", "other"].forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    sourceType.appendChild(option);
  });

  const fileName = document.createElement("input");
  fileName.className = "input";
  fileName.placeholder = "fileName (optional)";

  const r2Key = document.createElement("input");
  r2Key.className = "input";
  r2Key.placeholder = "r2Key (optional)";

  const preview = document.createElement("textarea");
  preview.className = "textarea";
  preview.rows = 3;
  preview.placeholder = "contentPreview (optional)";

  const button = document.createElement("button");
  button.type = "submit";
  button.className = "secondary-button";
  button.textContent = "登録";

  const status = document.createElement("p");
  status.className = "muted";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    button.disabled = true;
    status.textContent = "登録中...";

    try {
      await options.onSubmit({
        sourceType: sourceType.value as "line_txt" | "manual" | "other",
        fileName: fileName.value.trim() || undefined,
        r2Key: r2Key.value.trim() || undefined,
        contentPreview: preview.value.trim() || undefined
      });
      status.textContent = "登録しました。";
      fileName.value = "";
      r2Key.value = "";
      preview.value = "";
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "登録に失敗しました。";
    } finally {
      button.disabled = false;
    }
  });

  form.append(title, sourceType, fileName, r2Key, preview, button, status);
  return form;
}
