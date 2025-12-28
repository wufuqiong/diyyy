import React, { useState, useRef, useEffect } from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Shuffle as ShuffleIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon,
  FormatListNumbered as FormatListNumberedIcon
} from '@mui/icons-material';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Switch,
  FormControlLabel,
  Box,
  Slider,
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';


// 定义练习题类型
type ExerciseType = 'addition' | 'subtraction' | 'mixed';
type ThemeType = 'monsters' | 'fruits' | 'vegetables' | 'mixed';

// 定义单个练习题的接口
interface Exercise {
  id: number;
  type: 'addition' | 'subtraction';
  operands: number[];
  result: number;
  visualData: {
    totalItems: number;
    leftItems?: number;
    rightItems?: number;
    removedItems?: number;
  };
}

// 主题定义
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a6fa5',
    },
    secondary: {
      main: '#ff8e53',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Comic Neue", "Ma Shan Zheng", cursive, sans-serif',
    h4: {
      fontWeight: 700,
      color: '#2c3e50',
    },
    h5: {
      fontWeight: 600,
      color: '#34495e',
    },
  },
});

export const CharTraceView: React.FC = () => {
  // 状态管理
  const [exerciseType, setExerciseType] = useState<ExerciseType>('mixed');
  const [themeType, setThemeType] = useState<ThemeType>('mixed');
  const [numExercises, setNumExercises] = useState<number>(12);
  const [maxNumber, setMaxNumber] = useState<number>(5);
  const [exercisesPerRow, setExercisesPerRow] = useState<number>(3);
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [title, setTitle] = useState<string>('幼小衔接看图列算式专项练习');
  const [studentName, setStudentName] = useState<string>('姓名：__________');
  const [className, setClassName] = useState<string>('班级：__________');
  
  const printRef = useRef<HTMLDivElement>(null);

  // 初始化生成练习题
  useEffect(() => {
    generateExercises();
  }, []);

  // 生成随机数
  const getRandomNumber = (min: number, max: number): number => (
    Math.floor(Math.random() * (max - min + 1)) + min
  );

  // 生成练习题
  const generateExercises = () => {
    const newExercises: Exercise[] = [];
    
    for (let i = 0; i < numExercises; i++) {
      let exercise: Exercise;
      const isAddition = exerciseType === 'addition' || 
        (exerciseType === 'mixed' && Math.random() > 0.5);
      
      if (isAddition) {
        // 生成加法题
        const a = getRandomNumber(1, maxNumber - 1);
        const b = getRandomNumber(1, maxNumber - a);
        const result = a + b;
        
        exercise = {
          id: i + 1,
          type: 'addition',
          operands: [a, b],
          result,
          visualData: {
            totalItems: result,
            leftItems: a,
            rightItems: b
          }
        };
      } else {
        // 生成减法题
        const total = getRandomNumber(2, maxNumber);
        const remove = getRandomNumber(1, total - 1);
        const result = total - remove;
        
        exercise = {
          id: i + 1,
          type: 'subtraction',
          operands: [total, remove],
          result,
          visualData: {
            totalItems: total,
            removedItems: remove
          }
        };
      }
      
      newExercises.push(exercise);
    }
    
    setExercises(newExercises);
  };

  // 处理练习类型变化
  const handleExerciseTypeChange = (event: SelectChangeEvent) => {
    setExerciseType(event.target.value as ExerciseType);
  };

  // 处理主题变化
  const handleThemeTypeChange = (event: SelectChangeEvent) => {
    setThemeType(event.target.value as ThemeType);
  };

  // 处理题目数量变化
  const handleNumExercisesChange = (event: Event, newValue: number | number[]) => {
    setNumExercises(newValue as number);
  };

  // 处理最大数字变化
  const handleMaxNumberChange = (event: Event, newValue: number | number[]) => {
    setMaxNumber(newValue as number);
  };

  // 处理每行题目数变化
  const handleExercisesPerRowChange = (event: Event, newValue: number | number[]) => {
    setExercisesPerRow(newValue as number);
  };

  // 打印练习题
  const handlePrint = () => {
    window.print();
  };

  // 下载练习题
  const handleDownload = () => {
    const element = printRef.current;
    if (!element) return;
    
    const originalContents = document.body.innerHTML;
    const printContents = element.innerHTML;
    
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  // 渲染图形化表示
  const renderVisual = (exercise: Exercise) => {
    const { type, visualData } = exercise;
    const { totalItems, leftItems, rightItems, removedItems } = visualData;
    
    // 根据主题选择颜色
    const getColor = (index: number) => {
      const colors: Record<ThemeType, string[]> = {
        monsters: ['#FF9800', '#F44336', '#9C27B0', '#2196F3', '#4CAF50'],
        fruits: ['#FFD700', '#FF5722', '#E91E63', '#8BC34A', '#9C27B0'],
        vegetables: ['#8BC34A', '#FF9800', '#795548', '#4CAF50', '#FFC107'],
        mixed: ['#FF9800', '#F44336', '#9C27B0', '#2196F3', '#4CAF50', '#8BC34A']
      };
      
      return colors[themeType][index % colors[themeType].length];
    };
    
    // 根据主题选择形状
    const renderShape = (color: string, key: number, isRemoved: boolean = false) => {
      const size = 28;
      const shapes = ['circle', 'square', 'triangle'];
      const shapeType = shapes[key % shapes.length];
      
      const shapeStyle: React.CSSProperties = {
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: shapeType === 'circle' ? '50%' : shapeType === 'triangle' ? '0' : '4px',
        margin: '2px',
        display: 'inline-block',
        position: 'relative' as const,
        border: '1px solid rgba(0,0,0,0.1)'
      };
      
      if (shapeType === 'triangle') {
        shapeStyle.backgroundColor = 'transparent';
        shapeStyle.width = 0;
        shapeStyle.height = 0;
        shapeStyle.borderLeft = `${size/2}px solid transparent`;
        shapeStyle.borderRight = `${size/2}px solid transparent`;
        shapeStyle.borderBottom = `${size}px solid ${color}`;
      }
      
      if (isRemoved) {
        return (
          <div key={key} style={{ display: 'inline-block', position: 'relative' }}>
            <div style={shapeStyle} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: '#f44336',
              transform: 'rotate(-45deg)',
              transformOrigin: 'center',
            }} />
          </div>
        );
      }
      
      return <div key={key} style={shapeStyle} />;
    };
    
    if (type === 'addition') {
      return (
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* 左边组 */}
            <div style={{ marginRight: '10px' }}>
              {Array.from({ length: leftItems || 0 }).map((_, i) => 
                renderShape(getColor(i), i)
              )}
            </div>
            
            {/* 加号 */}
            <div style={{ 
              margin: '0 10px', 
              fontSize: '20px', 
              fontWeight: 'bold',
              color: '#333'
            }}>+</div>
            
            {/* 右边组 */}
            <div style={{ marginLeft: '10px' }}>
              {Array.from({ length: rightItems || 0 }).map((_, i) => 
                renderShape(getColor(i + (leftItems || 0)), i + (leftItems || 0))
              )}
            </div>
          </div>
        </div>
      );
    } else {
      // 减法
      return (
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {Array.from({ length: totalItems }).map((_, i) => 
              renderShape(getColor(i), i, i < (removedItems || 0))
            )}
          </div>
        </div>
      );
    }
  };

  // 渲染单个练习题
  const renderExercise = (exercise: Exercise) => {
    const { id, type, operands, result } = exercise;
    
    return (
      <div key={id} style={{ 
        padding: '16px', 
        marginBottom: '20px',
        border: '1px dashed #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
        minWidth: '200px',
        flex: '1 0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          minHeight: '140px'
        }}>
          {/* 图形表示 */}
          {renderVisual(exercise)}
          
          {/* 算式 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '12px',
            fontSize: '20px',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
          }}>
            {type === 'addition' ? (
              <>
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  border: '1px solid #999',
                  margin: '0 5px',
                  textAlign: 'center',
                  lineHeight: '30px',
                  backgroundColor: '#fff'
                }}>{showAnswers ? operands[0] : ''}</div>
                <span style={{ margin: '0 5px' }}>+</span>
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  border: '1px solid #999',
                  margin: '0 5px',
                  textAlign: 'center',
                  lineHeight: '30px',
                  backgroundColor: '#fff'
                }}>{showAnswers ? operands[1] : ''}</div>
                <span style={{ margin: '0 5px' }}>=</span>
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  border: '1px solid #999',
                  margin: '0 5px',
                  textAlign: 'center',
                  lineHeight: '30px',
                  backgroundColor: '#fff'
                }}>{showAnswers ? result : ''}</div>
              </>
            ) : (
              <>
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  border: '1px solid #999',
                  margin: '0 5px',
                  textAlign: 'center',
                  lineHeight: '30px',
                  backgroundColor: '#fff'
                }}>{showAnswers ? operands[0] : ''}</div>
                <span style={{ margin: '0 5px' }}>-</span>
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  border: '1px solid #999',
                  margin: '0 5px',
                  textAlign: 'center',
                  lineHeight: '30px',
                  backgroundColor: '#fff'
                }}>{showAnswers ? operands[1] : ''}</div>
                <span style={{ margin: '0 5px' }}>=</span>
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  border: '1px solid #999',
                  margin: '0 5px',
                  textAlign: 'center',
                  lineHeight: '30px',
                  backgroundColor: '#fff'
                }}>{showAnswers ? result : ''}</div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderExerciseGrid = () => {
    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${exercisesPerRow}, 1fr)`,
      gap: '20px',
      marginTop: '20px'
    };
    
    return (
      <div style={gridStyle}>
        {exercises.map(exercise => renderExercise(exercise))}
      </div>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ color: 'primary.main', mb: 3 }}>
            <AddIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            加减法列算式练习题生成器
            <RemoveIcon sx={{ verticalAlign: 'middle', ml: 1 }} />
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          {/* 控制面板 */}
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <FormatListNumberedIcon sx={{ mr: 1 }} />
            练习题设置
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>练习题类型</InputLabel>
                <Select
                  value={exerciseType}
                  label="练习题类型"
                  onChange={handleExerciseTypeChange}
                >
                  <MenuItem value="addition">加法篇</MenuItem>
                  <MenuItem value="subtraction">减法篇</MenuItem>
                  <MenuItem value="mixed">加减混合篇</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>图形主题</InputLabel>
                <Select
                  value={themeType}
                  label="图形主题"
                  onChange={handleThemeTypeChange}
                >
                  <MenuItem value="monsters">小怪兽主题</MenuItem>
                  <MenuItem value="fruits">水果主题</MenuItem>
                  <MenuItem value="vegetables">蔬菜主题</MenuItem>
                  <MenuItem value="mixed">混合主题</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography gutterBottom>题目数量: {numExercises}</Typography>
              <Slider
                value={numExercises}
                onChange={handleNumExercisesChange}
                step={1}
                marks
                min={4}
                max={24}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography gutterBottom>数字范围: 1 - {maxNumber}</Typography>
              <Slider
                value={maxNumber}
                onChange={handleMaxNumberChange}
                step={1}
                marks
                min={5}
                max={10}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography gutterBottom>每行题目数: {exercisesPerRow}</Typography>
              <Slider
                value={exercisesPerRow}
                onChange={handleExercisesPerRowChange}
                step={1}
                marks
                min={2}
                max={4}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showAnswers}
                      onChange={(e) => setShowAnswers(e.target.checked)}
                    />
                  }
                  label="显示答案"
                  sx={{ mr: 2 }}
                />
                
                <TextField
                  label="练习标题"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={generateExercises}
              sx={{ flexGrow: 1, md: { flexGrow: 0 } }}
            >
              重新生成练习题
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ShuffleIcon />}
              onClick={() => {
                setExerciseType('mixed');
                setThemeType('mixed');
                setMaxNumber(5);
                generateExercises();
              }}
              sx={{ flexGrow: 1, md: { flexGrow: 0 } }}
            >
              恢复默认设置
            </Button>
            
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ flexGrow: 1, md: { flexGrow: 0 } }}
            >
              打印练习题
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ flexGrow: 1, md: { flexGrow: 0 } }}
            >
              下载PDF
            </Button>
          </Box>
        </Paper>
        
        {/* 练习题预览区域 */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            backgroundColor: '#fff',
            '@media print': {
              boxShadow: 'none',
              padding: 0
            }
          }}
        >
          <div ref={printRef}>
            {/* 打印时的样式 */}
            <style>
              {`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #printable-exercises, #printable-exercises * {
                    visibility: visible;
                  }
                  #printable-exercises {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                }
              `}
            </style>
            
            <div id="printable-exercises">
              {/* 标题区域 */}
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '30px',
                borderBottom: '2px solid #4a6fa5',
                paddingBottom: '15px'
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  color: '#2c3e50',
                  mb: 1
                }}>
                  {title}
                </Typography>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  maxWidth: '400px',
                  margin: '0 auto',
                  fontSize: '18px',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  <div>{className}</div>
                  <div>{studentName}</div>
                </div>
              </div>
              
              {/* 练习题网格 */}
              {renderExerciseGrid()}
              
              {/* 页脚 */}
              <div style={{ 
                marginTop: '40px',
                textAlign: 'center',
                color: '#666',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                borderTop: '1px dashed #ccc',
                paddingTop: '15px'
              }}>
                幼小衔接数学练习题 • 生成时间: {new Date().toLocaleDateString()} • 第 1 页
              </div>
            </div>
          </div>
          
          {/* 非打印时的操作按钮 */}
          <Box sx={{ 
            display: 'none',
            '@media print': {
              display: 'none'
            },
            mt: 4,
            pt: 3,
            borderTop: '1px solid #eee',
            textAlign: 'center'
          }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              提示：打印前请确保打印机已连接，并检查打印预览中的布局。
            </Alert>
            
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ mr: 2 }}
            >
              立即打印
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              保存为PDF
            </Button>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};