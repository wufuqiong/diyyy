import React from 'react';
import './App.css';
import miemie from './miemie.json';


const SAMPLE_CHARACTERS = ['大', '小'];
const SAMPLE_COLORS = ['#FFA500', '#FFFF00'];
const MAX_LENGTH = 5;
const DISPLAY_LENGTH = 7;
class CNColor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            characters: SAMPLE_CHARACTERS,
            colors: SAMPLE_COLORS,
        };
    }

    handleCharacterChange = (index, value) => {
        this.setState(prevState => {
            const newCharacters = [...prevState.characters];
            newCharacters[index] = value;
            return { characters: newCharacters };
        });
    };

    handleColorChange = (index, value) => {
        this.setState(prevState => {
            const newColors = [...prevState.colors];
            newColors[index] = value;
            return { colors: newColors };
        });
    };

    addCharacter = () => {
        this.setState(prevState => {
            if (prevState.characters.length >= MAX_LENGTH) return null;
            return {
                characters: [...prevState.characters, ''],
                colors: [...prevState.colors, '#000000']
            };
        });
    };

    removeCharacter = (index) => {
        this.setState(prevState => {
            if (prevState.characters.length <= 1) return null;
            const newCharacters = [...prevState.characters];
            const newColors = [...prevState.colors];
            newCharacters.splice(index, 1);
            newColors.splice(index, 1);
            return {
                characters: newCharacters,
                colors: newColors
            };
        });
    };

    render() {
        const { characters, colors } = this.state;

        return (
            <div className="app">
                <div className="container">
                    <h1>涂色练习生成器</h1>
                    
                    <div className="content-wrapper">
                        <div className="form-section">
                            <div className="form-group">
                                <label>输入字符和对应颜色</label>
                                <div className="input-container">
                                    {characters.map((char, index) => (
                                        <div key={index} className="input-row">
                                            <input
                                                type="text"
                                                value={char}
                                                onChange={(e) => this.handleCharacterChange(index, e.target.value)}
                                                placeholder="输入字符"
                                                maxLength={1}
                                            />
                                            <input
                                                type="color"
                                                value={colors[index]}
                                                onChange={(e) => this.handleColorChange(index, e.target.value)}
                                            />
                                            {characters.length > 1 && (
                                                <button 
                                                    className="remove-btn"
                                                    onClick={() => this.removeCharacter(index)}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="form-buttons">
                                    {characters.length < 5 && (
                                        <button className="add-btn" onClick={this.addCharacter}>
                                            + 添加字符
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="preview-section">
                            <PreviewSheet 
                                characters={characters} 
                                colors={colors} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


const generatePatterns = (characters) => {
    const chars = [...characters];
    let additionalChars = [];
    let result = [];

    for (let i = 0; i < chars.length; i++) {
        const similarChars = miemie["1级"]
        additionalChars = additionalChars.concat(similarChars);
    }

    shuffleArray(additionalChars);

    for (let i = 0; i < 7; i++) {
        const randomAdditional = additionalChars.slice(0, DISPLAY_LENGTH - chars.length);
        let line = [...chars, ...randomAdditional];
        shuffleArray(line);
        result.push(line);
    }
    
    return result;
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class PreviewSheet extends React.Component {
    render() {
        const { characters, colors } = this.props;
        const patterns = generatePatterns(characters);
        const totalCircles = 49;
        
        return (
            <div className="preview-container">
                <div className="print-content">
                    <div className="preview-title">找一找 涂色</div>
                    
                    <div className="reference-section">
                        {characters.map((char, index) => (
                            <div key={index} className="reference-item">
                                <div 
                                    className="reference-color" 
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
                
                <div className="action-buttons">
                    <button className="print-btn" onClick={() => window.print()}>
                        打印
                    </button>
                </div>
            </div>
        );
    }
}

export default CNColor;