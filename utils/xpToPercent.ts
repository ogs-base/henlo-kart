import { getAgentLevelXpRequired, getPlayerLevelXpRequired } from "@/utils/xp";

function xpToPercent(xp: number, level: number, type: "agent" | "player") {
  if (level === 10) return "100";

  let percent = 0;
  let nextXpRequired = 0;
  let prevXpRequired = 0;

  if (type === "agent") {
    nextXpRequired = getAgentLevelXpRequired(level + 1);
    prevXpRequired = level === 1 ? 0 : getAgentLevelXpRequired(level);
  }

  if (type === "player") {
    nextXpRequired = getPlayerLevelXpRequired(level + 1);
    prevXpRequired = level === 1 ? 0 : getPlayerLevelXpRequired(level);
  }

  percent = Math.floor(
    (1 - (nextXpRequired - xp) / (nextXpRequired - prevXpRequired)) * 100
  );

  percent =
    percent >= 100
      ? 100
      : percent === 0
      ? 0
      : percent === 1
      ? 1
      : percent === 99
      ? 99
      : percent % 2 === 0
      ? percent
      : percent - 1;

  const percentage = percent.toString().padStart(3, "0");
  return percentage;
}

export { xpToPercent };
