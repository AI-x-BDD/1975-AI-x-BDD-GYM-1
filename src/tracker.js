import { deleteTask, renameTask } from './task.js';

export function mountIssueTracker(root) {
  // Each mounted tracker owns its state; refreshing starts a new session.
  const tasks = [];

  root.innerHTML = `
    <h1>Mini Issue Tracker</h1>
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
    <p data-empty-state>目前沒有任務</p>
    <ul aria-label="任務清單" aria-live="polite"></ul>
  `;

  const form = root.querySelector('form');
  const input = root.querySelector('input');
  const error = root.querySelector('[role="alert"]');
  const list = root.querySelector('ul');
  const emptyState = root.querySelector('[data-empty-state]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) {
      error.textContent = '請輸入任務標題，不能只有空白。';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }

    const task = { id: crypto.randomUUID(), title, status: '待辦' };
    tasks.push(task);
    const item = document.createElement('li');
    item.dataset.taskId = task.id;
    const titleElement = document.createElement('span');
    titleElement.textContent = task.title;
    const status = document.createElement('span');
    status.className = 'status';
    status.textContent = task.status;
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
      item.remove();
      emptyState.hidden = tasks.length > 0;
      input.focus();
    });
    item.append(titleElement, status, editButton, deleteButton);
    editButton.addEventListener('click', () => {
      const editor = document.createElement('form');
      editor.className = 'task-edit';
      editor.noValidate = true;
      editor.innerHTML = `
        <label for="edit-${task.id}">編輯任務標題</label>
        <input id="edit-${task.id}" name="title" required
          aria-describedby="edit-error-${task.id}" />
        <div class="edit-actions">
          <button type="submit">儲存</button>
          <button type="button" data-cancel>取消</button>
        </div>
        <p id="edit-error-${task.id}" role="alert"></p>
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
        titleElement.textContent = task.title;
        closeEditor();
      });
      editor.querySelector('[data-cancel]').addEventListener('click', closeEditor);
    });
    list.append(item);
    emptyState.hidden = tasks.length > 0;

    input.value = '';
    error.textContent = '';
    input.removeAttribute('aria-invalid');
    input.focus();
  });
}
