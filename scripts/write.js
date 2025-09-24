class WriteEditor {
    constructor() {
        this.textarea = document.getElementById('content-textarea');
        this.previewContent = document.getElementById('preview-content');
        this.titleDisplay = document.getElementById('title-display');
        this.timeDisplay = document.getElementById('time-display');
        this.submitButton = document.getElementById('submit-button');
        // 存储已上传图片信息 {filename,url,size}
        this.uploadedImages = [];
        
        this.init();
    }
    
    init() {
        // 实时预览
        this.textarea.addEventListener('input', () => this.updatePreview());
        
        // 发布按钮
        this.submitButton.addEventListener('click', () => this.publishArticle());
        
        // 图片上传按钮
        const addImageButton = document.getElementById('add-image-button');
        if (addImageButton) {
            addImageButton.addEventListener('click', () => this.handleImageUpload());
        }
        
        // 更新时间显示
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        
        // 初始预览
        this.updatePreview();
    }
    
    // 处理选择图片文件
    handleImageUpload() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.multiple = true;
        fileInput.onchange = async (e) => {
            const files = Array.from(e.target.files || []);
            for (const f of files) {
                await this.uploadImage(f);
            }
        };
        fileInput.click();
    }

    // 上传单个图片
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        this.showUploadProgress(`正在上传: ${file.name}`);
        try {
            const resp = await fetch('http://localhost:8000/api/upload/image', {
                method: 'POST',
                body: formData
            });
            if (!resp.ok) throw new Error('上传失败');
            const data = await resp.json();
            // 期望后端返回 { url: 'http://...', filename: 'xxx.jpg'}
            const imageUrl = data.url || data.path || '';
            if (!imageUrl) throw new Error('返回数据缺少 url');
            this.uploadedImages.push({ filename: file.name, url: imageUrl, size: file.size });
            this.insertImageMarkdown(imageUrl, file.name);
        } catch (err) {
            console.error('图片上传失败', err);
            alert(`图片上传失败: ${file.name}`);
        } finally {
            this.hideUploadProgress();
        }
    }

    // 将图片 markdown 插入文本域
    insertImageMarkdown(imageUrl, filename) {
        const cursorPos = this.textarea.selectionStart || 0;
        const before = this.textarea.value.slice(0, cursorPos);
        const after = this.textarea.value.slice(cursorPos);
        const md = `![${filename}](${imageUrl})`;
        this.textarea.value = before + md + after;
        this.textarea.dispatchEvent(new Event('input'));
        this.textarea.focus();
        const newPos = cursorPos + md.length;
        this.textarea.setSelectionRange(newPos, newPos);
    }

    showUploadProgress(message) {
        let box = document.getElementById('upload-progress');
        if (!box) {
            box = document.createElement('div');
            box.id = 'upload-progress';
            box.style.cssText = 'position:fixed;top:20px;right:20px;background:#2563eb;color:#fff;padding:8px 14px;border-radius:6px;font-size:14px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.15)';
            document.body.appendChild(box);
        }
        box.textContent = message;
        box.style.display = 'block';
    }

    hideUploadProgress() {
        const box = document.getElementById('upload-progress');
        if (box) box.style.display = 'none';
    }
    
    updatePreview() {
        const content = this.textarea.value;
        // 提取标题（第一行）
        const lines = content.split('\n');
        const title = lines[0].replace('#', '').trim() || '无标题';
        if (this.titleDisplay) {
            this.titleDisplay.textContent = title;
        }
        // 使用 marked 渲染
        if (typeof marked !== 'undefined') {
            this.previewContent.innerHTML = marked.parse(content);
        } else {
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
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width:100%;height:auto;" />')
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
            author: 'AC_101_',
            images: this.uploadedImages
        };
        try {
            this.submitButton.textContent = '发布中...';
            this.submitButton.disabled = true;
            const response = await fetch('http://localhost:8000/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(articleData)
            });
            if (response.ok) {
                const article = await response.json();
                alert('文章发布成功！');
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

// 旧的基于 prompt 的添加图片方式已整合进类中, 如仍需保留可移除以下注释
// const addImageButton = document.getElementById('add-image-button');
// addImageButton.addEventListener('click', function() { /* legacy code */ });