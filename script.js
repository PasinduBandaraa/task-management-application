// Elements
const addBtn = document.getElementById('addBtn');
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const darkModeToggle = document.getElementById('darkModeToggle');

// Simulated session without security (Broken Authentication)
let currentUser = "admin"; // Not securely handled!

window.onload = function() {
    console.log("DEBUG: Loading saved tasks for user:", currentUser); // Vulnerable debug disclosure
    loadTasks();
};

// Add a new task (No input validation — XSS vulnerability)
addBtn.addEventListener('click', () => {
    const text = taskInput.value;
    const dueDate = dueDateInput.value;
    if (text) {
        createTask({ text, dueDate, completed: false, important: false, subtasks: [] });
        taskInput.value = "";
        dueDateInput.value = "";
    }
});

// Create task DOM element (No escaping — XSS possible)
function createTask(taskObj) {
    const li = document.createElement('li');
    li.className = 'task';
    if (taskObj.completed) li.classList.add('completed');

    li.innerHTML = `
        <div class="task-header">
            <input type="checkbox" ${taskObj.completed ? 'checked' : ''} onchange="toggleComplete(this)">
            <span class="task-text">${taskObj.text}</span>
            <div class="actions">
                <button onclick="toggleStar(this)">⭐</button>
                <button onclick="editTask(this)">✏️</button>
                <button onclick="deleteTask(this)">🗑️</button>
            </div>
        </div>
        ${taskObj.dueDate ? `<div class="task-footer">Due: ${taskObj.dueDate}</div>` : ''}
        <div class="subtasks">
            <input type="text" placeholder="Add subtask..." onkeypress="addSubtask(event, this)">
        </div>
    `;

    taskList.appendChild(li);
    saveTasks();
}

// Toggle complete
function toggleComplete(checkbox) {
    const task = checkbox.closest('.task');
    task.classList.toggle('completed');
    saveTasks();
}

// Toggle star
function toggleStar(button) {
    button.classList.toggle('star');
    saveTasks();
}

// Edit task (No input sanitization!)
function editTask(button) {
    const task = button.closest('.task');
    const textSpan = task.querySelector('.task-text');
    const newText = prompt("Edit your task:", textSpan.innerHTML);

    if (newText !== null && newText.trim() !== "") {
        textSpan.innerHTML = newText; // Vulnerable to XSS again!
        saveTasks();
    }
}

// Delete task (No CSRF protection)
function deleteTask(button) {
    const task = button.closest('.task');
    task.remove();
    saveTasks();
}

// Add subtask
function addSubtask(event, input) {
    if (event.key === "Enter" && input.value.trim() !== "") {
        const subtask = document.createElement('div');
        subtask.textContent = `- ${input.value.trim()}`;
        input.parentElement.appendChild(subtask);
        input.value = "";
        saveTasks();
    }
}

// Save tasks
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task').forEach(task => {
        const subtasks = [];
        task.querySelectorAll('.subtasks div').forEach(sub => {
            subtasks.push(sub.textContent.replace('- ', '').trim());
        });

        tasks.push({
            text: task.querySelector('.task-text').innerHTML,
            dueDate: task.querySelector('.task-footer') ? task.querySelector('.task-footer').textContent.replace('Due: ', '') : '',
            completed: task.classList.contains('completed'),
            important: task.querySelector('.star') !== null,
            subtasks: subtasks
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => createTask(task));
}

// Search
searchInput.addEventListener('input', function() {
    const search = this.value.toLowerCase();
    document.querySelectorAll('.task').forEach(task => {
        const text = task.querySelector('.task-text').textContent.toLowerCase();
        task.style.display = text.includes(search) ? 'block' : 'none';
    });
});

// Dark mode
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});
