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
    // Split by lines or commas
    const lines = config.text.split(/[\n,，]/).filter(w => w.trim() !== '');
    const rowsPerPage = config.rowsPerPage;
    
    let pages = chunk(lines, rowsPerPage);
    if (pages.length === 0) pages = [[]];

    return (
        <Box sx={containerStyle}>
            {pages.map((pageLines, pageIndex) => {
                // Fill remaining rows with empty strings if needed to maintain structure
                const totalRows = Array.from({ length: rowsPerPage }, (_, i) => pageLines[i] || '');

                return (
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

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 4 }}>
                {totalRows.map((word, idx) => {
                    const rowHeight = 80; // px approx for one staff
                    
                    return (
                        <Box key={idx} sx={{ width: '100%', position: 'relative', height: `${rowHeight}px` }}>
                            {/* The 4-Line Staff Background */}
                            <Box sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                                {/* Top Line - Green */}
                                <Box sx={{ borderTop: '2px solid', borderColor: 'success.main', width: '100%', height: 0 }} />
                                {/* Mid Line - Green Dashed? Or Solid? Usually thin Green/Blue. Let's match image: Green */}
                                <Box sx={{ borderTop: '1px solid', borderColor: 'success.main', width: '100%', height: 0, opacity: 0.6 }} />
                                {/* Base Line - Red */}
                                <Box sx={{ borderTop: '2px solid', borderColor: '#ef5350', width: '100%', height: 0 }} />
                                {/* Bottom Line - Green */}
                                <Box sx={{ borderTop: '2px solid', borderColor: 'success.main', width: '100%', height: 0 }} />
                            </Box>

                            {/* Text Content Layer */}
                            {/* We use flex to place Main word and Trace words */}
                            <Box sx={{ 
                                position: 'absolute', inset: 0, width: '100%', height: '100%', 
                                display: 'flex', alignItems: 'center', pl: 2, overflow: 'hidden' 
                            }}>
                                {word && (
                                    <>
                                        {/* Main Word */}
                                        <span 
                                            className={`${config.fontFamily} italic`}
                                            style={{ 
                                                color: config.mainTextColor, 
                                                fontSize: '50px', // Scaled to fit between top and bottom lines mostly
                                                fontFamily: getFontStack(config.fontFamily),
                                                lineHeight: '0', // remove line-height spacing issues
                                                transform: 'translateY(-12px)', // Visual alignment to sit on baseline (approx 3rd line)
                                            }}
                                        >
                                            {word}
                                        </span>
                                        
                                        {/* Trace Words */}
                                        {Array.from({ length: config.traceCount }).map((_, tIdx) => (
                                            <span 
                                                key={tIdx}
                                                className={`${config.fontFamily} italic`}
                                                style={{ 
                                                    color: config.traceTextColor, 
                                                    opacity: config.traceOpacity,
                                                    fontSize: '50px',
                                                    fontFamily: getFontStack(config.fontFamily),
                                                    lineHeight: '0',
                                                    transform: 'translateY(-12px)',
                                                    marginLeft: '48px'
                                                }}
                                            >
                                                {word}
                                            </span>
                                        ))}
                                    </>
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
            {/* Footer could go here if needed for English mode */}
            </Box>
                );
            })}
        </Box>
    );
  }

  // --- Render Mode 2: Chinese Word/Phrase List ---
  if (isWordMode) {
    const words = config.text.split(/[,，]/).filter(w => w.trim() !== '');
    
    // Calculate max items based on physical space to prevent overflow when colsPerRow changes
    const cellHeightMm = A4_CONTENT_WIDTH_MM / config.colsPerRow;
    // Height = Pinyin(8.5mm) + Grid(cell) + Grid(cell) + Gap(6.5mm) + MarginOfError
    const blockHeightMm = (cellHeightMm * 2) + 12; 
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
                                                <Box sx={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', color: 'text.secondary', bgcolor: 'grey.50', ...cellStyle }}>
                                                    {cData.pinyin || ''}
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
  // Height = Meta(7.5mm) + Grid(cell) + Gap(4.5mm) + MarginOfError
  const rowHeightMm = cellHeightMm + 10;
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 0.5, px: 0.5 }}>
                            <Box component="span" sx={{ fontWeight: 'bold', fontSize: '1.125rem', fontFamily: 'serif', bgcolor: 'grey.50', px: 1, borderTopLeftRadius: 4, borderTopRightRadius: 4, border: 1, borderColor: 'grey.100', borderBottom: 0 }}>
                                {config.showPinyin ? charData.pinyin : ''}
                            </Box>
                            <Typography variant="caption" sx={{ color: 'grey.400' }}>
                                {config.showStrokeCount && charData.strokes > 0 ? `${charData.strokes}画` : ''}
                            </Typography>
                        </Box>
                        
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