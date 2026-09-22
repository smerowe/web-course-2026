let tasks = [];
let currentFilter = 'all';

const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');
const remainingCount = document.getElementById('remainingCount');
const completedCount = document.getElementById('completedCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('emptyState');

function init() {
    setupEventListeners();
    render();
}

function setupEventListeners() {
    addButton.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            render();
        });
    });
}

function addTask() {
    const text = taskInput.value.trim();
    
    if (text === '') {
        showWarning('Введите текст задачи!');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: text,
        completed: false
    };
    
    tasks.push(task);
    taskInput.value = '';
    render();
}

function showWarning(message) {
    const existingWarning = document.querySelector('.warning');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    const warning = document.createElement('div');
    warning.className = 'warning';
    warning.textContent = message;
    
    const inputWrapper = document.querySelector('.input-wrapper');
    inputWrapper.after(warning);
    
    setTimeout(() => {
        warning.remove();
    }, 3000);
}

function toggleTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        render();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    render();
}

function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

function updateStats() {
    const completed = tasks.filter(task => task.completed).length;
    const remaining = tasks.length - completed;
    
    remainingCount.textContent = remaining;
    completedCount.textContent = completed;
}

function render() {
    taskList.innerHTML = '';
    
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
    }
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
    
    updateStats();
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) {
        li.classList.add('completed');
    }
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));
    
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    
    return li;
}

init();
