import { ApiClient } from "../api/client";
import { createImportMetaForm } from "../components/log-update/import-meta-form";
import { createLogInputForm } from "../components/log-update/log-input-form";
import { createUpdateResult } from "../components/log-update/update-result";

export async function renderLogUpdatePage(container: HTMLElement, api: ApiClient): Promise<void> {
  container.innerHTML = "";

  const resultContainer = document.createElement("div");

  const logInput = createLogInputForm({
    onSubmit: async (input) => {
      const result = await api.postUpdateLog(input);
      resultContainer.innerHTML = "";
      resultContainer.appendChild(
        createUpdateResult({
          state: result.state,
          events: result.extractedEvents
        })
      );
    }
  });

  const importForm = createImportMetaForm({
    onSubmit: async (input) => {
      await api.postImport(input);
    }
  });

  container.append(logInput, resultContainer, importForm);
}
