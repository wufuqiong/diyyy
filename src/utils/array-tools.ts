export const filterChineseCharacters = (text: string): string => 
    text.replace(/[^\u4e00-\u9fff]/g, '');

export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const filterMazeCharacters = (text: string): string => {
  if (!text) return '';
  
  // Regular expression breakdown:
  // [\u4e00-\u9fff] - Basic Chinese characters
  // [\u3400-\u4dbf] - Chinese extension A
  // [a-zA-Z] - English letters (upper and lower case)
  // [0-9] - Numbers (optional, remove if not needed)
  // \s - Whitespace (spaces, tabs, etc.)
  const keepRegex = /[\u4e00-\u9fff\u3400-\u4dbfa-zA-Z0-9\s]/g;
  
  const matches = text.match(keepRegex);
  return matches ? matches.join('') : '';
};