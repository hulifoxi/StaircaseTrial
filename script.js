// ===== Debug Mode Variables & Setup =====
let titleClickCount = 0;
let debugModeActive = false;
const DEBUG_CLICKS_NEEDED = 10;
let logBuffer = []; // <--- 新增：日志缓冲区

// Store original console functions
const originalConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    info: console.info.bind(console), // Optional: capture info too
    debug: console.debug.bind(console) // Optional: capture debug too
};

// Function to append messages to the debug log
function appendToDebugLog(args, type = 'log') {
    if (!debugModeActive) return; // Only log if active

    const outputDiv = document.getElementById('debug-log-output');
    const terminalDiv = document.getElementById('debug-terminal');
    if (!outputDiv || !terminalDiv) return;

    const logEntry = document.createElement('p');

    // Try to stringify objects and format arguments
    const messageParts = [];
     // Add timestamp for live logs as well
    const now = new Date();
    messageParts.push(`[${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3,'0')}]`);
    for (const arg of args) {
        if (typeof arg === 'object' && arg !== null) {
            try {
                messageParts.push(JSON.stringify(arg, null, 2)); // Pretty print objects
            } catch (e) {
                messageParts.push('[Unserializable Object]');
            }
        } else {
            messageParts.push(String(arg));
        }
    }
    logEntry.textContent = messageParts.join(' '); // Join arguments with space

    // Add class for styling based on type
    if (type === 'warn') logEntry.classList.add('log-warn');
    if (type === 'error') logEntry.classList.add('log-error');

    outputDiv.appendChild(logEntry);

    // Auto-scroll to bottom
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

// Override console methods (修改逻辑)
console.log = function(...args) {
    originalConsole.log(...args); // Always log to original console
    if (debugModeActive) {
        appendToDebugLog(args, 'log');
    } else {
        logBuffer.push({ type: 'log', args: args, timestamp: new Date() }); // Store with type and timestamp
    }
};
console.warn = function(...args) {
    originalConsole.warn(...args);
    if (debugModeActive) {
        appendToDebugLog(args, 'warn');
    } else {
        logBuffer.push({ type: 'warn', args: args, timestamp: new Date() });
    }
};
console.error = function(...args) {
    originalConsole.error(...args);
    if (debugModeActive) {
        appendToDebugLog(args, 'error');
    } else {
        logBuffer.push({ type: 'error', args: args, timestamp: new Date() });
    }
};
// Optional overrides for info and debug
console.info = function(...args) {
    originalConsole.info(...args);
    if (debugModeActive) {
        appendToDebugLog(args, 'info');
    } else {
        logBuffer.push({ type: 'info', args: args, timestamp: new Date() });
    }
};
console.debug = function(...args) {
    originalConsole.debug(...args);
    if (debugModeActive) {
        appendToDebugLog(args, 'debug');
    } else {
        logBuffer.push({ type: 'debug', args: args, timestamp: new Date() });
    }
};
// ===== End Debug Mode Setup =====

// 游戏状态
let gameState = {
    score: 0,
    currentFloor: 1,
    maxFloor: 1,
    startingFloor: 1, // 新增：用户自定义起始楼层
    gamePhase: 'initial', // 游戏阶段标记 - 'initial'(初始), 'shop'(商店), 'adventure'(冒险)
    clothing: {
        '上衣': false,
        '长裤': false,
        '内裤': false,
        '白袜': false,
        '护膝': false
    },
    currentTask: null,
    tasksCompleted: 0, // 总任务完成数
    tasksCompletedInPhase: { A: 0, B: 0, C: 0 }, // 各阶段完成任务数
    currentPhase: 'A', // 当前所处阶段: 'A', 'B', 'C', 'Climbing1', 'Climbing2', 'Climbing3', 'End'
    inventory: {
        'skip': 0,
        'restore': 0
    },
    assignedClimbingTask: null, // 存储当前分配的上楼任务
    eighthFloorFirstTaskCompleted: false, // 8楼第一个任务是否完成
    hasBoughtRestore: false, // 是否已购买恢复内裤券
    progressStepsCompleted: 0 // 新增：跟踪关键进度步骤
};

const TOTAL_FLOORS_FOR_PROGRESS = 10;
const TOTAL_PROGRESS_STEPS = 10; // 7 floor tasks + 3 climbing tasks

// 任务数据
const tasks = {
    'A': [ // 1F-2F
        {
            id: 'A1',
            name: '舔脏袜',
            description: '穿白袜原地走3圈，然后舔袜面或袜趾，含进嘴里1次（任务后袜子不能擦）',
            baseScore: 2
        },
        {
            id: 'A2',
            name: '揉丁',
            description: '跪姿，掏出丁丁揉动',
            baseScore: 2
        },
        {
            id: 'A3',
            name: '狗叼内裤',
            description: '内裤脱下后叼嘴中保持10秒',
            baseScore: 1
        },
        {
            id: 'A4',
            name: '白袜自慰',
            description: '将白袜套在鸡巴上，撸30秒，不允许射精',
            baseScore: 2
        },
        {
            id: 'A5',
            name: '乳头刺激',
            description: '（如有上衣，上衣卷起）两乳头紧贴冷墙1分钟，坚持不发出声音',
            baseScore: 1
        },
        {
            id: 'A6',
            name: '狗姿被操',
            description: '狗姿抵墙，连续模拟被操动作10次，并娇喘',
            baseScore: 2
        }
    ],
    'B': [ // 4F–5F
        {
            id: 'B1',
            name: '舔地',
            description: '内裤垫地，跪舔1个台阶，舔完后再跪5秒',
            baseScore: 3
        },
        {
            id: 'B2',
            name: '模拟做爱',
            description: '光屁股，面对墙撸鸡巴，期间撞墙至少3次，模拟做爱',
            baseScore: 3
        },
        {
            id: 'B3',
            name: '勃起露出',
            description: '露出勃起带血管丁丁头，拍3张不同角度的照片',
            baseScore: 2
        },
        {
            id: 'B4',
            name: '夹腿露出',
            description: '脱下内裤包住鸡巴，夹腿，保持1分钟',
            baseScore: 2
        },
        {
            id: 'B5',
            name: '全裸露出',
            description: '全裸下半身，长裤挂在脖子上，坚持2分钟',
            baseScore: 2
        },
        {
            id: 'B6',
            name: '狗姿摇屁股',
            description: '全裸下半身，模仿狗姿势，摇屁股1分钟',
            baseScore: 2
        }
    ],
    'C': [ // 7F–8F
        {
            id: 'C1',
            name: '狗姿拍摄',
            description: '全裸下半身，狗姿，掰开屁股，保持1分钟并拍照',
            baseScore: 2
        },
        {
            id: 'C2',
            name: '鸡巴贴地走',
            description: '穿白袜，鸡巴贴地蹲着走，屁股大幅扭动3米',
            baseScore: 2
        },
        {
            id: 'C3',
            name: '超长跪姿暴露',
            description: '鸡巴朝楼下，跪势10分钟，鸡巴头暴露不可遮挡',
            baseScore: 4
        },
        {
            id: 'C4',
            name: '寸止挑战',
            description: '撸至高潮并寸止2次',
            baseScore: 3
        },
        {
            id: 'C5',
            name: '舔脚游戏',
            description: '舔脚趾和脚掌，必须舔完且干净',
            baseScore: 4
        },
        {
            id: 'C6',
            name: '阿努比斯摇',
            description: '全裸，跳阿努比斯摇并录制视频',
            baseScore: 3
        }
    ],
    '上楼任务': [ // 用于 2F→4F, 5F→7F, 8F→10F
        {
            id: 'U1',
            name: '狗姿上楼',
            description: '全程狗姿，仅穿白袜或全裸，往上爬2楼，脚不可着地',
            baseScore: 2
        },
        {
            id: 'U2',
            name: '跪姿上楼',
            description: '每上一级台阶膝盖至少落地1次，往上爬2楼',
            baseScore: 2
        },
        {
            id: 'U3',
            name: '露出上楼',
            description: '将内裤脱下叼在嘴里，同时下半身全裸，往上爬2楼',
            baseScore: 3
        },
        {
            id: 'U4',
            name: '披风上楼',
            description: '裤子挂在脖子上，全裸往上2楼。可自由选择爬or走。',
            baseScore: 2
        },
        {
            id: 'U5',
            name: '边缘上楼',
            description: '边撸鸡巴边缘，边爬2层',
            baseScore: 3
        },
        {
            id: 'U6',
            name: '赤脚上楼',
            description: '赤脚慢走，每一步需停0.5秒，露出鸡巴',
            baseScore: 2
        }
    ]
};

// 结局数据
const endings = {
    'best': {
        minScore: 35,
        description: '自主决定射精方式和地点（可以回家射精）'
    },
    'good': {
        minScore: 25,
        description: '撸射，并用白袜接精，嘴含白袜10秒'
    },
    'normal': {
        minScore: 15,
        description: '全裸跪地射精，用身体蹭干净或舔完'
    },
    'bad': {
        minScore: 6,
        description: '将精液射于身上，拍摄并舔净'
    },
    'worst': {
        minScore: 0,
        description: '禁止射精，裸体罚跪10分钟，戴3天贞操锁，白袜塞嘴里回家'
    }
};

// 自定义警告函数 (重写以支持堆叠)
function showAlert(message) {
    const container = document.getElementById('alertContainer');
    if (!container) {
        console.error('Alert container not found!');
        return;
    }

    // 创建新的警告元素
    const alertElement = document.createElement('div');
    alertElement.className = 'dynamic-alert';

    // 创建消息文本元素
    const messageElement = document.createElement('span');
    messageElement.className = 'dynamic-alert-message';
    messageElement.textContent = message;

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.className = 'dynamic-alert-close';
    closeButton.innerHTML = '×'; // 使用 HTML entity for cross

    // 将消息和按钮添加到警告元素中
    alertElement.appendChild(messageElement);
    alertElement.appendChild(closeButton);

    // 将新的警告元素添加到容器中 (添加到末尾，视觉上在最下方)
    container.appendChild(alertElement);

    // 关闭函数
    const closeAlert = () => {
        // 添加淡出动画 (可选)
        alertElement.style.opacity = '0';
        alertElement.style.transition = 'opacity 0.3s ease-out';
        // 动画结束后移除元素
        setTimeout(() => {
            if (alertElement.parentNode === container) { // 检查是否已被移除
                 container.removeChild(alertElement);
            }
        }, 300); // 300ms 与 transition 时间匹配
    };

    // 点击关闭按钮时关闭
    closeButton.addEventListener('click', closeAlert);

    // 3秒后自动关闭
    const autoCloseTimeout = setTimeout(closeAlert, 3000);

    // 清除定时器，如果按钮被点击 (可选，避免冗余调用)
    closeButton.addEventListener('click', () => clearTimeout(autoCloseTimeout));
}

// 自定义确认弹窗函数
function customConfirm(message, buttonConfig = {}) {
    console.log('[customConfirm] Called with message:', message, 'Config:', buttonConfig);
    return new Promise((resolve) => {
        const confirmDialog = document.getElementById('customConfirm');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmYes = document.getElementById('confirmYes');
        const confirmNo = document.getElementById('confirmNo');

        if (!confirmDialog || !confirmMessage || !confirmYes || !confirmNo) {
            console.error('[customConfirm] ERROR: Cannot find one or more dialog elements!');
            resolve(false);
            return;
        }
        console.log('[customConfirm] Dialog element found. Current display:', confirmDialog.style.display);

        confirmMessage.textContent = message;

        // 设置按钮文本
        confirmYes.textContent = buttonConfig.yesText || '是';
        confirmNo.textContent = buttonConfig.noText || '否';

        // 控制"否"按钮的显示
        if (buttonConfig.showNoButton === false) {
            confirmNo.style.display = 'none';
            console.log('[customConfirm] Hiding No button.');
        } else {
            confirmNo.style.display = ''; // 恢复默认显示 (或 'inline-block', 'block' 等，取决于按钮基础样式)
             console.log('[customConfirm] Showing No button.');
        }

        // 移除旧监听器
        const newConfirmYes = confirmYes.cloneNode(true);
        confirmYes.parentNode.replaceChild(newConfirmYes, confirmYes);
        const newConfirmNo = confirmNo.cloneNode(true);
        confirmNo.parentNode.replaceChild(newConfirmNo, confirmNo);

        // 重新绑定事件
        newConfirmYes.onclick = () => {
            console.log('[customConfirm] Yes/Confirm clicked.');
            confirmDialog.style.display = 'none';
            resolve(true);
        };

        // 只有在显示"否"按钮时才绑定其事件
        if (buttonConfig.showNoButton !== false) {
            newConfirmNo.onclick = () => {
                console.log('[customConfirm] No clicked.');
                confirmDialog.style.display = 'none';
                resolve(false);
            };
        }

        // 显示弹窗
        confirmDialog.style.display = 'flex';
        console.log('[customConfirm] Set display to flex. New display:', confirmDialog.style.display);
    });
}

// 初始化游戏
function initGame() {
    const startingFloorInput = document.getElementById('startingFloor');
    let startingFloor = 1;
    if (startingFloorInput && startingFloorInput.value) {
        startingFloor = parseInt(startingFloorInput.value) || 1;
        if (startingFloor < 1) {
             showAlert('起始楼层不能小于1，已重置为1。');
             startingFloor = 1;
             if(startingFloorInput) startingFloorInput.value = '1'; // 同步输入框
        }
        // 移除对特定楼层(1,4,7)的限制
    }
    gameState = {
        score: Math.floor(Math.random() * 23) + 5,
        currentFloor: 1, // 内部楼层始终从 1 开始
        maxFloor: 1,     // 内部最大楼层也从 1 开始
        startingFloor: startingFloor, // 存储用户选择的显示起始楼层
        gamePhase: 'initial',
        clothing: { '上衣': false, '长裤': false, '内裤': false, '白袜': false, '护膝': false },
        currentTask: null,
        tasksCompleted: 0,
        tasksCompletedInPhase: { A: 0, B: 0, C: 0 },
        currentPhase: 'A', // 内部阶段始终从 A 开始
        inventory: { 'skip': 0, 'restore': 0 },
        assignedClimbingTask: null,
        eighthFloorFirstTaskCompleted: false,
        hasBoughtRestore: false,
        progressStepsCompleted: 0 // 初始化
    };
    saveGameState();
    console.log(`[Init Game] Game initialized, starting from display floor ${startingFloor}, internal floor ${gameState.currentFloor}, internal phase ${gameState.currentPhase}.`);
    generateNewTask();
    updateGameStatus();
}

// 保存游戏状态到localStorage
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// 从localStorage加载游戏状态
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        gameState = JSON.parse(savedState);
        if (!gameState.gamePhase) {
             if(gameState.currentFloor === 0 || gameState.currentFloor === undefined) gameState.gamePhase = 'initial';
             else gameState.gamePhase = 'adventure';
             console.warn("[Load Game] Old save format detected, guessing gamePhase:", gameState.gamePhase);
        }
         if (gameState.startingFloor === undefined) gameState.startingFloor = 1;
        // 处理旧存档缺少 progressStepsCompleted 的情况
        if (gameState.progressStepsCompleted === undefined) {
            gameState.progressStepsCompleted = 0;
            console.warn('[Load Game] Initializing missing progressStepsCompleted to 0.');
        }
        console.log('[Load Game] Game state loaded:', gameState);
        updateGameStatus();
        return true;
    }
    return false;
}

// 更新分数显示 (需要更新选择器以匹配新的HTML结构)
function updateScore() {
    const scoreElements = document.querySelectorAll('#currentScore, #shopScore, #endScore');
    scoreElements.forEach(element => {
        if (element) element.textContent = gameState.score;
    });
}

// 计算实际显示的楼层号
function getDisplayFloor(internalFloor) {
    return internalFloor + gameState.startingFloor - 1;
}

// 更新楼层显示
function updateFloor() {
    const floorElement = document.getElementById('currentFloor');
    if (floorElement) {
        const displayFloor = getDisplayFloor(gameState.currentFloor);
        floorElement.textContent = displayFloor;
    }
}

// 更新衣物状态显示 (需要在游戏区域内)
function updateClothingStatus() {
    const clothingItemsContainer = document.getElementById('clothingItems');
    if (!clothingItemsContainer) return;

    Object.entries(gameState.clothing).forEach(([itemName, isWorn]) => {
        let itemElement = clothingItemsContainer.querySelector(`.clothing-item[data-item="${itemName}"]`);
        if (!itemElement) { // 如果元素不存在则创建
            itemElement = document.createElement('div');
            itemElement.classList.add('clothing-item');
            itemElement.dataset.item = itemName;
            itemElement.textContent = itemName;
            clothingItemsContainer.appendChild(itemElement);
        }
        if (isWorn) {
            itemElement.classList.remove('removed');
        } else {
            itemElement.classList.add('removed');
        }
    });
}

// 生成新任务
function generateNewTask() {
    console.log(`[Generate Task] Called. Floor: ${gameState.currentFloor}`);

    let taskPool = [];
    let taskPhase = '';

    // 根据当前楼层确定任务阶段和任务池
    if (gameState.currentFloor === 1 || gameState.currentFloor === 2) {
        taskPool = tasks['A'];
        taskPhase = 'A';
    } else if (gameState.currentFloor === 4 || gameState.currentFloor === 5) {
        taskPool = tasks['B'];
        taskPhase = 'B';
    } else if (gameState.currentFloor === 7) {
        taskPool = tasks['C'];
        taskPhase = 'C';
    } else if (gameState.currentFloor === 8) {
        // 8层特殊处理：如果当前没有任务，生成第一个任务；如果已有任务，生成第二个任务
        if (!gameState.currentTask) {
            taskPool = tasks['C'];
            taskPhase = 'C';
        } else {
            // 如果已经有任务，生成第二个任务
            taskPool = tasks['C'];
            taskPhase = 'C';
            // 确保第二个任务与第一个不同
            let newTask;
            do {
                const randomIndex = Math.floor(Math.random() * taskPool.length);
                newTask = taskPool[randomIndex];
            } while (newTask.id === gameState.currentTask.id);
            gameState.currentTask = newTask;
            // 显示任务信息
            const taskElement = document.getElementById('currentTask');
            if (taskElement) {
                taskElement.innerHTML = `
                    <span class="task-name">${newTask.name}</span>
                    <p class="task-description-text">${newTask.description}</p>
                `;
            }
            updateGameStatus();
            saveGameState();
            return;
        }
    } else {
        // 其他未指定楼层 不生成任务
        console.log(`[Generate Task] Floor ${gameState.currentFloor} not configured for task generation. Clearing current task.`);
        gameState.currentTask = null;
        const taskElement = document.getElementById('currentTask');
        if (taskElement) taskElement.innerHTML = '<span class="task-name text-center">等待前往下一楼层</span>'; 
        updateGameStatus();
        return;
    }

    console.log(`[Generate Task] Floor ${gameState.currentFloor}, using Task Pool ${taskPhase}. Pool size: ${taskPool.length}`);

    // 如果任务池为空
    if (!taskPool || taskPool.length === 0) {
        console.error(`[Generate Task ERROR] No tasks available in pool ${taskPhase} for floor ${gameState.currentFloor}.`);
        gameState.currentTask = null;
        const taskElement = document.getElementById('currentTask');
         if (taskElement) taskElement.innerHTML = '<span class="task-name text-center">错误：此阶段无可用任务！</span>';
        updateGameStatus();
        return;
    }

    // 从任务池中随机选择一个任务 (仍未处理重复)
    const randomIndex = Math.floor(Math.random() * taskPool.length);
    const newTask = taskPool[randomIndex];
    gameState.currentTask = newTask;
    console.log('[Generate Task DEBUG] New task object generated:', JSON.stringify(newTask));

    // 显示任务信息 (使用 innerHTML 分行显示)
    const taskElement = document.getElementById('currentTask');
    if (taskElement) {
        taskElement.innerHTML = `
            <span class="task-name">${newTask.name}</span>
            <p class="task-description-text">${newTask.description}</p>
        `;
        console.log('[Generate Task DEBUG] Updated #currentTask innerHTML.');
    } else {
        console.error('[Generate Task ERROR] Cannot find #currentTask element to display task!');
    }

    // 更新游戏状态 (按钮显示等)
    updateGameStatus();
    saveGameState(); // 保存新任务状态
    console.log('[Generate Task] Game state updated and saved with new task.');
}

// 计算任务得分
function calculateTaskScore() {
    if (!gameState.currentTask) return 0; // 安全检查
    let baseScore = gameState.currentTask.baseScore || 0;
    let clothingBonus = 0;
    
    // 定义计算羞耻加分的关键衣物
    const keyClothingItems = ['上衣', '长裤', '内裤', '白袜'];
    
    // 计算穿着的关键衣物件数
    let wornCount = 0;
    for (const item of keyClothingItems) {
        if (gameState.clothing[item]) {
            wornCount++;
        }
    }
    
    // 根据穿着件数计算羞耻加分 (总共4件，少穿一件+1分)
    clothingBonus = keyClothingItems.length - wornCount; 

    console.log(`得分计算: 基础分=${baseScore}, 羞耻加分=${clothingBonus} (穿着 ${wornCount}/${keyClothingItems.length} 件关键衣物)`, "穿着状态:", gameState.clothing);
    return baseScore + clothingBonus;
}

// 使用恢复衣物券
function useRestoreVoucher() {
    console.log("[Use Restore] Attempting to use restore voucher.");
    if (gameState.inventory.restore <= 0) {
        showAlert("你没有恢复内裤券！");
        console.log("[Use Restore] Failed: No restore vouchers.");
        return;
    }

    // 检查内裤是否已穿着
    if (gameState.clothing['内裤']) {
        showAlert("你已经穿着内裤，无需恢复！");
        console.log("[Use Restore] Failed: Underwear already worn.");
        return;
    }

    // 恢复内裤
    gameState.clothing['内裤'] = true;
    gameState.inventory.restore--;

    console.log("[Use Restore] Restored underwear.");
    showAlert("已使用恢复内裤券，恢复了内裤！");

    // 更新界面
    updateClothingStatus();
    updateInventory();
    saveGameState();
}

// 更新库存显示
function updateInventory() {
    const inventoryDiv = document.getElementById('inventory');
    inventoryDiv.innerHTML = ''; // 清空现有内容
    
    // 检查是否有任何库存
    let hasAnyInventory = false;
    
    // 显示跳过任务券库存
    if (gameState.inventory.skip > 0) {
        hasAnyInventory = true;
        const skipItem = document.createElement('div');
        skipItem.className = 'inventory-item';
        skipItem.innerHTML = `
            <span>跳过任务券 (x${gameState.inventory.skip})</span>
            <button class="use-button" onclick="skipTask()">使用</button> 
        `;
        inventoryDiv.appendChild(skipItem);
    }
    
    // 显示恢复内裤券库存
    if (gameState.inventory.restore > 0) {
        hasAnyInventory = true;
        const restoreItem = document.createElement('div');
        restoreItem.className = 'inventory-item';
        restoreItem.innerHTML = `
            <span>恢复内裤券</span>
            <button class="use-button" onclick="useRestoreVoucher()">使用</button>
        `;
        inventoryDiv.appendChild(restoreItem);
    }
    
    // 如果没有任何库存，显示"无"
    if (!hasAnyInventory) {
        const noInventory = document.createElement('div');
        noInventory.className = 'inventory-item';
        noInventory.textContent = '无';
        inventoryDiv.appendChild(noInventory);
    }
}

// 更新游戏状态
function updateGameStatus() {
    console.log('[Update Status - Start] State:', JSON.stringify({ 
        currentFloor: gameState.currentFloor, 
        currentTask: gameState.currentTask, 
        gamePhase: gameState.gamePhase,
        assignedClimbingTask: gameState.assignedClimbingTask 
    }));
    updateScore();
    updateFloor();
    updateClothingStatus();
    updateInventory();
    updateShopButtons();
    updateProgressBar();

    const nextFloorButton = document.getElementById('nextFloor');
    const completeTaskButton = document.getElementById('completeTask');
    const confirmClimbingButton = document.getElementById('confirmClimbing');
    const forfeitGameButton = document.getElementById('forfeitGame'); // 获取放弃按钮
    const taskElement = document.getElementById('currentTask');

    // 重置游戏控制按钮状态 (不包括 forfeitGameButton)
    nextFloorButton.style.display = 'none';
    completeTaskButton.style.display = 'none';
    confirmClimbingButton.style.display = 'none';
    nextFloorButton.textContent = '前往下一层'; // 重置文本

    // 根据游戏阶段控制 forfeitGameButton 的显示
    if (gameState.gamePhase === 'adventure') {
        forfeitGameButton.style.display = 'inline-block'; // 在冒险阶段显示放弃按钮

        // 控制其他游戏按钮的逻辑...
        if (gameState.assignedClimbingTask) {
            // 状态1: 已分配上楼任务，等待确认
            confirmClimbingButton.style.display = 'inline-block';
            console.log("[Update Status] Climbing task pending confirmation.");
        } else if (gameState.currentTask) {
            // 状态2: 有普通任务
            completeTaskButton.style.display = 'inline-block';
            console.log("[Update Status] Task found, showing Complete Task button.");
        } else {
            console.log(`[Update Status - Check Floor] Floor: ${gameState.currentFloor}, Task: ${gameState.currentTask}, Climbing Task: ${gameState.assignedClimbingTask}`);
            if ([2, 5, 8].includes(gameState.currentFloor)) { // 3. On climbing decision floor?
                nextFloorButton.style.display = 'inline-block';
                nextFloorButton.textContent = '获取上楼方式';
                // console.log(`[Update Status] On floor ${gameState.currentFloor}, show '获取上楼方式' button.`);
            } else if ([1, 4, 7].includes(gameState.currentFloor)) { // 4. On task completion floor (task is null)?
                console.log('[Update Status - Branch 1/4/7] Condition met. Setting button visible.'); // <--- Add this log
                nextFloorButton.style.display = 'inline-block';
                nextFloorButton.textContent = '前往下一层'; // This text is already default, but explicit is fine.
                // console.log(`[Update Status] On floor ${gameState.currentFloor}, show '前往下一层' button. Button display: ${nextFloorButton.style.display}`);
            }
        }
    } else {
        // 其他情况 (商店, 结束, 开始) - 隐藏放弃按钮
        forfeitGameButton.style.display = 'none';
        console.log("[Update Status] Not in adventure phase, hiding control buttons and forfeit button.");
    }
}

// 完成任务
async function completeTask() {
    if (!gameState.currentTask) {
        showAlert("当前没有任务需要完成！");
        return;
    }
    
    const currentFloor = gameState.currentFloor; // 记录完成任务时的楼层
    const wasEighthFloorFirstTask = currentFloor === 8 && !gameState.eighthFloorFirstTaskCompleted;

    // 1. 先计算并更新积分
    const scoreGained = calculateTaskScore();
    gameState.score += scoreGained;
    gameState.tasksCompleted++;
    gameState.tasksCompletedInPhase[gameState.currentPhase]++;
    updateScore(); // 立即更新积分显示
    
    // 2. 显示获得积分的信息
    showAlert(`任务完成！获得 ${scoreGained} 积分！`);
    
    // 3. 投骰子决定是否需要脱衣
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    if (diceRoll <= 3) {
        console.log("[Complete Task] Penalty roll: Force remove clothing attempt.");
        const canRemoveClothing = Object.values(gameState.clothing).some(worn => worn);

        if (canRemoveClothing) {
            const canAffordToKeep = gameState.score >= 5;
            let message = `你的运气不好，将被强制脱去一件衣物。
是否花费 5 积分保留？

当前积分：${gameState.score}`;
            // 默认按钮配置：显示两个按钮
            let buttons = {
                yesText: '花费5积分保留',
                noText: '不保留'
                // showNoButton defaults to true
            };

            if (!canAffordToKeep) {
                message = `你的运气不好，将被强制脱去一件衣物。（积分不足 5 分，无法保留）

当前积分：${gameState.score}`;
                // 积分不足时的按钮配置：只显示一个绿色的确认按钮
                buttons = {
                    yesText: '确认',
                    // noText is irrelevant as showNoButton is false
                    showNoButton: false
                };
            }

            const confirmResult = await customConfirm(message, buttons);

            if (confirmResult && canAffordToKeep) { // 注意：confirmResult 为 true 时，要么是点了保留，要么是点了确认
                gameState.score -= 5;
                showAlert("花费 5 积分保留了衣物。");
                console.log("[Complete Task] Penalty: Player spent 5 points to keep clothing.");
            } else {
                // 不保留 或 积分不足点了确认
                const removableItems = Object.entries(gameState.clothing)
                    .filter(([item, isWorn]) => isWorn)
                    .map(([item]) => item);
                
                if (removableItems.length > 0) {
                    const randomIndex = Math.floor(Math.random() * removableItems.length);
                    const itemToRemove = removableItems[randomIndex];
                    gameState.clothing[itemToRemove] = false;
                    showAlert(`你被迫脱去了 ${itemToRemove}！`);
                    console.log(`[Complete Task] Penalty: Player forced to remove ${itemToRemove}.`);
                } else {
                     console.warn("[Complete Task] Penalty: Logic error - should have clothing to remove but none found.");
                }
            }
        } else {
            // 没有衣物可脱，改为扣分
            console.log("[Complete Task] Penalty: No clothing to remove, deducting 5 points instead.");
            gameState.score -= 5;
            showAlert("你的运气不好！本应脱去一件衣物，但你已无可脱之物，改为扣除 5 积分！");
        }
    }

    // 检查是否完成了一个关键进度步骤 (楼层任务)
    const keyFloorTaskFloors = [1, 2, 4, 5, 7, 8]; // 包含任务的楼层
    if (keyFloorTaskFloors.includes(currentFloor)) {
        // 特殊处理8楼：第一个任务和第二个任务都算进度
        if (currentFloor === 8) {
            if (!gameState.eighthFloorFirstTaskCompleted) {
                // 完成8楼第一个任务
                gameState.progressStepsCompleted++;
                console.log(`[Progress Step] Completed floor ${currentFloor} task (1/2). Total steps: ${gameState.progressStepsCompleted}`);
            } else {
                // 完成8楼第二个任务
                gameState.progressStepsCompleted++;
                console.log(`[Progress Step] Completed floor ${currentFloor} task (2/2). Total steps: ${gameState.progressStepsCompleted}`);
            }
        } else {
            // 完成其他楼层的任务
            gameState.progressStepsCompleted++;
            console.log(`[Progress Step] Completed floor ${currentFloor} task. Total steps: ${gameState.progressStepsCompleted}`);
        }
        // 立即更新进度条以反映任务完成
        updateProgressBar();
    }

    // 处理8楼特殊逻辑 (需要在增加进度之后)
    if (wasEighthFloorFirstTask) {
         gameState.eighthFloorFirstTaskCompleted = true;
         generateNewTask(); // 生成8楼第二个任务
         saveGameState(); // 保存状态（包括增加的进度）
         updateGameStatus(); // 更新按钮等，但不改变楼层
         return; // 不继续执行后续的清空任务和楼层更新逻辑
    } else if (currentFloor === 8 && gameState.eighthFloorFirstTaskCompleted) {
         // 完成了8楼第二个任务，重置标记，继续正常流程
         gameState.eighthFloorFirstTaskCompleted = false;
    }

    // 5. 清空当前任务并更新状态 (针对非8楼第一任务完成的情况)
    gameState.currentTask = null;
    // 修改：根据楼层设置完成任务后的提示信息
    const taskElement = document.getElementById('currentTask');
    if (taskElement) {
        if ([2, 5, 8].includes(currentFloor)) {
            taskElement.innerHTML = '<span class="task-name text-center">任务完成！请点击按钮获取上楼方式</span>';
            console.log(`[Complete Task] Floor ${currentFloor}, set message to '获取上楼方式'.`);
        } else {
            taskElement.innerHTML = '<span class="task-name text-center">任务完成！请点击按钮前往下一层</span>';
            console.log(`[Complete Task] Floor ${currentFloor}, set message to '前往下一层'.`);
        }
    }
    updateGameStatus(); // 更新游戏状态，包括按钮的显示
    // Log state before saving
    console.log('[Complete Task - Pre Save] State:', JSON.stringify({ 
        currentFloor: gameState.currentFloor, 
        currentTask: gameState.currentTask, 
        gamePhase: gameState.gamePhase,
        assignedClimbingTask: gameState.assignedClimbingTask 
    }));
    saveGameState();
}

// 获取上楼方式
function getClimbingMethod() {
    const result = Math.floor(Math.random() * 6) + 1;
    let taskDesc = "";

    switch (result) {
        case 1: taskDesc = "狗姿白袜登阶: 全程狗姿，限定仅穿袜（或全裸），爬双层，脚不可着地"; break;
        case 2: taskDesc = "跪姿上楼法: 每上一级台阶膝盖至少落地1次（护膝强烈推荐）完成2层"; break;
        case 3: taskDesc = "叼着内裤勃起上楼: 将内裤脱下咬嘴中，同时丁丁全裸露头完整走2层"; break;
        case 4: taskDesc = "裤跨肩上（裤当披风）: 脱裤挂脖全裸上下体，每阶可选择爬or站，但视角均暴露"; break;
        case 5: taskDesc = "一次边撸边爬挑战: 边边缘、边爬2层，必须记录视频或射前自拍"; break;
        case 6: taskDesc = "赤足龟步控制式: 赤脚慢走，每一步需停0.5秒，装丁叽震动站立模拟热鸡走状态"; break;
    }

    return { result, taskDesc };
}

// 获取结局
function getEnding() {
    const finalScore = gameState.score;
    if (finalScore >= 35) return endings.best.description;
    if (finalScore >= 25) return endings.good.description;
    if (finalScore >= 15) return endings.normal.description;
    if (finalScore >= 6) return endings.bad.description;
    return endings.worst.description;
}

// 显示特定游戏阶段的函数 (Refactored to use CSS classes)
function showSection(sectionId) {
    console.log(`[Show Section] Attempting to show: ${sectionId}`);
    let sectionFoundAndActivated = false;
    document.querySelectorAll('main > section').forEach(section => {
        if (section.id === sectionId) {
            section.classList.add('section-active');
            section.classList.remove('section-hidden'); // Optional: if using hidden class too
            sectionFoundAndActivated = true;
            console.log(`[Show Section] Activating: ${section.id}`);
        } else {
            section.classList.remove('section-active');
            section.classList.add('section-hidden'); // Optional: if using hidden class too
        }
    });

    if (!sectionFoundAndActivated) {
        console.error("[Show Section] Section not found in main:", sectionId);
        // Keep handling for elements outside main if needed (like forfeit button)
        const outsideElement = document.getElementById(sectionId);
        if (outsideElement && outsideElement.tagName === 'BUTTON') {
            console.warn(`[Show Section] Element ${sectionId} found outside main, display not handled by class logic.`);
            // Maybe manually toggle display here if needed for outside elements?
            // outsideElement.style.display = 'inline-block'; // Example
        } else if (sectionId !== 'forfeitGame') { // Avoid error for forfeit button if handled elsewhere
            console.error("[Show Section] Element not found anywhere:", sectionId);
        }
    }
    // No need to handle viewRules listener dynamically here anymore
}

// 更新商店按钮状态
function updateShopButtons() {
    const shopItems = document.querySelectorAll('#shop-section .shop-item');
    const startAdventureButton = document.getElementById('startAdventure');

    shopItems.forEach(shopItemDiv => {
        const button = shopItemDiv.querySelector('.buy-button');
        if (!button) return;

        const item = button.dataset.item;
        const price = parseInt(button.dataset.price);
        const isClothing = button.classList.contains('buy-clothing');
        const isOneTimePurchase = item === 'restore';
        const inventoryCountSpan = shopItemDiv.querySelector('#inventory-count-skip'); // 获取跳过券库存的span

        // 1. 重置按钮状态为默认
        button.disabled = false;
        button.textContent = '购买';
        if (isClothing) {
            button.style.backgroundColor = '#28a745';
        } else {
             button.style.backgroundColor = '#17a2b8';
        }

        // 2. 检查是否已拥有/已购买
        if (isClothing && gameState.clothing[item]) {
            button.disabled = true;
            button.textContent = '已拥有';
            button.style.backgroundColor = '#6c757d';
        } else if (isOneTimePurchase && gameState.hasBoughtRestore) {
             button.disabled = true;
             button.textContent = '已购买';
             button.style.backgroundColor = '#6c757d';
        }
        // 3. 如果未拥有/未购买，再检查积分是否足够
        else if (gameState.score < price && item !== 'skip') { // 其他物品积分不足
             button.disabled = true;
             button.textContent = '积分不足';
             button.style.backgroundColor = '#aaa'; // 浅灰色
        } else if (gameState.score < price && item === 'skip') { // 跳过券积分不足
             button.disabled = true;
             // 保持文本为"购买"，但变灰提示不可用
             button.style.backgroundColor = '#aaa'; // 浅灰色
        }

        // 2b. 更新跳过任务券的库存显示 (独立逻辑)
        if (item === 'skip' && inventoryCountSpan) {
            inventoryCountSpan.textContent = `已购：${gameState.inventory.skip}`;
        }

    });

    // 4. 更新开始冒险按钮状态 (单独处理)
    const hasRequiredItem = gameState.clothing['长裤'];
    startAdventureButton.disabled = !hasRequiredItem;
    if (hasRequiredItem) {
        startAdventureButton.classList.add('ready-to-start');
    } else {
        startAdventureButton.classList.remove('ready-to-start');
    }

     // 5. 更新商店积分显示 (确保在这里也更新)
    const shopScoreElement = document.getElementById('shopScore');
    if(shopScoreElement) shopScoreElement.textContent = gameState.score;
}

// 显示上楼方式信息 (永久显示，直到进入下一层)
function showClimbingMethod(method) {
    const climbingInfoElement = document.getElementById('climbingMethodInfo');
    if (climbingInfoElement) {
        climbingInfoElement.innerHTML = 
            `<h4>上楼方式 (结果: ${method.result})</h4>
             <p>${method.taskDesc}</p>`;
        climbingInfoElement.style.display = 'block';
    } else {
        console.error('上楼方式显示区域未找到');
    }
}

// 清除上楼方式信息
function clearClimbingMethod() {
    const climbingInfoElement = document.getElementById('climbingMethodInfo');
    if (climbingInfoElement) {
        climbingInfoElement.style.display = 'none';
        climbingInfoElement.innerHTML = ''; // 清空内容
    }
}

// 购买物品函数
function buyItem(item, price) {
    // 检查购买长裤的优先级
    if (!gameState.clothing['长裤'] && item !== '长裤' && gameState.score - price < 5) {
         showAlert('长裤为必购项！购买此物品后积分将不足以购买长裤，请先购买长裤。');
         return; // 阻止购买
    }

    if (gameState.score >= price) {
        if (item === 'skip') {
            gameState.inventory.skip++;
            showAlert('购买跳过任务券成功！'); // 添加成功购买跳过任务券的通知
        } else if (item === 'restore') {
            gameState.inventory.restore++;
            gameState.hasBoughtRestore = true; // 标记已购买
        } else {
            gameState.clothing[item] = true;
        }
        gameState.score -= price;
        updateScore();
        updateShopButtons();
        updateInventory();
        if (item === '长裤') {
            const startAdventureButton = document.getElementById('startAdventure');
            startAdventureButton.disabled = false;
            startAdventureButton.classList.add('ready-to-start');
        }
        document.getElementById('shopScore').textContent = gameState.score;
        saveGameState(); // 保存游戏状态
    } else {
        showAlert('积分不足');
    }
}

// 跳过任务
async function skipTask() {
    if (!gameState.currentTask) {
        showAlert('当前没有任务可以跳过！');
        return;
    }

    if (gameState.inventory.skip > 0) {
        const useSkip = await customConfirm('是否使用跳过任务券？');
        if (useSkip) {
            gameState.inventory.skip--;
            showAlert('已使用跳过任务券！');
            gameState.currentTask = null;
            updateGameStatus();
            saveGameState();
        }
    } else if (gameState.score >= 6) {
        const usePoints = await customConfirm('是否花费6积分跳过任务？');
        if (usePoints) {
            gameState.score -= 6;
            showAlert('已花费6积分跳过任务！');
            gameState.currentTask = null;
            updateGameStatus();
            saveGameState();
        }
    } else {
        showAlert('积分不足且没有跳过任务券！');
    }
}

// 开始冒险
async function startAdventure() {
    // 检查是否有必需的物品（长裤）
    if (!gameState.clothing['长裤']) {
        showAlert('必须购买长裤才能开始冒险！');
        return;
    }
    
    console.log('开始冒险');
    gameState.gamePhase = 'adventure'; // 标记为冒险阶段
    saveGameState(); // 保存状态变化
    
    generateNewTask();
    showSection('game-section');
}

// 显示上楼任务选择界面 (新增/恢复)
function showClimbingTaskSelection() {
    const currentFloor = gameState.currentFloor;
    console.log(`[Show Climbing DEBUG] Function called on floor ${currentFloor}.`);
    if (![2, 5, 8].includes(currentFloor)) {
        console.error("[Show Climbing] ERROR: Called on incorrect floor.");
        return;
    }
    
    // 为了用户体验，这里使用指定的上楼方式
    const climbingTask = {
        name: '披风上楼',
        description: '裤子挂在脖子上，全裸往上2楼。可自由选择爬or走。'
    };
    
    // 保存到游戏状态
    gameState.assignedClimbingTask = climbingTask;
    saveGameState();
    
    // 隐藏"前往下一层"按钮，显示上楼信息和确认按钮
    const nextFloorButton = document.getElementById('nextFloor');
    if (nextFloorButton) {
        nextFloorButton.style.display = 'none';
        console.log("[Show Climbing DEBUG] nextFloor button hidden.");
    } else {
        console.error("[Show Climbing ERROR] Cannot find nextFloor button!");
    }
    
    // 将上楼方式显示在任务区域，使用与任务相同的格式
    const currentTaskElement = document.getElementById('currentTask');
    if (currentTaskElement) {
        currentTaskElement.innerHTML = `
            <span class="task-name">${climbingTask.name}</span>
            <p class="task-description-text">${climbingTask.description}</p>
        `;
        console.log("[Show Climbing DEBUG] Task area updated with climbing info.");
    }
    
    // 隐藏原来的climbingInfo区域，因为现在直接在任务区域显示
    const climbingInfoDiv = document.getElementById('climbingInfo');
    if (climbingInfoDiv) {
        climbingInfoDiv.style.display = 'none';
    }
    
    const confirmButton = document.getElementById('confirmClimbing');
    if (confirmButton) {
        confirmButton.style.display = 'block';
        console.log("[Show Climbing DEBUG] confirmClimbing button shown.");
    } else {
         console.error("[Show Climbing] ERROR: Cannot find #confirmClimbing button!");
    }
}

// 新增：保存游戏记录到历史
function saveGameToHistory() {
    const now = new Date();
    const timestamp = now.toLocaleString(); // 获取本地化的日期时间字符串
    const adjustedMaxFloor = getDisplayFloor(gameState.maxFloor); // 使用辅助函数获取显示楼层
    
    const currentGameResult = {
        timestamp: timestamp,
        finalScore: gameState.score,
        maxFloor: adjustedMaxFloor, // 使用调整后的楼层
        tasksCompleted: gameState.tasksCompleted,
        remainingClothes: Object.values(gameState.clothing).filter(Boolean).length,
        ending: getEnding() // 调用函数获取结局描述
    };

    // 加载现有历史
    loadHistory(); 
    // 添加新记录到最前面
    gameHistory.unshift(currentGameResult); 
    // 限制历史记录数量 (可选, 例如只保留最近10条)
    if (gameHistory.length > 10) {
        gameHistory.pop(); // 移除最旧的记录
    }
    // 保存回 localStorage
    try {
        localStorage.setItem('staircaseGameHistory', JSON.stringify(gameHistory));
        console.log('[History] Game history saved to localStorage.');
    } catch (e) {
        console.error('[History] Failed to save game history:', e);
    }
}

// 新增：从 localStorage 加载历史记录
function loadHistory() {
    try {
        const historyData = localStorage.getItem('staircaseGameHistory');
        if (historyData) {
            gameHistory = JSON.parse(historyData);
             console.log('[History] Game history loaded from localStorage.');
        } else {
            gameHistory = []; // 如果没有历史记录，确保是空数组
             console.log('[History] No saved game history found.');
        }
    } catch (e) {
        console.error('[History] Failed to load game history:', e);
        gameHistory = []; // 加载失败也置为空数组
    }
}

// 新增：显示历史记录
function displayHistory() {
    loadHistory(); // 确保加载最新的历史记录
    const historyListDiv = document.getElementById('historyList');
    historyListDiv.innerHTML = ''; // 清空旧内容

    if (gameHistory.length === 0) {
        historyListDiv.innerHTML = '<p>暂无历史记录。</p>';
        return;
    }

    gameHistory.forEach(record => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <p class="timestamp">${record.timestamp}</p>
            <p><strong>最终得分:</strong> ${record.finalScore}</p>
            <p><strong>最高楼层:</strong> ${record.maxFloor}</p>
            <p><strong>完成任务:</strong> ${record.tasksCompleted}</p>
            <p><strong>剩余衣物:</strong> ${record.remainingClothes}</p>
            <p><strong>结局:</strong> ${record.ending}</p>
        `;
        historyListDiv.appendChild(historyItem);
    });
    console.log(`[History] Displayed ${gameHistory.length} history records.`);
}

// 新增：单独设置结束和历史按钮的事件监听
function setupEndAndHistoryButtons() {
    const restartButton = document.getElementById('restartGame');
    if (restartButton) {
        // 先移除旧监听器，避免重复绑定
        restartButton.replaceWith(restartButton.cloneNode(true));
        document.getElementById('restartGame').addEventListener('click', () => {
            console.log('[Restart Game] Clicked.');
            // 修改：清除本地存储，显示开始界面，但不调用 initGame()
            localStorage.removeItem('gameState');
            // initGame(); // <-- 移除这一行
            showSection('start-section'); // 显示开始界面
        });
    }

    const viewHistoryButton = document.getElementById('viewHistory');
    if (viewHistoryButton) {
        // 先移除旧监听器
        viewHistoryButton.replaceWith(viewHistoryButton.cloneNode(true));
        document.getElementById('viewHistory').addEventListener('click', () => {
            console.log('[View History] Clicked.');
            displayHistory(); // 加载并显示历史
            showSection('history-section'); // 显示历史记录界面
        });
    }

    const backFromHistoryButton = document.getElementById('backFromHistory');
    if (backFromHistoryButton) {
        // 先移除旧监听器
        backFromHistoryButton.replaceWith(backFromHistoryButton.cloneNode(true));
        document.getElementById('backFromHistory').addEventListener('click', () => {
            console.log('[Back From History] Clicked.');
            showSection('end-section'); // 返回结束界面
        });
    }
}

function updateProgressBar() {
    const progressBarFill = document.getElementById('progressBar');
    const progressSection = document.getElementById('progress-section');
    if (!progressBarFill || !progressSection) return;

    // 使用完成的步骤数计算进度
    let progressPercent = Math.min(100, (gameState.progressStepsCompleted / TOTAL_PROGRESS_STEPS) * 100);

    // 游戏结束时强制100%
    if (gameState.gamePhase === 'ended') progressPercent = 100;

    progressBarFill.style.width = `${progressPercent}%`;

    if (gameState.gamePhase === 'adventure' || gameState.gamePhase === 'ended') {
         progressSection.style.display = 'block';
    } else {
         progressSection.style.display = 'none';
    }
    console.log(`[Progress Bar] Updated: Steps=${gameState.progressStepsCompleted}/${TOTAL_PROGRESS_STEPS}, Percent=${progressPercent.toFixed(1)}%`);
}

// 新增：结束游戏函数
function endGame(reason = "游戏结束！") { // 添加默认原因
    console.log(`[End Game] Triggered. Reason: ${reason}`);
    gameState.gamePhase = 'ended';
    saveGameState();

    // 更新结束界面信息
    document.getElementById('endScore').textContent = gameState.score;
    document.getElementById('maxFloorEnd').textContent = getDisplayFloor(gameState.maxFloor);
    document.getElementById('tasksCompletedEnd').textContent = gameState.tasksCompleted;
    document.getElementById('remainingClothesEnd').textContent = Object.values(gameState.clothing).filter(Boolean).length;
    document.getElementById('endingDescription').textContent = getEnding();

    showSection('end-section');
    updateGameStatus(); // 确保进度条等更新到结束状态
    saveGameToHistory(); // 保存游戏结果到历史
    setupEndAndHistoryButtons(); // 重新绑定结束和历史按钮事件
    showAlert(reason); // 使用 showAlert 显示结束原因
}

// 修改 confirmClimbing 调用 endGame
document.getElementById('confirmClimbing').addEventListener('click', () => {
    const previousFloor = gameState.currentFloor;
    console.log(`[Confirm Climbing] Clicked on floor ${previousFloor}.`);
    if (![2, 5, 8].includes(previousFloor)) {
         console.error("[Confirm Climbing] ERROR: Clicked on incorrect floor.");
         return;
    }

    // 确认爬楼，增加进度步骤 (移动到这里，在判断结束前)
    gameState.progressStepsCompleted++;
    console.log(`[Progress Step] Confirmed climbing task. Total steps: ${gameState.progressStepsCompleted}`);
    // 立即更新进度条
    updateProgressBar();

    let nextFloorValue = 0;
    if (previousFloor === 2) nextFloorValue = 4;
    else if (previousFloor === 5) nextFloorValue = 7;
    else if (previousFloor === 8) nextFloorValue = 10;
    console.log(`[Confirm Climbing] Transitioning from ${previousFloor} to ${nextFloorValue}`);
    gameState.currentFloor = nextFloorValue;
    gameState.assignedClimbingTask = null; // 清除已分配的上楼任务
    if (gameState.currentFloor > gameState.maxFloor) {
        gameState.maxFloor = gameState.currentFloor;
        console.log(`[Confirm Climbing] Max floor updated to: ${gameState.maxFloor}`);
    }
    // 移除旧的 climbingInfo 显示逻辑 (已合并到 updateGameStatus)
    // const climbingInfoDiv = document.getElementById('climbingInfo');
    // if (climbingInfoDiv) climbingInfoDiv.style.display = 'none';
    // const confirmClimbingButton = document.getElementById('confirmClimbing');
    // if (confirmClimbingButton) confirmClimbingButton.style.display = 'none';
    updateFloor(); // 只需要更新楼层数字显示

    // 修改：检查是否到达或超过结束楼层
    if (gameState.currentFloor >= TOTAL_FLOORS_FOR_PROGRESS) { 
        endGame(`到达顶层 ${getDisplayFloor(TOTAL_FLOORS_FOR_PROGRESS)}！游戏结束！`); // 调用 endGame
    } else {
        // 游戏未结束，生成新任务并更新状态
        generateNewTask();
        updateGameStatus(); // 更新按钮和任务显示
        saveGameState();
        console.log(`[Confirm Climbing] Moved to floor ${gameState.currentFloor}. Generated new task and updated status.`);
    }
});

// 新增：分配随机上楼任务函数
function assignClimbingTask() {
    const currentFloor = gameState.currentFloor;
    if (![2, 5, 8].includes(currentFloor)) {
        console.error("[Assign Climbing Task] Called on wrong floor:", currentFloor);
        return;
    }

    const availableTasks = tasks['上楼任务'];
    const randomIndex = Math.floor(Math.random() * availableTasks.length);
    const selectedTask = availableTasks[randomIndex];

    let targetFloor = 0;
    if (currentFloor === 2) targetFloor = 4;
    else if (currentFloor === 5) targetFloor = 7;
    else if (currentFloor === 8) targetFloor = 10;

    gameState.assignedClimbingTask = { ...selectedTask, targetFloor: targetFloor };
    console.log(`[Assign Climbing Task] Assigned: ${selectedTask.name} (Target: ${targetFloor})`);

    // **** 新增：更新任务区域显示上楼任务 ****
    const taskElement = document.getElementById('currentTask');
    if (taskElement) {
        taskElement.innerHTML = `
            <span class="task-name text-center">上楼方式：${gameState.assignedClimbingTask.name}</span>
            <p class="task-description-text text-center">${gameState.assignedClimbingTask.description}</p>
        `;
        console.log('[Assign Climbing Task] Updated task area with climbing info.');
    } else {
        console.error('[Assign Climbing Task] ERROR: Cannot find #currentTask element!');
    }
    // **** 结束新增 ****

    // 更新UI以显示待确认的任务
    updateGameStatus();
    saveGameState(); // 保存分配的任务
}

// 仅处理从普通任务楼层（1, 4, 7）前进到下一楼层（2, 5, 8）
function nextFloor() {
    const currentFloor = gameState.currentFloor;
    console.log(`[Next Floor Function] Called. Internal floor: ${currentFloor}.`);

    let nextFloor = currentFloor;
    if (currentFloor === 1) nextFloor = 2;
    else if (currentFloor === 4) nextFloor = 5;
    else if (currentFloor === 7) nextFloor = 8;
    else {
        console.error(`[Next Floor Function] Error: Called on unexpected internal floor ${currentFloor}.`);
        showAlert("内部逻辑错误：尝试在非预期楼层前进。");
        return;
    }

    console.log(`[Next Floor Function] Moving from internal floor ${currentFloor} to ${nextFloor}.`);
    gameState.currentFloor = nextFloor;
    updateFloor(); // 更新显示的楼层
    updateProgressBar(); // 更新进度条
    
    // 到达 2, 5, 8 楼后，应该生成该楼层的任务
    console.log(`[Next Floor Function] Arrived at internal floor ${nextFloor}, generating task for this floor.`);
    generateNewTask(); // <--- 修改点：调用 generateNewTask 获取新任务
    
    saveGameState();
    updateGameStatus(); // 更新按钮状态等 (应该会显示 completeTask 按钮)
}

// 定义 viewRules 按钮的处理函数 (现在由委托处理)
/* function handleViewRulesClick() { ... } */

// 定义 backToStart 按钮的处理函数 (保持不变)
function handleBackToStartClick() {
    console.log('[Back To Start Button] Clicked! (Using named handler)');
    showSection('start-section');
}

// 初始化整个应用程序
function initializeApp() {
    console.log('[Initialize App] Function called!');
    console.log('Initializing application...');

    const loaded = loadGameState();

    if (loaded) {
        console.log('Game state loaded from localStorage.');
        // 优先处理游戏结束状态
        if (gameState.gamePhase === 'ended') {
            console.log('Loaded state indicates game ended. Activating end section.');
            document.getElementById('endScore').textContent = gameState.score;
            document.getElementById('maxFloorEnd').textContent = getDisplayFloor(gameState.maxFloor);
            document.getElementById('tasksCompletedEnd').textContent = gameState.tasksCompleted;
            document.getElementById('remainingClothesEnd').textContent = Object.values(gameState.clothing).filter(Boolean).length;
            document.getElementById('endingDescription').textContent = getEnding();
            showSection('end-section'); // Use showSection to handle class
            setupEndAndHistoryButtons();
            return;
        }
        // 处理游戏进行中状态
        if (gameState.gamePhase === 'adventure') {
            console.log(`Loaded state indicates game in adventure phase. Activating game section.`);
            updateScore();
            updateFloor();
            updateClothingStatus();
            updateInventory();
            updateGameStatus();
            showSection('game-section'); // Use showSection to handle class
        } else if (gameState.gamePhase === 'shop') { // 新增：明确处理商店状态
            console.log(`Loaded state indicates game in shop phase. Activating shop section.`);
            updateScore(); // 确保分数显示正确
            updateInventory(); // 确保库存和按钮状态正确
            showSection('shop-section'); // 显示商店界面
        } else {
            // 其他所有状态 -> 显示开始界面
            console.log(`Loaded state phase is '${gameState.gamePhase}' or invalid. Activating start section.`);
            showSection('start-section'); // Use showSection to handle class
        }
    } else {
        // 没有找到保存的状态 -> 显示开始界面
        console.log('No saved game state found. Activating start section.');
        showSection('start-section'); // Use showSection to handle class
    }

    // --- 事件监听器设置 ---
    // 'startGame' 按钮监听器 (代码保持不变)
    document.getElementById('startGame').addEventListener('click', () => {
        console.log('点击开始游戏');
        initGame(); // 在这里初始化游戏并随机分数
        gameState.gamePhase = 'shop';
        saveGameState();
        updateShopButtons();
        updateScore();
        showSection('shop-section');
    });

    // 移除 viewRules 的直接监听器
    /*
    const viewRulesButton = document.getElementById('viewRules');
    if (viewRulesButton) {
        viewRulesButton.disabled = false;
        viewRulesButton.addEventListener('click', handleViewRulesClick);
        console.log('[Initialize App] Event listener attached directly to #viewRules button.');
    } else {
        console.error('[Initialize App] #viewRules button not found!');
    }
    */

    // 最简单的 backToStart 监听器设置 (保持不变)
    const backToStartButton = document.getElementById('backToStart');
    if (backToStartButton) {
        backToStartButton.disabled = false;
        backToStartButton.removeEventListener('click', handleBackToStartClick); // 保留移除
        backToStartButton.addEventListener('click', handleBackToStartClick);
         console.log('[Initialize App] Event listener attached directly to #backToStart button.');
    } else {
        console.error('[Initialize App] #backToStart button not found!');
    }

    // 新增：使用事件委托处理 start-actions 内的点击
    const startActionsContainer = document.querySelector('.start-actions');
    if (startActionsContainer) {
        startActionsContainer.addEventListener('click', (event) => {
            console.log('[Start Actions Delegate] Click detected inside container. Target:', event.target);
            // 检查被点击的是否是 viewRules 按钮
            if (event.target && event.target.id === 'viewRules') {
                console.log('[Start Actions Delegate] #viewRules button click delegated!');
                showSection('rules-section');
            }
            // 这里可以添加对 startGame 按钮的委托处理（如果需要）
            // if (event.target && event.target.id === 'startGame') { ... }
        });
        console.log('[Initialize App] Event listener attached to .start-actions for delegation.');
    } else {
        console.error('[Initialize App] .start-actions container not found for delegation!');
    }

    // 其他按钮监听器 (viewRules, backToStart, startAdventure, completeTask, nextFloor, confirmClimbing, 商店购买按钮) (代码保持不变)
    const startAdventureButton = document.getElementById('startAdventure');
    if(startAdventureButton) startAdventureButton.addEventListener('click', startAdventure);
    document.getElementById('completeTask').addEventListener('click', completeTask);
    document.getElementById('nextFloor').addEventListener('click', () => {
        const buttonText = document.getElementById('nextFloor').textContent;
        if (buttonText === '获取上楼方式') {
            assignClimbingTask();
        } else if (buttonText === '前往下一层') {
            nextFloor();
        } else {
            console.warn("[Next Floor Button] Unknown button text:", buttonText);
        }
    });

    const buyButtons = document.querySelectorAll('#shop-section .buy-button');
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.dataset.item;
            const price = parseInt(button.dataset.price);
            buyItem(item, price);
        });
    });

    // 新增：放弃挑战按钮监听器
    document.getElementById('forfeitGame').addEventListener('click', async () => {
        // Swap button text meanings: Yes (green) = Continue, No (red) = Forfeit
        const continueChallenge = await customConfirm( 
            '你确定要放弃本次挑战吗？放弃后将直接进入结局判定。',
            {
                yesText: '继续挑战', // Green button text
                noText: '确认放弃'   // Red button text
            }
        );
        // If the result is false, it means they clicked the red "确认放弃" button
        if (!continueChallenge) { 
            console.log('[Forfeit Game] Player confirmed forfeit by clicking the red button.');
            // **** 新增：在调用 endGame 前强制将分数归零 ****
            gameState.score = 0;
            console.log('[Forfeit Game] Score forced to 0.');
            // **** 结束新增 ****
            endGame('挑战已放弃！'); // Call endGame (now with score 0)
        } else {
             console.log('[Forfeit Game] Player chose to continue (clicked the green button).');
        }
    });

    // 设置结束和历史按钮 (代码保持不变)
    setupEndAndHistoryButtons();

    console.log("initializeApp complete.");
}

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    originalConsole.log('[DOM Ready - Diagnostic] Event fired.'); // Use originalConsole here in case override failed

    // ===== Debug Mode Activation Listener =====
    originalConsole.log('[DOM Ready - Diagnostic] Setting up debug listeners...');
    const gameTitle = document.getElementById('gameTitle');
    originalConsole.log('[DOM Ready - Diagnostic] gameTitle element:', gameTitle ? 'Found' : 'NOT FOUND!');

    const debugIndicator = document.getElementById('debug-mode-indicator');
    const debugTerminal = document.getElementById('debug-terminal');
    const debugOutput = document.getElementById('debug-log-output');
    const clearDebugButton = document.getElementById('clearDebugLog');
    const closeDebugButton = document.getElementById('closeDebugLog');
    const copyDebugButton = document.getElementById('copyDebugLog'); // Get the new button

    // Diagnostic: Add listener to header as well
    const headerElement = document.querySelector('header');
    if (headerElement) {
        originalConsole.log('[DOM Ready - Diagnostic] Adding listener to HEADER element.');
        headerElement.addEventListener('click', (event) => {
            originalConsole.log('[DOM Ready - Diagnostic] HEADER clicked! Target:', event.target);
        });
    } else {
        originalConsole.error('[DOM Ready - Diagnostic] Could not find HEADER element!');
    }


    if (gameTitle && debugIndicator && debugTerminal) {
        originalConsole.log('[DOM Ready - Diagnostic] Attempting to add click listener to gameTitle.');
        gameTitle.addEventListener('click', () => {
            if (debugModeActive) {
                // If already active, toggle the terminal visibility
                if (debugTerminal) {
                    debugTerminal.classList.toggle('debug-visible');
                    console.log(`[Debug Activation] Toggled terminal visibility. Visible: ${debugTerminal.classList.contains('debug-visible')}`);
                }
                return; // Don't count clicks anymore
            }

            // If not active, count clicks to activate
            titleClickCount++;
            console.log(`[Debug Activation] Title clicked ${titleClickCount}/${DEBUG_CLICKS_NEEDED} times.`);

            if (titleClickCount >= DEBUG_CLICKS_NEEDED) {
                debugModeActive = true; // <--- Set active FIRST
                console.log('--- DEBUG MODE ACTIVATED ---'); // Log activation (will now go to buffer if logged before emptying)

                // --- 新增：输出缓冲日志 ---
                originalConsole.log('[Debug Activation] Flushing log buffer...');
                const outputDiv = document.getElementById('debug-log-output');
                if (outputDiv) { // Ensure output div exists before flushing
                     logBuffer.forEach(entry => {
                         // Manually create log entry for buffered items
                         const logEntry = document.createElement('p');
                         const messageParts = [];
                         // Add timestamp to buffered logs
                         messageParts.push(`[${entry.timestamp.toLocaleTimeString()}.${entry.timestamp.getMilliseconds().toString().padStart(3,'0')}]`);
                         for (const arg of entry.args) {
                             if (typeof arg === 'object' && arg !== null) {
                                 try { messageParts.push(JSON.stringify(arg, null, 2)); } catch (e) { messageParts.push('[Unserializable Object]'); }
                             } else { messageParts.push(String(arg)); }
                         }
                         logEntry.textContent = messageParts.join(' ');
                         if (entry.type === 'warn') logEntry.classList.add('log-warn');
                         if (entry.type === 'error') logEntry.classList.add('log-error');
                         outputDiv.appendChild(logEntry);
                     });
                     // Auto-scroll after flushing
                     outputDiv.scrollTop = outputDiv.scrollHeight;
                }
                logBuffer = []; // Clear the buffer
                originalConsole.log('[Debug Activation] Log buffer flushed.');
                // --- 结束新增 ---

                debugIndicator.style.display = 'inline';
                debugTerminal.classList.add('debug-visible');
                showAlert('Debug Mode Activated!');
                // Log activation message AGAIN, this time it will definitely go to the visible terminal
                console.log('--- DEBUG MODE ACTIVATED (Terminal Ready) ---');

            }
            /*
            // Optional: Timeout reset (currently commented out)
            setTimeout(() => {
                 if (!debugModeActive) titleClickCount = 0;
            }, 1500);
            */
        });
        originalConsole.log('[DOM Ready - Diagnostic] Listener potentially added to gameTitle.');
    } else {
        originalConsole.error('[Debug Setup] Could not find title, indicator, or terminal element for debug mode.');
    }

    // Debug terminal button listeners
    originalConsole.log('[DOM Ready - Diagnostic] Setting up debug terminal button listeners...');
    if (copyDebugButton && debugOutput) { // Add listener for copy button
        originalConsole.log('[DOM Ready - Diagnostic] Found copyDebugButton and debugOutput. Adding listener.');
        copyDebugButton.addEventListener('click', () => {
            console.log('[Debug Button] Copy button clicked.');
            const logText = debugOutput.textContent;
            navigator.clipboard.writeText(logText)
                .then(() => {
                    console.log('[Debug Log] Copied to clipboard successfully.');
                    showAlert('日志已复制到剪贴板！'); // Confirmation message
                })
                .catch(err => {
                    console.error('[Debug Log] Failed to copy logs:', err);
                    showAlert('复制日志失败！请手动复制。');
                });
        });
    } else {
         originalConsole.error('[DOM Ready - Diagnostic] Could not find copyDebugButton or debugOutput!');
    }

    if(clearDebugButton && debugOutput) {
        originalConsole.log('[DOM Ready - Diagnostic] Found clearDebugButton and debugOutput. Adding listener.');
        clearDebugButton.addEventListener('click', () => {
            console.log('[Debug Button] Clear button clicked.');
            debugOutput.innerHTML = '';
            console.log('[Debug Log] Cleared.');
        });
    } else {
         originalConsole.error('[DOM Ready - Diagnostic] Could not find clearDebugButton or debugOutput!');
    }

     if(closeDebugButton && debugTerminal) {
        originalConsole.log('[DOM Ready - Diagnostic] Found closeDebugButton and debugTerminal. Adding listener.');
        closeDebugButton.addEventListener('click', () => {
            console.log('[Debug Button] Close button clicked.'); // Log inside handler
            debugTerminal.classList.remove('debug-visible');
            console.log('[Debug Button] Removed debug-visible class from terminal.'); // Log after action
            // Optionally deactivate debug mode fully on close?
            // debugModeActive = false;
            // debugIndicator.style.display = 'none';
            // titleClickCount = 0;
        });
    } else {
         originalConsole.error('[DOM Ready - Diagnostic] Could not find closeDebugButton or debugTerminal!');
    }
    // ===== End Debug Mode Activation =====

    // Use overridden console log from here on if needed
    console.log('[DOM Ready] Initializing app...');
    initializeApp(); // Initialize the main application AFTER setting up debug listeners/overrides
});
