import { loadTasks, saveTasks } from './storage.js';
import { changeTaskStatus, deleteTask, renameTask, TASK_STATUSES } from './task.js';

export function mountIssueTracker(root) {
  const loaded = loadTasks();
  const tasks = loaded.tasks;

  root.innerHTML = `
    <h1>Mini Issue Tracker</h1>
    <p data-storage-message role="status"></p>
    <form novalidate>
      <label for="task-title">任務標題</label>
      <div class="entry">
        <input id="task-title" name="title" type="text" required
          aria-describedby="title-error" autocomplete="off" />
        <button type="submit">新增</button>
      </div>
      <p id="title-error" role="alert"></p>
    </form>
    <h2>任務清單</h2>
    <div class="task-filters" role="search" aria-label="搜尋與篩選任務">
      <div>
        <label for="task-search">搜尋任務標題</label>
        <input id="task-search" type="search" placeholder="輸入標題關鍵字" />
      </div>
      <div>
        <label for="status-filter">篩選任務狀態</label>
        <select id="status-filter">
          <option value="">全部狀態</option>
        </select>
      </div>
      <button type="button" data-reset-filters>清除條件</button>
    </div>
    <p data-filter-summary role="status"></p>
    <p data-empty-state>目前沒有任務</p>
    <ul aria-label="任務清單" aria-live="polite"></ul>
  `;

  const storageMessage = root.querySelector('[data-storage-message]');
  storageMessage.textContent = loaded.error;
  const persist = () => {
    storageMessage.textContent = saveTasks(tasks)
      ? '' : '無法儲存任務；目前變更僅保留於此頁面，重新整理後可能遺失。';
  };

  const form = root.querySelector('form');
  const input = root.querySelector('input');
  const error = root.querySelector('[role="alert"]');
  const list = root.querySelector('ul');
  const emptyState = root.querySelector('[data-empty-state]');

  const search = root.querySelector('#task-search');
  const statusFilter = root.querySelector('#status-filter');
  const summary = root.querySelector('[data-filter-summary]');
  for (const value of TASK_STATUSES) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    statusFilter.append(option);
  }

  const applyFilters = () => {
    const keyword = search.value.trim().toLowerCase();
    const byId = new Map(tasks.map((task) => [task.id, task]));
    let visibleCount = 0;
    for (const item of list.children) {
      const task = byId.get(item.dataset.taskId);
      item.hidden = !task.title.toLowerCase().includes(keyword)
        || (statusFilter.value !== '' && task.status !== statusFilter.value);
      if (!item.hidden) visibleCount++;
      if (item.hidden && item.contains(document.activeElement)) search.focus();
    }
    emptyState.hidden = visibleCount > 0;
    emptyState.textContent = tasks.length === 0 ? '目前沒有任務' : '沒有符合條件的任務';
    summary.textContent = `顯示 ${visibleCount} / ${tasks.length} 筆任務`;
  };
  search.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  root.querySelector('[data-reset-filters]').addEventListener('click', () => {
    search.value = '';
    statusFilter.value = '';
    applyFilters();
    search.focus();
  });

  const renderTask = (task) => {
    const item = document.createElement('li');
    item.dataset.taskId = task.id;
    const titleElement = document.createElement('span');
    titleElement.id = `title-${task.id}`;
    titleElement.textContent = task.title;
    const status = document.createElement('span');
    status.className = 'status';
    status.textContent = task.status;
    const statusSelect = document.createElement('select');
    statusSelect.setAttribute('aria-label', '任務狀態');
    statusSelect.setAttribute('aria-describedby', titleElement.id);
    for (const value of TASK_STATUSES) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      statusSelect.append(option);
    }
    statusSelect.value = task.status;
    statusSelect.addEventListener('change', () => {
      changeTaskStatus(task, statusSelect.value);
      persist();
      status.textContent = task.status;
      statusSelect.value = task.status;
      applyFilters();
    });
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = '編輯';
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = '刪除';
    deleteButton.dataset.delete = '';
    deleteButton.addEventListener('click', () => {
      if (!window.confirm(`確定要永久刪除任務「${task.title}」嗎？此操作無法復原。`)) return;
      if (!deleteTask(tasks, task.id)) return;
      persist();
      item.remove();
      applyFilters();
      input.focus();
    });
    item.append(titleElement, status, statusSelect, editButton, deleteButton);
    editButton.addEventListener('click', () => {
      const editorId = crypto.randomUUID();
      const editor = document.createElement('form');
      editor.className = 'task-edit';
      editor.noValidate = true;
      editor.innerHTML = `
        <label for="edit-${editorId}">編輯任務標題</label>
        <input id="edit-${editorId}" name="title" required
          aria-describedby="edit-error-${editorId}" />
        <div class="edit-actions">
          <button type="submit">儲存</button>
          <button type="button" data-cancel>取消</button>
        </div>
        <p id="edit-error-${editorId}" role="alert"></p>
      `;
      const editInput = editor.querySelector('input');
      const editError = editor.querySelector('[role="alert"]');
      editInput.value = task.title;
      titleElement.hidden = true;
      editButton.hidden = true;
      item.append(editor);
      editInput.focus();

      const closeEditor = () => {
        editor.remove();
        titleElement.hidden = false;
        editButton.hidden = false;
        editButton.focus();
      };
      editor.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!renameTask(task, editInput.value)) {
          editError.textContent = '請輸入任務標題，不能只有空白。';
          editInput.setAttribute('aria-invalid', 'true');
          editInput.focus();
          return;
        }
        persist();
        titleElement.textContent = task.title;
        closeEditor();
        applyFilters();
      });
      editor.querySelector('[data-cancel]').addEventListener('click', closeEditor);
    });
    list.append(item);
  };

  for (const task of tasks) renderTask(task);
  applyFilters();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) {
      error.textContent = '請輸入任務標題，不能只有空白。';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }

    const task = { id: crypto.randomUUID(), title, status: TASK_STATUSES[0] };
    tasks.push(task);
    renderTask(task);
    persist();
    applyFilters();

    input.value = '';
    error.textContent = '';
    input.removeAttribute('aria-invalid');
    input.focus();
  });
}
