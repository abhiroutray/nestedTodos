// Workflow:
  // Type todo text into the input box
  // If tab is pressed, check if a same level <li> exists above the new item
    // If a <li> exists, create a new <ul> under this <li>
  // If enter is pressed, the new <li> should be created under the current <ul>

var util = {
  generateId: function() { // borrowed from todoMVC code, thanks
    /*jshint bitwise:false */
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
  }
}

function Todo(todoText) {
  this.todoText = todoText;
  this.completed = false;
  this.id = util.generateId();
  this.childTodos = [];
}

var todoList = {
  todos: [],

  // takes some text, creates a todo, and adds it to the list
  // if an id is given, it finds a todo with that id and adds the todo as a child todo
  addTodo: function(todoText, id) {
    var newTodo = new Todo(todoText);

    if (arguments.length > 1) { // if given an id, find the todo with that id and add new todo as a subtodo
      var parentTodo = this.findTodoById(id);
      parentTodo.childTodos.push(newTodo);
    } else {
      this.todos.push(newTodo);
    }
  },

  // takes an id and returns the todo corresponding to that id
  // second argument, listToSearch, is only used for recursively searching through child todos
  findTodoById: function(id, listToSearch) {
    var result;
    
    // if listToSearch is not given, start search at the top level of todos
    if (arguments.length < 2) {
      listToSearch = this.todos;
    }

    // search todos for the id
    listToSearch.forEach(function(todo) {
      if (todo.id === id) {
        result = todo;
      } else if (todo.childTodos.length > 0) { // if the todo has child todos, perform a recursive search across its child todos for the id
        result = todoList.findTodoById(id, todo.childTodos);
      }
    });

    return result;
  },

  // finds a todo with the given id and changes its text to the new todoText
  editTodo: function(todoText, id) {
    var todo = this.findTodoById(id);
    todo.todoText = todoText;
  },

  toggleCompleted: function(id, status) {
    var todo = this.findTodoById(id);

    if (arguments.length < 2) {
      todo.completed = !todo.completed;
    } else { // second argument, status, is only used for recursively setting completed property to match that of parent
      todo.completed = status;
    }
    
    // What if this todo has child todos?
    // Child todos should be toggled to have the same completed property as the parent.
    if (todo.childTodos.length > 0) {
      todo.childTodos.forEach(function(childTodo) {
        todoList.toggleCompleted(childTodo.id, todo.completed);
      });
    }
  },

  // very similar recursive method to todoList.findTodoById
  deleteTodo: function(id, listToSearch) {
    // if listToSearch is not given, start search at the top level of todos
    if (arguments.length < 2) {
      listToSearch = this.todos;
    }
    
    listToSearch.forEach(function(todo, index) {
      if (todo.id === id) {
        listToSearch.splice(index, 1);
      } else if (todo.childTodos.length > 0) {
        todoList.deleteTodo(id, todo.childTodos);
      }
    });
  }
}

var view = {
  // again, similar recursion to todoList.findTodoById and todoList.deleteTodo
  // make a new <li> for each todo and add it to the main <ul>
  // if a todo has child todos, create a new <ul> under that <li> and repeat the process recursively
  displayTodos: function(unorderedListId, listToDisplay) {
    // if listToDisplay is not given, assume we want to display todoList.todos
    if (arguments.length < 2) {
      listToDisplay = todoList.todos;
    }

    // if unorderedListId is not given, assume we want to add todos to the top level unordered list
    if (arguments.length < 1) {
      unorderedListId = 'todo-list';
    }

    var parentUnorderedList = document.getElementById(unorderedListId);
    parentUnorderedList.textContent = '';

    listToDisplay.forEach(function(todo) {
      var displayText = '';

      if (todo.completed === true) {
        displayText = '(x) ' + todo.todoText;
      } else {
        displayText = '( ) ' + todo.todoText;
      }

      var todoListItem = document.createElement('li');
      
      todoListItem.textContent = displayText;
      todoListItem.id = todo.id;
      parentUnorderedList.appendChild(todoListItem);

      // if a todo has child todos, create a new <ul> under this todos <li>
      // recursively call todoList.displayTodos, passing the id of the new <ul> along with the child todos array
      if (todo.childTodos.length > 0) {
        var childUnorderedList = document.createElement('ul');
        
        childUnorderedList.id = 'list-' + todo.id;  // gives new <ul> an id that corresponds with its <li> but avoids id conflict by prepending 'list-'
        todoListItem.appendChild(childUnorderedList);
        view.displayTodos(childUnorderedList.id, todo.childTodos);
      }
    });
  }
}