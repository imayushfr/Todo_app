const form = document.querySelector("form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

let todos = load_todos();
update_list();

form.addEventListener("submit", function (event){
    event.preventDefault();
    add_todo();
})

function add_todo(){
    const todo_text = input.value.trim();
    if (todo_text.length > 0){
        const todo_obj = {
            text: todo_text,
            completed: false
        }
        todos.push(todo_obj);
        save_todos();
        if (current_filter === "all")
        {
            update_list();
        }
        else
        {
            filtered_list();
        }        
        input.value = "";
    }
}

function create_todo(todo, index){
    const todo_id = "todo-" + index;
    const todo_li = document.createElement("li");
    const todo_text = todo.text;
    todo_li.className = "todo";
    todo_li.draggable = true;
    todo_li.dataset.index = index;
    todo_li.innerHTML = `
    <input type="checkbox" id="${todo_id}">
      <label class="custom-checkbox" for="${todo_id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="9"><path fill="none" stroke="#FFF" stroke-width="2" d="M1 4.304L3.696 7l6-6"/>
        </svg>
      </label>
      <p class="todo_text" todo_index="${index}">${todo_text}</p>
      <button class="dlt-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path fill="#494C6B" fill-rule="evenodd" d="M16.97 0l.708.707L9.546 8.84l8.132 8.132-.707.707-8.132-8.132-8.132 8.132L0 16.97l8.132-8.132L0 .707.707 0 8.84 8.132 16.971 0z"/>
        </svg>
      </button>
    `

    const dlt_btn = todo_li.querySelector(".dlt-btn");
    dlt_btn.addEventListener("click", ()=>{
        dlt_todo(index);
    })

    const checkbox = todo_li.querySelector("input");
    checkbox.addEventListener("change", ()=>{
        todos[index].completed = checkbox.checked;
        save_todos();
        items_left();
    })
    checkbox.checked = todo.completed;
    
    const edit_text = todo_li.querySelector(".todo_text");
    edit_text.addEventListener("click", ()=>{
        edit_todo(edit_text, index);
    })

    todo_li.addEventListener('dragstart', drag_start);
    todo_li.addEventListener('dragenter', drag_enter);
    todo_li.addEventListener('dragover', drag_over);
    todo_li.addEventListener('dragleave', drag_leave);
    todo_li.addEventListener('drop', drop);
    todo_li.addEventListener('dragend', drag_end);

    return todo_li;
}

function edit_todo(edit_text, index){
    if (edit_text.querySelector("input"))
    {
        return;
    }

    const current_text = edit_text.textContent;

    const edit_input = document.createElement("input");
    edit_input.type = "text";
    edit_input.value = current_text;
    edit_input.className = "edit_input";

    edit_text.innerHTML = "";
    edit_text.appendChild(edit_input);

    edit_input.focus();
    edit_input.select();

    function save_edit(){
        const new_text = edit_input.value.trim();
        if (new_text.length > 0){
            todos[index].text = new_text;
            save_todos();
        }
        edit_text.textContent = todos[index].text;
    }

    edit_input.addEventListener("keydown", (event)=>{
        if (event.key === "Enter"){
            save_edit();
        }
        else if (event.key === "Escape"){
            edit_text.textContent = current_text;
        }
    })

    edit_input.addEventListener('blur', save_edit);
}

function update_list(){
    list.innerHTML = "";
    todos.forEach((todo, index)=>{
        const todo_item = create_todo(todo, index);
        list.append(todo_item);
    })
    items_left();
}

function save_todos(){
    const todosJSON = JSON.stringify(todos);
    localStorage.setItem("json", todosJSON);
    items_left();
}

function load_todos(){
    const array = localStorage.getItem("json",) || "[]";
    return JSON.parse(array);
}

function dlt_todo(index){
    todos = todos.filter((_, i)=> i!== index);
    save_todos();
    if (current_filter === "all")
        {
            update_list();
        }
        else
        {
            filtered_list();
        } 
}

let current_filter = "all";
let dragged_element = null;
let dragged_index = null;

function drag_start(e) {
    dragged_element = this;
    dragged_index = parseInt(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function drag_enter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function drag_over(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function drag_leave(e) {
    this.classList.remove('drag-over');
}

function drop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (dragged_element !== this) {
        const targetIndex = parseInt(this.dataset.index);
        
        const dragged_todo = todos[dragged_index];
        todos.splice(dragged_index, 1);
        todos.splice(targetIndex, 0, dragged_todo);

        save_todos();

        if (current_filter === "all") {
            update_list();
        } else {
            filtered_list();
        }
    }
}

function drag_end(e) {
    this.classList.remove('dragging');
    
    const allItems = document.querySelectorAll('.todo');
    allItems.forEach(item => {
        item.classList.remove('drag-over');
    });
    
    dragged_element = null;
    dragged_index = null;
}

document.addEventListener("DOMContentLoaded", function(){
    const filter_btns = document.querySelectorAll(".filter-btn");
    filter_btns.forEach(button => {
        button.addEventListener("click", function(){
            filter_btns.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            current_filter = this.dataset.filter;
            filtered_list();
        })
    })

    const clear_btn = document.getElementById("clear-btn");
    clear_btn.addEventListener("click", clear_completed);

    items_left();
})

function filtered_list(){
    list.innerHTML = "";

    const filtered = todos.filter(todo => {
        if (current_filter === "active")
        {
            return !todo.completed;
        }
        if (current_filter === "completed")
        {
            return todo.completed;
        }
        return true;
    })

    filtered.forEach((todo) => {
        const index = todos.indexOf(todo);
        const todo_item = create_todo(todo, index);
        list.append(todo_item);
    })

    items_left();
}

function items_left(){
    const actives = todos.filter(todo => !todo.completed).length;
    const left = document.getElementById("items-left");
    left.textContent = `${actives} item(s) left`; 
}

function clear_completed(){
    todos = todos.filter(todo => !todo.completed);
    save_todos();
    if (current_filter === "all")
        {
            update_list();
        }
        else
        {
            filtered_list();
        }   
}

