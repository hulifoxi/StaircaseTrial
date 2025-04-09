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
    hasBoughtRestore: false // 是否已购买恢复内裤券
};

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

// 自定义警告函数
function showAlert(message) {
    const alertElement = document.getElementById('customAlert');
    const messageElement = document.getElementById('alertMessage');
    const closeButton = document.getElementById('alertClose');
    
    messageElement.textContent = message;
    alertElement.style.display = 'flex';
    
    // 3秒后自动关闭
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 3000);
    
    // 点击关闭按钮也可以关闭
    closeButton.addEventListener('click', () => {
        alertElement.style.display = 'none';
    });
}

// 自定义确认弹窗函数
function customConfirm(message) {
    return new Promise((resolve) => {
        const confirmDialog = document.getElementById('customConfirm');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmYes = document.getElementById('confirmYes');
        const confirmNo = document.getElementById('confirmNo');

        // // 如果消息包含"当前积分"，则添加换行 (移除此逻辑，由调用者负责格式化)
        // if (message.includes('当前积分')) {
        //     const parts = message.split('当前积分');
        //     message = parts[0] + '\n当前积分：' + parts[1];
        // }

        confirmMessage.textContent = message; // 直接使用传入的消息
        confirmDialog.style.display = 'flex';

        // 根据消息内容设置不同的按钮文字
        if (message.includes('花费3积分保留')) {
            confirmYes.textContent = '花费3积分保留';
            confirmNo.textContent = '脱去衣物';
        } else {
            confirmYes.textContent = '是';
            confirmNo.textContent = '否';
        }

        confirmYes.onclick = () => {
            confirmDialog.style.display = 'none';
            resolve(true);
        };

        confirmNo.onclick = () => {
            confirmDialog.style.display = 'none';
            resolve(false);
        };
    });
}

// 初始化游戏
function initGame() {
    // 获取用户设置的起始楼层
    const startingFloorInput = document.getElementById('startingFloor');
    let startingFloor = 1;
    if (startingFloorInput && startingFloorInput.value) {
        startingFloor = parseInt(startingFloorInput.value) || 1;
        // 确保起始楼层至少为1
        if (startingFloor < 1) startingFloor = 1;
    }
    
    gameState = {
        score: Math.floor(Math.random() * 23) + 5, // 5-27之间随机初始分
        currentFloor: 1,
        maxFloor: 1,
        startingFloor: startingFloor, // 使用用户设置的起始楼层
        gamePhase: 'initial', // 初始状态
        clothing: {
            '上衣': false,
            '长裤': false,
            '内裤': false,
            '白袜': false,
            '护膝': false
        },
        currentTask: null,
        tasksCompleted: 0,
        tasksCompletedInPhase: { A: 0, B: 0, C: 0 },
        currentPhase: 'A',
        inventory: {
            'skip': 0,
            'restore': 0
        },
        assignedClimbingTask: null,
        eighthFloorFirstTaskCompleted: false,
        hasBoughtRestore: false
    };
    saveGameState();
    console.log(`[Init Game] Game initialized, starting from floor ${startingFloor}, internal phase A.`);
    generateNewTask(); // 初始化后立即生成第一个任务
}

// 保存游戏状态到localStorage
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// 从localStorage加载游戏状态
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        // 合并状态，确保新添加的状态属性不会丢失
        const loaded = JSON.parse(savedState);
        // 特别处理对象嵌套，防止覆盖不全
        gameState.score = loaded.score !== undefined ? loaded.score : gameState.score;
        gameState.currentFloor = loaded.currentFloor !== undefined ? loaded.currentFloor : gameState.currentFloor;
        gameState.maxFloor = loaded.maxFloor !== undefined ? loaded.maxFloor : gameState.maxFloor;
        gameState.startingFloor = loaded.startingFloor !== undefined ? loaded.startingFloor : gameState.startingFloor;
        gameState.clothing = loaded.clothing ? { ...gameState.clothing, ...loaded.clothing } : gameState.clothing;
        gameState.currentTask = loaded.currentTask ? loaded.currentTask : null;
        gameState.tasksCompleted = loaded.tasksCompleted !== undefined ? loaded.tasksCompleted : gameState.tasksCompleted;
        gameState.tasksCompletedInPhase = loaded.tasksCompletedInPhase ? { ...gameState.tasksCompletedInPhase, ...loaded.tasksCompletedInPhase } : gameState.tasksCompletedInPhase;
        gameState.currentPhase = loaded.currentPhase ? loaded.currentPhase : gameState.currentPhase;
        gameState.inventory = loaded.inventory ? { ...gameState.inventory, ...loaded.inventory } : gameState.inventory;
        gameState.assignedClimbingTask = loaded.assignedClimbingTask ? loaded.assignedClimbingTask : null;
        gameState.eighthFloorFirstTaskCompleted = loaded.eighthFloorFirstTaskCompleted !== undefined ? loaded.eighthFloorFirstTaskCompleted : gameState.eighthFloorFirstTaskCompleted;
        gameState.hasBoughtRestore = loaded.hasBoughtRestore !== undefined ? loaded.hasBoughtRestore : gameState.hasBoughtRestore;
        gameState.gamePhase = loaded.gamePhase ? loaded.gamePhase : gameState.gamePhase;
        return true; // 表示成功加载
    } 
    return false; // 表示没有找到保存的状态
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
    updateScore();
    updateFloor();
    updateClothingStatus();
    updateInventory(); // 确保库存区的按钮状态也更新
    updateShopButtons();

    const nextFloorButton = document.getElementById('nextFloor');
    const completeTaskButton = document.getElementById('completeTask');
    const confirmClimbingButton = document.getElementById('confirmClimbing'); 
    const climbingInfoDiv = document.getElementById('climbingInfo');

    // 先隐藏所有主要控制按钮
    nextFloorButton.style.display = 'none';
    completeTaskButton.style.display = 'none';
    confirmClimbingButton.style.display = 'none';

    // 根据状态决定显示哪个按钮
    if (gameState.currentTask) {
        // 1. 如果有任务
        completeTaskButton.style.display = 'block';
        console.log("[Update Status] Task found, showing Complete Task button.");
    } else if (gameState.assignedClimbingTask) {
        // 2. 如果分配了上楼任务
        confirmClimbingButton.style.display = 'block';
        console.log("[Update Status] Climbing task assigned, showing Confirm Climbing button.");
    } else {
        // 3. 如果没有任务，并且不在选择上楼方式阶段
        if ([1, 2, 4, 5, 7, 8].includes(gameState.currentFloor)) {
            // 3a. 刚完成任务，在任务楼层 -> 显示"前往下一层"/"获取上楼方式"按钮
            nextFloorButton.style.display = 'block';
            // 修改：根据楼层设置按钮文字
            if ([2, 5, 8].includes(gameState.currentFloor)) {
                nextFloorButton.textContent = '获取上楼方式';
                console.log(`[Update Status] Floor ${gameState.currentFloor}, showing Next Floor button with text '获取上楼方式'.`);
            } else {
                nextFloorButton.textContent = '前往下一层';
                console.log(`[Update Status] Floor ${gameState.currentFloor}, showing Next Floor button with text '前往下一层'.`);
            }
        } else if (gameState.currentFloor >= 10) {
            // 3b. 游戏结束
            console.log("[Update Status] Floor >= 10, game ended, hiding buttons.");
        } else {
            // 3c. 其他情况（理论上不应发生）
            console.log(`[Update Status] Floor ${gameState.currentFloor}, no task, not a standard state, hiding buttons.`);
        }
    }
}

// 完成任务
async function completeTask() {
    if (!gameState.currentTask) {
        showMessage("当前没有任务需要完成！");
        return;
    }
    
    // 1. 先计算并更新积分
    const scoreGained = calculateTaskScore();
    gameState.score += scoreGained;
    gameState.tasksCompleted++;
    gameState.tasksCompletedInPhase[gameState.currentPhase]++;
    updateScore(); // 立即更新积分显示
    
    // 2. 显示获得积分的信息
    showMessage(`任务完成！获得 ${scoreGained} 积分！`);
    
    // 3. 投骰子决定是否需要脱衣
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    let forceRemove = false;
    if (diceRoll <= 3) {
        console.log("[Complete Task] Penalty roll: Force remove clothing attempt.");
        const canRemoveClothing = Object.values(gameState.clothing).some(worn => worn);

        if (canRemoveClothing) {
            const canAffordToKeep = gameState.score >= 5;
            let message = `你的运气不好，将被强制脱去一件衣物。是否花费 5 积分保留？\n\n当前积分：${gameState.score}`;
            if (!canAffordToKeep) {
                message = `你的运气不好，将被强制脱去一件衣物。（积分不足 5 分，无法保留）\n\n当前积分：${gameState.score}`;
            }

            const confirmResult = await customConfirm(message);

            if (confirmResult && canAffordToKeep) {
                // 选择保留且积分足够
                gameState.score -= 5;
                showAlert("花费 5 积分保留了衣物。");
                console.log("[Complete Task] Penalty: Player spent 5 points to keep clothing.");
            } else {
                // 选择不保留 或 选择保留但积分不足 -> 强制脱衣
                const removableItems = Object.entries(gameState.clothing)
                    .filter(([item, isWorn]) => isWorn)
                    .map(([item]) => item);
                
                if (removableItems.length > 0) { // 再次确认有可移除的
                    const randomIndex = Math.floor(Math.random() * removableItems.length);
                    const itemToRemove = removableItems[randomIndex];
                    gameState.clothing[itemToRemove] = false;
                    showAlert(`你被迫脱去了 ${itemToRemove}！`);
                    console.log(`[Complete Task] Penalty: Player forced to remove ${itemToRemove}.`);
                } else {
                     // 理论上这个 else 不应该执行，因为上面已经判断过 canRemoveClothing
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

    // 4. 处理8楼特殊逻辑
    if (gameState.currentFloor === 8) {
        // 如果这是8楼的第一个任务
        if (!gameState.eighthFloorFirstTaskCompleted) {
            gameState.eighthFloorFirstTaskCompleted = true;
            // 生成第二个任务
            generateNewTask();
            return;
        } else {
            // 如果这是8楼的第二个任务，重置标记
            gameState.eighthFloorFirstTaskCompleted = false;
        }
    }

    // 5. 清空当前任务并更新状态
    gameState.currentTask = null;
    // 修改：根据楼层设置完成任务后的提示信息
    const taskElement = document.getElementById('currentTask');
    if (taskElement) {
        if ([2, 5, 8].includes(gameState.currentFloor)) {
            taskElement.innerHTML = '<span class="task-name text-center">任务完成！请点击按钮获取上楼方式</span>';
            console.log(`[Complete Task] Floor ${gameState.currentFloor}, set message to '获取上楼方式'.`);
        } else {
            taskElement.innerHTML = '<span class="task-name text-center">任务完成！请点击按钮前往下一层</span>';
            console.log(`[Complete Task] Floor ${gameState.currentFloor}, set message to '前往下一层'.`);
        }
    }
    updateGameStatus(); // 更新游戏状态，包括按钮的显示
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

// 显示特定游戏阶段的函数
function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => {
        section.style.display = 'none';
    });
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    } else {
        console.error("未找到要显示的区域:", sectionId);
    }
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
            inventoryCountSpan.textContent = `库存: ${gameState.inventory.skip}`;
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

// 显示消息函数
function showMessage(message) {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        // 短暂显示3秒
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    } else {
        console.error('消息元素未找到');
    }
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
        showMessage('当前没有任务可以跳过！');
        return;
    }

    if (gameState.inventory.skip > 0) {
        const useSkip = await customConfirm('是否使用跳过任务券？');
        if (useSkip) {
            gameState.inventory.skip--;
            showMessage('已使用跳过任务券！');
            gameState.currentTask = null;
            updateGameStatus();
            saveGameState();
        }
    } else if (gameState.score >= 6) {
        const usePoints = await customConfirm('是否花费6积分跳过任务？');
        if (usePoints) {
            gameState.score -= 6;
            showMessage('已花费6积分跳过任务！');
            gameState.currentTask = null;
            updateGameStatus();
            saveGameState();
        }
    } else {
        showMessage('积分不足且没有跳过任务券！');
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
            // 修改：清除本地存储，重新初始化，显示开始界面
            localStorage.removeItem('gameState');
            initGame(); // 重置游戏状态
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

// 初始化整个应用程序
function initializeApp() {
    console.log('Initializing application...');

    const loaded = loadGameState();

    if (loaded) {
        console.log('Game state loaded from localStorage.');

        // 新增：优先处理游戏结束状态
        if (gameState.gamePhase === 'ended') {
            console.log('Loaded state indicates game ended. Showing end section.');
            // 更新结束界面信息
            document.getElementById('endScore').textContent = gameState.score;
            document.getElementById('maxFloorEnd').textContent = getDisplayFloor(gameState.maxFloor);
            document.getElementById('tasksCompletedEnd').textContent = gameState.tasksCompleted;
            document.getElementById('remainingClothesEnd').textContent = Object.values(gameState.clothing).filter(Boolean).length;
            document.getElementById('endingDescription').textContent = getEnding();
            showSection('end-section');
            // 确保结束界面的按钮事件也被绑定 (因为后续逻辑被return)
            setupEndAndHistoryButtons(); 
            return; // 结束初始化，不再执行后续界面判断
        }

        // 状态已加载，需要根据当前状态恢复UI
        updateScore();
        updateFloor();
        updateClothingStatus();
        updateInventory();
        updateShopButtons();
        updateGameStatus();

        // 根据游戏阶段和楼层决定显示哪个界面
        if (gameState.gamePhase === 'adventure') {
            console.log(`Loaded state indicates game in adventure phase (Floor ${gameState.currentFloor}). Showing game section.`);
            showSection('game-section');
            
            // 任务显示逻辑
            const taskElement = document.getElementById('currentTask');
            if (gameState.currentTask) {
                if (taskElement) {
                    taskElement.innerHTML = `
                        <span class="task-name">${gameState.currentTask.name}</span>
                        <p class="task-description-text">${gameState.currentTask.description}</p>
                    `;
                }
            } else {
                if ([2, 5, 8].includes(gameState.currentFloor)) {
                    console.log(`[Initialize App] On floor ${gameState.currentFloor} with no task, showing climbing selection.`);
                    showClimbingTaskSelection();
                } else if (taskElement) {
                    taskElement.innerHTML = '<span class="task-name text-center">任务完成！请点击按钮前往下一层</span>';
                }
            }
        }
        else if (gameState.gamePhase === 'shop') {
            // 在商店阶段
            console.log('Loaded state indicates player in shop phase. Showing shop section.');
            showSection('shop-section');
            document.getElementById('shopScore').textContent = gameState.score;
        }
        else {
            // 初始状态或未识别状态
            console.log('Loaded state indicates initial phase or unrecognized state. Showing start section.');
            showSection('start-section');
        }
    } else {
        console.log('No saved game state found. Initializing new game.');
        initGame();
        showSection('start-section');
    }

    // --- 按钮事件监听 (保持不变) ---
     document.getElementById('startGame').addEventListener('click', () => {
        console.log('点击开始游戏');
        initGame(); 
        gameState.gamePhase = 'shop'; // 标记为商店阶段
        saveGameState(); 
        updateShopButtons(); 
        updateScore();
        showSection('shop-section');
    });
    document.getElementById('viewRules').addEventListener('click', () => {
        showSection('rules-section');
    });
    document.getElementById('backToStart').addEventListener('click', () => {
        showSection('start-section');
    });
    document.getElementById('startAdventure').addEventListener('click', startAdventure);
    document.getElementById('completeTask').addEventListener('click', completeTask);
    document.getElementById('nextFloor').addEventListener('click', () => {
        console.log(`[Next Floor DEBUG] Click event fired. Floor: ${gameState.currentFloor}, Task: ${gameState.currentTask}`);
        if (gameState.currentTask) {
            showAlert("请先完成当前任务！");
            console.log("[Next Floor] Cannot proceed, current task exists.");
            return;
        }
        const previousFloor = gameState.currentFloor;
        console.log(`[Next Floor DEBUG] previousFloor = ${previousFloor}`);
        let nextFloor = previousFloor;

        if ([1, 4, 7].includes(previousFloor)) {
            console.log("[Next Floor DEBUG] Moving from normal floor to next floor.");
            if (previousFloor === 1) nextFloor = 2;
            else if (previousFloor === 4) nextFloor = 5;
            else if (previousFloor === 7) nextFloor = 8;
            console.log(`[Next Floor] Indoor task phase complete. Moving from ${previousFloor} to ${nextFloor}.`);
            gameState.currentFloor = nextFloor;
            updateFloor();
            generateNewTask();
            saveGameState();
        } else if ([2, 5, 8].includes(previousFloor)) {
            console.log("[Next Floor DEBUG] On climbing floor, showing climbing task selection.");
            showClimbingTaskSelection();
        } else {
            console.log("[Next Floor DEBUG] Conditions for floor transition or climb selection FAILED.");
            console.log("[Next Floor] No action defined for floor:", previousFloor);
            showAlert("无法从当前楼层执行标准操作。");
        }
    });
    document.getElementById('confirmClimbing').addEventListener('click', () => {
        const previousFloor = gameState.currentFloor;
        console.log(`[Confirm Climbing] Clicked on floor ${previousFloor}.`);
        if (![2, 5, 8].includes(previousFloor)) {
             console.error("[Confirm Climbing] ERROR: Clicked on incorrect floor.");
             return;
        }
        let nextFloor = 0;
        if (previousFloor === 2) nextFloor = 4;
        else if (previousFloor === 5) nextFloor = 7;
        else if (previousFloor === 8) nextFloor = 10;
        console.log(`[Confirm Climbing] Transitioning from ${previousFloor} to ${nextFloor}`);
        gameState.currentFloor = nextFloor;
        gameState.assignedClimbingTask = null; // 清除已分配的上楼任务
        if (gameState.currentFloor > gameState.maxFloor) {
            gameState.maxFloor = gameState.currentFloor;
            console.log(`[Confirm Climbing] Max floor updated to: ${gameState.maxFloor}`);
        }
        const climbingInfoDiv = document.getElementById('climbingInfo');
        if (climbingInfoDiv) climbingInfoDiv.style.display = 'none';
        const confirmClimbingButton = document.getElementById('confirmClimbing');
        if (confirmClimbingButton) confirmClimbingButton.style.display = 'none';
        updateFloor();
        if (gameState.currentFloor >= 10) {
            console.log('[Confirm Climbing] Reached end floor (10). Showing end section.');
            // 新增：标记游戏阶段为结束并保存
            gameState.gamePhase = 'ended';
            saveGameState();
            // 更新结束界面信息
            document.getElementById('endScore').textContent = gameState.score;
            document.getElementById('maxFloorEnd').textContent = getDisplayFloor(gameState.maxFloor);
            document.getElementById('tasksCompletedEnd').textContent = gameState.tasksCompleted;
            document.getElementById('remainingClothesEnd').textContent = Object.values(gameState.clothing).filter(Boolean).length;
            document.getElementById('endingDescription').textContent = getEnding();
            showSection('end-section');
            updateGameStatus();
            saveGameToHistory(); // <-- 在这里保存游戏结果到历史
        } else {
            // 新增：游戏未结束，生成新任务并更新状态
            generateNewTask();
            updateGameStatus();
            saveGameState();
            console.log(`[Confirm Climbing] Moved to floor ${gameState.currentFloor}. Generated new task and updated status.`);
        }
    });

    // --- 新增：为商店购买按钮添加事件监听 ---
    const buyButtons = document.querySelectorAll('#shop-section .buy-button');
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.dataset.item;
            const price = parseInt(button.dataset.price);
            buyItem(item, price);
        });
    });
    // --- 结束新增 ---

    // 调用新的函数来设置结束和历史按钮
    setupEndAndHistoryButtons();
}

// 初始化整个应用程序
initializeApp();
