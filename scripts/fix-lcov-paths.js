/* eslint-env node */
const fs = require('fs');
const path = require('path');

// 修正 lcov.info 檔案中的路徑格式
function fixLcovPaths() {
  const lcovPath = path.join(__dirname, '..', 'coverage', 'lcov.info');
  
  if (fs.existsSync(lcovPath)) {
    let content = fs.readFileSync(lcovPath, 'utf8');
    
    // 將 Windows 路徑分隔符號替換為 Unix 格式
    content = content.replace(/\\/g, '/');
    
    fs.writeFileSync(lcovPath, content, 'utf8');
    console.log('已修正 lcov.info 檔案中的路徑格式');
  } else {
    console.log('找不到 lcov.info 檔案');
  }
}

fixLcovPaths();
