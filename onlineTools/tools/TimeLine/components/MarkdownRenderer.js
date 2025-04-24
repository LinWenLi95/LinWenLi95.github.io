// MarkdownRenderer.js
// Markdown渲染器组件

(function() {
    // 添加Markdown样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
    /* 添加整体内边距 */
    .markdown-body {
        padding: 10px;
    }
    /* 一级二级标题底部增加横线 */
    .markdown-body h1, .markdown-body h2 {
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
    }
    /* 一到六级标题上下高度调整 */
    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4,
    .markdown-body h5,
    .markdown-body h6 {
        margin-top: 0;
        margin-bottom: 5px;
    }
    /* 段落上下高度调整 */
    .markdown-body p {
            margin-top: 0;
            margin-bottom: 0;
    }
    /* 列表样式 - 完全重置 */
    .markdown-body ul,
    .markdown-body ol {
        margin: 0;
        padding: 0;
        list-style: none;
    }
    
    /* 无序列表项 */
    .markdown-body ul > li {
        position: relative;
        padding-left: 1.5em;
    }
    
    /* 对非待办事项的列表项应用项目符号 */
    .markdown-body ul > li:not(.task-list-item):before {
        content: "•";
        position: absolute;
        left: 0.3em;
    }
    
    /* 待办事项特殊样式 - 完全移除左侧空间 */
    .markdown-body .task-list-item {
        list-style-type: none;
        padding-left: 0 !important;
        margin-left: 0 !important;
    }
    
    /* 嵌套在待办事项内的列表仍需要缩进 */
    .markdown-body .task-list-item ul > li,
    .markdown-body .task-list-item ol > li {
        padding-left: 1.5em;
    }
    
    /* 待办事项复选框容器调整 */
    .markdown-body .task-list-item-checkbox {
        margin: 0 8px 0 0 !important;
        vertical-align: middle;
    }
    
    /* 有序列表项 */
    .markdown-body ol {
        counter-reset: markdown-ol;
    }
    
    .markdown-body ol > li {
        position: relative;
        padding-left: 1.5em;
        counter-increment: markdown-ol;
    }
    
    .markdown-body ol > li:before {
        content: counter(markdown-ol) ".";
        position: absolute;
        left: 0;
        width: 1.5em;
        text-align: left;
    }
    
    /* 嵌套列表 */
    .markdown-body li ul,
    .markdown-body li ol {
        margin-top: 0.5em;
    }
    
    /* 任务列表样式 */
    .markdown-body input[type="checkbox"] {
        margin-right: 4px;
        vertical-align: middle;
    }
    
    /* 代码块样式 */
    .markdown-body pre {
        background-color: #f6f8fa;
        border-radius: 3px;
        padding: 16px;
        overflow: auto;
    }
    /* 代码样式 */
    .markdown-body code {
        background-color: rgba(27,31,35,0.05);
        border-radius: 3px;
        padding: 0.2em 0.4em;
        font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
    }
    /* 引用样式 */
    .markdown-body blockquote {
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e5;
        margin: 0;
    }
    /* 表格样式 */
    .markdown-body table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 16px;
    }
    .markdown-body table th, .markdown-body table td {
        padding: 6px 13px;
        border: 1px solid #dfe2e5;
    }
    /* 表格行样式 */
    .markdown-body table tr {
        background-color: #fff;
        border-top: 1px solid #c6cbd1;
    }
    .markdown-body table tr:nth-child(2n) {
        background-color: #f6f8fa;
    }
    `;
    document.head.appendChild(styleElement);
    
    // 为marked设置渲染选项，以正确处理任务列表
    marked.use({
        gfm: true, // 开启GitHub风格的Markdown
        breaks: true,
        // 定义自定义渲染器
        renderer: {
            // 自定义复选框渲染
            checkbox(checked) {
                return `<input type="checkbox" class="task-list-item-checkbox" ${checked ? 'checked' : ''}>`;
            },
            // 自定义列表项渲染
            listitem(text, task, checked) {
                if (task) {
                    return `<li class="task-list-item" style="padding-left:0; margin-left:0;">${text}</li>`;
                }
                return `<li>${text}</li>`;
            }
        }
    });
    
    // 注册Markdown渲染器组件
    Vue.component('markdown-renderer', {
        props: {
            content: {
                type: String,
                default: ''
            }
        },
        computed: {
            compiledMarkdown() {
                return marked.parse(this.content || '');
            }
        },
        template: '<div class="markdown-body" v-html="compiledMarkdown"></div>',
        mounted() {
            // 挂载后处理任务列表
            this.processTaskLists();
        },
        updated() {
            // 更新后处理任务列表
            this.processTaskLists();
        },
        methods: {
            processTaskLists() {
                // 查找所有列表项
                const listItems = this.$el.querySelectorAll('li');
                
                listItems.forEach(item => {
                    // 检查列表项中是否包含复选框
                    const hasCheckbox = item.querySelector('input[type="checkbox"]');
                    
                    if (hasCheckbox) {
                        // 如果包含复选框，添加task-list-item类
                        item.classList.add('task-list-item');
                        
                        // 给复选框添加类，便于样式控制
                        hasCheckbox.classList.add('task-list-item-checkbox');
                        
                        // 调整列表项样式，确保左侧没有空间
                        item.style.paddingLeft = '0';
                        item.style.marginLeft = '0';
                    }
                });
            }
        }
    });
})(); 