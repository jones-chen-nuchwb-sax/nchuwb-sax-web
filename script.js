// 全域變數，用來儲存從 JSON 讀取到的原始資料
let siteData = {};

// 1. 初始化：網頁載入後立刻執行
document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            siteData = data;
            // 預設進來顯示「歷屆工作坊」
            switchCategory('workshops');
        })
        .catch(error => console.error('無法讀取資料庫:', error));
});

// 2. 切換大分類 (Top Menu 點擊時觸發)
function switchCategory(category) {
    const subMenu = document.getElementById('sub-menu');
    const categoryTitle = document.getElementById('category-title');
    
    // 更新左側標題
    const categoryNames = {
        'workshops': '歷屆工作坊',
        'performances': '各種演出',
        'gallery': '活動剪影',
        'tree': '家族族譜',
        'about': '關於我們'
    };
    categoryTitle.innerText = categoryNames[category] || '紀錄內容';

    // 清空左側子選單
    subMenu.innerHTML = '';

    // 取得該分類下的所有活動
    const items = siteData[category];

    if (!items || items.length === 0) {
        subMenu.innerHTML = '<p class="text-gray-400 text-sm">尚無紀錄</p>';
        document.getElementById('content-area').innerHTML = '<p class="text-center py-20 text-gray-500">內容準備中，敬請期待！</p>';
        return;
    }

    // 產生左側子選單按鈕
    items.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = "text-left px-4 py-2 rounded-lg transition-all duration-200 hover:bg-emerald-100 hover:text-emerald-800 mb-1";
        btn.innerText = item.subMenuTitle;
        btn.onclick = () => {
            // 切換按鈕樣式
            document.querySelectorAll('#sub-menu button').forEach(b => b.classList.remove('bg-emerald-700', 'text-white'));
            btn.classList.add('bg-emerald-700', 'text-white');
            // 渲染內容
            renderContent(item);
        };
        subMenu.appendChild(btn);

        // 預設點開第一個活動
        if (index === 0) btn.click();
    });
}

// 3. 渲染右側主內容區
function renderContent(item) {
    const contentArea = document.getElementById('content-area');
    
    // 建立 YouTube 區塊
    let videoHTML = '';
    if (item.videos && item.videos.length > 0) {
        videoHTML = `
            <div class="grid grid-cols-1 gap-6 mb-8">
                ${item.videos.map(v => `
                    <div class="bg-black rounded-xl overflow-hidden shadow-lg">
                        <div class="aspect-video">
                            <iframe class="w-full h-full" src="https://www.youtube.com/embed/${v.youtubeId}" frameborder="0" allowfullscreen></iframe>
                        </div>
                        <div class="p-3 text-white text-sm bg-gray-900">${v.title}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 建立照片區塊 (Grid 佈局)
    let imageHTML = '';
    if (item.images && item.images.length > 0) {
        imageHTML = `
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                ${item.images.map(img => `
                    <div class="group relative overflow-hidden rounded-lg shadow-md aspect-square bg-gray-200">
                        <img src="${img}" class="object-cover w-full h-full transition duration-300 group-hover:scale-110" alt="活動照片">
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 組合最終內容
    contentArea.innerHTML = `
        <div class="fade-in">
            <h2 class="text-3xl font-bold text-gray-800 mb-2">${item.fullTitle}</h2>
            <div class="flex items-center text-gray-500 text-sm mb-6 space-x-4">
                <span><i class="far fa-calendar-alt mr-1"></i> ${item.date}</span>
                <span><i class="fas fa-map-marker-alt mr-1"></i> ${item.location}</span>
            </div>
            
            <p class="text-gray-700 leading-relaxed mb-10 bg-white p-6 rounded-xl border-l-8 border-emerald-500 shadow-sm italic">
                ${item.description}
            </p>

            <h4 class="font-bold text-xl mb-4 border-b pb-2 text-emerald-800"><i class="fab fa-youtube mr-2"></i>活動錄影</h4>
            ${videoHTML}

            <h4 class="font-bold text-xl mb-4 border-b pb-2 text-emerald-800"><i class="far fa-images mr-2"></i>活動剪影</h4>
            ${imageHTML}
        </div>
    `;
}