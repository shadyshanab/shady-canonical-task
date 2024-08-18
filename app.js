document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo-list');
    const newTaskInput = document.getElementById('new-task');
    const taskForm = document.getElementById('task-form');

    // Use a Map to store tasks with a unique ID for better data structure management
    let tasks = new Map(JSON.parse(localStorage.getItem('tasks')) || []);

    // Render the tasks
    function renderTasks() {
        todoList.innerHTML = '';
        tasks.forEach((task, id) => {
            const li = createTaskElement(task, id);
            todoList.appendChild(li);
        });
    }

    // Create a new task element
    function createTaskElement(task, id) {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('draggable', 'true');
        li.dataset.id = id;

        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        taskText.setAttribute('aria-label', `Task: ${task.text}`);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);

        li.append(taskText, deleteBtn);

        // Add event listeners
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('dragend', handleDragEnd);
        li.addEventListener('click', toggleComplete);
        deleteBtn.addEventListener('click', deleteTask);

        return li;
    }

    // Add a new task
    function addTask(event) {
        event.preventDefault();
        const text = newTaskInput.value.trim();
        if (!text) return;

        const id = Date.now().toString(); // Use timestamp as a unique ID
        tasks.set(id, { text, completed: false });
        updateLocalStorage();
        renderTasks();
        newTaskInput.value = '';
        newTaskInput.focus();
    }

    // Toggle task completion
    function toggleComplete(event) {
        if (event.target.tagName === 'BUTTON') return; // Ignore click on delete button

        const id = event.target.closest('.todo-item').dataset.id;
        const task = tasks.get(id);
        task.completed = !task.completed;
        updateLocalStorage();
        renderTasks();
    }

    // Delete a task
    function deleteTask(event) {
        event.stopPropagation();
        const id = event.target.closest('.todo-item').dataset.id;
        tasks.delete(id);
        updateLocalStorage();
        renderTasks();
    }

    // Handle drag and drop reordering
    function handleDragStart(event) {
        event.target.classList.add('dragging');
    }

    function handleDragOver(event) {
        event.preventDefault();
        const dragging = document.querySelector('.dragging');
        const target = event.target.closest('.todo-item');
        if (target && dragging !== target) {
            const bounding = target.getBoundingClientRect();
            const offset = bounding.y + bounding.height / 2;
            if (event.clientY - offset > 0) {
                target.insertAdjacentElement('afterend', dragging);
            } else {
                target.insertAdjacentElement('beforebegin', dragging);
            }
        }
    }

    function handleDragEnd(event) {
        event.target.classList.remove('dragging');
        const newOrder = Array.from(todoList.children).map(li => li.dataset.id);
        const updatedTasks = new Map();
        newOrder.forEach(id => updatedTasks.set(id, tasks.get(id)));
        tasks = updatedTasks;
        updateLocalStorage();
    }

    // Update local storage with the current state of tasks
    function updateLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify([...tasks]));
    }

    // Event listeners
    taskForm.addEventListener('submit', addTask);
    renderTasks();
});
