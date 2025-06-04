// Datos de la aplicación
let calendarData = {
    tasks: {
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: []
    },
    texts: {
        meta: '',
        autocuidado: '',
        emociones: '',
        motivacion: '',
        notas: ''
    },
    stickers: [] // Guardará info de stickers colocados
};

// Inicializar la aplicación cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
    createFloatingHearts();
    loadStickers();
    setupTaskInputs();
    setupTextAreas();
    setupDropZones();
    setupButtons();
    setupStickerPalette();
    loadData();
});

// Crear corazones flotantes
function createFloatingHearts() {
    const heartsContainer = document.getElementById('floatingHearts');
    const heartEmojis = ['💗', '💕', '💖', '💓', '💘', '💝', '❤️', '🩷'];
    
    for (let i = 0; i < 200; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        
        // Elegir emoji de corazón aleatorio
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        
        // Posición aleatoria
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = Math.random() * 100 + '%';
        
        // Tamaño aleatorio
        const size = 15 + Math.random() * 20;
        heart.style.fontSize = size + 'px';
        
        // Opacidad aleatoria
        heart.style.opacity = 0.1 + Math.random() * 0.3;
        
        // Retardo aleatorio en la animación
        heart.style.animationDelay = Math.random() * 5 + 's';
        heart.style.animationDuration = 5 + Math.random() * 10 + 's';
        
        heartsContainer.appendChild(heart);
    }
}

// Cargar stickers de la carpeta img
function loadStickers() {
    const paletteGrid = document.getElementById('paletteGrid');
    
    // Lista de imágenes en la carpeta img
    const stickerImages = [
        'img/01_checklist_kawaii.png',
        'img/02_corazon_cute.png',
        'img/03_kit_termometros_vendas_corazon.png',
        'img/04_termometros_triste_feliz.png',
        'img/05_venda_con_corazones.png',
        'img/06_pixel_en_botiquin.png',
        'img/07_enfermera_con_pixel.png',
        'img/08_enfermera_con_perrito.png',
        'img/09_estoy_orgullosa_de_mi.png',
        'img/10_pasito_a_pasito.png',
        'img/11_tiempo_para_mi_pixel.png',
        'img/12_estrellas_kawaii.png',
        'img/13_motivacion_liquida_botella.png',
        'img/14_motivacion_liquida_capsulas.png',
        'img/15_pastilla_con_alas.png',
        'img/16_reloj_de_arena_tiempo_para_mi.png',
        'img/17_cruz_flores_medical.png',
        'img/18_corazon_anatomico_realista.png',
        'img/19_lazo_venda_cute.png',
        'img/20_pixel_enfermero_reloj.png',
        'img/21_botiquin_cara_feliz.png',
        'img/22_jeringuilla_kawaii.png'
    ];
    
    // Crear elementos de sticker para cada imagen
    stickerImages.forEach(imagePath => {
        const stickerItem = document.createElement('div');
        stickerItem.className = 'sticker-item';
        stickerItem.draggable = true;
        stickerItem.innerHTML = `<img src="${imagePath}" alt="Sticker" draggable="false">`;
        
        // Identificador único para el sticker
        const stickerId = imagePath.split('/').pop().split('.')[0];
        stickerItem.dataset.stickerId = stickerId;
        stickerItem.dataset.stickerPath = imagePath;
        
        // Evento de inicio de arrastre
        stickerItem.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('application/json', JSON.stringify({
                id: this.dataset.stickerId,
                path: this.dataset.stickerPath
            }));
        });
        
        paletteGrid.appendChild(stickerItem);
    });
}

// Configurar los inputs de tareas
function setupTaskInputs() {
    const taskInputs = document.querySelectorAll('.task-input');
    
    taskInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                const day = this.dataset.day;
                addTask(day, this.value.trim());
                this.value = '';
            }
        });
    });
}

// Añadir una tarea
function addTask(day, text) {
    const taskId = Date.now();
    const taskObj = {
        id: taskId,
        text: text,
        completed: false
    };
    
    calendarData.tasks[day].push(taskObj);
    renderTasks(day);
    saveData();
}

// Renderizar tareas para un día específico y añadir drag-&-drop
function renderTasks(day) {
    const taskList = document.getElementById(`tasks-${day}`);
    taskList.innerHTML = '';
    
    calendarData.tasks[day].forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.draggable = true;
        taskItem.dataset.id = task.id;
        taskItem.dataset.day = day;
        taskItem.dataset.index = index; // Índice dentro del array
        
        taskItem.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <input type="text" class="task-edit-input" value="${task.text}" style="display: none;">
            <div class="task-actions">
                <button class="edit-btn" title="Editar tarea">✏️</button>
                <button class="delete-btn" title="Eliminar tarea">🗑️</button>
            </div>
        `;
        
        // EVENTO: marcar como completada
        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            task.completed = this.checked;
            taskItem.classList.toggle('completed', this.checked);
            saveData();
        });
        
        // EVENTO: editar la tarea
        const editBtn = taskItem.querySelector('.edit-btn');
        const taskText = taskItem.querySelector('.task-text');
        const editInput = taskItem.querySelector('.task-edit-input');
        
        editBtn.addEventListener('click', function() {
            if (editInput.style.display === 'none') {
                taskText.style.display = 'none';
                editInput.style.display = 'block';
                editInput.focus();
                editInput.select();
                editBtn.textContent = '✅';
                editBtn.title = 'Guardar cambios';
            } else {
                const newText = editInput.value.trim();
                if (newText) {
                    task.text = newText;
                    taskText.textContent = newText;
                    taskText.style.display = 'block';
                    editInput.style.display = 'none';
                    editBtn.textContent = '✏️';
                    editBtn.title = 'Editar tarea';
                    saveData();
                }
            }
        });
        
        // Salvar con Enter y cancelar con Escape
        editInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') editBtn.click();
        });
        editInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                editInput.value = task.text;
                taskText.style.display = 'block';
                editInput.style.display = 'none';
                editBtn.textContent = '✏️';
                editBtn.title = 'Editar tarea';
            }
        });
        
        // EVENTO: eliminar tarea
        const deleteBtn = taskItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            calendarData.tasks[day] = calendarData.tasks[day].filter(t => t.id !== task.id);
            renderTasks(day);
            saveData();
        });
        
        // EVENTOS DE DRAG & DROP para esta tarea
        taskItem.addEventListener('dragstart', onTaskDragStart);
        taskItem.addEventListener('dragover', onTaskDragOver);
        taskItem.addEventListener('dragleave', onTaskDragLeave);
        taskItem.addEventListener('drop', onTaskDropOnItem);
        
        taskList.appendChild(taskItem);
    });
    
    // EVENTOS DE DRAG & DROP para la lista (para soltar abajo de todo)
    taskList.addEventListener('dragover', onListDragOver);
    taskList.addEventListener('dragleave', onListDragLeave);
    taskList.addEventListener('drop', onListDrop);
}

// Variables temporales de drag & drop
let draggedTaskId = null;
let draggedFromDay = null;
let draggedFromIndex = null;

// Cuando empezamos a arrastrar una tarea
function onTaskDragStart(e) {
    const item = e.currentTarget;
    draggedTaskId = item.dataset.id;
    draggedFromDay = item.dataset.day;
    draggedFromIndex = parseInt(item.dataset.index);
    e.dataTransfer.effectAllowed = 'move';
}

// Cuando arrastramos sobre otra tarea (para posicionar antes o después)
function onTaskDragOver(e) {
    e.preventDefault();
    const item = e.currentTarget;
    const bounding = item.getBoundingClientRect();
    const offset = e.clientY - bounding.top;
    // Si el puntero está en la mitad superior, marcamos "antes"; sinó "después"
    if (offset < bounding.height / 2) {
        item.classList.add('drag-over-before');
        item.classList.remove('drag-over-after');
    } else {
        item.classList.add('drag-over-after');
        item.classList.remove('drag-over-before');
    }
    e.dataTransfer.dropEffect = 'move';
}

// Cuando salimos del hover de drop sobre una tarea
function onTaskDragLeave(e) {
    const item = e.currentTarget;
    item.classList.remove('drag-over-before', 'drag-over-after');
}

// Cuando soltamos sobre una tarea
function onTaskDropOnItem(e) {
    e.preventDefault();
    const targetItem = e.currentTarget;
    targetItem.classList.remove('drag-over-before', 'drag-over-after');
    
    // Obtener datos de origen y destino
    const destDay = targetItem.dataset.day;
    let destIndex = parseInt(targetItem.dataset.index);
    
    // Si soltamos en la mitad inferior, insertamos después
    const bounding = targetItem.getBoundingClientRect();
    const offset = e.clientY - bounding.top;
    if (offset >= bounding.height / 2) {
        destIndex = destIndex + 1;
    }
    
    // Si venimos del mismo día y movemos hacia abajo/remontamos índice, debemos ajustar
    if (draggedFromDay === destDay && draggedFromIndex < destIndex) {
        destIndex -= 1;
    }
    
    moveTask(draggedFromDay, draggedFromIndex, destDay, destIndex);
}

// Cuando arrastramos sobre la lista (no sobre un ítem) para permitir soltar al final
function onListDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over-list');
}

// Cuando salimos del hover de la lista
function onListDragLeave(e) {
    this.classList.remove('drag-over-list');
}

// Cuando soltamos en la zona vacía de la lista (al final)
function onListDrop(e) {
    e.preventDefault();
    const taskList = e.currentTarget;
    taskList.classList.remove('drag-over-list');
    
    const destDay = taskList.id.replace('tasks-', ''); // ej. "lunes"
    let destIndex = calendarData.tasks[destDay].length; // al final
    
    // Si venimos del mismo día y la tarea estaba en último lugar, no hacer nada
    if (draggedFromDay === destDay && draggedFromIndex === destIndex - 1) return;
    
    moveTask(draggedFromDay, draggedFromIndex, destDay, destIndex);
}

// Función que mueve la tarea en los datos y re-renderiza
function moveTask(fromDay, fromIndex, toDay, toIndex) {
    const taskObj = calendarData.tasks[fromDay].splice(fromIndex, 1)[0];
    calendarData.tasks[toDay].splice(toIndex, 0, taskObj);
    saveData();
    renderTasks(fromDay);
    if (fromDay !== toDay) renderTasks(toDay);
}

// Configurar las áreas de texto
function setupTextAreas() {
    const textareas = document.querySelectorAll('.section-textarea');
    
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            calendarData.texts[this.id] = this.value;
            saveData();
        });
    });
}

// Configurar las zonas donde se pueden soltar stickers
function setupDropZones() {
    const dropZones = document.querySelectorAll('.sticker-area');
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        zone.addEventListener('dragleave', function(e) {
            if (!zone.contains(e.relatedTarget)) {
                this.classList.remove('drag-over');
            }
        });
        
        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            try {
                const stickerData = JSON.parse(e.dataTransfer.getData('application/json'));
                if (stickerData && stickerData.path) {
                    // Obtener coordenadas relativas a la zona de drop
                    const rect = this.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    // Crear sticker
                    createDroppedSticker(this, stickerData, x, y);
                }
            } catch (err) {
                console.error('Error al procesar el sticker:', err);
            }
        });
    });
}

// Crear un sticker en la zona de drop
function createDroppedSticker(dropZone, stickerData, x, y) {
    const stickerId = `${stickerData.id}-${Date.now()}`;
    
    // Crear el elemento visual del sticker
    const stickerElement = document.createElement('div');
    stickerElement.className = 'dropped-sticker';
    stickerElement.style.left = `${x - 35}px`; // Centrar horizontalmente
    stickerElement.style.top = `${y - 35}px`;  // Centrar verticalmente
    stickerElement.dataset.id = stickerId;
    stickerElement.innerHTML = `
        <img src="${stickerData.path}" alt="Sticker" draggable="false">
        <button class="sticker-remove">×</button>
    `;
    
    // Botón para eliminar
    const removeBtn = stickerElement.querySelector('.sticker-remove');
    removeBtn.addEventListener('click', function() {
        // Eliminar de los datos
        calendarData.stickers = calendarData.stickers.filter(s => s.id !== stickerId);
        stickerElement.remove();
        saveData();
    });
    
    // Hacer que el sticker sea movible
    makeElementDraggable(stickerElement, dropZone);
    
    // Añadir a la zona de drop
    dropZone.appendChild(stickerElement);
    
    // Guardar en los datos
    calendarData.stickers.push({
        id: stickerId,
        path: stickerData.path,
        zoneId: dropZone.dataset.dropzone,
        x: parseInt(stickerElement.style.left),
        y: parseInt(stickerElement.style.top)
    });
    
    saveData();
}

// Hacer que un elemento sea movible con el ratón
function makeElementDraggable(element, container) {
    let isDragging = false;
    let offsetX, offsetY;
    
    // Al empezar a arrastrar
    element.addEventListener('mousedown', function(e) {
        // No iniciar arrastre si se hizo clic en el botón de eliminar
        if (e.target.className === 'sticker-remove') return;
        
        isDragging = true;
        
        // Obtener la posición inicial del puntero relativa al sticker
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Estilo al arrastrar
        element.style.cursor = 'grabbing';
        element.style.zIndex = '100';
    });
    
    // Al mover el ratón mientras se arrastra
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const containerRect = container.getBoundingClientRect();
        let newX = e.clientX - containerRect.left - offsetX;
        let newY = e.clientY - containerRect.top - offsetY;
        
        // Limitar dentro del contenedor
        newX = Math.max(0, Math.min(newX, containerRect.width - element.offsetWidth));
        newY = Math.max(0, Math.min(newY, containerRect.height - element.offsetHeight));
        
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
    });
    
    // Al soltar el ratón
    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        
        isDragging = false;
        element.style.cursor = 'move';
        element.style.zIndex = '10';
        
        // Actualizar posición en los datos
        const stickerId = element.dataset.id;
        const stickerData = calendarData.stickers.find(s => s.id === stickerId);
        
        if (stickerData) {
            stickerData.x = parseInt(element.style.left);
            stickerData.y = parseInt(element.style.top);
            saveData();
        }
    });
}

// Configurar el panel de stickers
function setupStickerPalette() {
    const paletteToggle = document.getElementById('paletteToggle');
    const stickerPalette = document.getElementById('stickerPalette');
    
    // Cargar estado guardado del panel
    const isCollapsed = localStorage.getItem('palette-collapsed') === 'true';
    if (isCollapsed) {
        stickerPalette.classList.add('collapsed');
        paletteToggle.textContent = '📋';
    }
    
    paletteToggle.addEventListener('click', function() {
        const isCurrentlyCollapsed = stickerPalette.classList.contains('collapsed');
        
        if (isCurrentlyCollapsed) {
            // Desplegar
            stickerPalette.classList.remove('collapsed');
            paletteToggle.textContent = '📌';
            localStorage.setItem('palette-collapsed', 'false');
        } else {
            // Plegar
            stickerPalette.classList.add('collapsed');
            paletteToggle.textContent = '📋';
            localStorage.setItem('palette-collapsed', 'true');
        }
    });
}

// Configurar botones
function setupButtons() {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const clearBtn = document.getElementById('clearBtn');
    const fileImport = document.getElementById('fileImport');
    
    exportBtn.addEventListener('click', function() {
        exportData();
    });
    
    importBtn.addEventListener('click', function() {
        fileImport.click();
    });
    
    fileImport.addEventListener('change', function(e) {
        importData(e);
    });
    
    clearBtn.addEventListener('click', function() {
        if (confirm('¿Estás segura de que quieres limpiar todo? 🥺')) {
            resetData();
        }
    });
}

// Exportar datos
function exportData() {
    const dataStr = JSON.stringify(calendarData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'burbujita-semana.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

// Importar datos
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validar que el formato sea correcto
            if (importedData.tasks && importedData.texts && importedData.stickers) {
                calendarData = importedData;
                
                // Limpiar todas las tareas y stickers actuales
                document.querySelectorAll('.task-list').forEach(list => {
                    list.innerHTML = '';
                });
                
                document.querySelectorAll('.dropped-sticker').forEach(sticker => {
                    sticker.remove();
                });
                
                // Cargar datos importados
                loadData();
                
                alert('¡Datos importados correctamente! 💖');
            } else {
                alert('El archivo no tiene el formato correcto 😥');
            }
        } catch (err) {
            console.error('Error al importar los datos:', err);
            alert('Error al importar los datos. Verifica que sea un archivo JSON válido.');
        }
        
        // Limpiar el input file
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// Guardar datos en localStorage
function saveData() {
    localStorage.setItem('burbujita-calendario', JSON.stringify(calendarData));
}

// Cargar datos desde localStorage
function loadData() {
    const savedData = localStorage.getItem('burbujita-calendario');
    
    if (savedData) {
        try {
            calendarData = JSON.parse(savedData);
            
            // Renderizar tareas
            for (const day in calendarData.tasks) {
                renderTasks(day);
            }
            
            // Cargar textos
            for (const id in calendarData.texts) {
                const textarea = document.getElementById(id);
                if (textarea) {
                    textarea.value = calendarData.texts[id] || '';
                }
            }
            
            // Cargar stickers
            calendarData.stickers.forEach(sticker => {
                const dropZone = document.querySelector(
                  `.sticker-area[data-dropzone="${sticker.zoneId}"]`
                );
                if (dropZone) {
                    const stickerElement = document.createElement('div');
                    stickerElement.className = 'dropped-sticker';
                    stickerElement.style.left = `${sticker.x}px`;
                    stickerElement.style.top = `${sticker.y}px`;
                    stickerElement.dataset.id = sticker.id;
                    stickerElement.innerHTML = `
                        <img src="${sticker.path}" alt="Sticker" draggable="false">
                        <button class="sticker-remove">×</button>
                    `;
                    
                    // Botón para eliminar
                    const removeBtn = stickerElement.querySelector('.sticker-remove');
                    removeBtn.addEventListener('click', function() {
                        calendarData.stickers = calendarData.stickers.filter(
                          s => s.id !== sticker.id
                        );
                        stickerElement.remove();
                        saveData();
                    });
                    
                    // Hacer movible
                    makeElementDraggable(stickerElement, dropZone);
                    
                    dropZone.appendChild(stickerElement);
                }
            });
            
        } catch (err) {
            console.error('Error al cargar los datos:', err);
        }
    }
}

// Resetear todos los datos
function resetData() {
    // Reiniciar objeto de datos
    calendarData = {
        tasks: {
            lunes: [],
            martes: [],
            miercoles: [],
            jueves: [],
            viernes: []
        },
        texts: {
            meta: '',
            autocuidado: '',
            emociones: '',
            motivacion: '',
            notas: ''
        },
        stickers: []
    };
    
    // Limpiar tareas
    for (const day in calendarData.tasks) {
        renderTasks(day);
    }
    
    // Limpiar textos
    document.querySelectorAll('.section-textarea').forEach(textarea => {
        textarea.value = '';
    });
    
    // Limpiar stickers
    document.querySelectorAll('.dropped-sticker').forEach(sticker => {
        sticker.remove();
    });
    
    // Guardar datos limpios
    saveData();
    
    alert('¡Todo limpio y listo para una nueva semana! ✨');
}
