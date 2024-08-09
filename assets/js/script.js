// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;



//function to generate a unique task id
function generateTaskId() {
    nextId++;
    localStorage.setItem("nextId", nextId);
    return nextId - 1;
}

// Function to create a task card
function createTaskCard(task) {
    const taskCard = $(`
        <div class="task-card card mb-3" data-id="${task.id}">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small class="text-muted">Deadline: ${task.deadline}</small></p>
                <button class="btn btn-danger delete-task-btn">Delete</button>
            </div>
        </div>
    `);

    const deadline = dayjs(task.deadline);
    const now = dayjs();
    if (now.isAfter(deadline)) {
        taskCard.addClass('bg-danger text-white');
    } else if (now.add(2, 'day').isAfter(deadline)) {
        taskCard.addClass('bg-warning text-dark');
    }

    return taskCard;
}

// Function to handle rendering the task list and make cards draggable
function renderTaskList() {
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty();

    for (let task of taskList) {
        let taskCard = createTaskCard(task);
        if (task.status === 'to-do') {
            $('#todo-cards').append(taskCard);
        } else if (task.status === 'in-progress') {
            $('#in-progress-cards').append(taskCard);
        } else if (task.status === 'done') {
            $('#done-cards').append(taskCard);
        }
    }

    initializeDraggable();
    initializeDroppable();
}

// Function to initialize draggable functionality
function initializeDraggable() {

    $('.task-card').draggable({
        revert: "invalid",
        helper: "clone",
        start: function (event, ui) {
            $(this).hide();
            ui.helper.css('z-index', 1000);
        },
        stop: function (event, ui) {
            $(this).css('z-index', 1).show();
        },
        appendTo: 'body'
    });
}

// Function to initialize droppable functionality
function initializeDroppable() {
    $('.lane').droppable({
        accept: '.task-card',
        drop: handleDrop
    });
}


// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    let title = $('#task-title').val();
    let description = $('#task-desc').val();
    let deadline = $('#task-deadline').val();
    let id = generateTaskId();
    let task = { id, title, description, deadline, status: 'to-do' };

    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));

    let taskCard = createTaskCard(task);
    $('#todo-cards').append(taskCard);

    $('#formModal')[0].reset();
    $('#formModal').modal('hide');

    initializeDraggable();
}

// Function to handle moving a task into a new status lane
function handleDrop(event, ui) {
    const target = $(event.target).closest('.lane');
    if (target.length) {
        const newStatus = target.find('.card-title').text().toLowerCase().replace(' ', '-'); // 'to-do', 'in-progress', or 'done'
        const taskId = ui.helper.data('id');

        let task = taskList.find(task => task.id === taskId);
        if (task) {
            task.status = newStatus;
            localStorage.setItem("tasks", JSON.stringify(taskList));
            renderTaskList();
        }
    }
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    const btnClicked = $(event.target);
    const taskId = btnClicked.closest('.task-card').data('id');

    // Remove task from the taskList array
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));

    // Remove task card from the DOM
    btnClicked.closest('.task-card').remove();
}

$(document).ready(function () {
    renderTaskList();

    $('#formModal').on('submit', handleAddTask);

    $(document).on('click', '.delete-task-btn', handleDeleteTask);
});