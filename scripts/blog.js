class BlogReader {
    constructor() {
        this.init();
    }
    
    async init() {
        // 从URL获取文章ID
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (articleId) {
            await this.loadArticle(articleId);
        } else {
            this.showError('未指定文章ID');
        }
    }
    
    async loadArticle(articleId) {
        try {
            const response = await fetch(`${window.API_BASE}/api/articles/${articleId}`);
            
            if (response.ok) {
                const article = await response.json();
                this.displayArticle(article);
            } else {
                throw new Error('文章不存在');
            }
        } catch (error) {
            console.error('加载文章失败:', error);
            this.showError('加载文章失败');
        }
    }
    
    displayArticle(article) {
        // 更新标题
        const titleElement = document.querySelector('.blog-info h1') || document.querySelector('h1');
        if (titleElement) {
            titleElement.textContent = article.title;
        }
        
        // 更新元信息
        const metaElement = document.querySelector('.blog-info span') || document.querySelector('.post-meta');
        if (metaElement) {
            metaElement.textContent = `作者: ${article.author} | 日期: ${article.created_at}`;
        }
        
        // 更新页面标题
        document.title = `${article.title} - 前端学习测试网站`;
        
        // 渲染文章内容
        const postText = document.querySelector('.post-text') || document.querySelector('.post-main');
        if (postText) {
            // 移除第一行标题
            const contentWithoutFirstLine = this.removeFirstLine(article.content);
            
            if (typeof marked !== 'undefined') {
                postText.innerHTML = marked.parse(contentWithoutFirstLine);
            } else {
                postText.innerHTML = this.simpleMarkdownRender(contentWithoutFirstLine);
            }
        }
    }
    
    removeFirstLine(content) {
        const lines = content.split('\n');
        // 移除第一行（通常是标题）
        return lines.slice(1).join('\n');
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
    
    showError(message) {
        const postText = document.querySelector('.post-text') || document.querySelector('.post-main') || document.querySelector('main');
        if (postText) {
            postText.innerHTML = `<p style="color: red;">${message}</p>`;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new BlogReader();
});