// 获取搜索容器和按钮
const searchContainer = document.querySelector('.search-container');
const searchButton = document.querySelector('.search-button');
const searchInput = document.querySelector('.search-input');
const header = document.querySelector('header');

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

// 监听滚动事件，为header添加背景
window.addEventListener('scroll', () => {
  if (window.scrollY > 0) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});
