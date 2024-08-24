// 初始化数据和DOMContentLoaded事件监听
document.addEventListener('DOMContentLoaded', function() {
    displayTests();
    createCalendar();
    displayOverdueTasks();
    displayUnassignedTasks();
    displayCompletedTasks();
});

// 初始化任务列表
const tests = [
    { name: "数学作业", dates: [new Date()], color: getRandomColor() },
    { name: "物理实验报告", dates: [new Date(new Date().setDate(new Date().getDate() + 1))], color: getRandomColor() }
];

const unassignedTasks = [
    { name: "阅读历史章节" },
    { name: "编写化学实验报告" }
];

// 已完成的任务列表
const completedTasks = [];

// 获取随机颜色函数
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// 显示任务到Tests and Assignments部分
function displayTests() {
    const testsList = document.getElementById('tests-list');
    testsList.innerHTML = ''; // 清空现有列表
    tests.forEach(test => {
        const listItem = document.createElement('li');

        // 创建复选框
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.onchange = function() {
            moveToCompleted(test, tests);
        };

        listItem.appendChild(checkbox);
        listItem.appendChild(document.createTextNode(`${test.name} - due ${test.dates.map(d => d.toDateString()).join(', ')}`));
        testsList.appendChild(listItem);
    });
}

// 显示未指派日期的任务
function displayUnassignedTasks() {
    const unassignedList = document.getElementById('unassigned-list');
    unassignedList.innerHTML = ''; // 清空现有未指派任务列表
    unassignedTasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.setAttribute('data-task', task.name); // 添加数据属性

        // 创建复选框
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.onchange = function() {
            moveToCompleted(task, unassignedTasks);
        };

        listItem.appendChild(checkbox);
        listItem.appendChild(document.createTextNode(task.name));
        
        const button = document.createElement('button');
        button.textContent = '指派日期';
        button.onclick = function() { assignDate(task.name); };
        listItem.appendChild(button);
        
        unassignedList.appendChild(listItem);
    });
}

// 添加未分配任务
function addUnassignedTask() {
    const taskName = document.getElementById('new-task-name').value;
    if (taskName.trim()) {
        unassignedTasks.push({ name: taskName });
        document.getElementById('new-task-name').value = ''; // 清空输入框
        updateDisplays(); // 更新所有显示
    } else {
        alert("请输入任务名称！");
    }
}

// 检查并显示逾期任务
function displayOverdueTasks() {
    const overdueList = document.getElementById('overdue-list');
    overdueList.innerHTML = ''; // 清空现有逾期任务列表
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置今天的日期为凌晨

    const overdueTasks = tests.filter(task => task.dates.some(date => date < today));
    overdueTasks.forEach(task => {
        const listItem = document.createElement('li');
        
        // 创建复选框
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.onchange = function() {
            moveToCompleted(task, tests);
        };

        listItem.appendChild(checkbox);
        listItem.appendChild(document.createTextNode(task.name));
        
        const button = document.createElement('button');
        button.textContent = '指派日期';
        button.onclick = function() { assignDate(task.name); };
        listItem.appendChild(button);
        
        overdueList.appendChild(listItem);
    });
}

function createCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = ''; // 清空现有日历

    // 按任务被指派的天数排序
    const sortedTasks = tests.slice().sort((a, b) => b.dates.length - a.dates.length);

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateElement = document.createElement('div');
        dateElement.classList.add('calendar-day');
        
        // 格式化日期为 "MMM DD"
        dateElement.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // 添加日期下面的线
        const lineElement = document.createElement('hr');
        dateElement.appendChild(lineElement);

        // 显示每天的任务
        sortedTasks.forEach(task => {
            if (task.dates && task.dates.some(d => d.toDateString() === date.toDateString())) {
                const taskElement = document.createElement('div');
                taskElement.textContent = task.name;
                taskElement.style.backgroundColor = task.color; // 使用任务指定的颜色
                taskElement.style.padding = '5px';
                taskElement.style.marginTop = '5px'; // 添加一些间距
                dateElement.appendChild(taskElement);
            }
        });

        calendar.appendChild(dateElement);
    }
}

// 任务日期指派函数
function assignDate(taskName) {
    const taskElement = document.querySelector(`li[data-task="${taskName}"]`);
    
    if (!taskElement) {
        console.error(`找不到任务: ${taskName}`);
        return;
    }

    // 检查是否已存在日期选择器，如果存在则不再添加
    let datesContainer = document.querySelector(`#dates-container-${taskName}`);
    if (datesContainer) {
        datesContainer.remove(); // 如果已经存在，先移除它
    }

    datesContainer = document.createElement('div');
    datesContainer.id = `dates-container-${taskName}`; // 给容器一个唯一ID

    for (let i = 0; i < 7; i++) {
        const dateButton = document.createElement('button');
        const date = new Date();
        date.setDate(date.getDate() + i);
        dateButton.textContent = `t+${i}d`;
        dateButton.dataset.date = date.toISOString().substring(0, 10);  // 使用ISO日期格式

        // 设置按钮点击后的行为
        dateButton.onclick = function() {
            toggleDateSelection(taskName, date, this);
        };

        datesContainer.appendChild(dateButton);
    }

    // 添加确认按钮
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '确认';
    confirmButton.onclick = function() {
        console.log('确认按钮被点击');  // 测试事件是否触发
        updateDisplays();  // 更新所有显示，包括日历
        // 关闭日期选择器
        datesContainer.remove(); // 直接移除整个日期容器
    };
    datesContainer.appendChild(confirmButton);

    taskElement.appendChild(datesContainer);
}

// 切换任务的日期选择
function toggleDateSelection(taskName, date, button) {
    const task = tests.find(t => t.name === taskName);
    if (task) {
        // 如果已经有这个日期，就移除；如果没有，就添加
        const index = task.dates ? task.dates.findIndex(d => d.toISOString() === date.toISOString()) : -1;
        if (index > -1) {
            task.dates.splice(index, 1);
            button.classList.remove('selected');
        } else {
            task.dates = task.dates || [];
            task.dates.push(date);
            button.classList.add('selected');
        }
    } else {
        tests.push({ name: taskName, dates: [date], color: getRandomColor() });
        button.classList.add('selected');
    }
}

// 移动任务到完成部分
function moveToCompleted(task, fromList) {
    // 从原列表中移除任务
    const index = fromList.indexOf(task);
    if (index > -1) {
        fromList.splice(index, 1);
    }
    // 添加任务到完成列表
    completedTasks.push(task);
    updateDisplays();
}

// 显示完成的任务
function displayCompletedTasks() {
    const completedList = document.getElementById('completed-list');
    completedList.innerHTML = ''; // 清空现有列表
    completedTasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.textContent = task.name;
        completedList.appendChild(listItem);
    });
}

// 更新显示
function updateDisplays() {
    displayTests();
    createCalendar();
    displayOverdueTasks();
    displayUnassignedTasks();
    displayCompletedTasks(); // 新增显示完成的任务
}
