import 'src/css/CNMaze.css';

import React, { Component, createRef } from 'react';

interface MazeConfig {
  rows: number;
  cols: number;
  title: string;
  author: string;
}

interface CNMazeState {
  sentence: string;
  mazeConfig: MazeConfig;
  mazeData: string[][];
}

export class CNMazeView extends Component<{}, CNMazeState> {
  private mazeRef = createRef<HTMLDivElement>();

  constructor(props: {}) {
    super(props);
    this.state = {
      sentence: '我分得清昨天今天和明天',
      mazeConfig: {
        rows: 8,
        cols: 10,
        title: '汉字迷宫',
        author: '超爸带娃'
      },
      mazeData: []
    };
  }

  // 常用汉字库
  private commonCharacters = '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小实现量制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严';

  // 修复箭头函数写法
  private getRandomCharacter = (): string => 
    this.commonCharacters[Math.floor(Math.random() * this.commonCharacters.length)];

  private generateMaze = (): void => {
    const { sentence, mazeConfig } = this.state;

    if (!sentence.trim()) {
      alert('请输入句子');
      return;
    }

    const chars = sentence.replace(/[^\u4e00-\u9fa5]/g, '').split('');
    if (chars.length === 0) {
      alert('请输入有效的中文字符');
      return;
    }

    const totalCells = mazeConfig.rows * mazeConfig.cols;
    if (chars.length > totalCells) {
      alert(`句子过长，最多支持 ${totalCells} 个汉字`);
      return;
    }

    const maze: string[][] = [];
    let charIndex = 0;

    // 填充迷宫
    for (let i = 0; i < mazeConfig.rows; i++) {
      const row: string[] = [];
      for (let j = 0; j < mazeConfig.cols; j++) {
        if (charIndex < chars.length) {
          row.push(chars[charIndex]);
          charIndex++;
        } else {
          row.push(this.getRandomCharacter());
        }
      }
      maze.push(row);
    }

    this.setState({ mazeData: maze });
  };

  private handlePrint = (): void => {
    if (this.mazeRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>汉字迷宫</title>
              <style>
                body { 
                  font-family: 'SimSun', serif; 
                  margin: 20px;
                  text-align: center;
                  background-color: #f5f5dc;
                }
                .maze-container { 
                  max-width: 800px; 
                  margin: 0 auto;
                  background: white;
                  padding: 20px;
                  border: 2px solid #8B4513;
                  box-shadow: 3px 3px 10px rgba(0,0,0,0.2);
                }
                .header { 
                  margin-bottom: 20px; 
                  position: relative;
                }
                .lesson-info {
                  font-size: 14px;
                  margin-bottom: 5px;
                }
                .maze-title { 
                  font-size: 24px; 
                  font-weight: bold; 
                  margin: 10px 0;
                  color: #8B0000;
                }
                .instruction { 
                  margin: 15px 0; 
                  font-size: 16px; 
                }
                .target-sentence {
                  font-size: 18px;
                  font-weight: bold;
                  margin: 15px 0;
                  padding: 10px;
                  border: 2px dashed #8B0000;
                  background-color: #FFFACD;
                }
                .maze-grid { 
                  display: grid; 
                  gap: 8px; 
                  justify-content: center;
                  margin: 20px 0;
                }
                .maze-row {
                  display: flex;
                  gap: 8px;
                }
                .character-cell { 
                  width: 50px; 
                  height: 50px; 
                  border: 2px solid #000;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 18px;
                  font-weight: bold;
                  position: relative;
                }
                .start-cell::before {
                  content: "🐱";
                  position: absolute;
                  top: -5px;
                  left: -5px;
                  font-size: 12px;
                }
                .end-cell::after {
                  content: "🏁";
                  position: absolute;
                  bottom: -5px;
                  right: -5px;
                  font-size: 12px;
                }
                .footer { 
                  margin-top: 30px; 
                  display: flex;
                  justify-content: space-between;
                  font-size: 14px;
                }
                @media print {
                  body { 
                    margin: 0;
                    background-color: white;
                  }
                  .no-print { display: none; }
                  .maze-container {
                    box-shadow: none;
                    border: 1px solid #000;
                  }
                }
              </style>
            </head>
            <body>
              ${this.mazeRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ sentence: event.target.value });
  };

  private handleRowsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState(prevState => ({
      mazeConfig: {
        ...prevState.mazeConfig,
        rows: parseInt(event.target.value) || 8
      }
    }));
  };

  private handleColsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState(prevState => ({
      mazeConfig: {
        ...prevState.mazeConfig,
        cols: parseInt(event.target.value) || 10
      }
    }));
  };

  render() {
    const { sentence, mazeConfig, mazeData } = this.state;

    return (
      <div className="cnmaze-container">        
        <div className="control-panel">
          <div className="input-group">
            <label>输入句子：</label>
            <input
              type="text"
              value={sentence}
              onChange={this.handleInputChange}
              placeholder="请输入要生成迷宫的中文句子"
            />
          </div>

          <div className="config-group">
            <div className="config-item">
              <label>行数：</label>
              <input
                type="number"
                value={mazeConfig.rows}
                onChange={this.handleRowsChange}
                min="4"
                max="15"
              />
            </div>
            <div className="config-item">
              <label>列数：</label>
              <input
                type="number"
                value={mazeConfig.cols}
                onChange={this.handleColsChange}
                min="4"
                max="15"
              />
            </div>
          </div>

          <div className="button-group">
            <button className="generate-btn" onClick={this.generateMaze}>
              生成迷宫
            </button>
            
            {mazeData.length > 0 && (
              <button className="print-btn" onClick={this.handlePrint}>
                打印迷宫
              </button>
            )}
          </div>
        </div>

        {mazeData.length > 0 && (
          <div ref={this.mazeRef} className="maze-preview">
            <div className="maze-header">
              <div className="maze-title">{mazeConfig.title}</div>
              <div className="instruction">
                请从开始至结束，找出以下句子，并涂上颜色。
              </div>
              <div className="target-sentence">
                {sentence}
              </div>
            </div>

            <div 
              className="maze-grid"
              style={{
                gridTemplateColumns: `repeat(${mazeConfig.cols}, 50px)`
              }}
            >
              {mazeData.map((row, rowIndex) =>
                row.map((char, colIndex) => (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    className={`character-cell ${
                      rowIndex === 0 && colIndex === 0 ? 'start-cell' : ''
                    } ${
                      rowIndex === mazeConfig.rows - 1 && colIndex === mazeConfig.cols - 1 ? 'end-cell' : ''
                    }`}
                  >
                    {char}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}