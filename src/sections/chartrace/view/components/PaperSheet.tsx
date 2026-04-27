import React from 'react';

import { Box, Typography } from '@mui/material';

import { SheetConfig, GridType } from 'src/types';

import { GridBox } from './GridBox';
import { getCharData } from '../utils/charData';

interface PaperSheetProps {
  config: SheetConfig;
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
    return 'KaiTi, STKaiti, "Kaiti SC", "SimKai", serif';
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
const getPinyinFontStack = () =>
  '"Andika", "Comic Sans MS", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';

export const PaperSheet: React.FC<PaperSheetProps> = ({ config }) => {
  // Detect "Word Mode" via comma separator
  const isWordMode = config.text.includes(',') || config.text.includes('，');
  const isEnglishMode = config.gridType === GridType.ENGLISH_LINES;
  
  // Calculate dynamic styles
  const borderColor = getBorderColor(config.gridColor, config.gridOpacity);
  
  // "Border Collapse" strategy for Chinese Grid
  const wrapperStyle = {
    borderColor: borderColor,
    borderWidth: '1px 0 0 1px', // Top Left
    borderStyle: 'solid',
  };
  
  const cellStyle = {
    borderColor: borderColor,
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

  // Shared styles for the outer scrolling container
  const containerStyle = {
    bgcolor: 'grey.200',
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column', // Stack pages vertically
    alignItems: 'center',    // Center pages horizontally
    gap: 4,                  // Gap between pages
    p: 4,
    '@media print': { p: 0, gap: 0, display: 'block', bgcolor: 'white', overflow: 'visible', height: 'auto' }
  };

  // Shared styles for the A4 page
  const a4PageStyle = {
    bgcolor: 'white',
    boxShadow: 24,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '210mm',
    minHeight: '297mm',
    height: '297mm',
    padding: '15mm',
    boxSizing: 'border-box',
    '@media print': { boxShadow: 'none', minHeight: 'auto', height: '297mm' }
  };

  // Constants for A4 layout calculations (approximate in mm)
  const A4_CONTENT_HEIGHT_MM = 245; // 297 - 30(padding) - ~22(header/footer/margins)
  const A4_CONTENT_WIDTH_MM = 180;  // 210 - 30(padding)

  // === RENDER MODE: ENGLISH LINES ===
  if (isEnglishMode) {
    // Parsing logic:
    // 1. If contains commas/newlines, split by them (words)
    // 2. Else if contains spaces, split by spaces (words)
    // 3. Else, split by characters (individual letters like a, b, c)
    let parsedItems: string[] = [];
    if (config.text.match(/[\n,，]/)) {
        parsedItems = config.text.split(/[\n,，]/).map(w => w.trim()).filter(w => w !== '');
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

    return (
        <Box sx={containerStyle}>
            {pages.map((pageRows, pageIndex) => (
            <Box key={pageIndex} sx={{ ...a4PageStyle, '@media print': { 
                ...a4PageStyle['@media print'], 
                breakAfter: pageIndex === pages.length - 1 ? 'auto' : 'page' 
            } }}>
             <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid', borderColor: 'success.main', pb: 1, mb: 3 }}>
                 <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark', fontFamily: 'serif' }}>
                    Name: <Box component="span" sx={{ textDecoration: 'underline', textDecorationStyle: 'dotted', color: 'grey.400', ml: 1 }}>__________</Box>
                 </Typography>
                 <Box sx={{ width: '33%', display: 'flex', justifyContent: 'space-between', color: 'success.dark', fontFamily: 'serif', fontSize: '0.875rem' }}>
                     <span>Class: <Box component="span" sx={{ textDecoration: 'underline', textDecorationStyle: 'dotted', color: 'grey.400' }}>______</Box></span>
                     <span>Date: <Box component="span" sx={{ textDecoration: 'underline', textDecorationStyle: 'dotted', color: 'grey.400' }}>______</Box></span>
                 </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: `${rowMarginPx}px` }}>
                {pageRows.map((staffRow, idx) => {
                    let englishFontStack = getPinyinFontStack(); // fallback
                    if (config.fontFamily === 'font-english-print') englishFontStack = '"Fredoka", "Comic Sans MS", "Andika", sans-serif';
                    else if (config.fontFamily === 'font-english-hand') englishFontStack = '"Patrick Hand", "Comic Sans MS", cursive';
                    else if (config.fontFamily === 'font-sans') englishFontStack = 'Arial, Helvetica, sans-serif';
                    
                    return (
                        <Box key={idx} sx={{ width: '100%', position: 'relative', height: `${rowHeightPx}px` }}>
                            {/* Absolute precise SVG mapping rendering pixels 1:1, never squeezing */}
                            <svg width="100%" height="100%" style={{ display: 'block' }}>
                                {/* 4 Lines (Red line #ef5350 is specifically the baseline for English!) */}
                                <line x1="0" y1={y1} x2="100%" y2={y1} stroke={borderColor} strokeWidth="1.5" />
                                <line x1="0" y1={y2} x2="100%" y2={y2} stroke={borderColor} strokeWidth="1" strokeDasharray="3,3" opacity={0.6} />
                                <line x1="0" y1={y3} x2="100%" y2={y3} stroke="#ef5350" strokeWidth="2" />
                                <line x1="0" y1={y4} x2="100%" y2={y4} stroke={borderColor} strokeWidth="1.5" />

                                {/* Precise Text Rendering */}
                                {staffRow.items.map((item, tIdx) => (
                                    <text
                                        key={tIdx}
                                        x={item.x}
                                        y={y3} // Exact baseline position!
                                        fill={item.isTrace ? config.traceTextColor : config.mainTextColor}
                                        fillOpacity={item.isTrace ? config.traceOpacity : 1}
                                        fontSize={`${fontSizePx}px`}
                                        fontFamily={englishFontStack}
                                        dominantBaseline="alphabetic"
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                        {item.text}
                                    </text>
                                ))}
                            </svg>
                        </Box>
                    );
                })}
            </Box>
            </Box>
            ))}
        </Box>
    );
  }

  // --- Render Mode 2: Chinese Word/Phrase List ---
  if (isWordMode) {
    const words = config.text.split(/[,，]/).filter(w => w.trim() !== '');
    
    // Calculate max items based on physical space to prevent overflow when colsPerRow changes
    const cellHeightMm = A4_CONTENT_WIDTH_MM / config.colsPerRow;
    // Height = Pinyin + Grid(cell) + Pinyin + Grid(cell) + Gap + MarginOfError
    const blockHeightMm = (cellHeightMm * 2) + 20;
    const maxItemsPhysically = Math.max(1, Math.floor(A4_CONTENT_HEIGHT_MM / blockHeightMm));
    
    const itemsPerPage = Math.max(1, Math.min(Math.floor(config.rowsPerPage / 2), maxItemsPhysically));
    
    let pages = chunk(words, itemsPerPage);
    if (pages.length === 0) pages = [[]];

    return (
        <Box sx={containerStyle}>
          {pages.map((pageWords, pageIndex) => (
          <Box key={pageIndex} sx={{ ...a4PageStyle, '@media print': { 
              ...a4PageStyle['@media print'], 
              breakAfter: pageIndex === pages.length - 1 ? 'auto' : 'page' 
          } }}>
            <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid', borderColor: 'orange.200', pb: 1, mb: 3 }}>
                 <Typography variant="h6" className="font-kaiti" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{config.headerTitle}</Typography>
                 <Typography variant="body2" className="font-kaiti" sx={{ color: 'text.secondary' }}>{config.headerContent}</Typography>
            </Box>
    
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {pageWords.map((word, wordIndex) => (
                    <Box key={wordIndex} sx={{ width: '100%', display: 'flex', flexDirection: 'column', ...wrapperStyle }}>
                            {/* Row 1: Guide with Pinyin & Info */}
                            <Box sx={{ display: 'flex', width: '100%' }}>
                                {/* Character Columns */}
                                {(Array.from(word) as string[]).map((char, charIdx) => {
                                    const cData = getCharData(char);
                                    return (
                                        <Box key={charIdx} sx={{ display: 'flex', flexDirection: 'column', width: cellWidthPercent }}>
                                            {/* Pinyin Box */}
                                            {config.showPinyin && (
                                                <Box sx={{ position: 'relative', bgcolor: 'white', overflow: 'hidden', ...cellStyle }}>
                                                    {renderPinyinStaff(cData.pinyin || '', false)}
                                                </Box>
                                            )}
                                            {/* Solid Character Grid */}
                                            <Box sx={{ aspectRatio: '1/1', position: 'relative', ...cellStyle }}>
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
                                        </Box>
                                    );
                                })}

                                {/* Info Area (Right side) - Spans the rest of the row */}
                                <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'white', ...cellStyle }}>
                                    {/* Completely empty info area for Word Mode as requested */}
                                </Box>
                            </Box>

                            {config.showPinyin && (
                                <Box sx={{ display: 'flex', width: '100%' }}>
                                    {Array.from({ length: config.colsPerRow }).map((_, colIndex) => {
                                        const charAtPos = word[colIndex % word.length];
                                        const pinyinAtPos = getCharData(charAtPos).pinyin;
                                        const totalCharsToTrace = word.length * config.traceCount;
                                        const isTrace = colIndex < totalCharsToTrace;

                                        return (
                                            <Box
                                                key={colIndex}
                                                sx={{ position: 'relative', bgcolor: 'white', overflow: 'hidden', width: cellWidthPercent, ...cellStyle }}
                                            >
                                                {renderPinyinStaff(isTrace ? pinyinAtPos : '', true)}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}

                            {/* Row 2: Practice (Trace + Empty) */}
                            <Box sx={{ display: 'flex', width: '100%' }}>
                                {Array.from({ length: config.colsPerRow }).map((_, colIndex) => {
                                    // Logic: Repeat the word pattern across the row
                                    const charAtPos = word[colIndex % word.length];
                                    
                                    // Logic: traceCount = Number of word repetitions.
                                    // If word is "abc" (3 chars) and traceCount is 2, we trace 6 cells.
                                    const totalCharsToTrace = word.length * config.traceCount;
                                    const isTrace = colIndex < totalCharsToTrace;

                                    return (
                                        <Box key={colIndex} 
                                             sx={{ aspectRatio: '1/1', position: 'relative', width: cellWidthPercent, ...cellStyle }}
                                        >
                                            <GridBox 
                                                type={config.gridType} 
                                                color={config.gridColor} 
                                                opacity={config.gridOpacity}
                                                content={isTrace ? charAtPos : undefined}
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
                ))}
            </Box>
    
            <Box component="footer" sx={{ mt: 'auto', borderTop: 1, borderColor: 'grey.100', pt: 1, textAlign: 'center', color: 'grey.400', fontSize: '0.75rem' }} className="font-kaiti">
                 Page {pageIndex + 1}
            </Box>
          </Box>
          ))}
        </Box>
      );
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

  return (
    <Box sx={containerStyle}>
      {pages.map((pageChars, pageIndex) => (
      <Box key={pageIndex} sx={{ ...a4PageStyle, '@media print': { 
          ...a4PageStyle['@media print'], 
          breakAfter: pageIndex === pages.length - 1 ? 'auto' : 'page' 
      } }}>
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
      </Box>
      ))}
    </Box>
  );
};