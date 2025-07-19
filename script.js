document.addEventListener("DOMContentLoaded", () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  
    const greeting = document.getElementById("greeting");
    const nameInput = document.getElementById("nameInput");
    const nameSection = document.getElementById("nameSection");
    const saveNameBtn = document.getElementById("saveNameBtn");
    const startLink = document.getElementById("startLink");
    const startTaskLink = document.getElementById("startTaskLink");
    const taskSection = document.getElementById("taskSection");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const editNameBtn = document.getElementById("editNameBtn");
  
    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
  
    const savedName = localStorage.getItem("username");
    if (savedName) {
      greeting.textContent = `Welcome, ${savedName}!`;
      nameSection.style.display = "none";
      startLink.style.display = "block";
    }
  
    saveNameBtn.addEventListener("click", () => {
      const name = nameInput.value.trim();
      if (!name) return alert("Please enter your name.");
      localStorage.setItem("username", name);
      greeting.textContent = `Welcome, ${name}!`;
      nameSection.style.display = "none";
      startLink.style.display = "block";
      alert(`Hi ${name}, your name has been saved!`);
    });
  
    startTaskLink.addEventListener("click", (e) => {
      e.preventDefault();
      startLink.style.display = "none";
      taskSection.style.display = "block";
      usernameDisplay.textContent = `👤 ${localStorage.getItem("username")}`;
    });
  
    editNameBtn.addEventListener("click", () => {
      nameSection.style.display = "flex";
      taskSection.style.display = "none";
      nameInput.value = localStorage.getItem("username");
    });
  
    document.getElementById("switchUserBtn").addEventListener("click", () => {
      if (confirm("Do you want to switch users?")) {
        localStorage.removeItem("username");
        location.reload();
      }
    });
  
    document.getElementById("addTaskBtn").addEventListener("click", () => {
      const text = document.getElementById("taskInput").value.trim();
      const date = document.getElementById("taskDate").value;
      const time = document.getElementById("taskTime").value;
      if (!text) return alert("Please enter a task.");
  
      taskList.push({ text, date, time, completed: false, notified: false });
      saveTasks();
      renderTasks();
      document.getElementById("taskInput").value = "";
      document.getElementById("taskDate").value = "";
      document.getElementById("taskTime").value = "";
      alert(`✅ Task added: "${text}"`);
    });
  
    function renderTasks() {
      const taskUl = document.getElementById("taskList");
      const doneUl = document.getElementById("doneList");
      const empty = document.getElementById("emptyMessage");
  
      taskUl.innerHTML = "";
      doneUl.innerHTML = "";
  
      const active = taskList.filter(t => !t.completed);
      const done = taskList.filter(t => t.completed);
  
      empty.style.display = active.length ? "none" : "block";
  
      active.forEach((task, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${task.text}</strong><br>
          ${task.date ? "📅 " + task.date : ""} ${task.time ? "🕒 " + task.time : ""}
          <div style="margin-top:5px;">
            <button onclick="markDone(${i})">✅</button>
            <button onclick="editTask(${i})">✏️</button>
            <button onclick="deleteTask(${i})">🗑️</button>
          </div>
        `;
        taskUl.appendChild(li);
      });
  
      done.forEach((task, i) => {
        const li = document.createElement("li");
        li.classList.add("done");
        li.innerHTML = `
          <strong>${task.text}</strong><br>
          ${task.date ? "📅 " + task.date : ""} ${task.time ? "🕒 " + task.time : ""}
          <div style="margin-top:5px;">
            <button onclick="deleteTask(${taskList.indexOf(task)})">🗑️</button>
          </div>
        `;
        doneUl.appendChild(li);
      });
    }
  
    window.markDone = (i) => {
      taskList[i].completed = true;
      saveTasks();
      renderTasks();
    };
  
    window.editTask = (i) => {
      const task = taskList[i];
      const newText = prompt("Edit Task", task.text);
      if (newText !== null) task.text = newText;
      const newDate = prompt("Edit Date (YYYY-MM-DD)", task.date || "");
      if (newDate !== null) task.date = newDate;
      const newTime = prompt("Edit Time (HH:MM)", task.time || "");
      if (newTime !== null) task.time = newTime;
      task.notified = false;
      saveTasks();
      renderTasks();
    };
  
    window.deleteTask = (i) => {
      if (confirm("Delete this task?")) {
        taskList.splice(i, 1);
        saveTasks();
        renderTasks();
      }
    };
  
    function saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(taskList));
    }
  
    function checkReminders() {
      const now = new Date();
      taskList.forEach((task, i) => {
        if (task.completed || task.notified || !task.date || !task.time) return;
        const taskTime = new Date(`${task.date}T${task.time}`);
        const timeDiff = taskTime - now;
        if (Math.abs(timeDiff) < 60000) {
          const msg = `⏰ Task due: "${task.text}"`;
          if (Notification.permission === "granted") {
            new Notification("Task Reminder", { body: msg });
          } else {
            alert(msg);
          }
          task.notified = true;
          saveTasks();
        }
      });
    }
  
    renderTasks();
    checkReminders();
    setInterval(checkReminders, 60000); // every minute
  });
  