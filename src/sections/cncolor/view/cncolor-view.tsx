import '../CNColor.css';

import React from 'react';

import miemieData from '../miemie.json';

// Define types for our data structures
interface ColorPreset {
  name: string;
  colors: string[];
}

interface PageData {
  chars: string[];
  colors: string[];
}

interface PreviewPage {
  characters: string[];
  colors: string[];
  pageNumber: number;
  totalPages: number;
}

interface PreviewSheetProps {
  pages: PreviewPage[];
}

interface CNColorState {
  userInput: string;
  wordsPerPage: number;
  selectedPreset: number;
  selectedLevel: string;
  pages: PageData[];
}

// Assuming miemie.json has this structure
interface MiemieData {
  [key: string]: string[];
}

// Type assertion for the imported data
const miemie = miemieData as MiemieData;

const MAX_INPUT_LENGTH = 300;
const SAMPLE_DICT = "人教版小学语文一年级上册";

// Modify color presets, ensuring 5 distinct colors in each palette
const COLOR_PRESETS: ColorPreset[] = [
  {
    name: '经典组合',
    colors: ['#FF6B6B', '#f5b63aff', '#45B7D1', '#51db8dff', '#F7DC6F'] // Red, orange, blue, green, yellow
  },
  {
    name: '柔和组合',
    colors: ['#FF9999', '#66CCCC', '#9999FF', '#FFCC99', '#CC99FF'] // Light red, light cyan, light blue, light orange, light purple
  },
  {
    name: '鲜艳组合',
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'] // Red, green, blue, yellow, purple
  },
  {
    name: '自然组合',
    colors: ['#8B4513', '#228B22', '#1E90FF', '#FFD700', '#FF6347'] // Brown, green, blue, gold, orange-red
  }
];

// Random shuffle array with proper typing
const shuffleArray = <T,>(array: T[]): T[] => {
const newArray = [...array];
for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
}
return newArray;
};

export class CNColorView extends React.Component<object, CNColorState> {
  constructor(props: object) {
    super(props);
    this.state = {
      userInput: '',
      wordsPerPage: 3,
      selectedPreset: 0,
      selectedLevel: '',
      pages: [],
    };
  }

  handleUserInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const input = e.target.value;
    if (input.length <= MAX_INPUT_LENGTH) {
      this.setState({ userInput: input });
    }
  };

  handleWordsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ wordsPerPage: parseInt(e.target.value) });
  };

  handleColorPresetChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const presetIndex = parseInt(e.target.value);
    this.setState({ selectedPreset: presetIndex });
  };

  handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const level = e.target.value;
    this.setState({ selectedLevel: level });
    
    if (level && miemie[level]) {
      const chineseChars = miemie[level].join('');
      this.setState({ userInput: chineseChars });
    }
  };

  handleClearInput = (): void => {
    this.setState({ 
      userInput: '',
      selectedLevel: '',
      pages: [],
    });
  };

  // FIXED: Remove block braces for single return statement
  filterChineseCharacters = (text: string): string => 
    text.replace(/[^\u4e00-\u9fff]/g, '');



  // Generate random colors for page with proper typing
  generateRandomColorsForPage = (pageChars: string[], presetIndex: number): string[] => {
    const presetColors = COLOR_PRESETS[presetIndex].colors;
    
    const numColors = Math.min(pageChars.length, 5);
    const shuffledColors = shuffleArray(presetColors).slice(0, numColors);
    
    // FIXED: Remove block braces for single return statement
    return pageChars.map((char, index) => shuffledColors[index % shuffledColors.length]);
  };

  generatePages = (): void => {
    // FIXED: Use const for variables that are never reassigned
    const { wordsPerPage, selectedPreset } = this.state;
    let { userInput } = this.state;
    
    userInput = this.filterChineseCharacters(userInput);
    
    if (!userInput.trim()) {
      alert('请输入要练习的文字');
      return;
    }

    if (wordsPerPage < 2 || wordsPerPage > 5) {
      alert('每页字数必须在2-5之间');
      return;
    }

    this.setState({ userInput }, () => {
      const inputChars = userInput.split('');
      const totalPages = Math.ceil(inputChars.length / wordsPerPage);
      
      const pages: PageData[] = [];
      for (let i = 0; i < totalPages; i++) {
        const startIndex = i * wordsPerPage;
        const endIndex = startIndex + wordsPerPage;
        const pageChars = inputChars.slice(startIndex, endIndex);
        
        if (pageChars.length < wordsPerPage) {
          const neededChars = wordsPerPage - pageChars.length;
          pageChars.push(...inputChars.slice(0, neededChars));
        }
        
        const pageColors = this.generateRandomColorsForPage(pageChars, selectedPreset);
        
        pages.push({
          chars: pageChars,
          colors: pageColors
        });
      }

      this.setState({ pages });
    });
  };

  render() {
    const { userInput, wordsPerPage, selectedPreset, selectedLevel, pages } = this.state;

    return (
      <div className="app">
        <div className="container">                    
          <div className="input-section">
            <div className="form-group full-width">
              <label>输入练习文字（最多{MAX_INPUT_LENGTH}个字）</label>
              <div className="input-with-buttons">
                <textarea
                  value={userInput}
                  onChange={this.handleUserInputChange}
                  placeholder={`请输入最多${MAX_INPUT_LENGTH}个要练习的文字`}
                  rows={3}
                  maxLength={MAX_INPUT_LENGTH}
                  className="text-input"
                />
                <button 
                  className="clear-btn"
                  onClick={this.handleClearInput}
                  disabled={!userInput}
                >
                  清空
                </button>
              </div>
              <div className="char-count">
                已输入 {userInput.length}/{MAX_INPUT_LENGTH} 字
              </div>
            </div>
            
            <div className="settings-row">
              <div className="form-group">
                <label>每页字数</label>
                <select 
                  value={wordsPerPage} 
                  onChange={this.handleWordsPerPageChange}
                  className="page-select"
                >
                  <option value={2}>2字/页</option>
                  <option value={3}>3字/页</option>
                  <option value={4}>4字/页</option>
                  <option value={5}>5字/页</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>颜色色系</label>
                <select 
                  value={selectedPreset} 
                  onChange={this.handleColorPresetChange}
                  className="color-preset-select"
                >
                  {COLOR_PRESETS.map((preset, index) => (
                    <option key={index} value={index}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>预设字库</label>
                <select 
                  value={selectedLevel} 
                  onChange={this.handleLevelChange}
                  className="level-select"
                >
                  <option value="">请选择字库</option>
                  {Object.keys(miemie).map(level => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Color palette preview */}
            <div className="color-preview-section">
              <label>当前色系</label>
              <div className="color-spectrum">
                {COLOR_PRESETS[selectedPreset].colors.map((color, index) => (
                  <div 
                    key={index}
                    className="color-sample"
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    <span className="color-index">{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="color-info">
                每页将随机使用其中的 {wordsPerPage} 种颜色，确保颜色区分明显
              </div>
            </div>
            
            <button 
              className="generate-btn" 
              onClick={this.generatePages}
              disabled={!userInput.trim()}
            >
              生成练习页
            </button>
          </div>

          <div className="preview-section">
            {pages.length > 0 ? (
              <PreviewSheet pages={pages.map((page, index) => ({
                characters: page.chars,
                colors: page.colors,
                pageNumber: index + 1,
                totalPages: pages.length
              }))} />
            ) : (
              <div className="empty-preview">
                {/* FIXED: Escape double quotes with &quot; */}
                <p>请输入文字并点击&quot;生成练习页&quot;来预览</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

// Generate practice grid patterns with proper typing
const generatePatterns = (characters: string[]): string[][] => {
  if (characters.length === 0) return [];
  
  const chars = [...characters];
  let additionalChars: string[] = [];
  // FIXED: Use const for variables that are never reassigned
  const result: string[][] = [];

  // Find similar characters for current page characters
  for (let i = 0; i < chars.length; i++) {
    const similarChars = miemie[SAMPLE_DICT] || [];
    additionalChars = additionalChars.concat(similarChars);
  }

  additionalChars = shuffleArray(additionalChars);

  // Generate 7 lines of content
  for (let i = 0; i < 7; i++) {
    additionalChars = shuffleArray(additionalChars);
    const randomAdditional = additionalChars.slice(0, 7 - chars.length);
    // FIXED: Use const for variables that are never reassigned
    let line = [...chars, ...randomAdditional];
    line = shuffleArray(line);
    result.push(line);
  }
  
  return result;
};

interface PreviewSheetState {
  currentPage: number;
}

class PreviewSheet extends React.Component<PreviewSheetProps, PreviewSheetState> {
  constructor(props: PreviewSheetProps) {
    super(props);
    this.state = {
      currentPage: 0,
    };
  }

  // Go to previous page
  goToPreviousPage = (): void => {
    this.setState(prevState => ({
      currentPage: Math.max(0, prevState.currentPage - 1)
    }));
  };

  // Go to next page
  goToNextPage = (): void => {
    const { pages } = this.props;
    this.setState(prevState => ({
      currentPage: Math.min(pages.length - 1, prevState.currentPage + 1)
    }));
  };

  // Go to specific page
  goToPage = (pageIndex: number): void => {
    this.setState({
      currentPage: pageIndex
    });
  };

  // Generate pagination indicators array
  generatePageIndicators = (): (number | 'ellipsis')[] => {
    const { pages } = this.props;
    const { currentPage } = this.state;
    const totalPages = pages.length;
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    
    const indicators: (number | 'ellipsis')[] = [];
    
    // Always show first page
    indicators.push(0);
    
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        indicators.push(i);
      }
      indicators.push('ellipsis');
      indicators.push(totalPages - 2);
      indicators.push(totalPages - 1);
    } else if (currentPage >= totalPages - 4) {
      indicators.push('ellipsis');
      for (let i = totalPages - 5; i < totalPages; i++) {
        if (i > 0) indicators.push(i);
      }
    } else {
      indicators.push('ellipsis');
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        indicators.push(i);
      }
      indicators.push('ellipsis');
      indicators.push(totalPages - 1);
    }
    
    return indicators;
  };

  // Extract page rendering logic to separate method
  renderPage = (pageData: PreviewPage, pageNumber: number, totalPages: number): React.ReactElement => {
    const { characters, colors } = pageData;
    const patterns = generatePatterns(characters);
    const totalCircles = 49;
    
    return (
      <div className="print-content">
        <div className="preview-title">找一找 涂色</div>
        
        <div className="reference-section">
          {characters.map((char, index) => (
            <div key={index} className="reference-item">
              {/* FIXED: Use self-closing div */}
              <div 
                className="reference-circle" 
                style={{ backgroundColor: colors[index] }}
              />
              <div className="reference-char">{char}</div>
            </div>
          ))}
        </div>
        
        <div className="practice-section">
          {Array.from({ length: totalCircles }).map((_, i) => {
            const row = Math.floor(i / 7);
            const col = i % 7;
            const char = patterns[row]?.[col] || '';
            
            return (
              <div key={i} className="practice-circle">
                <div className="practice-char">{char}</div>
              </div>
            );
          })}
        </div>                
      </div>
    );
  };

  render() {
    const { pages } = this.props;
    const { currentPage } = this.state;
    
    if (!pages || pages.length === 0) {
      return (
        <div className="preview-container">
          <div className="empty-preview">
            <p>没有可预览的页面</p>
          </div>
        </div>
      );
    }

    return (
      <div className="preview-container">
        {/* Screen preview - only show current page */}
        <div className="screen-preview">
          {/* Pagination controls */}
          <div className="pagination-controls">
            <button 
              className="page-btn prev-btn"
              onClick={this.goToPreviousPage}
              disabled={currentPage === 0}
            >
              上一页
            </button>
            
            <div className="page-indicator">
              {this.generatePageIndicators().map((pageIndex, index) => {
                if (pageIndex === 'ellipsis') {
                  return (
                    <span key={`ellipsis-${index}`} className="page-ellipsis">
                      ...
                    </span>
                  );
                }
                
                return (
                  <button
                    key={pageIndex}
                    className={`page-dot ${pageIndex === currentPage ? 'active' : ''}`}
                    onClick={() => this.goToPage(pageIndex)}
                    title={`第 ${pageIndex + 1} 页`}
                  >
                    {pageIndex + 1}
                  </button>
                );
              })}
            </div>
            
            <button 
              className="page-btn next-btn"
              onClick={this.goToNextPage}
              disabled={currentPage === pages.length - 1}
            >
              下一页
            </button>
          </div>
          
          {/* Current page content */}
          <div className="screen-page">
            {this.renderPage(pages[currentPage], currentPage, pages.length)}
          </div>
          
          {/* Action buttons */}
          <div className="action-buttons">
            <button className="print-btn" onClick={() => window.print()}>
              打印所有页面
            </button>
          </div>
        </div>
        
        {/* Print view - show all pages */}
        <div className="print-preview">
          {pages.map((page, index) => (
            <div key={index} className="page-break print-page">
              {this.renderPage(page, index, pages.length)}
            </div>
          ))}
        </div>
      </div>
    );
  }
}