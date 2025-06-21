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
        update_list();
        save_todos();
        input.value = "";
    }
}

function create_todo(todo, index){
    const todo_id = "todo-" + index;
    const todo_li = document.createElement("li");
    const todo_text = todo.text;
    todo_li.className = "todo";
    todo_li.innerHTML = `
    <input type="checkbox" id="${todo_id}">
      <label class="custom-checkbox" for="${todo_id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="9"><path fill="none" stroke="#FFF" stroke-width="2" d="M1 4.304L3.696 7l6-6"/>
        </svg>
      </label>
      <p>${todo_text}</p>
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
    })
    checkbox.checked = todo.completed;
    return todo_li;
}

function dlt_todo(index){
    todos = todos.filter((_, i)=> i!== index);
    save_todos();
    update_list();
}

function update_list(){
    list.innerHTML = "";
    todos.forEach((todo, index)=>{
        todo_item = create_todo(todo, index);
        list.append(todo_item);
    });
}

function save_todos(){
    const todosJSON = JSON.stringify(todos);
    localStorage.setItem("json", todosJSON);
}

function load_todos(){
    const array = localStorage.getItem("json",) || "[]";
    return JSON.parse(array);
}