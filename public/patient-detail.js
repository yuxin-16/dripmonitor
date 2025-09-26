// patient-detail.js

// 假資料，用於在沒有後端時模擬單一病患數據
const DUMMY_PATIENT_DATA = {
    id: 'pat-001',
    name: '王小明',
    history: [] // 歷史數據，用於圖表
};

const currentWeightEl = document.getElementById('current-weight');
const currentFlowRateEl = document.getElementById('current-flow-rate');
const statusTextEl = document.getElementById('status-text');
const patientNameEl = document.getElementById('patient-name');
const prescriptionForm = document.getElementById('prescriptionForm');
const prescriptionMessageEl = document.getElementById('prescription-message');

// 從 URL 取得病患 ID
const urlParams = new URLSearchParams(window.location.search);
const patientId = urlParams.get('id');

// 圖表設定
const ctx = document.getElementById('weightChart').getContext('2d');
const weightChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // x 軸標籤 (時間)
        datasets: [{
            label: '點滴重量 (g)',
            data: [], // y 軸數據 (重量)
            borderColor: '#007bff',
            tension: 0.1,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: '時間'
                }
            },
            y: {
                title: {
                    display: true,
                    text: '重量 (g)'
                },
                min: 0,
            }
        }
    }
});

// 函數：根據數據更新頁面顯示
function updatePatientData(data) {
    currentWeightEl.innerText = `${data.weight} g`;
    currentFlowRateEl.innerText = `${data.flowRate} ml/min`;

    // 更新狀態顯示和顏色
    let statusText = '正常';
    let statusClass = 'status-normal';
    if (data.status === 'warning') {
        statusText = '警告：即將滴完';
        statusClass = 'status-warning';
    } else if (data.status === 'critical') {
        statusText = '緊急：流速異常';
        statusClass = 'status-critical';
    }
    statusTextEl.innerText = statusText;
    statusTextEl.className = `status-indicator ${statusClass}`;

    // 更新圖表
    // 假設每 10 秒收到一次數據
    const now = new Date();
    const timeLabel = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    weightChart.data.labels.push(timeLabel);
    weightChart.data.datasets[0].data.push(data.weight);
    
    // 如果圖表數據點過多，移除最舊的
    const maxDataPoints = 20;
    if (weightChart.data.labels.length > maxDataPoints) {
        weightChart.data.labels.shift();
        weightChart.data.datasets[0].data.shift();
    }
    
    weightChart.update();
}

// 函數：處理表單提交，發送醫囑到後端
prescriptionForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const flowRate = document.getElementById('flowRate').value;
    const totalWeight = document.getElementById('totalWeight').value;

    prescriptionMessageEl.innerText = '';
    prescriptionMessageEl.style.display = 'none';

    try {
        // 實際專案中，這裡會向後端發送 HTTP POST 請求
        // const response = await fetch(`http://your-backend-server-ip:port/api/prescribe/${patientId}`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ flowRate, totalWeight })
        // });
        
        // 模擬成功回應
        console.log(`正在為病患 ${patientId} 儲存醫囑...`);
        
        prescriptionMessageEl.innerText = '醫囑儲存成功！';
        prescriptionMessageEl.className = 'message success';
        prescriptionMessageEl.style.display = 'block';

    } catch (error) {
        prescriptionMessageEl.innerText = '儲存失敗，請重試。';
        prescriptionMessageEl.className = 'message error';
        prescriptionMessageEl.style.display = 'block';
        console.error('醫囑儲存失敗:', error);
    }
});


// 函數：模擬 WebSocket 連接與數據更新
function simulateWebSocketUpdates() {
    let currentWeight = 850;
    setInterval(() => {
        currentWeight -= Math.floor(Math.random() * 5) + 1; // 隨機減少重量
        if (currentWeight < 0) currentWeight = 800; // 模擬更換點滴
        
        const newFlowRate = (Math.random() * 5) + 3; // 模擬流速變化
        let status = 'normal';
        if (currentWeight < 100 && currentWeight >= 50) {
            status = 'warning';
        } else if (currentWeight < 50) {
            status = 'critical';
        }

        // 更新頁面
        const data = {
            weight: currentWeight.toFixed(1), // 保留小數點
            flowRate: newFlowRate.toFixed(1),
            status: status
        };
        updatePatientData(data);
        
    }, 2000); // 每 2 秒更新一次
}


// 頁面載入時執行
document.addEventListener('DOMContentLoaded', () => {
    // 根據 URL 參數設定病患姓名
    patientNameEl.innerText = `${DUMMY_PATIENT_DATA.name} 的詳細資料`;

    // 模擬 WebSocket 連接
    simulateWebSocketUpdates();
});

// 登出按鈕事件處理
document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = 'login.html';
});