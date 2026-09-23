document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const themeBtn = document.getElementById('theme-btn');
    const clockSpan = document.getElementById('clock');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const taskProgress = document.getElementById('task-progress');
    const progressText = document.getElementById('progress-text');
    const avatarInput = document.getElementById('avatar-input');
    const avatarContainer = document.getElementById('avatar-container');
    const avatarFallback = document.getElementById('avatar-text');
    const listActions = document.getElementById('list-actions');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');

    // Perfil
    const perfilName = document.getElementById('perfil-name');
    const perfilDesc = document.getElementById('perfil-desc');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const profileEditForm = document.getElementById('profile-edit-form');
    const editNameInput = document.getElementById('edit-name-input');
    const editDescInput = document.getElementById('edit-desc-input');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelProfileBtn = document.getElementById('cancel-profile-btn');

    let currentFilter = 'all';
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // --- CARGAR DATOS PERFIL DESDE LOCALSTORAGE ---
    const savedName = localStorage.getItem('profile-name') || "Desarrollador Experto";
    const savedDesc = localStorage.getItem('profile-desc') || "Construyendo el futuro de la web, un componente a la vez.";
    perfilName.textContent = savedName;
    perfilDesc.textContent = savedDesc;
    avatarFallback.textContent = savedName.charAt(0).toUpperCase();

    // NUEVA ASIGNACIÓN: Carga la imagen directamente como background-image
    const savedAvatar = localStorage.getItem('custom-avatar');
    if (savedAvatar) {
        avatarContainer.style.backgroundImage = `url('${savedAvatar}')`;
    }

    // Edición de Perfil
    editProfileBtn.addEventListener('click', () => {
        editNameInput.value = perfilName.textContent;
        editDescInput.value = perfilDesc.textContent;
        profileEditForm.style.display = 'flex';
        editProfileBtn.style.display = 'none';
    });

    cancelProfileBtn.addEventListener('click', () => {
        profileEditForm.style.display = 'none';
        editProfileBtn.style.display = 'inline-block';
    });

    saveProfileBtn.addEventListener('click', () => {
        const newName = editNameInput.value.trim();
        const newDesc = editDescInput.value.trim();

        if (newName !== "" && newDesc !== "") {
            localStorage.setItem('profile-name', newName);
            localStorage.setItem('profile-desc', newDesc);
            perfilName.textContent = newName;
            perfilDesc.textContent = newDesc;
            avatarFallback.textContent = newName.charAt(0).toUpperCase();
            
            profileEditForm.style.display = 'none';
            editProfileBtn.style.display = 'inline-block';
        }
    });

    // NUEVO PROCESAMIENTO: Guarda e inyecta el background-image dinámicamente
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Image = event.target.result;
                localStorage.setItem('custom-avatar', base64Image);
                avatarContainer.style.backgroundImage = `url('${base64Image}')`;
            };
            reader.readAsDataURL(file);
        }
    });

    // --- MODO OSCURO ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeBtn.textContent = 'Modo Claro';
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeBtn.textContent = 'Modo Claro';
        } else {
            localStorage.setItem('theme', 'light');
            themeBtn.textContent = 'Modo Oscuro';
        }
    });

    // --- RELOJ EN VIVO ---
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; 
        clockSpan.textContent = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // --- PROGRESO ---
    function updateMetrics() {
        const total = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;
        listActions.style.display = completedTasks > 0 ? 'flex' : 'none';

        if (total === 0) {
            taskProgress.style.width = '0%';
            progressText.textContent = '0% completado';
            return;
        }
        const percentage = Math.round((completedTasks / total) * 100);
        taskProgress.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}% completado (${completedTasks}/${total})`;
    }

    // --- TAREAS ---
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateMetrics();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        
        tasks.forEach((task, index) => {
            if (currentFilter === 'pending' && task.completed) return;
            if (currentFilter === 'completed' && !task.completed) return;

            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');

            const taskContent = document.createElement('div');
            taskContent.className = 'task-content';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            
            checkbox.addEventListener('change', () => {
                li.style.opacity = '0.5';
                setTimeout(() => {
                    tasks[index].completed = !tasks[index].completed;
                    saveTasks();
                    renderTasks();
                }, 150);
            });

            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;

            taskContent.appendChild(checkbox);
            taskContent.appendChild(span);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Eliminar';
            
            deleteBtn.addEventListener('click', () => {
                li.classList.add('slide-out');
                li.addEventListener('transitionend', () => {
                    tasks.splice(index, 1);
                    saveTasks();
                    renderTasks();
                });
            });

            li.appendChild(taskContent);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
        updateMetrics();
    }

    clearCompletedBtn.addEventListener('click', () => {
        const completedItems = taskList.querySelectorAll('li.completed');
        completedItems.forEach(item => item.classList.add('slide-out'));
        setTimeout(() => {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
        }, 300);
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderTasks();
        });
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            tasks.push({ text: taskText, completed: false });
            taskInput.value = '';
            saveTasks();
            renderTasks();
        }
    });

    renderTasks();
});
