class WriteEditor {
    constructor() {
        this.textarea = document.getElementById('content-textarea');
        this.previewContent = document.getElementById('preview-content');
        this.titleDisplay = document.getElementById('title-display');
        this.timeDisplay = document.getElementById('time-display');
        this.submitButton = document.getElementById('submit-button');
        // 存储已上传图片信息 {filename,url,size}
        this.uploadedImages = [];
        // 封面图片信息 { filename, url, size }
        this.coverImage = null;
        // 发布确认状态
        this.isConfirming = false;
        
        // API 基础地址配置
        this.API_BASE = (window.API_BASE || 'http://localhost:8000').replace(/\/$/, '');
        // 可选：如果你希望前端直接携带 PicGo Key（一般不建议暴露在前端），可设置 window.PICGO_API_KEY
        this.PICGO_API_KEY = window.PICGO_API_KEY || '';

        this.init();
    }
    
    init() {
    // 实时预览
        this.textarea.addEventListener('input', () => this.updatePreview());

    // 支持粘贴图片
    this.textarea.addEventListener('paste', (e) => this.handlePaste(e));
    // 支持拖拽图片
    this.textarea.addEventListener('dragover', (e) => { e.preventDefault(); });
    this.textarea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // 发布按钮 -> 二次确认
        this.submitButton.addEventListener('click', () => this.confirmAndPublish());
        
        // 图片上传按钮
        const addImageButton = document.getElementById('add-image-button');
        if (addImageButton) {
            addImageButton.addEventListener('click', () => this.handleImageUpload());
        }

        // 封面上传按钮（单图）
        const coverButton = document.getElementById('upload-cover-button');
        if (coverButton) {
            coverButton.addEventListener('click', () => this.handleCoverUpload());
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
            const headers = {};
            if (this.PICGO_API_KEY) headers['X-API-Key'] = this.PICGO_API_KEY;
            const resp = await fetch(`${this.API_BASE}/api/upload/image`, {
                method: 'POST',
                body: formData,
                headers
            });
            if (!resp.ok) throw new Error('上传失败');
            const data = await resp.json();
            // 兼容 PicGo / 其他后端字段 { url | imgUrl | path | raw.imgUrl }
            const imageUrl = data.url || data.imgUrl || data.path || (data.raw && data.raw.imgUrl) || '';
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

    // 处理封面上传（不插入正文，仅显示预览）
    handleCoverUpload() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('image', file);
            this.showUploadProgress(`正在上传封面: ${file.name}`);
            try {
                const headers = {};
                if (this.PICGO_API_KEY) headers['X-API-Key'] = this.PICGO_API_KEY;
                const resp = await fetch(`${this.API_BASE}/api/upload/image`, {
                    method: 'POST',
                    body: formData,
                    headers
                });
                if (!resp.ok) throw new Error('上传失败');
                const data = await resp.json();
                const imageUrl = data.url || data.imgUrl || data.path || (data.raw && data.raw.imgUrl) || '';
                if (!imageUrl) throw new Error('返回数据缺少 url');
                this.coverImage = { filename: file.name, url: imageUrl, size: file.size };
                this.updateCoverPreview();
            } catch (err) {
                console.error('封面上传失败', err);
                alert('封面上传失败');
            } finally {
                this.hideUploadProgress();
            }
        };
        fileInput.click();
    }

    handlePaste(e) {
        const items = e.clipboardData && e.clipboardData.items;
        if (!items) return;
        for (const item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) this.uploadImage(file);
            }
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files || []);
        files.filter(f => f.type.startsWith('image/')).forEach(f => this.uploadImage(f));
    }

    // 更新封面预览区域
    updateCoverPreview() {
        const previewEl = document.getElementById('cover-preview');
        if (!previewEl) return;
        if (this.coverImage) {
            previewEl.innerHTML = `<img src="${this.coverImage.url}" alt="封面" style="max-width:240px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,.15);" />`;
        } else {
            previewEl.textContent = '尚未选择封面';
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
            images: this.uploadedImages,
            cover: this.coverImage || undefined
        };
        try {
            this.submitButton.textContent = '发布中...';
            this.submitButton.disabled = true;
            const response = await fetch(`${this.API_BASE}/api/articles`, {
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
            this.isConfirming = false; // 重置状态
        }
    }

    // 二次确认入口
    confirmAndPublish() {
        // 若已在发布流程中，忽略
        if (this.submitButton.disabled) return;
        // 已展示确认，直接发布
        if (this.isConfirming) {
            // 点击第二次按钮时（确认发布）
            this.closeConfirmOverlay();
            this.publishArticle();
            return;
        }
        this.showConfirmOverlay();
    }

    // 创建并显示确认浮层
    showConfirmOverlay() {
        this.isConfirming = true;
        const overlayId = 'publish-confirm-overlay';
        if (document.getElementById(overlayId)) return; // 已存在
        const title = (this.textarea.value.split('\n')[0] || '').replace(/^#+/,'').trim() || '无标题';
        const wordCount = this.textarea.value.replace(/\s+/g,' ').trim().length;
        const imageCount = this.uploadedImages.length;
        const coverStatus = this.coverImage ? '已设置 ✅' : '未设置 ❌';

        const overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);z-index:10000;padding:20px;';
        overlay.innerHTML = `
            <div style="background:#fff;max-width:480px;width:100%;border-radius:12px;padding:22px 24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-shadow:0 6px 28px rgba(0,0,0,.25);">
              <h2 style="margin:0 0 12px;font-size:20px;">发布确认</h2>
              <div style="font-size:14px;line-height:1.6;color:#374151;max-height:50vh;overflow:auto;">
                <p><strong>标题：</strong>${this.escapeHtml(title)}</p>
                <p><strong>字数估计：</strong>${wordCount}</p>
                <p><strong>正文图片数：</strong>${imageCount}</p>
                <p><strong>封面：</strong>${coverStatus}</p>
                ${ this.coverImage ? `<div style='margin:8px 0;'><img src='${this.coverImage.url}' alt='封面' style='max-width:100%;border-radius:6px;'/></div>` : '' }
                <p style="margin-top:14px;background:#f3f4f6;padding:10px;border-radius:6px;">请确认上述信息无误后再点击 <strong>确认发布</strong>。</p>
              </div>
              <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:18px;">
                <button id="cancel-publish-btn" style="padding:8px 16px;background:#e5e7eb;border:none;border-radius:6px;cursor:pointer;">取消</button>
                <button id="confirm-publish-btn" style="padding:8px 16px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;">确认发布</button>
              </div>
            </div>`;
        document.body.appendChild(overlay);
        // 事件
        overlay.querySelector('#cancel-publish-btn').addEventListener('click', () => {
            this.closeConfirmOverlay();
            this.isConfirming = false;
        });
        overlay.querySelector('#confirm-publish-btn').addEventListener('click', () => {
            this.confirmAndPublish();
        });
    }

    closeConfirmOverlay() {
        const overlay = document.getElementById('publish-confirm-overlay');
        if (overlay) overlay.remove();
    }

    escapeHtml(str) {
        // 转义基础字符，保留空格原样
        return str.replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c] || c));
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new WriteEditor();
});

// 旧的基于 prompt 的添加图片方式已整合进类中, 如仍需保留可移除以下注释
// const addImageButton = document.getElementById('add-image-button');
// addImageButton.addEventListener('click', function() { /* legacy code */ });