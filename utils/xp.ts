// Function to calculate XP gained based on level, steps, and previous XP
const getXp = (
  steps: number,
  level: number,
  prevXp: number,
  isWinner: boolean
) => {
  const baseXp =
    steps *
    5 *
    (1 -
      0.8752 * level +
      (0.8975 * level) ** 1.2275 +
      (0.1476 * level) ** 8.811);
  return isWinner ? prevXp + baseXp * 1.25 : prevXp + baseXp;
};

// Function to calculate XP required for a specific level
const getAgentLevelXpRequired = (level: number) =>
  5 * (50 * (level - 1) ** 2 + 100 * (level - 1) + 200);

// Function to calculate XP required for a specific player level
const getPlayerLevelXpRequired = (level: number) =>
  50 * (50 * (level - 1) ** 2 + 100 * (level - 1) + 200);

// Function to determine the level based on current XP
const getAgentLevelFromXp = (currentXp: number) => {
  let level = 2;
  while (level < 11 && currentXp >= getAgentLevelXpRequired(level)) {
    level++;
  }
  return level - 1; // Subtract 1 to get the correct level
};

// Function to determine the level based on current XP
const getPlayerLevelFromXp = (currentXp: number) => {
  let level = 2;
  while (level < 11 && currentXp >= getPlayerLevelXpRequired(level)) {
    level++;
  }
  return level - 1; // Subtract 1 to get the correct level
};

export {
  getAgentLevelFromXp,
  getAgentLevelXpRequired,
  getPlayerLevelFromXp,
  getPlayerLevelXpRequired,
  getXp,
};
