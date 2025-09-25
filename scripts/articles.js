class ArticleList {
    constructor() {
        this.init();
    }
    
    async init() {
        await this.loadArticles();
    }
    
    async loadArticles() {
        try {
            const response = await fetch(`/api/articles`);
            
            if (response.ok) {
                const articles = await response.json();
                this.displayArticles(articles);
            } else {
                throw new Error('加载失败');
            }
        } catch (error) {
            console.error('加载文章列表失败:', error);
            this.showError('加载文章列表失败');
        }
    }
    
    displayArticles(articles) {
        const mainContent = document.querySelector('.main-content main') || document.querySelector('main');
        
        if (!mainContent) {
            console.error('找不到主内容区域');
            return;
        }
        
        if (articles.length === 0) {
            mainContent.innerHTML = '<div class="main-title"><i class="fas fa-history"></i><span>Discovery</span><hr /></div><div style="text-align: center; color: rgba(64, 64, 64, 0.7)">暂无文章</div>';
            return;
        }
        
        let articlesHTML = '';
        articles.forEach((article, index) => {
            // 使用默认图片或根据索引选择图片
            const imageIndex = (index % 3) + 1;
            const imageSrc = `images/post${imageIndex}.jpg`;
            
            articlesHTML += `
                <article class="post" onclick="location.href='blog.html?id=${article.id}'" style="cursor: pointer;">
                    <img src="${imageSrc}" alt="${article.title}" onerror="this.src='images/post1.jpg'">
                    <div class="post-content">
                        <h2>${article.title}</h2>
                        <div class="post-date">${article.created_at} | 作者: ${article.author}</div>
                        <p>${article.summary}</p>
                    </div>
                </article>
            `;
        });
        
        mainContent.innerHTML = `
            <div class="main-title"><i class="fas fa-history"></i><span>Discovery</span><hr /></div>
            ${articlesHTML}
        `;
    }
    
    showError(message) {
        const mainContent = document.querySelector('.main-content main') || document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = `<p style="color: red;">${message}</p>`;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ArticleList();
});