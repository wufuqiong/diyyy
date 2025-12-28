import { shuffleArray } from "./array-tools";

interface WordPosition {
  word: string;
  positions: [number, number][];
};

export const generateWordMazePath = (rows: number, cols: number): number[][] => {
  const visited: number[][] = Array.from({ length: rows }, () => 
    Array.from({ length: cols }, () => 0)
  );
  const path: number[][] = [];

  const dfs = (x: number, y: number): boolean => {
    if (x === rows - 1 && y === cols - 1) {
      path.push([x, y]);
      return true;
    }

    visited[x][y] = 1;
    path.push([x, y]);

    let directions: number[][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    directions = shuffleArray(directions);
    
    for (let i = 0; i < directions.length; i++) {
      const nx = directions[i][0] + x;
      const ny = directions[i][1] + y;
      if (nx >= 0 && ny >= 0 && nx < rows && ny < cols && visited[nx][ny] === 0) {
        let sum = 0;
        for (let j = 0; j < directions.length; j++) {
          const nnx = directions[j][0] + nx;
          const nny = directions[j][1] + ny;
          if (nnx >= 0 && nny >= 0 && nnx < rows && nny < cols) {
            sum += visited[nnx][nny];
          }
        }
        if (sum <= 1 && dfs(nx, ny)) {
          return true;
        }
      }
    }

    path.pop();
    visited[x][y] = 0;
    return false;
  };

  return dfs(0, 0) ? path : [];
};

export const generateSentenceMazePath = (sentence: string, rows: number, cols: number): number[][] => {
  if (!sentence || sentence.length === 0) return [];
  
  const visited: boolean[][] = Array.from({ length: rows }, () => 
    Array.from({ length: cols }, () => false)
  );
  const path: number[][] = [];
  const totalCells = rows * cols;
  const sentenceLength = sentence.length;
  
  // If the sentence is longer than available cells, we can't place it
  if (sentenceLength > totalCells) {
    console.warn("Sentence is too long for the maze dimensions");
    return [];
  }
  
  // Helper function to get a random starting position
  const getRandomPosition = (): [number, number] => (
    [Math.floor(Math.random() * rows), Math.floor(Math.random() * cols)]
  );
  
  // Check if position is valid
  const isValidPosition = (x: number, y: number): boolean => (
    x >= 0 && y >= 0 && x < rows && y < cols
  );
  
  // Get unvisited neighbors
  const getUnvisitedNeighbors = (x: number, y: number): number[][] => {
    const directions: number[][] = [[0, 1], [1, 0]];
    const neighbors: number[][] = [];
    
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (isValidPosition(nx, ny) && !visited[nx][ny]) {
        neighbors.push([nx, ny]);
      }
    }
    
    return shuffleArray(neighbors);
  };
  
  // Try to find a path using backtracking
  const findPath = (x: number, y: number, index: number): boolean => {
    // Mark current cell as visited
    visited[x][y] = true;
    path.push([x, y]);
    
    // If we've placed all characters, we're done
    if (index === sentenceLength - 1) {
      return true;
    }
    
    // Get unvisited neighbors in random order
    const neighbors = getUnvisitedNeighbors(x, y);
    
    for (const [nx, ny] of neighbors) {
      if (findPath(nx, ny, index + 1)) {
        return true;
      }
    }
    
    // Backtrack if no neighbor works
    visited[x][y] = false;
    path.pop();
    return false;
  };
  
  // Try multiple random starting positions
  const maxAttempts = rows * cols * 2; // Try multiple times
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Reset visited and path
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        visited[i][j] = false;
      }
    }
    path.length = 0;
    
    // Get a random starting position
    const [startX, startY] = getRandomPosition();
    
    // Try to find a path starting from this position
    if (findPath(startX, startY, 0)) {
      return path;
    }
  }
  
  // If we couldn't find a path, try a simpler approach (allow intersections)
  console.warn("Could not find non-intersecting path, using simpler approach");
  return generateSimplePath(sentence, rows, cols);
};

// Fallback function if the backtracking approach fails
const generateSimplePath = (sentence: string, rows: number, cols: number): number[][] => {
  const path: number[][] = [];
  const usedPositions = new Set<string>();
  const sentenceLength = sentence.length;
  
  // Start at a random position
  let x = Math.floor(Math.random() * rows);
  let y = Math.floor(Math.random() * cols);
  const directions: number[][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  
  for (let i = 0; i < sentenceLength; i++) {
    // Find an available cell
    let attempts = 0;
    const maxPositionAttempts = rows * cols;
    
    while (attempts < maxPositionAttempts) {
      const posKey = `${x},${y}`;
      
      if (!usedPositions.has(posKey)) {
        usedPositions.add(posKey);
        path.push([x, y]);
        break;
      }
      
      // Try to move to a neighboring cell
      attempts++;
      const shuffledDirs = shuffleArray([...directions]);
      let moved = false;
      
      for (const [dx, dy] of shuffledDirs) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && ny >= 0 && nx < rows && ny < cols) {
          x = nx;
          y = ny;
          moved = true;
          break;
        }
      }
      
      if (!moved) {
        // If we can't move, pick a random unvisited cell
        const emptyCells = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (!usedPositions.has(`${r},${c}`)) {
              emptyCells.push([r, c]);
            }
          }
        }
        
        if (emptyCells.length > 0) {
          const randomIdx = Math.floor(Math.random() * emptyCells.length);
          [x, y] = emptyCells[randomIdx];
        } else {
          // No more empty cells, just pick any
          x = Math.floor(Math.random() * rows);
          y = Math.floor(Math.random() * cols);
        }
      }
    }
    
    // Move to a new random direction for next character
    if (i < sentenceLength - 1) {
      const shuffledDirs = shuffleArray([...directions]);
      for (const [dx, dy] of shuffledDirs) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && ny >= 0 && nx < rows && ny < cols) {
          x = nx;
          y = ny;
          break;
        }
      }
    }
  }
  
  return path;
};

export const generatePhraseMazePath = (chars: string[], rows: number, cols: number): WordPosition[] => {
  const maze: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));
  const wordPositions: WordPosition[] = [];
  
  // Sort by longest to shortest for better placement
  const sortedChars = [...chars].sort((a, b) => b.length - a.length);
  
  for (const word of sortedChars) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = rows * cols * 2; // Limit attempts to prevent infinite loop
    
    // Try random positions
    while (!placed && attempts < maxAttempts) {
      attempts++;
      
      // Generate random starting position
      const startRow = Math.floor(Math.random() * rows);
      const startCol = Math.floor(Math.random() * cols);
      
      // Random direction
      const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      
      // Randomly decide to try both directions
      const tryBoth = Math.random() > 0.5;
      
      if (tryDirection(maze, word, startRow, startCol, direction, rows, cols)) {
        const positions = placeWord(maze, word, startRow, startCol, direction);
        wordPositions.push({ word, positions });
        placed = true;
      } else if (tryBoth) {
        // Try the opposite direction
        const oppositeDirection = direction === 'horizontal' ? 'vertical' : 'horizontal';
        if (tryDirection(maze, word, startRow, startCol, oppositeDirection, rows, cols)) {
          const positions = placeWord(maze, word, startRow, startCol, oppositeDirection);
          wordPositions.push({ word, positions });
          placed = true;
        }
      }
    }
    
    if (!placed) {
      console.warn(`Could not place word: "${word}" after ${maxAttempts} attempts`);
    }
  }
  
  return wordPositions;
};

// Helper function to try placement
const tryDirection = (
  maze: string[][], 
  word: string, 
  row: number, 
  col: number, 
  direction: 'horizontal' | 'vertical', 
  rows: number, 
  cols: number
): boolean => {
  if (direction === 'horizontal') {
    if (col + word.length > cols) return false;
    for (let i = 0; i < word.length; i++) {
      if (maze[row][col + i] !== '') return false;
    }
  } else {
    if (row + word.length > rows) return false;
    for (let i = 0; i < word.length; i++) {
      if (maze[row + i][col] !== '') return false;
    }
  }
  return true;
};

// Alternative: Try all possible positions systematically if random fails
const generatePhraseMazePathWithFallback = (chars: string[], rows: number, cols: number): WordPosition[] => {
  const maze: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));
  const wordPositions: WordPosition[] = [];
  
  const sortedChars = [...chars].sort((a, b) => b.length - a.length);
  
  for (const word of sortedChars) {
    let placed = false;
    
    // First try random placement
    placed = tryRandomPlacement(maze, word, rows, cols, wordPositions);
    
    // If random fails, try systematic placement
    if (!placed) {
      placed = trySystematicPlacement(maze, word, rows, cols, wordPositions);
    }
    
    if (!placed) {
      console.warn(`Could not place word: "${word}"`);
    }
  }
  
  return wordPositions;
};

const tryRandomPlacement = (
  maze: string[][],
  word: string,
  rows: number,
  cols: number,
  wordPositions: WordPosition[]
): boolean => {
  const maxRandomAttempts = rows * cols * 3;
  
  for (let attempt = 0; attempt < maxRandomAttempts; attempt++) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    
    if (tryDirection(maze, word, row, col, direction, rows, cols)) {
      const positions = placeWord(maze, word, row, col, direction);
      wordPositions.push({ word, positions });
      return true;
    }
  }
  
  return false;
};

const trySystematicPlacement = (
  maze: string[][],
  word: string,
  rows: number,
  cols: number,
  wordPositions: WordPosition[]
): boolean => {
  // Try all positions systematically
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Try horizontal
      if (tryDirection(maze, word, row, col, 'horizontal', rows, cols)) {
        const positions = placeWord(maze, word, row, col, 'horizontal');
        wordPositions.push({ word, positions });
        return true;
      }
      // Try vertical
      if (tryDirection(maze, word, row, col, 'vertical', rows, cols)) {
        const positions = placeWord(maze, word, row, col, 'vertical');
        wordPositions.push({ word, positions });
        return true;
      }
    }
  }
  
  return false;
};

// Keep the original placeWord function
const placeWord = (maze: string[][], word: string, row: number, col: number,
                   direction: 'horizontal' | 'vertical'): [number, number][] => {
  const positions: [number, number][] = [];
  if (direction === 'horizontal') {
    for (let i = 0; i < word.length; i++) {
      maze[row][col + i] = word[i];
      positions.push([row, col + i]);
    }
  } else {
    for (let i = 0; i < word.length; i++) {
      maze[row + i][col] = word[i];
      positions.push([row + i, col]);
    }
  }
  return positions;
};