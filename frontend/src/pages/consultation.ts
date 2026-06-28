import { ApiClient } from "../api/client";
import { createAnswerPanel } from "../components/consultation/answer-panel";
import { createConsultationHistoryList } from "../components/consultation/consultation-history";
import { createQuestionForm } from "../components/consultation/question-form";

export async function renderConsultationPage(container: HTMLElement, api: ApiClient): Promise<void> {
  container.innerHTML = "";

  let latestAnswer = "";

  const answerContainer = document.createElement("div");
  const historyContainer = document.createElement("div");

  const refreshHistory = async (): Promise<void> => {
    historyContainer.innerHTML = "";
    try {
      const { consultations } = await api.getConsultations(20);
      historyContainer.appendChild(createConsultationHistoryList(consultations));
    } catch (error) {
      const failed = document.createElement("p");
      failed.className = "muted";
      failed.textContent = error instanceof Error ? error.message : "履歴の取得に失敗しました。";
      historyContainer.appendChild(failed);
    }
  };

  const form = createQuestionForm({
    onSubmit: async (question) => {
      const result = await api.postConsult(question);
      latestAnswer = result.consultation.answer;
      answerContainer.innerHTML = "";
      answerContainer.appendChild(createAnswerPanel(latestAnswer));
      await refreshHistory();
    }
  });

  answerContainer.appendChild(createAnswerPanel(latestAnswer));

  container.append(form, answerContainer, historyContainer);
  await refreshHistory();
}
