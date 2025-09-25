// 全局可配置的后端 API 基础地址
// 根据当前环境自动判断使用开发或生产环境的 API 地址
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '';

// 自动根据环境设置 API 基础地址
if (isDevelopment) {
    // 开发环境：使用 localhost
    window.API_BASE = 'http://localhost:8000';
} else {
    // 生产环境：使用当前域名的相对路径，或者设置为你的实际后端域名
    // 方案1：使用相对路径（后端和前端在同一域名下）
    window.API_BASE = window.location.origin;
    
    // 方案2：使用指定的后端域名（取消下面的注释并修改为你的实际域名）
    // window.API_BASE = 'https://your-backend-domain.com';
}

// 可选：如需前端请求头携带 PicGo Key（一般不建议在前端暴露）
// window.PICGO_API_KEY = 'chv_xxx';
