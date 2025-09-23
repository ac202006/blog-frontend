class WriteEditor {
    constructor() {
        this.textarea = document.getElementById('content-textarea');
        this.previewContent = document.getElementById('preview-content');
        this.titleDisplay = document.getElementById('title-display');
        this.timeDisplay = document.getElementById('time-display');
        this.submitButton = document.getElementById('submit-button');
        
        this.init();
    }
    
    init() {
        // 实时预览
        this.textarea.addEventListener('input', () => this.updatePreview());
        
        // 发布按钮
        this.submitButton.addEventListener('click', () => this.publishArticle());
        
        // 更新时间显示
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        
        // 初始预览
        this.updatePreview();
    }
    
    updatePreview() {
        const content = this.textarea.value;
        
        // 提取标题（第一行）
        const lines = content.split('\n');
        const title = lines[0].replace('#', '').trim() || '无标题';
        if (this.titleDisplay) {
            this.titleDisplay.textContent = title;
        }
        
        // 使用marked.js渲染Markdown
        if (typeof marked !== 'undefined') {
            this.previewContent.innerHTML = marked.parse(content);
        } else {
            // 简单的Markdown渲染
            this.previewContent.innerHTML = this.simpleMarkdownRender(content);
        }
    }
    
    simpleMarkdownRender(text) {
        return text
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\`(.*)\`/gim, '<code>$1</code>')
            .replace(/\n/gim, '<br>');
    }
    
    updateTime() {
        const now = new Date();
        if (this.timeDisplay) {
            this.timeDisplay.textContent = now.toLocaleString('zh-CN');
        }
    }
    
    async publishArticle() {
        const content = this.textarea.value.trim();
        
        if (!content) {
            alert('请输入文章内容');
            return;
        }
        
        const articleData = {
            content: content,
            author: 'AC_101_'
        };
        
        try {
            this.submitButton.textContent = '发布中...';
            this.submitButton.disabled = true;
            
            const response = await fetch('http://localhost:8000/api/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(articleData)
            });
            
            if (response.ok) {
                const article = await response.json();
                alert('文章发布成功！');
                // 跳转到文章详情页
                window.location.href = `blog.html?id=${article.id}`;
            } else {
                throw new Error('发布失败');
            }
        } catch (error) {
            console.error('发布文章失败:', error);
            alert('发布失败，请重试');
        } finally {
            this.submitButton.textContent = '发布文章';
            this.submitButton.disabled = false;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new WriteEditor();
});