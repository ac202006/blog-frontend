// 获取搜索容器和按钮
const searchContainer = document.querySelector('.search-container');
const searchButton = document.querySelector('.search-button');
const searchInput = document.querySelector('.search-input');
const header = document.querySelector('header');
const container = document.querySelector('.site-wrapper');

// 点击搜索按钮时，显示搜索框
searchButton.addEventListener('click', (event) => {
  event.stopPropagation();
  searchContainer.classList.add('click');
  searchInput.focus(); // 自动聚焦到搜索框
});

// 点击搜索框时保持显示
searchInput.addEventListener('click', (event) => {
  event.stopPropagation();
  searchContainer.classList.add('click');
});

// 点击页面其他地方时，隐藏搜索框
document.addEventListener('click', (event) => {
  if (!searchContainer.contains(event.target)) {
    searchContainer.classList.remove('click');
  }
});


function handleScroll() {
  const windowScrollY = window.scrollY || window.pageYOffset;
  const containerScrollY = container ? container.scrollTop : 0;
  if (windowScrollY > 0 || containerScrollY > 0) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

// 监听 window 滚动
window.addEventListener('scroll', handleScroll);

// 如果容器存在，也监听容器滚动
if (container) {
  container.addEventListener('scroll', handleScroll);
}

document.addEventListener('DOMContentLoaded', function() {
  const posts = document.querySelectorAll('.post[data-post-id]');
  posts.forEach(post => {
    post.addEventListener('click', function() {
      const postId = this.getAttribute('data-post-id');
      window.location.href = `blog.html?id=${postId}`;
    });
    
    post.style.cursor = 'pointer';
  });

  if (document.body.classList.contains('blog')) {
    loadBlogContent();
  }
});

function loadBlogContent() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  if (postId && postsData && postsData[postId]) {
    const post = postsData[postId];
    const blogTitle = document.querySelector('.blog-info h1');
    const blogDate = document.querySelector('.blog-info .post-date');
    const blogImage = document.querySelector('.blog-header-image');
    const blogContent = document.querySelector('.blog .post-text');
    
    if (blogTitle) blogTitle.textContent = post.title;
    if (blogDate) blogDate.innerHTML = `<i class="fas fa-calendar-alt"></i> ${post.date}`;
    if (blogImage) {
      blogImage.src = post.image;
      blogImage.alt = post.title;
    }
    if (blogContent) blogContent.innerHTML = post.content;
    document.title = `${post.title} - 个人前端学习网站`;
  } else {
    const blogTitle = document.querySelector('.blog-info h1');
    const blogContent = document.querySelector('.blog .post-text');
    
    if (blogTitle) blogTitle.textContent = "文章未找到";
    if (blogContent) {
      blogContent.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <h3>抱歉，请求的文章不存在</h3>
          <p>可能是链接有误或文章已被删除。</p>
          <button onclick="window.location.href='index.html'" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            返回首页
          </button>
        </div>
      `;
    }
  }
}
