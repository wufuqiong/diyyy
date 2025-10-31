import React from 'react';
import './App.css';
import miemie from './miemie.json';

const MAX_INPUT_LENGTH = 300;
const SAMPLE_DICT = "人教版小学语文一年级上册";
// 修改颜色预设，确保每个色系内的5种颜色有足够区分度
const COLOR_PRESETS = [
  {
    name: '经典组合',
    colors: ['#FF6B6B', '#f5b63aff', '#45B7D1', '#51db8dff', '#F7DC6F'] // 红、橙、蓝、绿、黄
  },
  {
    name: '柔和组合',
    colors: ['#FF9999', '#66CCCC', '#9999FF', '#FFCC99', '#CC99FF'] // 浅红、浅青、浅蓝、浅橙、浅紫
  },
  {
    name: '鲜艳组合',
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'] // 红、绿、蓝、黄、紫
  },
  {
    name: '自然组合',
    colors: ['#8B4513', '#228B22', '#1E90FF', '#FFD700', '#FF6347'] // 棕、绿、蓝、金、橙红
  }
];


class CNColor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userInput: '',
            wordsPerPage: 3,
            selectedPreset: 0,
            selectedLevel: '',
            pages: [],
        };
    }

    handleUserInputChange = (e) => {
        const input = e.target.value;
        if (input.length <= MAX_INPUT_LENGTH) {
            this.setState({ userInput: input });
        }
    };

    handleWordsPerPageChange = (e) => {
        this.setState({ wordsPerPage: parseInt(e.target.value) });
    };

    handleColorPresetChange = (e) => {
        const presetIndex = parseInt(e.target.value);
        this.setState({ selectedPreset: presetIndex });
    };

    handleLevelChange = (e) => {
        const level = e.target.value;
        this.setState({ selectedLevel: level });
        
        if (level && miemie[level]) {
            const chineseChars = miemie[level].join('');
            this.setState({ userInput: chineseChars });
        }
    };

    handleClearInput = () => {
        this.setState({ 
            userInput: '',
            selectedLevel: '',
            pages: [],
        });
    };

    filterChineseCharacters = (text) => {
        return text.replace(/[^\u4e00-\u9fff]/g, '');
    };

    // 随机打乱数组
    shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // 为每页生成随机颜色序列（使用5种颜色，但只使用其中2-5种）
    generateRandomColorsForPage = (pageChars, presetIndex) => {
        const presetColors = COLOR_PRESETS[presetIndex].colors;
        
        // 确定这页使用几种颜色（与字符数相同，最多5种）
        const numColors = Math.min(pageChars.length, 5);
        
        // 从5种颜色中随机选择几种，并打乱顺序
        const shuffledColors = this.shuffleArray(presetColors).slice(0, numColors);
        
        // 为每个字符分配一个颜色，循环使用选中的颜色
        return pageChars.map((char, index) => {
            return shuffledColors[index % shuffledColors.length];
        });
    };

    generatePages = () => {
        let { userInput, wordsPerPage, selectedPreset } = this.state;
        
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
            
            const pages = [];
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
                        
                        {/* 色系预览 */}
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
                                <p>请输入文字并点击"生成练习页"来预览</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 生成练习网格模式
const generatePatterns = (characters) => {
    if (characters.length === 0) return [];
    
    const chars = [...characters];
    let additionalChars = [];
    let result = [];

    // 为当前页的字符寻找相似字符
    for (let i = 0; i < chars.length; i++) {
        const similarChars = miemie[SAMPLE_DICT] || [];
        additionalChars = additionalChars.concat(similarChars);
    }

    // 随机打乱数组函数

    shuffleArray(additionalChars);

    // 生成7行内容
    for (let i = 0; i < 7; i++) {
        shuffleArray(additionalChars);
        const randomAdditional = additionalChars.slice(0, 7 - chars.length);
        let line = [...chars, ...randomAdditional];
        shuffleArray(line);
        result.push(line);
    }
    
    return result;
};

class PreviewSheet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0, // 当前显示的页面索引
        };
    }

    // 切换到上一页
    goToPreviousPage = () => {
        this.setState(prevState => ({
            currentPage: Math.max(0, prevState.currentPage - 1)
        }));
    };

    // 切换到下一页
    goToNextPage = () => {
        const { pages } = this.props;
        this.setState(prevState => ({
            currentPage: Math.min(pages.length - 1, prevState.currentPage + 1)
        }));
    };

    // 跳转到指定页面
    goToPage = (pageIndex) => {
        this.setState({
            currentPage: pageIndex
        });
    };

    // 生成分页指示器数组，实现中间数字隐藏效果
    generatePageIndicators = () => {
        const { pages } = this.props;
        const { currentPage } = this.state;
        const totalPages = pages.length;
        
        if (totalPages <= 7) {
            // 如果总页数少于等于7页，显示所有页码
            return Array.from({ length: totalPages }, (_, i) => i);
        }
        
        const indicators = [];
        const showEllipsis = totalPages > 7;
        
        // 总是显示第一页
        indicators.push(0);
        
        if (currentPage <= 3) {
            // 当前页在前4页内
            for (let i = 1; i <= 4; i++) {
                indicators.push(i);
            }
            indicators.push('ellipsis');
            // 显示最后2页
            indicators.push(totalPages - 2);
            indicators.push(totalPages - 1);
        } else if (currentPage >= totalPages - 4) {
            // 当前页在最后4页内
            indicators.push('ellipsis');
            for (let i = totalPages - 5; i < totalPages; i++) {
                if (i > 0) indicators.push(i);
            }
        } else {
            // 当前页在中间
            indicators.push('ellipsis');
            // 显示当前页前后各2页
            for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                indicators.push(i);
            }
            indicators.push('ellipsis');
            // 显示最后一页
            indicators.push(totalPages - 1);
        }
        
        return indicators;
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
                {/* 屏幕预览 - 只显示当前页 */}
                <div className="screen-preview">
                    {/* 分页控件 */}
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
                    
                    {/* 当前页面内容 */}
                    <div className="screen-page">
                        {this.renderPage(pages[currentPage], currentPage, pages.length)}
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="action-buttons">
                        <button className="print-btn" onClick={() => window.print()}>
                            打印所有页面
                        </button>
                    </div>
                </div>
                
                {/* 打印视图 - 显示所有页面 */}
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

    // 提取页面渲染逻辑到单独的方法
    renderPage = (pageData, pageNumber, totalPages) => {
        const { characters, colors } = pageData;
        const patterns = generatePatterns(characters);
        const totalCircles = 49;
        
        return (
            <div className="print-content">
                <div className="preview-title">找一找 涂色</div>
                
                <div className="reference-section">
                    {characters.map((char, index) => (
                        <div key={index} className="reference-item">
                            <div 
                                className="reference-circle" 
                                style={{ backgroundColor: colors[index] }}
                            ></div>
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
}
export default CNColor;