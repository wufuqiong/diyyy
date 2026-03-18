import React, { useState, useEffect } from 'react';

import PrintIcon from '@mui/icons-material/Print';
import { Box, Paper, Typography, Pagination, Stack, IconButton } from '@mui/material';

interface NumberCompositionProblem {
  id: string;
  total: number;
  part1: number;
  part2: number;
  color: string;
  emoji: string;
}

interface Props {
  problems: NumberCompositionProblem[];
  title: string;
  theme: string;
  showAnswers: boolean;
}

// 单个数的分合练习题组件
const CompositionProblem: React.FC<{
  problem: NumberCompositionProblem;
  index: number;
  showAnswers: boolean;
}> = React.memo(({ problem, index, showAnswers }) => {
  const { total, part1, part2, color, emoji } = problem;

  // 获取边框颜色
  const getBorderColor = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'blue': '#1976d2',
      'green': '#388e3c',
      'purple': '#7b1fa2',
      'red': '#d32f2f',
      'yellow': '#f57c00',
      'orange': '#e65100',
    };
    return colorMap[colorName] || '#666';
  };

  const borderColor = getBorderColor(color);

  // 渲染emoji图片
  const renderEmojis = (count: number) => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 60,
        p: 1,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          component="span"
          sx={{
            fontSize: '1.8rem',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {emoji}
        </Box>
      ))}
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        border: '3px solid',
        borderColor,
        borderRadius: 3,
        backgroundColor: 'white',
        height: 280,
        width: '100%',
        breakInside: 'avoid',
        overflow: 'hidden',
      }}
    >
      {/* 题号 */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.100',
          borderRadius: '50%',
          color: 'grey.600',
          fontWeight: 'bold',
          fontSize: '0.875rem',
          border: '1px solid',
          borderColor: 'grey.300',
          zIndex: 1,
        }}
      >
        {index + 1}
      </Box>

      {/* 顶部：图片展示区域 */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
        }}
      >
        {renderEmojis(total)}
      </Box>

      {/* 中间：总数圆形 */}
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: borderColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          border: '2px solid',
          borderColor: 'grey.800',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          {total}
        </Typography>
      </Box>

      {/* 底部：分解结构 */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {/* 连接线 */}
        <Box sx={{ position: 'relative', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* 左边斜线 */}
          <Box
            sx={{
              position: 'absolute',
              left: '35%',
              top: '50%',
              width: 30,
              height: 2,
              backgroundColor: 'grey.600',
              transform: 'translate(-50%, -50%) rotate(-45deg)',
              transformOrigin: 'center',
            }}
          />
          {/* 右边斜线 */}
          <Box
            sx={{
              position: 'absolute',
              left: '65%',
              top: '50%',
              width: 30,
              height: 2,
              backgroundColor: 'grey.600',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              transformOrigin: 'center',
            }}
          />
        </Box>

        {/* 两个部分 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* 左边：已知部分 */}
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid',
              borderColor: 'grey.600',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: 'grey.800',
              }}
            >
              {part1}
            </Typography>
          </Box>

          {/* 右边：待填部分 */}
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: showAnswers ? 'lightgreen' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid',
              borderColor: showAnswers ? 'green' : 'grey.600',
            }}
          >
            {showAnswers ? (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: 'green',
                }}
              >
                {part2}
              </Typography>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: 'grey.400',
                  fontStyle: 'italic',
                }}
              >
                ?
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
});

CompositionProblem.displayName = 'CompositionProblem';

const NumberCompositionPreview: React.FC<Props> = ({ problems, title, theme, showAnswers }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const PROBLEMS_PER_PAGE = 4; // 每页4题，2x2布局
  
  // 计算分页
  const totalPages = Math.ceil(problems.length / PROBLEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + PROBLEMS_PER_PAGE, problems.length);
  const currentProblems = problems.slice(startIndex, endIndex);

  // 重置到第一页当题目变化时
  useEffect(() => {
    setCurrentPage(1);
  }, [problems]);

  if (problems.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: 'grey.100',
          p: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'grey.400',
        }}
      >
        <Typography variant="h6" color="inherit">
          生成预览中...
        </Typography>
      </Box>
    );
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: 'grey.50',
        overflowY: 'auto',
        padding: 2,
        '@media print': {
          backgroundColor: 'white',
          padding: 0,
          overflow: 'visible',
        },
      }}
      className="worksheet-preview"
    >
      {/* 屏幕视图 - 打印时隐藏 */}
      <Box 
        sx={{ 
          '@media print': { 
            display: 'none !important' 
          } 
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '210mm',
            minHeight: '297mm',
            overflow: 'hidden',
            margin: '0 auto',
            marginBottom: 4,
            padding: '20mm',
            paddingBottom: '15mm',
            backgroundColor: 'white',
            boxShadow: 5,
            '&:last-child': {
              marginBottom: 0,
            },
          }}
        >
          {/* 页面头部 */}
          <Box sx={{ mb: 4, borderBottom: '2px solid', borderColor: 'grey.300', pb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 'bold',
                    color: 'grey.800',
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                  }}
                >
                  {title}
                </Typography>
                <IconButton onClick={() => window.print()} color="primary">
                  <PrintIcon />
                </IconButton>
              </Box>
              
              {/* 姓名和日期 */}
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    姓名：
                  </Typography>
                  <Box
                    sx={{
                      width: 80,
                      height: 30,
                      borderBottom: '1px solid',
                      borderColor: 'grey.400',
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    日期：
                  </Typography>
                  <Box
                    sx={{
                      width: 100,
                      height: 30,
                      borderBottom: '1px solid',
                      borderColor: 'grey.400',
                    }}
                  />
                </Box>
              </Box>
            </Box>
            
            {totalPages > 1 && (
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'right',
                  color: 'grey.500',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  mt: 1,
                }}
              >
                第 {currentPage} 页，共 {totalPages} 页
              </Typography>
            )}
          </Box>

          {/* 题目网格 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 3,
            }}
          >
            {currentProblems.map((problem, index) => (
              <CompositionProblem 
                problem={problem} 
                index={startIndex + index}
                showAnswers={showAnswers}
                key={problem.id}
              />
            ))}
          </Box>
        </Paper>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Box>

      {/* 打印视图 - 所有页面 - 仅打印时显示 */}
      <Box 
        sx={{ 
          display: 'none',
          '@media print': { 
            display: 'block !important',
            '& .page-container': {
              pageBreakAfter: 'always',
              '&:last-child': {
                pageBreakAfter: 'auto',
              }
            }
          } 
        }}
      >
        {Array.from({ length: totalPages }).map((_, pageIndex) => {
          const printStartIndex = pageIndex * PROBLEMS_PER_PAGE;
          const printEndIndex = Math.min(printStartIndex + PROBLEMS_PER_PAGE, problems.length);
          const printProblems = problems.slice(printStartIndex, printEndIndex);

          return (
            <Paper
              key={`print-page-${pageIndex}`}
              className="page-container"
              elevation={0}
              sx={{
                width: '210mm',
                minHeight: '297mm',
                overflow: 'hidden',
                margin: '0 auto',
                padding: '20mm',
                paddingBottom: '15mm',
                backgroundColor: 'white',
                boxShadow: 5,
                pageBreakAfter: pageIndex < totalPages - 1 ? 'always' : 'auto',
                pageBreakInside: 'avoid',
              }}
            >
              <Box sx={{ mb: 4, borderBottom: '2px solid', borderColor: 'grey.300', pb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 'bold',
                        color: 'grey.800',
                        mb: 0.5,
                        fontSize: '2rem',
                      }}
                    >
                      {title}
                    </Typography>
                  </Box>
                  
                  {/* 姓名和日期 */}
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        姓名：
                      </Typography>
                      <Box
                        sx={{
                          width: 80,
                          height: 30,
                          borderBottom: '1px solid',
                          borderColor: 'grey.400',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        日期：
                      </Typography>
                      <Box
                        sx={{
                          width: 100,
                          height: 30,
                          borderBottom: '1px solid',
                          borderColor: 'grey.400',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                
                {totalPages > 1 && (
                  <Typography
                    variant="body2"
                    sx={{
                      textAlign: 'right',
                      color: 'grey.500',
                      fontSize: '0.75rem',
                      mt: 1,
                    }}
                  >
                    第 {pageIndex + 1} 页，共 {totalPages} 页
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 3,
                }}
              >
                {printProblems.map((problem, index) => (
                  <CompositionProblem 
                    problem={problem} 
                    index={printStartIndex + index}
                    showAnswers={showAnswers}
                    key={problem.id}
                  />
                ))}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default NumberCompositionPreview;
