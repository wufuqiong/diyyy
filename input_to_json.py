import json
import re
from typing import List, Dict, Optional, Tuple

def clean_text(text: str) -> str:
    """
    清洗文本，处理非常规字符
    """
    # 替换各种空白字符为普通空格
    replacements = {
        '\u3000': ' ',  # 全角空格
        '\u00A0': ' ',  # 不间断空格
        '\u200B': ' ',  # 零宽空格
        '\u2002': ' ',  # EN空格
        '\u2003': ' ',  # EM空格
        '\u2009': ' ',  # 窄空格
        '\t': ' ',      # 制表符
        '\n': '\n',     # 保留换行符
        '\r': '',       # 删除回车符
        '\f': ' ',      # 换页符替换为空格
        '\v': ' ',      # 垂直制表符替换为空格
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # 将连续的多个空格合并为一个空格
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        # 去除行首行尾空白
        line = line.strip()
        if line:
            # 合并连续空格
            line = re.sub(r'\s+', ' ', line)
            cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

def is_lesson_title(line: str) -> bool:
    """
    判断是否是课程标题
    """
    # 匹配格式如：第一课、第二十三课、综合练习
    patterns = [
        r'^第[零一二三四五六七八九十百千]+课$',
        r'^第\d+课$',
        r'^综合练习$'
    ]
    for pattern in patterns:
        if re.match(pattern, line.strip()):
            return True
    return False

def extract_words(line: str) -> List[str]:
    """
    从一行中提取单个汉字单词
    """
    # 分割空白字符
    parts = re.split(r'\s+', line.strip())
    words = []
    for part in parts:
        if not part:
            continue
        # 去除括号和注音，如"诉（su）" -> "诉"
        part = re.sub(r'\([^)]*\)', '', part)
        # 检查是否是单个汉字
        if len(part) == 1 and '\u4e00' <= part <= '\u9fff':
            words.append(part)
    return words

def is_word_line(line: str) -> bool:
    """
    判断一行是否是单词行
    """
    if not line.strip():
        return False
    
    # 检查是否包含"读词语："、"读句子："等标记
    if '读词语：' in line or '读句子：' in line:
        return False
    
    # 按空白字符分割
    parts = re.split(r'\s+', line.strip())
    parts = [p for p in parts if p]
    
    if not parts:
        return False
    
    # 统计汉字数量
    hanzi_count = 0
    for part in parts:
        # 去除注音
        clean_part = re.sub(r'\([^)]*\)', '', part)
        if clean_part and len(clean_part) == 1 and '\u4e00' <= clean_part <= '\u9fff':
            hanzi_count += 1
    
    # 如果大部分是单个汉字，则认为是单词行
    return hanzi_count >= len(parts) * 0.8  # 80%以上是单个汉字

def is_phrase_line(line: str) -> bool:
    """
    判断一行是否是短语行
    """
    if not line.strip():
        return False
    
    # 排除标记行
    if '读词语：' in line or '读句子：' in line:
        return False
    
    # 排除句子行（包含句号、感叹号、问号、冒号、分号、引号）
    sentence_indicators = ['。', '！', '？', '：', '；', '，', '、', '".*?"', '\'.*?\'']
    for indicator in sentence_indicators:
        if indicator in line:
            return False
    
    # 排除单词行
    if is_word_line(line):
        return False
    
    # 排除包含数字和标点的行
    if re.search(r'[0-9]', line):
        return False
    
    return True

def extract_phrases(line: str) -> List[str]:
    """
    从一行中提取短语
    """
    # 按空白字符分割
    parts = re.split(r'\s+', line.strip())
    # 过滤空字符串和非汉字内容
    phrases = []
    for part in parts:
        if part and not re.match(r'^[0-9]+$', part):  # 排除纯数字
            # 检查是否包含汉字
            if re.search(r'[\u4e00-\u9fff]', part):
                phrases.append(part)
    return phrases

def parse_lesson_block(block_text: str) -> Optional[Dict]:
    """
    解析单个课程块的函数
    """
    lines = block_text.strip().split('\n')
    
    if not lines or not lines[0]:
        return None
    
    # 第一行是标题
    title = lines[0].strip()
    
    word_list = []
    phrase_list = []
    sentence_list = []
    
    i = 1
    # 跳过标题行后的空行
    while i < len(lines) and not lines[i].strip():
        i += 1
    
    # 阶段1: 处理单词行
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
            
        # 检查是否是下一个课程的标题
        if is_lesson_title(line):
            break
            
        # 检查是否是标记行
        if '读词语：' in line or '读句子：' in line:
            i += 1
            continue
            
        if is_word_line(line):
            words = extract_words(line)
            if words:
                word_list.extend(words)
            i += 1
        else:
            break  # 不是单词行，进入下一阶段
    
    # 阶段2: 处理短语行
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
            
        # 检查是否是下一个课程的标题
        if is_lesson_title(line):
            break
            
        # 检查是否是标记行
        if '读句子：' in line:
            i += 1
            break  # 进入句子阶段
            
        if '读词语：' in line:
            i += 1
            continue
            
        if is_phrase_line(line):
            phrases = extract_phrases(line)
            if phrases:
                phrase_list.extend(phrases)
            i += 1
        else:
            break  # 不是短语行，进入下一阶段
    
    # 阶段3: 处理句子
    current_sentence = []
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
            
        # 检查是否是下一个课程的标题
        if is_lesson_title(line):
            # 处理当前的句子缓冲
            if current_sentence:
                sentence_text = ''.join(current_sentence)
                sentences = split_sentences(sentence_text)
                sentence_list.extend(sentences)
                current_sentence = []
            break
            
        # 跳过标记行
        if '读词语：' in line or '读句子：' in line:
            i += 1
            continue
            
        # 添加到句子缓冲
        current_sentence.append(line)
        i += 1
    
    # 处理最后的句子缓冲
    if current_sentence:
        sentence_text = ''.join(current_sentence)
        sentences = split_sentences(sentence_text)
        sentence_list.extend(sentences)
    
    return {
        "title": title,
        "word": word_list,
        "phrase": phrase_list,
        "sentence": sentence_list
    }

def split_sentences(text: str) -> List[str]:
    """
    将文本分割成句子
    """
    if not text:
        return []
    
    # 使用正则表达式分割句子，保留标点
    # 匹配以句号、感叹号、问号结尾的部分
    sentence_pattern = r'[^。！？]*[。！？]'
    sentences = re.findall(sentence_pattern, text)
    
    # 过滤空句子
    sentences = [s.strip() for s in sentences if s.strip()]
    
    return sentences

def parse_input_to_json(input_text: str) -> List[Dict]:
    """
    主解析函数，处理多课内容
    """
    # 清洗文本
    cleaned_text = clean_text(input_text)
    
    # 分割课程块
    # 使用正则表达式匹配课程标题
    pattern = r'(第[零一二三四五六七八九十百千\d]+课|综合练习)'
    
    # 在每个课程标题前添加一个特殊分隔符
    parts = re.split(pattern, cleaned_text)
    
    # 重新组合课程块
    lesson_blocks = []
    for i in range(1, len(parts), 2):
        if i + 1 < len(parts):
            block_title = parts[i]
            block_content = parts[i + 1]
            # 将标题和内容合并为一个课程块
            lesson_block = f"{block_title}\n{block_content}"
            lesson_blocks.append(lesson_block)
    
    # 如果没有找到课程标题，按空行分割
    if not lesson_blocks:
        # 用多个连续换行符分割
        lesson_blocks = re.split(r'\n\s*\n\s*\n', cleaned_text)
        lesson_blocks = [block.strip() for block in lesson_blocks if block.strip()]
    
    # 解析每个课程块
    lessons = []
    for block in lesson_blocks:
        lesson = parse_lesson_block(block)
        if lesson and (lesson['word'] or lesson['phrase'] or lesson['sentence']):
            lessons.append(lesson)
    
    return lessons

def save_lessons_to_json(lessons: List[Dict], output_file: str = 'lessons.json'):
    """
    将解析结果保存为JSON文件
    """
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(lessons, f, ensure_ascii=False, indent=2)
    
    print(f"已保存到 {output_file}")
    return lessons

# 测试代码
if __name__ == "__main__":
    # 示例输入（使用您提供的部分内容进行测试）
    test_input = """第六课

草　  叶     日    　风   　雨
的　  孩　   六
 
聪明　明亮　明天　明月　眉头　鼻头　石头　　木头　心头　小手　小花　大树　小树　树木　　五月　五天　手心　我有小手。
 
头上有眉、目、耳、鼻和口。 
眉下有目，鼻下有口。 
树上有花和叶。"""

    # 解析测试输入
    test_result = parse_lesson_block(test_input)
    print("测试结果：")
    print(json.dumps(test_result, ensure_ascii=False, indent=2))
    
    # 完整的解析
    with open('input.txt', 'r', encoding='utf-8') as f:
        full_input = f.read()
    
    lessons = parse_input_to_json(full_input)
    
    # 保存到文件
    save_lessons_to_json(lessons, 'lessons_output.json')
    
    # 打印前几课检查
    print("\n前5课结果：")
    for i, lesson in enumerate(lessons[:5]):
        print(f"\n{i+1}. {lesson['title']}")
        print(f"   单词: {lesson['word']}")
        print(f"   短语: {lesson['phrase'][:5]}...")  # 只显示前5个短语
        print(f"   句子: {lesson['sentence'][:2]}...")  # 只显示前2个句子