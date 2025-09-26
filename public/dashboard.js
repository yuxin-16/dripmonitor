// dashboard.js

// 假資料，在沒有後端時用來模擬病患資訊
const dummyPatients = [
    { id: 'pat-001', name: '王先生', room: 'A-201', weight: 450, flowRate: 5, status: 'normal' },
    { id: 'pat-002', name: '陳小姐', room: 'A-202', weight: 80, flowRate: 8, status: 'warning' },
    { id: 'pat-003', name: '林先生', room: 'B-305', weight: 720, flowRate: 6, status: 'normal' },
];

const patientCardsContainer = document.getElementById('patient-cards-container');
const alertBarContainer = document.getElementById('alert-bar-container');

// 函數：根據病患資料建立 HTML 卡片
function createPatientCard(patient) {
    const card = document.createElement('a');
    card.href = `patient-detail.html?id=${patient.id}`; // 點擊卡片導向詳細頁
    card.id = `card-${patient.id}`;
    
    // 根據狀態設定卡片邊框顏色
    let statusClass = 'status-normal';
    if (patient.status === 'warning') statusClass = 'status-warning';
    if (patient.status === 'critical') statusClass = 'status-critical';
    
    card.className = `patient-card ${statusClass}`;
    card.innerHTML = `
        <div class="card-header">
            <span class="patient-name">${patient.name}</span>
            <span class="room-number">房號: ${patient.room}</span>
        </div>
        <div class="card-body">
            <div class="data-row">
                <span class="label">點滴重量:</span>
                <span id="weight-${patient.id}">${patient.weight} g</span>
            </div>
            <div class="data-row">
                <span class="label">流速:</span>
                <span id="flowRate-${patient.id}">${patient.flowRate} ml/min</span>
            </div>
        </div>
    `;
    return card;
}

// 函數：更新單一病患卡片上的數據
function updatePatientCardData(patientId, newWeight, newFlowRate, newStatus) {
    const weightEl = document.getElementById(`weight-${patientId}`);
    const flowRateEl = document.getElementById(`flowRate-${patientId}`);
    const cardEl = document.getElementById(`card-${patientId}`);

    if (weightEl) {
        weightEl.innerText = `${newWeight} g`;
        flowRateEl.innerText = `${newFlowRate} ml/min`;
        
        // 更新卡片狀態顏色
        cardEl.className = `patient-card status-${newStatus}`;
    }
}

// 函數：顯示警示訊息
function showAlert(message) {
    const alertBar = document.createElement('div');
    alertBar.className = 'alert-bar';
    alertBar.innerHTML = `
        <span><i class="fas fa-exclamation-triangle"></i> ${message}</span>
        <i class="fas fa-times close-alert"></i>
    `;
    alertBar.querySelector('.close-alert').addEventListener('click', () => {
        alertBar.remove();
    });
    alertBarContainer.appendChild(alertBar);
}

// 函數：初始化頁面，載入所有病患卡片
function initializeDashboard() {
    // 這裡原本應該向後端發送 HTTP 請求來取得所有病患清單
    // 為了展示，我們暫時使用假資料
    dummyPatients.forEach(patient => {
        const card = createPatientCard(patient);
        patientCardsContainer.appendChild(card);
    });
    
    // 實際專案中，這裡會啟動 WebSocket 連接
    // connectWebSocket();
}

// 函數：連接到 WebSocket
function connectWebSocket() {
    // 請將 'ws://' 後面的網址替換成你的後端 WebSocket 伺服器位址
    const ws = new WebSocket('ws://your-backend-server-ip:port/ws');

    ws.onopen = () => {
        console.log('已成功連接到 WebSocket 伺服器');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('收到 WebSocket 數據:', data);
        
        if (data.type === 'data_update') {
            // 接收到即時點滴數據，更新對應的病患卡片
            updatePatientCardData(data.patientId, data.weight, data.flowRate, data.status);
        } else if (data.type === 'alert') {
            // 接收到警示訊息，在頁面頂部顯示警示
            showAlert(data.message);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket 連線已關閉。');
    };

    ws.onerror = (error) => {
        console.error('WebSocket 錯誤:', error);
    };
}


// 頁面載入時執行
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    // 模擬 WebSocket 連接，以便在沒有後端時也能看到效果
    simulateWebSocketUpdates();
});

// 模擬 WebSocket 更新的函數，讓你在沒有後端時也能看到效果
function simulateWebSocketUpdates() {
    let currentWeight = 800;
    setInterval(() => {
        currentWeight -= Math.floor(Math.random() * 5); // 隨機減少重量
        if (currentWeight < 0) currentWeight = 1000;

        let status = 'normal';
        if (currentWeight < 100 && currentWeight >= 50) {
            status = 'warning';
        } else if (currentWeight < 50) {
            status = 'critical';
            showAlert(`[緊急] 王先生的點滴重量已低於 50 克！`);
        }
        
        const randomPatient = dummyPatients[Math.floor(Math.random() * dummyPatients.length)];
        const newFlowRate = Math.floor(Math.random() * 5) + 5;
        
        updatePatientCardData(randomPatient.id, currentWeight, newFlowRate, status);
        
    }, 2000); // 每 2 秒模擬一次數據更新
}

// 登出按鈕事件處理
document.getElementById('logoutBtn').addEventListener('click', () => {
    // 實際專案中，這裡會向後端發送登出請求並清除 session
    // 為了展示，我們直接導向回登入頁面
    window.location.href = 'login.html';
});