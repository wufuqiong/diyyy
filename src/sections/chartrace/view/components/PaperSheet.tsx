import type { SheetConfig} from 'src/types';

import React from 'react';

import { Box, Typography } from '@mui/material';

import { WorksheetPaper } from 'src/shared/worksheet';
import { GridType, TraceContentMode } from 'src/types';
import { sansStack, kaitiStack, pinyinStack, englishHandStack, englishPrintStack } from 'src/theme/tokens';

import { GridBox } from './GridBox';
import { getCharData } from '../utils/charData';

interface PaperSheetProps {
  config: SheetConfig;
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
}

// Helper to convert hex + opacity to rgba string
const getBorderColor = (hex: string, opacity: number) => {
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  const val = parseInt(c.join(''), 16);
  // eslint-disable-next-line no-bitwise
  const r = (val >> 16) & 255;
  // eslint-disable-next-line no-bitwise
  const g = (val >> 8) & 255;
  // eslint-disable-next-line no-bitwise
  const b = val & 255;
  return `rgba(${r},${g},${b},${opacity})`;
};

// Helper to chunk array into pages
const chunk = <T,>(arr: T[], size: number): T[][] => {
  if (arr.length === 0) return [];
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, (i + 1) * size)
  );
};

const getFontStack = (fontClass: string) => {
  if (fontClass === 'font-kaiti') {
    return kaitiStack;
  }
  return undefined;
};

// Andika is an SIL literacy webfont (bundled via @fontsource/andika in
// global.css) with:
//   - single-story `a` and `g` — the handwriting/teaching shapes used in
//     Chinese primary-school 描红 materials, and
//   - complete Pinyin tone-mark coverage in a SINGLE family (both macron
//     `ā ē ī ō ū` in Latin Extended-A and caron `ǎ ě ǐ ǒ ǔ ǚ` in Latin
//     Extended-B), so every glyph on the page is served by the same
//     typeface — no per-glyph system fallback that previously made e.g.
//     `bā` and `liǎng` look like different fonts.
const getPinyinFontStack = () => pinyinStack;

export const PaperSheet: React.FC<PaperSheetProps> = ({ config, pdfContainerRef }) => {
  const isSentenceMode = config.contentMode === TraceContentMode.SENTENCES;
  const isWordMode = config.contentMode === TraceContentMode.PHRASES;
  const isEnglishMode = config.gridType === GridType.ENGLISH_LINES;

  // Routes any tool mode's pre-computed `pages` array through the shared
  // unified preview area (nav bar + candy A4 sheet + print container).
  const renderSheet = <T,>(sheetPages: T[], renderOne: (page: T, pageIndex: number) => React.ReactNode) => (
    <WorksheetPaper
      pageCount={sheetPages.length}
      pdfContainerRef={pdfContainerRef}
      paperPadding="15mm"
      renderPage={(i) => renderOne(sheetPages[i], i)}
    />
  );
  
  // Calculate dynamic styles
  const borderColor = getBorderColor(config.gridColor, config.gridOpacity);
  
  // "Border Collapse" strategy for Chinese Grid
  const wrapperStyle = {
    borderColor,
    borderWidth: '1px 0 0 1px', // Top Left
    borderStyle: 'solid',
  };
  
  const cellStyle = {
    borderColor,
    borderWidth: '0 1px 1px 0', // Bottom Right
    borderStyle: 'solid',
  };

  const cellWidthPercent = `${100 / config.colsPerRow}%`;
  const baseCols = 9;
  const colScale = Math.max(0.72, Math.min(1.28, baseCols / config.colsPerRow));
  
  // Use reference ratio based on 96px grid (Medium size from snippet)
  // Grid width/height ~ 96px * colScale
  // Pinyin Height ~ 40px * colScale
  // Pinyin Font Size ~ 20px * colScale
  // Pinyin Y Offset ~ -4px * colScale
  // Hanzi Font Size ~ 75% of grid width
  const hanziFontSize = 75; // SVG viewBox is 100x100, 75 represents 75%
  const punctuationPattern = /^[，。！？；：、,.!?;:（）()《》〈〉【】「」『』“”‘’'"…—-]$/;
  const cornerPunctuationPattern = /^[，。！？；：、,.!?;:]$/;

  const renderPinyinStaff = (pinyinText: string, isTrace: boolean) => (
    <Box sx={{ width: '100%', aspectRatio: '2 / 1', position: 'relative', overflow: 'visible' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none" style={{ display: 'block' }}>
        {/* 4 Lines evenly spaced: Top(1), Upper-Mid(17), Lower-Mid(33), Bottom(49) */}
        <line x1="0" y1="1"  x2="100" y2="1"  stroke={borderColor} strokeWidth="1.5" />
        <line x1="0" y1="17" x2="100" y2="17" stroke={borderColor} strokeWidth="1" strokeDasharray="3,3" opacity={0.6} />
        <line x1="0" y1="33" x2="100" y2="33" stroke={borderColor} strokeWidth="1" strokeDasharray="3,3" opacity={0.6} />
        <line x1="0" y1="49" x2="100" y2="49" stroke={borderColor} strokeWidth="1.5" />

        {config.showPinyin && pinyinText && (
          <text
            x="50"
            y="33" /* Baseline on the 3rd line (lower-mid) */
            textAnchor="middle"
            fill={isTrace ? config.traceTextColor : config.mainTextColor}
            fillOpacity={isTrace ? config.traceOpacity : 0.95}
            fontSize="28"
            fontFamily={getPinyinFontStack()}
            letterSpacing="0.05em"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {pinyinText}
          </text>
        )}
      </svg>
    </Box>
  );

  const renderSentenceCell = (char: string | undefined, isTrace: boolean) => {
    const contentColor = isTrace ? config.traceTextColor : config.mainTextColor;
    const contentOpacity = isTrace ? config.traceOpacity : 1;

    if (!char || !punctuationPattern.test(char)) {
      return (
        <GridBox
          type={config.gridType}
          color={config.gridColor}
          opacity={config.gridOpacity}
          content={char}
          contentColor={contentColor}
          contentOpacity={contentOpacity}
          contentFontSize={hanziFontSize}
          fontFamily={config.fontFamily}
          showOuterBorder={false}
        />
      );
    }

    const isCornerPunctuation = cornerPunctuationPattern.test(char);

    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <GridBox
          type={config.gridType}
          color={config.gridColor}
          opacity={config.gridOpacity}
          contentColor={contentColor}
          contentOpacity={contentOpacity}
          contentFontSize={hanziFontSize}
          fontFamily={config.fontFamily}
          showOuterBorder={false}
        />
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <text
            x={isCornerPunctuation ? '68' : '50'}
            y={isCornerPunctuation ? '68' : '52'}
            dominantBaseline="central"
            textAnchor="middle"
            fill={contentColor}
            fillOpacity={contentOpacity}
            className={config.fontFamily}
            style={{
              fontSize: `${isCornerPunctuation ? 44 : 52}px`,
              fontFamily: getFontStack(config.fontFamily),
            }}
          >
            {char}
          </text>
        </svg>
      </Box>
    );
  };

  // Constants for A4 layout calculations (approximate in mm)
  const A4_CONTENT_HEIGHT_MM = 245; // 297 - 30(padding) - ~22(header/footer/margins)
  const A4_CONTENT_WIDTH_MM = 180;  // 210 - 30(padding)

  // === RENDER MODE: ENGLISH LINES ===
  if (isEnglishMode) {
    // Parsing logic:
    // 1. If contains newlines → sentences (commas kept as punctuation)
    // 2. Else if contains commas → phrases
    // 3. Else if contains spaces → words
    // 4. Else → individual letters
    let parsedItems: string[] = [];
    if (config.text.includes('\n')) {
        parsedItems = config.text.split('\n').map(w => w.trim()).filter(w => w !== '');
    } else if (config.text.match(/[,，]/)) {
        parsedItems = config.text.split(/[,，]/).map(w => w.trim()).filter(w => w !== '');
    } else if (config.text.includes(' ')) {
        parsedItems = config.text.split(' ').map(w => w.trim()).filter(w => w !== '');
    } else {
        parsedItems = Array.from(config.text).filter(c => c.trim() !== '');
    }
    
    // Convert physical sizes to pixels (1mm ~ 3.78px)
    const gridSizeMm = config.gridSize || 14; // Default to 14mm
    const rowHeightPx = gridSizeMm * 3.78;
    // INCREASE ROW MARGIN FOR CLEAR VISUAL SEPARATION BETWEEN STAFFS
    const rowMarginPx = rowHeightPx * 0.75; 
    const totalRowHeightPx = rowHeightPx + rowMarginPx;
    
    // A4 content bounds
    const A4_CONTENT_HEIGHT_PX = A4_CONTENT_HEIGHT_MM * 3.78; // ~926px
    const A4_CONTENT_WIDTH_PX = A4_CONTENT_WIDTH_MM * 3.78;   // ~680px
    const maxRowsPerPage = Math.max(1, Math.floor(A4_CONTENT_HEIGHT_PX / totalRowHeightPx));
    
    // Layout Calculation Engine
    const gapPx = 24;
    const fontSizePx = rowHeightPx * 0.85; // Calculate font size proportional to the staff
    const estCharWidth = fontSizePx * 0.6; // English fonts average ~60% width per char
    
    interface StaffRow {
        items: { text: string, isTrace: boolean, x: number }[];
    }
    const allStaffRows: StaffRow[] = [];
    let currentRow: StaffRow = { items: [] };
    let currentX = 10; // Start with 10px padding on the left
    
    parsedItems.forEach(word => {
        // ALWAYS FORCE A NEW LINE FOR EACH DIFFERENT WORD/LETTER
        if (currentRow.items.length > 0) {
            allStaffRows.push(currentRow);
            currentRow = { items: [] };
            currentX = 10;
        }

        const wordWidthPx = word.length * estCharWidth;
        const totalCopies = 1 + config.traceCount;
        
        for (let i = 0; i < totalCopies; i++) {
            const isTrace = i > 0;
            // Wrap to new row if it exceeds A4 width
            if (currentX + wordWidthPx > A4_CONTENT_WIDTH_PX && currentRow.items.length > 0) {
                allStaffRows.push(currentRow);
                currentRow = { items: [] };
                currentX = 10;
            }
            currentRow.items.push({ text: word, isTrace, x: currentX });
            currentX += wordWidthPx + gapPx;
        }
    });
    if (currentRow.items.length > 0) {
        allStaffRows.push(currentRow);
    }
    
    let pages = chunk(allStaffRows, maxRowsPerPage);
    if (pages.length === 0) pages = [[]];

    // Math coords for the 4 lines (top, 1/3, 2/3, bottom)
    const y1 = 1;
    const y2 = rowHeightPx * 0.333;
    const y3 = rowHeightPx * 0.666;
    const y4 = rowHeightPx - 1;
    const lineYs = [y1, y2, y3, y4];

    // Line color themes
    const lineTheme = config.englishLineTheme || 'rainbow';
    const SPECTRUM = ['#FF6B6B', '#FFA63D', '#FFD23F', '#4ECB71', '#2EC4B6', '#4D9DE0', '#9B72CF', '#FF7AAE'];
    const getRainbowColors = (): string[] => {
      const themeHex = config.gridColor.toUpperCase();
      const idx = SPECTRUM.findIndex((c) => c === themeHex);
      const start = idx >= 0 ? idx : 0;
      return [0, 1, 2, 3].map((i) => SPECTRUM[(start + i) % SPECTRUM.length]);
    };
    const getLineColors = (): string[] => {
      if (lineTheme === 'rainbow') return getRainbowColors();
      if (lineTheme === 'monochrome') {
        const hex = config.gridColor;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [
          `rgba(${r},${g},${b},0.4)`,
          `rgba(${r},${g},${b},0.6)`,
          `rgba(${r},${g},${b},0.8)`,
          `rgba(${r},${g},${b},1)`,
        ];
      }
      return Array(4).fill(borderColor);
    };
    const lineColors = getLineColors();
    const lineDashes = [false, true, false, false]; // line 2 is dashed
    const lineWidths = [1.5, 1, 2, 1.5]; // baseline is thicker

    const showLineNums = config.showLineNumbers || false;
    const isUnderlineMode = (config.traceMode || 'faded') === 'underline';
    const isBlankMode = config.traceMode === 'blank';

    return renderSheet(pages, (pageRows, pageIndex) => (
            <>
             <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid', borderColor: 'grey.300', pb: 1, mb: 3 }}>
                 <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', fontFamily: 'serif' }}>
                    Name: <Box component="span" sx={{ textDecoration: 'underline', textDecorationStyle: 'dotted', color: 'grey.400', ml: 1 }}>__________</Box>
                 </Typography>
                 <Box sx={{ width: '33%', display: 'flex', justifyContent: 'space-between', color: '#333', fontFamily: 'serif', fontSize: '0.875rem' }}>
                     <span>Class: <Box component="span" sx={{ textDecoration: 'underline', textDecorationStyle: 'dotted', color: 'grey.400' }}>______</Box></span>
                     <span>Date: <Box component="span" sx={{ textDecoration: 'underline', textDecorationStyle: 'dotted', color: 'grey.400' }}>______</Box></span>
                 </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: `${rowMarginPx}px` }}>
                {pageRows.map((staffRow, idx) => {
                    let englishFontStack = getPinyinFontStack(); // fallback
                    if (config.fontFamily === 'font-english-print') englishFontStack = englishPrintStack;
                    else if (config.fontFamily === 'font-english-hand') englishFontStack = englishHandStack;
                    else if (config.fontFamily === 'font-sans') englishFontStack = sansStack;

                    return (
                        <Box key={idx} sx={{ width: '100%', position: 'relative', height: `${rowHeightPx}px` }}>
                            <svg width="100%" height="100%" style={{ display: 'block' }}>
                                {/* 4 Lines with themed colors */}
                                {lineYs.map((y, li) => (
                                    <line
                                        key={li}
                                        x1="0" y1={y} x2="100%" y2={y}
                                        stroke={lineColors[li]}
                                        strokeWidth={lineWidths[li]}
                                        {...(lineDashes[li] ? { strokeDasharray: '3,3', opacity: 0.6 } : {})}
                                    />
                                ))}

                                {/* Line numbers */}
                                {showLineNums && lineYs.map((y, li) => {
                                    const numFontSize = Math.max(7, rowHeightPx * 0.15);
                                    return [
                                        <text key={`l-${li}`} x={3} y={y + numFontSize + 1} fontSize={numFontSize} fill="#999" dominantBaseline="alphabetic">{li + 1}</text>,
                                        <text key={`r-${li}`} x="99%" y={y + numFontSize + 1} fontSize={numFontSize} fill="#999" dominantBaseline="alphabetic" textAnchor="end">{li + 1}</text>,
                                    ];
                                })}

                                {/* Text / Underline rendering */}
                                {staffRow.items.map((item, tIdx) => {
                                    if (item.isTrace && isBlankMode) return null;
                                    if (item.isTrace && isUnderlineMode) {
                                        return Array.from(item.text).map((_, ci) => {
                                            const lx = item.x + ci * estCharWidth;
                                            const lw = estCharWidth - 4; // small gap between letters
                                            return (
                                                <line
                                                    key={`${tIdx}-${ci}`}
                                                    x1={lx + 2} y1={y3 + 2}
                                                    x2={lx + 2 + lw} y2={y3 + 2}
                                                    stroke="#bbb" strokeWidth={1.5}
                                                />
                                            );
                                        });
                                    }
                                    return (
                                        <text
                                            key={tIdx}
                                            x={item.x}
                                            y={y3}
                                            fill={item.isTrace ? config.traceTextColor : config.mainTextColor}
                                            fillOpacity={item.isTrace ? config.traceOpacity : 1}
                                            fontSize={`${fontSizePx}px`}
                                            fontFamily={englishFontStack}
                                            dominantBaseline="alphabetic"
                                            style={{ pointerEvents: 'none', userSelect: 'none' }}
                                        >
                                            {item.text}
                                        </text>
                                    );
                                })}
                            </svg>
                        </Box>
                    );
                })}
            </Box>
            </>
    ));
  }

  if (isSentenceMode) {
    type SentenceCell = {
      char?: string;
      pinyin: string;
      isTrace: boolean;
    };

    type SentenceBlock = {
      sampleRows: SentenceCell[][];
      traceRows: SentenceCell[][];
      rowUnits: number;
      heightMm: number;
    };

    const sentences = config.text.split('\n').map((sentence) => sentence.trim()).filter((sentence) => sentence !== '');
    const cellHeightMm = A4_CONTENT_WIDTH_MM / config.colsPerRow;
    const pinyinHeightMm = config.showPinyin ? cellHeightMm / 2 : 0;
    const practiceRowHeightMm = cellHeightMm + pinyinHeightMm;
    const blockGapMm = 8;

    const sentenceBlocks: SentenceBlock[] = sentences.map((sentence) => {
      const charDataList = Array.from(sentence)
        .filter((char) => char.trim() !== '')
        .map((char) => ({
          char,
          pinyin: punctuationPattern.test(char) ? '' : getCharData(char).pinyin,
        }));
      const rowsPerPass = Math.max(1, Math.ceil(charDataList.length / config.colsPerRow));
      const paddedCellCount = rowsPerPass * config.colsPerRow;
      const buildRows = (isTrace: boolean) => {
        const cells: SentenceCell[] = Array.from({ length: paddedCellCount }, (_, cellIndex) => {
          if (cellIndex >= charDataList.length) {
            return { char: undefined, pinyin: '', isTrace };
          }

          const charData = charDataList[cellIndex];

          return {
            char: charData.char,
            pinyin: charData.pinyin,
            isTrace,
          };
        });

        return chunk(cells, config.colsPerRow);
      };

      return {
        sampleRows: buildRows(false),
        traceRows: buildRows(true),
        rowUnits: rowsPerPass * 2,
        heightMm: rowsPerPass * practiceRowHeightMm * 2,
      };
    });

    const maxRowsPhysically = Math.max(1, Math.floor(A4_CONTENT_HEIGHT_MM / Math.max(practiceRowHeightMm, 1)));
    const rowBudgetPerPage = Math.max(1, Math.min(config.rowsPerPage, maxRowsPhysically));
    const pages: SentenceBlock[][] = [];
    let currentPage: SentenceBlock[] = [];
    let currentRowUnits = 0;
    let currentHeightMm = 0;

    sentenceBlocks.forEach((block) => {
      const nextHeightMm = currentPage.length === 0 ? block.heightMm : currentHeightMm + blockGapMm + block.heightMm;
      const exceedsRowBudget = currentRowUnits + block.rowUnits > rowBudgetPerPage;
      const exceedsHeightBudget = nextHeightMm > A4_CONTENT_HEIGHT_MM;

      if ((exceedsRowBudget || exceedsHeightBudget) && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [block];
        currentRowUnits = block.rowUnits;
        currentHeightMm = block.heightMm;
        return;
      }

      currentPage.push(block);
      currentRowUnits += block.rowUnits;
      currentHeightMm = nextHeightMm;
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    if (pages.length === 0) {
      pages.push([]);
    }

    return renderSheet(pages, (pageBlocks, pageIndex) => (
            <>
            <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid', borderColor: 'orange.200', pb: 1, mb: 3 }}>
              <Typography variant="h6" className="font-kaiti" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{config.headerTitle}</Typography>
              <Typography variant="body2" className="font-kaiti" sx={{ color: 'text.secondary' }}>{config.headerContent}</Typography>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {pageBlocks.map((block, sentenceIndex) => (
                <Box key={sentenceIndex} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[block.sampleRows, block.traceRows].map((passRows, passIndex) => (
                    <Box key={passIndex} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {passRows.map((rowCells, rowIndex) => (
                        <Box key={rowIndex} sx={{ width: '100%' }}>
                          {config.showPinyin && (
                            <Box sx={{ display: 'flex', width: '100%', ...wrapperStyle }}>
                              {rowCells.map((cell, colIndex) => (
                                <Box
                                  key={colIndex}
                                  sx={{ position: 'relative', bgcolor: 'white', overflow: 'hidden', width: cellWidthPercent, ...cellStyle }}
                                >
                                  {renderPinyinStaff(cell.pinyin, cell.isTrace)}
                                </Box>
                              ))}
                            </Box>
                          )}

                          <Box sx={{ display: 'flex', width: '100%', ...wrapperStyle }}>
                            {rowCells.map((cell, colIndex) => (
                              <Box
                                key={colIndex}
                                sx={{ aspectRatio: '1/1', position: 'relative', bgcolor: 'white', width: cellWidthPercent, ...cellStyle }}
                              >
                                {renderSentenceCell(cell.char, cell.isTrace)}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>

            <Box component="footer" sx={{ mt: 'auto', borderTop: 1, borderColor: 'grey.100', pt: 1, textAlign: 'center', color: 'grey.400', fontSize: '0.75rem' }} className="font-kaiti">
              Page {pageIndex + 1}
            </Box>
          </>
    ));
  }

  if (isWordMode) {
    type WordCell = {
      char?: string;
      pinyin: string;
      isTrace: boolean;
    };

    type WordBlock = {
      rows: WordCell[][];
      rowUnits: number;
      heightMm: number;
    };

    const words = config.text.split(/[,，]/).map((word) => word.trim()).filter((word) => word !== '');
    const cellHeightMm = A4_CONTENT_WIDTH_MM / config.colsPerRow;
    const pinyinHeightMm = config.showPinyin ? cellHeightMm / 2 : 0;
    const practiceRowHeightMm = cellHeightMm + pinyinHeightMm;
    const blockGapMm = 6;

    const wordBlocks: WordBlock[] = words.map((word) => {
      const charDataList = Array.from(word).map((char) => ({ char, pinyin: getCharData(char).pinyin }));
      const totalCells = charDataList.length * (config.traceCount + 1);
      const rowUnits = Math.max(1, Math.ceil(totalCells / config.colsPerRow));
      const paddedCellCount = rowUnits * config.colsPerRow;
      const cells: WordCell[] = Array.from({ length: paddedCellCount }, (_, cellIndex) => {
        if (cellIndex >= totalCells) {
          return { char: undefined, pinyin: '', isTrace: false };
        }

        const charIndex = cellIndex % charDataList.length;
        const copyIndex = Math.floor(cellIndex / charDataList.length);
        const charData = charDataList[charIndex];

        return {
          char: charData.char,
          pinyin: charData.pinyin,
          isTrace: copyIndex > 0,
        };
      });

      return {
        rows: chunk(cells, config.colsPerRow),
        rowUnits,
        heightMm: rowUnits * practiceRowHeightMm,
      };
    });

    const maxRowsPhysically = Math.max(1, Math.floor(A4_CONTENT_HEIGHT_MM / Math.max(practiceRowHeightMm, 1)));
    const rowBudgetPerPage = Math.max(1, Math.min(config.rowsPerPage, maxRowsPhysically));
    const pages: WordBlock[][] = [];
    let currentPage: WordBlock[] = [];
    let currentRowUnits = 0;
    let currentHeightMm = 0;

    wordBlocks.forEach((block) => {
      const nextHeightMm = currentPage.length === 0 ? block.heightMm : currentHeightMm + blockGapMm + block.heightMm;
      const exceedsRowBudget = currentRowUnits + block.rowUnits > rowBudgetPerPage;
      const exceedsHeightBudget = nextHeightMm > A4_CONTENT_HEIGHT_MM;

      if ((exceedsRowBudget || exceedsHeightBudget) && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [block];
        currentRowUnits = block.rowUnits;
        currentHeightMm = block.heightMm;
        return;
      }

      currentPage.push(block);
      currentRowUnits += block.rowUnits;
      currentHeightMm = nextHeightMm;
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    if (pages.length === 0) {
      pages.push([]);
    }

    return renderSheet(pages, (pageBlocks, pageIndex) => (
            <>
            <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid', borderColor: 'orange.200', pb: 1, mb: 3 }}>
              <Typography variant="h6" className="font-kaiti" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{config.headerTitle}</Typography>
              <Typography variant="body2" className="font-kaiti" sx={{ color: 'text.secondary' }}>{config.headerContent}</Typography>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {pageBlocks.map((block, wordIndex) => (
                <Box key={wordIndex} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {block.rows.map((rowCells, rowIndex) => (
                    <Box key={rowIndex} sx={{ width: '100%' }}>
                      {config.showPinyin && (
                        <Box sx={{ display: 'flex', width: '100%', ...wrapperStyle }}>
                          {rowCells.map((cell, colIndex) => (
                            <Box
                              key={colIndex}
                              sx={{ position: 'relative', bgcolor: 'white', overflow: 'hidden', width: cellWidthPercent, ...cellStyle }}
                            >
                              {renderPinyinStaff(cell.pinyin, cell.isTrace)}
                            </Box>
                          ))}
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', width: '100%', ...wrapperStyle }}>
                        {rowCells.map((cell, colIndex) => (
                          <Box
                            key={colIndex}
                            sx={{ aspectRatio: '1/1', position: 'relative', bgcolor: 'white', width: cellWidthPercent, ...cellStyle }}
                          >
                            <GridBox
                              type={config.gridType}
                              color={config.gridColor}
                              opacity={config.gridOpacity}
                              content={cell.char}
                              contentColor={cell.isTrace ? config.traceTextColor : config.mainTextColor}
                              contentOpacity={cell.isTrace ? config.traceOpacity : 1}
                              contentFontSize={hanziFontSize}
                              fontFamily={config.fontFamily}
                              showOuterBorder={false}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>

            <Box component="footer" sx={{ mt: 'auto', borderTop: 1, borderColor: 'grey.100', pt: 1, textAlign: 'center', color: 'grey.400', fontSize: '0.75rem' }} className="font-kaiti">
              Page {pageIndex + 1}
            </Box>
          </>
    ));
  }

  // --- Render Mode 3: Standard Chinese Character Practice ---
  
  // Filter out whitespace/newlines to prevent empty boxes
  const textChars = Array.from(config.text).filter(c => c.trim() !== '');
  
  // Calculate max items based on physical space to prevent overflow when colsPerRow changes
  const cellHeightMm = A4_CONTENT_WIDTH_MM / config.colsPerRow;
  // Height = StrokeMeta + Pinyin + Grid(cell) + Gap + MarginOfError
  const rowHeightMm = cellHeightMm + (config.showPinyin ? 16 : 10);
  const maxRowsPhysically = Math.max(1, Math.floor(A4_CONTENT_HEIGHT_MM / rowHeightMm));
  
  const itemsPerPage = Math.max(1, Math.min(config.rowsPerPage, maxRowsPhysically));
  
  let pages = chunk(textChars, itemsPerPage);
  if (pages.length === 0) pages = [['字']];

  return renderSheet(pages, (pageChars, pageIndex) => (
            <>
        <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid', borderColor: 'orange.200', pb: 1, mb: 3 }}>
             <Typography variant="h6" className="font-kaiti" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{config.headerTitle}</Typography>
             <Typography variant="body2" className="font-kaiti" sx={{ color: 'text.secondary' }}>{config.headerContent}</Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {pageChars.map((char, rowIndex) => {
                const charData = getCharData(char);
                return (
                    <Box key={rowIndex} sx={{ width: '100%' }}>
                        {/* Meta info row */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', mb: 0.5, px: 0.5 }}>
                            <Typography variant="caption" sx={{ color: 'grey.400' }}>
                                {config.showStrokeCount && charData.strokes > 0 ? `${charData.strokes}画` : ''}
                            </Typography>
                        </Box>

                        {config.showPinyin && (
                            <Box sx={{ display: 'flex', width: '100%', mb: 0.5, ...wrapperStyle }}>
                                {Array.from({ length: config.colsPerRow }).map((_, colIndex) => {
                                    const isMain = colIndex === 0;
                                    const isTrace = colIndex > 0 && colIndex <= config.traceCount;
                                    const pinyinText = isMain || isTrace ? charData.pinyin : '';

                                    return (
                                        <Box
                                            key={colIndex}
                                            sx={{ position: 'relative', bgcolor: 'white', overflow: 'hidden', width: cellWidthPercent, ...cellStyle }}
                                        >
                                            {renderPinyinStaff(pinyinText, isTrace)}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                        
                        {/* Grid Row */}
                        <Box sx={{ display: 'flex', width: '100%', ...wrapperStyle }}>
                            {/* Main Character */}
                            <Box sx={{ aspectRatio: '1/1', position: 'relative', bgcolor: 'white', width: cellWidthPercent, ...cellStyle }}>
                                <GridBox 
                                    type={config.gridType} 
                                    color={config.gridColor} 
                                    opacity={config.gridOpacity}
                                    content={char}
                                    contentColor={config.mainTextColor}
                                    contentFontSize={hanziFontSize}
                                    fontFamily={config.fontFamily}
                                    showOuterBorder={false}
                                />
                            </Box>
                            
                            {/* Trace/Empty Characters */}
                            {Array.from({ length: config.colsPerRow - 1 }).map((_, colIndex) => {
                                const isTrace = colIndex < config.traceCount;
                                return (
                                    <Box key={colIndex} 
                                         sx={{ aspectRatio: '1/1', position: 'relative', bgcolor: 'white', width: cellWidthPercent, ...cellStyle }}
                                    >
                                        <GridBox 
                                            type={config.gridType} 
                                            color={config.gridColor} 
                                            opacity={config.gridOpacity}
                                            content={isTrace ? char : undefined}
                                            contentColor={config.traceTextColor}
                                            contentOpacity={config.traceOpacity}
                                            contentFontSize={hanziFontSize}
                                            fontFamily={config.fontFamily}
                                            showOuterBorder={false}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                );
            })}
        </Box>

        <Box component="footer" sx={{ mt: 'auto', borderTop: 1, borderColor: 'grey.100', pt: 1, textAlign: 'center', color: 'grey.400', fontSize: '0.75rem' }} className="font-kaiti">
             Page {pageIndex + 1}
        </Box>
      </>
  ));
};