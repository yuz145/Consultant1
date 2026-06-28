import type { KeyEvent } from "../../types/domain";

export function buildConsultPrompt(input: {
  overallSummary: string;
  recentSummary: string;
  keyEvents: KeyEvent[];
  question: string;
}): string {
  const eventsText = input.keyEvents
    .map((event, index) => {
      return `${index + 1}. [${event.eventDate}] ${event.title} (importance:${event.importance})\\n${event.description}`;
    })
    .join("\\n\\n");

  return [
    "あなたは関係相談の補助AIです。",
    "相手の気持ちを断定せず、事実・推測・不確実を分けて答えてください。",
    "次の情報だけを使って回答してください。",
    "",
    "[全体要約]",
    input.overallSummary || "(未登録)",
    "",
    "[最近の関係要約]",
    input.recentSummary || "(未登録)",
    "",
    "[主要イベント]",
    eventsText || "(未登録)",
    "",
    "[相談内容]",
    input.question,
    "",
    "出力形式:",
    "- まず要点3つ",
    "- 次に具体的な行動案3つ",
    "- 最後に『断定できない点』を明示"
  ].join("\\n");
}

export function buildSummaryUpdatePrompt(content: string): string {
  return [
    "次のログ/メモを要約し、JSONのみを返してください。説明文は不要です。",
    "",
    "JSON schema:",
    "{",
    '  \"overallSummary\": \"string\",',
    '  \"recentSummary\": \"string\",',
    '  \"currentStatus\": \"string\",',
    '  \"moodScore\": number,',
    '  \"events\": [',
    "    {",
    '      \"eventDate\": \"YYYY-MM-DD\",',
    '      \"title\": \"string\",',
    '      \"description\": \"string\",',
    '      \"importance\": number',
    "    }",
    "  ]",
    "}",
    "",
    "ルール:",
    "- moodScore は -100 から 100",
    "- events の importance は 1 から 5",
    "- events は最大10件",
    "",
    "入力ログ:",
    content
  ].join("\\n");
}
