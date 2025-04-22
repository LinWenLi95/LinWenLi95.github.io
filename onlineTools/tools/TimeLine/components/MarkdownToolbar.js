// MarkdownToolbar.js
// Markdown工具栏组件

(function() {
    // 添加工具栏样式，仅保留按钮样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
    .divBody {
        overflow-x: auto; /* 修改为auto允许滚动 */
        width: 100%; /* 确保占满父容器宽度 */
        position: relative; /* 添加相对定位 */
        user-select: none; /* 防止文本选择干扰拖动 */
        -ms-overflow-style: none; /* 隐藏IE/Edge的滚动条 */
        scrollbar-width: none; /* 隐藏Firefox的滚动条 */
        -webkit-overflow-scrolling: touch; /* 启用弹性滚动 */
    }
    .markdown-toolbar {
        display: flex;
        flex-wrap: nowrap; /* 不换行 */
        white-space: nowrap; /* 防止内容换行 */
        width: max-content; /* 根据内容自动调整宽度，不再固定为1100px */
        min-width: 100%; /* 至少占满父容器宽度 */
        user-select: none;
    }
    .markdown-toolbar button {
        padding: 4px 8px;
        background-color: #f9f9f9;
        border: 1px solid #eaeaea;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
        color: #606266;
        margin: 0 2px;
        opacity: 0.85;
        transition: all 0.2s;
        height: 28px; /* 设置固定高度 */
        min-width: 40px; /* 确保按钮有最小宽度 */
        white-space: nowrap; /* 防止文字换行 */
        flex-shrink: 0; /* 防止按钮被压缩 */
    }
    
    .markdown-toolbar button:hover {
        background-color: #f0f0f0;
        opacity: 1;
    }
    `;
    document.head.appendChild(styleElement);
    
    // 注册Markdown工具栏组件
    Vue.component('markdown-toolbar', {
        props: {
            // 编辑器内容
            content: {
                type: String,
                default: ''
            }
        },
        template: `
            <div class="divBody" ref="toolbarContainer">
                <div class="markdown-toolbar">
                    <button @click.stop="insertMarkdown('一级标题', '# 标题文本')">H1</button>
                    <button @click.stop="insertMarkdown('二级标题', '## 标题文本')">H2</button>
                    <button @click.stop="insertMarkdown('三级标题', '### 标题文本')">H3</button>
                    <button @click.stop="insertMarkdown('四级标题', '#### 标题文本')">H4</button>
                    <button @click.stop="insertMarkdown('五级标题', '##### 标题文本')">H5</button>
                    <button @click.stop="insertMarkdown('六级标题', '###### 标题文本')">H6</button>
                    <button @click.stop="insertMarkdown('缩进', '    ')">缩进</button>
                    <button @click.stop="insertMarkdown('无序列表', '- 列表项\\n- 列表项\\n- 列表项')">无序列表</button>
                    <button @click.stop="insertMarkdown('有序列表', '1. 列表项\\n2. 列表项\\n3. 列表项')">有序列表</button>
                    <button @click.stop="insertMarkdown('待办事项', '- [ ] 待办事项\\n- [x] 已完成事项')">待办事项</button>
                    <button @click.stop="insertMarkdown('加粗', '**文本**')">加粗</button>
                    <button @click.stop="insertMarkdown('斜体', '*文本*')">斜体</button>
                    <button @click.stop="insertMarkdown('删除线', '~~文本~~')">删除线</button>
                    <button @click.stop="insertMarkdown('引用', '> 引用文本')">引用</button>
                    <button @click.stop="insertMarkdown('超链接', '[链接文本](https://example.com)')">超链接</button>
                    <button @click.stop="insertMarkdown('图片', '![图片描述](图片URL)')">图片</button>
                    <button @click.stop="insertMarkdown('表格', '| 标题1 | 标题2 | 标题3 |\\n| ------ | ------ | ------ |\\n| 单元格1 | 单元格2 | 单元格3 |\\n| 单元格4 | 单元格5 | 单元格6 |')">表格</button>
                    <button @click.stop="insertMarkdown('行内代码', '\`代码\`')">行内代码</button>
                    <button @click.stop="insertMarkdown('代码块', '\`\`\`\\n代码块\\n\`\`\`')">代码块</button>
                </div>
            </div>
        `,
        mounted() {
            // 在组件挂载后设置拖动功能
            this.$nextTick(() => {
                this.setupDragToScroll();
            });
        },
        methods: {
            // 设置拖动滚动功能
            setupDragToScroll() {
                const container = this.$refs.toolbarContainer;
                if (!container) return;
                
                let isDragging = false;
                let startX, scrollLeft;
                
                // 鼠标按下事件
                container.addEventListener('mousedown', (e) => {
                    // 只有在容器可滚动时才启用拖动
                    if (container.scrollWidth > container.clientWidth) {
                        isDragging = true;
                        startX = e.pageX - container.offsetLeft;
                        scrollLeft = container.scrollLeft;
                        container.style.cursor = 'grabbing';
                        
                        // 阻止默认事件和冒泡
                        e.preventDefault();
                    }
                });
                
                // 鼠标移动事件
                container.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    
                    const x = e.pageX - container.offsetLeft;
                    const walk = x - startX; // 滚动速度
                    container.scrollLeft = scrollLeft - walk;
                });
                
                // 鼠标释放事件
                const endDrag = () => {
                    if (isDragging) {
                        isDragging = false;
                        container.style.cursor = 'grab';
                    }
                };
                
                // 监听相关事件
                container.addEventListener('mouseup', endDrag);
                container.addEventListener('mouseleave', endDrag);
                
                // 触摸设备支持
                container.addEventListener('touchstart', (e) => {
                    if (container.scrollWidth > container.clientWidth) {
                        isDragging = true;
                        startX = e.touches[0].pageX - container.offsetLeft;
                        scrollLeft = container.scrollLeft;
                    }
                });
                
                container.addEventListener('touchmove', (e) => {
                    if (!isDragging) return;
                    const x = e.touches[0].pageX - container.offsetLeft;
                    const walk = (x - startX) * 2;
                    container.scrollLeft = scrollLeft - walk;
                    e.preventDefault(); // 防止页面滚动
                });
                
                container.addEventListener('touchend', endDrag);
            },
            
            // 获取选中行的信息
            getSelectedLineInfo(textarea, content, start, end) {
                const beforeSelection = content.substring(0, start);
                const selection = content.substring(start, end);
                const afterSelection = content.substring(end);
                
                // 找到选中内容所在行的起始位置
                let lineStart = beforeSelection.lastIndexOf('\n');
                lineStart = lineStart === -1 ? 0 : lineStart + 1;
                
                // 找到选中内容所在行的结束位置
                let lineEnd = afterSelection.indexOf('\n');
                lineEnd = lineEnd === -1 ? content.length : end + lineEnd;
                
                const line = content.substring(lineStart, lineEnd);
                
                return {
                    lineStart,
                    lineEnd,
                    line,
                    beforeLine: content.substring(0, lineStart),
                    afterLine: content.substring(lineEnd)
                };
            },
            
            // 更新标题格式
            updateHeadingFormat(textarea, content, start, end, level) {
                // 检查是否选中了多行
                const selectedText = content.substring(start, end);
                
                // 如果选中了多行文本（包含换行符）
                if (selectedText.includes('\n')) {
                    // 分割成多行进行处理
                    const lines = selectedText.split('\n');
                    const hashPattern = /^#{1,6}\s/; // 匹配1-6个#号
                    
                    // 处理每一行
                    const processedLines = lines.map(line => {
                        // 移除已有的标题标记
                        const cleanLine = line.replace(hashPattern, '');
                        
                        // 如果是空行，不添加标题标记
                        if (cleanLine.trim() === '') {
                            return '';
                        }
                        
                        // 添加新的标题标记
                        return '#'.repeat(level) + ' ' + cleanLine;
                    });
                    
                    // 将处理后的行重新组合
                    const newContent = processedLines.join('\n');
                    
                    // 更新内容
                    return {
                        content: content.substring(0, start) + newContent + content.substring(end),
                        newCursorPos: start, // 保持原始选区开始位置
                        newSelectionEnd: start + newContent.length // 保持选区结束位置
                    };
                } else {
                    // 处理单行情况
                    const lineInfo = this.getSelectedLineInfo(textarea, content, start, end);
                    const hashPattern = /^#{1,6}\s/; // 匹配1-6个#号
                    
                    // 检查当前行是否已经有标题标记
                    const hasHash = hashPattern.test(lineInfo.line);
                    
                    // 移除已有的标题标记
                    let cleanLine = lineInfo.line.replace(hashPattern, '');
                    
                    // 如果当前行已经是相同级别的标题，则移除标题标记
                    if (hasHash) {
                        const currentLevel = lineInfo.line.match(/^#+/)[0].length;
                        if (currentLevel === level) {
                            const newLine = cleanLine;
                            return {
                                content: lineInfo.beforeLine + newLine + lineInfo.afterLine,
                                newCursorPos: lineInfo.lineStart, // 选中整行
                                newSelectionEnd: lineInfo.lineEnd // 选中整行
                            };
                        }
                    }
                    
                    // 添加新的标题标记
                    const newLine = '#'.repeat(level) + ' ' + cleanLine;
                    
                    return {
                        content: lineInfo.beforeLine + newLine + lineInfo.afterLine,
                        newCursorPos: lineInfo.lineStart, // 选中整行
                        newSelectionEnd: lineInfo.lineEnd // 选中整行
                    };
                }
            },
            
            // 更新列表格式
            updateListFormat(textarea, content, start, end, listType) {
                const selectedText = content.substring(start, end);
                
                // 如果选中了多行文本
                if (selectedText.includes('\n')) {
                    const lines = selectedText.split('\n');
                    const unorderedPattern = /^-\s/;
                    const orderedPattern = /^\d+\.\s/;
                    const todoPattern = /^-\s\[\s?\]\s/;
                    const doneTodoPattern = /^-\s\[x\]\s/;
                    
                    let processedLines = [];
                    let lineNumber = 1;
                    
                    // 处理每一行
                    for (let line of lines) {
                        let cleanLine = line;
                        
                        // 移除任何已有的列表标记
                        cleanLine = cleanLine.replace(unorderedPattern, '')
                                            .replace(orderedPattern, '')
                                            .replace(todoPattern, '')
                                            .replace(doneTodoPattern, '');
                                            
                        // 根据列表类型添加标记
                        if (listType === 'unordered') {
                            processedLines.push('- ' + cleanLine);
                        } else if (listType === 'ordered') {
                            processedLines.push(lineNumber + '. ' + cleanLine);
                            lineNumber++;
                        } else if (listType === 'todo') {
                            processedLines.push('- [ ] ' + cleanLine);
                        }
                    }
                    
                    const newContent = processedLines.join('\n');
                    
                    return {
                        content: content.substring(0, start) + newContent + content.substring(end),
                        newCursorPos: start,
                        newSelectionEnd: start + newContent.length
                    };
                } else {
                    const lineInfo = this.getSelectedLineInfo(textarea, content, start, end);
                    
                    // 检测现有的列表标记并移除
                    const unorderedPattern = /^-\s/;
                    const orderedPattern = /^\d+\.\s/;
                    const todoPattern = /^-\s\[\s?\]\s/;
                    const doneTodoPattern = /^-\s\[x\]\s/;
                    
                    let cleanLine = lineInfo.line;
                    let newLine;
                    
                    if (listType === 'unordered') {
                        // 检查是否已经是无序列表
                        if (unorderedPattern.test(lineInfo.line)) {
                            // 已是无序列表，则移除标记
                            newLine = cleanLine.replace(unorderedPattern, '');
                        } else {
                            // 移除任何已有的其他列表标记
                            cleanLine = cleanLine.replace(orderedPattern, '')
                                                .replace(todoPattern, '')
                                                .replace(doneTodoPattern, '');
                            // 添加无序列表标记
                            newLine = '- ' + cleanLine;
                        }
                    } else if (listType === 'ordered') {
                        // 检查是否已经是有序列表
                        if (orderedPattern.test(lineInfo.line)) {
                            // 已是有序列表，则移除标记
                            newLine = cleanLine.replace(orderedPattern, '');
                        } else {
                            // 移除任何已有的其他列表标记
                            cleanLine = cleanLine.replace(unorderedPattern, '')
                                                .replace(todoPattern, '')
                                                .replace(doneTodoPattern, '');
                            // 添加有序列表标记
                            newLine = '1. ' + cleanLine;
                        }
                    } else if (listType === 'todo') {
                        // 检查是否已有待办标记
                        if (todoPattern.test(lineInfo.line)) {
                            // 已有待办，转为已办
                            newLine = lineInfo.line.replace(todoPattern, '- [x] ');
                        } else if (doneTodoPattern.test(lineInfo.line)) {
                            // 已有已办，转为待办
                            newLine = lineInfo.line.replace(doneTodoPattern, '- [ ] ');
                        } else {
                            // 移除其它类型列表标记
                            cleanLine = cleanLine.replace(unorderedPattern, '')
                                                .replace(orderedPattern, '');
                            // 添加待办标记
                            newLine = '- [ ] ' + cleanLine;
                        }
                    }
                    
                    // 更新内容
                    return {
                        content: lineInfo.beforeLine + newLine + lineInfo.afterLine,
                        newCursorPos: lineInfo.lineStart, // 选中整行
                        newSelectionEnd: lineInfo.lineEnd // 选中整行
                    };
                }
            },
            
            // 更新引用格式
            updateQuoteFormat(textarea, content, start, end) {
                const selectedText = content.substring(start, end);
                
                // 如果选中了多行文本
                if (selectedText.includes('\n')) {
                    const lines = selectedText.split('\n');
                    const quotePattern = /^>\s/;
                    
                    const processedLines = lines.map(line => {
                        // 检查是否已有引用标记
                        if (quotePattern.test(line)) {
                            return line; // 保持不变
                        } else {
                            return '> ' + line;
                        }
                    });
                    
                    const newContent = processedLines.join('\n');
                    
                    return {
                        content: content.substring(0, start) + newContent + content.substring(end),
                        newCursorPos: start,
                        newSelectionEnd: start + newContent.length
                    };
                } else {
                    const lineInfo = this.getSelectedLineInfo(textarea, content, start, end);
                    const quotePattern = /^>\s/;
                    
                    let newLine;
                    
                    if (quotePattern.test(lineInfo.line)) {
                        // 已有引用，移除
                        newLine = lineInfo.line.replace(quotePattern, '');
                    } else {
                        // 添加引用
                        newLine = '> ' + lineInfo.line;
                    }
                    
                    // 更新内容
                    return {
                        content: lineInfo.beforeLine + newLine + lineInfo.afterLine,
                        newCursorPos: lineInfo.lineStart, // 选中整行
                        newSelectionEnd: lineInfo.lineEnd // 选中整行
                    };
                }
            },
            
            // 应用缩进
            applyIndent(textarea, content, start, end) {
                const selectedText = content.substring(start, end);
                
                // 如果选中了多行文本
                if (selectedText.includes('\n')) {
                    const lines = selectedText.split('\n');
                    const processedLines = lines.map(line => '    ' + line);
                    const newContent = processedLines.join('\n');
                    
                    return {
                        content: content.substring(0, start) + newContent + content.substring(end),
                        newCursorPos: start,
                        newSelectionEnd: start + newContent.length
                    };
                } else {
                    const lineInfo = this.getSelectedLineInfo(textarea, content, start, end);
                    const newLine = '    ' + lineInfo.line;
                    
                    return {
                        content: lineInfo.beforeLine + newLine + lineInfo.afterLine,
                        newCursorPos: lineInfo.lineStart, // 选中整行
                        newSelectionEnd: lineInfo.lineEnd // 选中整行
                    };
                }
            },
            
            // 应用文本样式（加粗、斜体、删除线）
            applyTextStyle(textarea, content, start, end, style) {
                const selectedText = content.substring(start, end);
                let newContent;
                let newCursorPos = start;
                let newSelectionEnd = end;
                
                // 检查是否选中了多行
                if (selectedText.includes('\n')) {
                    // 分割成多行进行处理
                    const lines = selectedText.split('\n');
                    
                    // 用于检测常见的Markdown标记
                    const markdownPrefixPattern = /^(#{1,6}\s|>\s|-\s|\d+\.\s|-\s\[[ x]\]\s|\s{4})/;
                    
                    // 处理每一行
                    const processedLines = lines.map(line => {
                        // 如果是空行，直接返回
                        if (line.trim() === '') {
                            return line;
                        }
                        
                        // 提取行首Markdown命令和内容
                        let prefix = '';
                        let content = line;
                        const match = line.match(markdownPrefixPattern);
                        
                        if (match) {
                            prefix = match[0];
                            content = line.substring(prefix.length);
                        }
                        
                        // 准备样式标记
                        let styleMarkers;
                        let pattern;
                        
                        switch (style) {
                            case 'bold':
                                styleMarkers = '**';
                                pattern = /^\*\*(.*)\*\*$/;
                                break;
                            case 'italic':
                                styleMarkers = '*';
                                pattern = /^\*(.*)\*$/;
                                break;
                            case 'strikethrough':
                                styleMarkers = '~~';
                                pattern = /^~~(.*)~~$/;
                                break;
                            default:
                                styleMarkers = '';
                                pattern = null;
                        }
                        
                        // 检查当前行是否已有相同样式
                        let styledContent;
                        if (pattern && pattern.test(content)) {
                            // 如果已有相同样式，则移除样式
                            styledContent = content.replace(pattern, '$1');
                        } else {
                            // 应用文本样式
                            styledContent = styleMarkers + content + styleMarkers;
                        }
                        
                        // 将前缀和样式化内容组合
                        return prefix + styledContent;
                    });
                    
                    const newText = processedLines.join('\n');
                    newContent = content.substring(0, start) + newText + content.substring(end);
                    newSelectionEnd = start + newText.length;
                } else {
                    let styleMarkers;
                    let pattern;
                    
                    switch (style) {
                        case 'bold':
                            styleMarkers = '**';
                            pattern = /^\*\*(.*)\*\*$/;
                            break;
                        case 'italic':
                            styleMarkers = '*';
                            pattern = /^\*(.*)\*$/;
                            break;
                        case 'strikethrough':
                            styleMarkers = '~~';
                            pattern = /^~~(.*)~~$/;
                            break;
                        default:
                            styleMarkers = '';
                            pattern = null;
                    }
                    
                    if (selectedText) {
                        if (pattern && pattern.test(selectedText)) {
                            // 如果选中的文本已有相同样式，则移除样式
                            const cleanText = selectedText.replace(pattern, '$1');
                            newContent = content.substring(0, start) + cleanText + content.substring(end);
                            newSelectionEnd = start + cleanText.length;
                        } else {
                            // 应用样式
                            const styledText = styleMarkers + selectedText + styleMarkers;
                            newContent = content.substring(0, start) + styledText + content.substring(end);
                            newSelectionEnd = start + styledText.length;
                        }
                    } else {
                        // 如果没有选中文本，插入占位符
                        let placeholder;
                        switch (style) {
                            case 'bold':
                                placeholder = '粗体文本';
                                break;
                            case 'italic':
                                placeholder = '斜体文本';
                                break;
                            case 'strikethrough':
                                placeholder = '删除线文本';
                                break;
                            default:
                                placeholder = '文本';
                        }
                        
                        const styledText = styleMarkers + placeholder + styleMarkers;
                        newContent = content.substring(0, start) + styledText + content.substring(end);
                        
                        // 选中占位符文本
                        newCursorPos = start + styleMarkers.length;
                        newSelectionEnd = start + styleMarkers.length + placeholder.length;
                    }
                }
                
                return { content: newContent, newCursorPos, newSelectionEnd };
            },
            
            // 在文本区域插入Markdown语法
            insertMarkdown(buttonName, markdown) {
                // 阻止原生事件冒泡，避免关闭编辑框
                if (event) {
                    event.stopPropagation();
                }
                
                // 获取textarea元素
                const textarea = document.querySelector('.el-textarea__inner');
                if (!textarea) return;
                
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selectedText = this.content.substring(start, end);
                let result;
                
                // 根据不同按钮类型处理
                switch (buttonName) {
                    case '一级标题':
                    case '二级标题':
                    case '三级标题':
                    case '四级标题':
                    case '五级标题':
                    case '六级标题':
                        // 获取标题级别
                        const headerLevel = this.chineseToArabic(buttonName.charAt(0));
                        // 应用标题更新
                        result = this.updateHeadingFormat(textarea, this.content, start, end, headerLevel);
                        break;
                        
                    case '缩进':
                        // 应用缩进
                        result = this.applyIndent(textarea, this.content, start, end);
                        break;
                        
                    case '无序列表':
                        result = this.updateListFormat(textarea, this.content, start, end, 'unordered');
                        break;
                        
                    case '有序列表':
                        result = this.updateListFormat(textarea, this.content, start, end, 'ordered');
                        break;
                        
                    case '待办事项':
                        result = this.updateListFormat(textarea, this.content, start, end, 'todo');
                        break;
                        
                    case '引用':
                        result = this.updateQuoteFormat(textarea, this.content, start, end);
                        break;
                        
                    case '加粗':
                        result = this.applyTextStyle(textarea, this.content, start, end, 'bold');
                        break;
                        
                    case '斜体':
                        result = this.applyTextStyle(textarea, this.content, start, end, 'italic');
                        break;
                        
                    case '删除线':
                        result = this.applyTextStyle(textarea, this.content, start, end, 'strikethrough');
                        break;
                        
                    case '行内代码':
                        if (selectedText) {
                            result = {
                                content: this.content.substring(0, start) + '`' + selectedText + '`' + this.content.substring(end),
                                newCursorPos: start,
                                newSelectionEnd: start + selectedText.length + 2
                            };
                        } else {
                            result = {
                                content: this.content.substring(0, start) + '`行内代码`' + this.content.substring(end),
                                newCursorPos: start + 1,
                                newSelectionEnd: start + 5
                            };
                        }
                        break;
                        
                    case '代码块':
                        if (selectedText) {
                            result = {
                                content: this.content.substring(0, start) + '\n```\n' + selectedText + '\n```\n' + this.content.substring(end),
                                newCursorPos: start,
                                newSelectionEnd: start + selectedText.length + 8
                            };
                        } else {
                            result = {
                                content: this.content.substring(0, start) + '\n```\n代码块\n```\n' + this.content.substring(end),
                                newCursorPos: start + 5,
                                newSelectionEnd: start + 8
                            };
                        }
                        break;
                        
                    case '表格':
                        const tableTemplate = '\n| 标题1 | 标题2 | 标题3 |\n| ------ | ------ | ------ |\n| 单元格1 | 单元格2 | 单元格3 |\n| 单元格4 | 单元格5 | 单元格6 |';
                        result = {
                            content: this.content.substring(0, start) + tableTemplate + this.content.substring(end),
                            newCursorPos: start,
                            newSelectionEnd: start + tableTemplate.length
                        };
                        break;
                        
                    case '超链接':
                        if (selectedText) {
                            result = {
                                content: this.content.substring(0, start) + '[' + selectedText + '](https://example.com)' + this.content.substring(end),
                                newCursorPos: start,
                                newSelectionEnd: start + selectedText.length + 21
                            };
                        } else {
                            result = {
                                content: this.content.substring(0, start) + '[链接文本](https://example.com)' + this.content.substring(end),
                                newCursorPos: start + 1,
                                newSelectionEnd: start + 5
                            };
                        }
                        break;
                        
                    case '图片':
                        if (selectedText) {
                            result = {
                                content: this.content.substring(0, start) + '![' + selectedText + '](图片URL)' + this.content.substring(end),
                                newCursorPos: start,
                                newSelectionEnd: start + selectedText.length + 10
                            };
                        } else {
                            result = {
                                content: this.content.substring(0, start) + '![图片描述](图片URL)' + this.content.substring(end),
                                newCursorPos: start + 2,
                                newSelectionEnd: start + 6
                            };
                        }
                        break;
                        
                    default:
                        if (selectedText) {
                            result = {
                                content: this.content.substring(0, start) + markdown + this.content.substring(end),
                                newCursorPos: start,
                                newSelectionEnd: start + markdown.length
                            };
                        } else {
                            result = {
                                content: this.content.substring(0, start) + markdown + this.content.substring(end),
                                newCursorPos: start,
                                newSelectionEnd: start + markdown.length
                            };
                        }
                }
                
                // 更新内容
                this.$emit('update:content', result.content);
                
                // 恢复焦点并设置选择范围
                this.$nextTick(() => {
                    textarea.focus();
                    textarea.setSelectionRange(result.newCursorPos, result.newSelectionEnd);
                });
            },
            
            // 中文数字转阿拉伯数字
            chineseToArabic(chineseNumber) {
                const chineseNumerals = {
                    '零': 0,
                    '一': 1,
                    '二': 2,
                    '三': 3,
                    '四': 4,
                    '五': 5,
                    '六': 6,
                    '七': 7,
                    '八': 8,
                    '九': 9,
                    '十': 10,
                    '百': 100,
                    '千': 1000,
                    '万': 10000,
                    '亿': 100000000
                };
            
                let result = 0;
                let temp = 0;
                let lastUnit = 1;
            
                for (let i = 0; i < chineseNumber.length; i++) {
                    const char = chineseNumber[i];
                    if (char in chineseNumerals) {
                        if (chineseNumerals[char] >= 10) {
                            if (chineseNumerals[char] === 10 && (i === 0 || chineseNumerals[chineseNumber[i - 1]] >= 10)) {
                                temp = 1 * chineseNumerals[char];
                            } else {
                                temp *= chineseNumerals[char];
                            }
            
                            if (chineseNumerals[char] >= 10000) {
                                result += temp * lastUnit;
                                lastUnit = chineseNumerals[char];
                                temp = 0;
                            }
                        } else {
                            temp = chineseNumerals[char];
                        }
                    }
                }
            
                result += temp * lastUnit;
                return result;
            }
        }
    });
})(); 