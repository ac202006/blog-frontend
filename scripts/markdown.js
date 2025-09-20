// 使用Marked.js的Markdown处理器

document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('content-textarea');
    const previewContent = document.getElementById('preview-content');
    const titleDisplay = document.getElementById('title-display');
    const authorDisplay = document.getElementById('author-display');
    const timeDisplay = document.getElementById('time-display');
    
    // 设置默认作者和时间
    if (authorDisplay) {
        authorDisplay.textContent = 'AC_101_';
    }
    
    if (timeDisplay) {
        const now = new Date();
        const formattedTime = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        timeDisplay.textContent = formattedTime;
    }
    
    // 实时预览功能
    function updatePreview() {
        if (!textarea || !previewContent) return;
        
        const markdownText = textarea.value;
        
        // 提取第一行作为标题
        const lines = markdownText.split('\n');
        let title = '';
        let contentWithoutTitle = markdownText;
        
        if (lines[0] && lines[0].startsWith('#')) {
            title = lines[0].replace(/^#+\s*/, ''); // 移除#号和空格
            contentWithoutTitle = lines.slice(1).join('\n').trim(); // 移除第一行
            
            if (titleDisplay) {
                titleDisplay.textContent = title || '无标题';
            }
        } else {
            if (titleDisplay) {
                titleDisplay.textContent = '无标题';
            }
        }
        
        // 转换为HTML并显示预览
        if (typeof marked !== 'undefined') {
            const htmlContent = marked.parse(contentWithoutTitle || markdownText);
            previewContent.innerHTML = htmlContent;
        } else {
            // 如果marked.js没有加载，使用简单的转换
            previewContent.innerHTML = `<p>${contentWithoutTitle.replace(/\n/g, '<br>')}</p>`;
        }
    }
    
    // 默认内容和自动清除功能
    const defaultContent = `# 我的文章标题

这里是正文内容，支持**Markdown**语法：

- 列表项目 1
- 列表项目 2

> 这是一个引用

\`\`\`javascript
console.log('Hello World!');
\`\`\`

*斜体文本* 和 **粗体文本**`;

    let isDefaultContent = false;

    // 监听输入变化
    if (textarea) {
        // 用户输入时的处理
        textarea.addEventListener('input', function() {
            if (isDefaultContent) {
                // 如果当前是默认内容状态，用户开始输入时清除默认状态
                isDefaultContent = false;
                textarea.classList.remove('default-content');
            }
            updatePreview();
        });
        
        // 点击时清空默认内容
        textarea.addEventListener('focus', function() {
            if (isDefaultContent) {
                textarea.value = '';
                isDefaultContent = false;
                textarea.classList.remove('default-content');
                updatePreview();
            }
        });
        
        // 如果失去焦点且内容为空，恢复默认内容
        textarea.addEventListener('blur', function() {
            if (textarea.value.trim() === '') {
                textarea.value = defaultContent;
                isDefaultContent = true;
                textarea.classList.add('default-content');
                updatePreview();
            }
        });
        
        // 设置默认内容
        if (!textarea.value) {
            textarea.value = defaultContent;
            isDefaultContent = true;
            textarea.classList.add('default-content');
            updatePreview();
        }
    }
    
    // 提交按钮功能
    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const content = textarea.value;
            const lines = content.split('\n');
            const title = lines[0] && lines[0].startsWith('#') ? 
                         lines[0].replace(/^#+\s*/, '') : '无标题';
            
            // 这里可以添加提交逻辑
            alert(`文章准备提交：\n标题：${title}\n作者：AC_101_\n时间：${timeDisplay.textContent}`);
        });
    }
});