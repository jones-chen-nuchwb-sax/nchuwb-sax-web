// 全域變數，用來儲存從 JSON 讀取到的原始資料
let siteData = {};

// 1. 初始化：網頁載入後立刻執行
document.addEventListener('DOMContentLoaded', () => {
    // 原有的資料抓取邏輯
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            siteData = data;
            switchCategory('home');
        });

    // --- [新增] 手機版選單控制 ---
    const menuBtn = document.getElementById('mobile-menu-button');
    const sidebar = document.getElementById('sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', (e) => {
            // 阻止事件冒泡 (防止點擊按鈕後立刻觸發下方的點擊空白處關閉邏輯)
            e.stopPropagation(); 
            sidebar.classList.toggle('-translate-x-full');
        });

        // 點擊側邊欄以外的地方自動收起選單 (優化體驗)
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    }
});

// 2. 切換大分類
function switchCategory(category) {
    const subMenu = document.getElementById('sub-menu');
    const categoryTitle = document.getElementById('category-title');
    const contentArea = document.getElementById('content-area');
    const sidebar = document.getElementById('sidebar'); // [新增] 抓取側邊欄
    
    const categoryNames = {
        'home': '首頁',
        'workshops': '歷屆工作坊',
        'performances': '各種演出',
        'tree': '家族族譜',
        'about': '關於我們'
    };
    categoryTitle.innerText = categoryNames[category] || '紀錄內容';
    subMenu.innerHTML = '';

    if (category === 'home') {
        renderHome();
        // [新增] 回首頁時也確保手機版選單收起來
        if (window.innerWidth < 768) sidebar.classList.add('-translate-x-full');
        return;
    }

    const items = siteData[category];
    if (!items || items.length === 0) {
        subMenu.innerHTML = '<p class="text-gray-400 text-sm">尚無紀錄</p>';
        contentArea.innerHTML = '<p class="text-center py-20 text-gray-500">內容準備中，敬請期待！</p>';
        return;
    }

    items.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = "text-left px-4 py-2 rounded-lg transition-all duration-200 hover:bg-emerald-100 hover:text-emerald-800 mb-1";
        btn.innerText = item.subMenuTitle;
        btn.onclick = () => {
            document.querySelectorAll('#sub-menu button').forEach(b => b.classList.remove('bg-emerald-700', 'text-white'));
            btn.classList.add('bg-emerald-700', 'text-white');
            renderContent(item);

            // --- [新增] 點擊子項目後，如果是手機版就自動收起選單 ---
            if (window.innerWidth < 768) {
                sidebar.classList.add('-translate-x-full');
            }
        };
        subMenu.appendChild(btn);
        
        // 注意：這裡預設點擊第一個時，先不要觸發「收起選單」
        // 因為切換大分類時，我們通常想讓使用者看到子選單
        if (index === 0) {
            document.querySelectorAll('#sub-menu button').forEach(b => b.classList.remove('bg-emerald-700', 'text-white'));
            btn.classList.add('bg-emerald-700', 'text-white');
            renderContent(item);
        }
    });
}

// --- 【新增】渲染首頁功能 ---
function renderHome() {
    const contentArea = document.getElementById('content-area');
    
    // 抓取最新的工作坊 (最後一筆)
    //const latestWS = siteData.workshops[siteData.workshops.length - 1];
    const latestWS = siteData.workshops[0];
    // 抓取最新的演出 (最後一筆)
    const latestPerf = siteData.performances[siteData.performances.length - 1];

    contentArea.innerHTML = `
        <div class="fade-in space-y-10">
            <div class="text-center py-10 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl text-white shadow-xl">
                <h1 class="text-4xl font-black mb-4">歡迎來到薩克斯風紀錄網</h1>
                <p class="text-emerald-100 italic">"每一段旋律，都是我們共同的記憶"</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer" 
                     onclick="renderContent(siteData.workshops[0])">
                    <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">最新活動</span>
                    <h3 class="text-xl font-bold mt-2 mb-3">${latestWS.fullTitle}</h3>
                    <p class="text-gray-500 text-sm line-clamp-2">${latestWS.description}</p>
                    <div class="mt-4 text-emerald-700 font-medium text-sm">查看紀錄內容 →</div>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer" 
                     onclick="renderContent(siteData.performances[siteData.performances.length - 1])">
                    <span class="text-xs font-bold text-orange-600 uppercase tracking-wider">近期演出</span>
                    <h3 class="text-xl font-bold mt-2 mb-3">${latestPerf.fullTitle}</h3>
                    <p class="text-gray-500 text-sm line-clamp-2">${latestPerf.description}</p>
                    <div class="mt-4 text-orange-700 font-medium text-sm">欣賞影音紀錄 →</div>
                </div>
            </div>
            
            <div class="bg-emerald-50 p-8 rounded-2xl text-center">
                <h3 class="font-bold text-emerald-900 mb-2">想了解更多？</h3>
                <p class="text-emerald-700 text-sm mb-6">點擊上方選單瀏覽完整的工作坊紀錄、演出影像，或查詢我們的家族族譜。</p>
            </div>
        </div>
    `;
}

// 3. 渲染右側主內容區 (保持不變)
function renderContent(item) {
    const contentArea = document.getElementById('content-area');
    
    let memberHTML = '';
    if (item.category === 'tree' && item.members && item.members.length > 0) {
        memberHTML = `
            <div class="mt-6 mb-10 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table class="w-full text-left border-collapse bg-white">
                    <thead class="bg-emerald-600 text-white">
                        <tr>
                            <th class="p-4 font-semibold">姓名</th>
                            <th class="p-4 font-semibold">系所</th>
                            <th class="p-4 font-semibold">曾任幹部/備註</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${item.members.map(m => `
                            <tr class="hover:bg-emerald-50 transition-colors">
                                <td class="p-4 font-medium text-gray-800">${m.name}</td>
                                <td class="p-4 text-gray-600">${m.dept || '-'}</td>
                                <td class="p-4 text-sm text-emerald-700">${m.role || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    let videoHTML = '';
    if (item.videos && item.videos.length > 0) {
        videoHTML = `
            <h4 class="font-bold text-xl mb-4 border-b pb-2 text-emerald-800"><i class="fab fa-youtube mr-2"></i>活動錄影</h4>
            <div class="grid grid-cols-1 gap-6 mb-8">
                ${item.videos.map(v => `
                    <div class="bg-black rounded-xl overflow-hidden shadow-lg aspect-video">
                        <iframe class="w-full h-full" src="https://www.youtube.com/embed/${v.youtubeId}" frameborder="0" allowfullscreen></iframe>
                    </div>
                `).join('')}
            </div>
        `;
    }

    let imageHTML = '';
    if (item.images && item.images.length > 0) {
        imageHTML = `
            <h4 class="font-bold text-xl mb-4 border-b pb-2 text-emerald-800"><i class="far fa-images mr-2"></i>活動剪影</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                ${item.images.map(img => `
                    <div class="group relative overflow-hidden rounded-lg shadow-md aspect-square bg-gray-200">
                        <img src="${img}" class="object-cover w-full h-full transition duration-300 group-hover:scale-110" alt="活動照片">
                    </div>
                `).join('')}
            </div>
        `;
    }

    contentArea.innerHTML = `
        <div class="fade-in">
            <h2 class="text-3xl font-bold text-gray-800 mb-2">${item.fullTitle}</h2>
            <div class="flex items-center text-gray-500 text-sm mb-6 space-x-4">
                <span><i class="far fa-calendar-alt mr-1"></i> ${item.date}</span>
                ${item.location ? `<span><i class="fas fa-map-marker-alt mr-1"></i> ${item.location}</span>` : ''}
            </div>
            <p class="text-gray-700 leading-relaxed mb-8 bg-white p-6 rounded-xl border-l-8 border-emerald-500 shadow-sm italic">
                ${item.description}
            </p>
            ${memberHTML}
            ${videoHTML}
            ${imageHTML}
        </div>
    `;
}