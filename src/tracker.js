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
    <ul aria-label="任務清單" aria-live="polite"></ul>
  `;

  const form = root.querySelector('form');
  const input = root.querySelector('input');
  const error = root.querySelector('[role="alert"]');
  const list = root.querySelector('ul');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) {
      error.textContent = '請輸入任務標題，不能只有空白。';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }

    const task = { title, status: '待辦' };
    tasks.push(task);
    const item = document.createElement('li');
    const titleElement = document.createElement('span');
    titleElement.textContent = task.title;
    const status = document.createElement('span');
    status.className = 'status';
    status.textContent = task.status;
    item.append(titleElement, status);
    list.append(item);

    input.value = '';
    error.textContent = '';
    input.removeAttribute('aria-invalid');
    input.focus();
  });
}
