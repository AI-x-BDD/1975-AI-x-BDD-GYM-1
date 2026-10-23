// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { mountIssueTracker } from './tracker.js';
import { renameTask } from './task.js';

describe('編輯任務', () => {
  let root;
  const add = (title) => {
    root.querySelector('#task-title').value = title;
    root.querySelector('form button').click();
    return [...root.querySelectorAll('li')].at(-1);
  };
  const edit = (item) => {
    item.querySelector('button').click();
    return item.querySelector('input');
  };
  const save = (item) => item.querySelector('button[type="submit"]').click();
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<main></main>';
    root = document.querySelector('main');
    mountIssueTracker(root);
  });
  afterEach(() => vi.restoreAllMocks());

  it('每筆提供編輯按鈕，預填原標題並聚焦', () => {
    const item = add('原始任務');
    const input = edit(item);
    expect(input.value).toBe('原始任務');
    expect(document.activeElement).toBe(input);
    expect(item.querySelector('label').htmlFor).toBe(input.id);
  });

  it('儲存時 trim 並立即顯示新標題，保留 ID 與狀態', () => {
    const item = add('原始任務');
    const id = item.dataset.taskId;
    expect(id).toBeTruthy();
    edit(item).value = '  更新任務  ';
    save(item);
    expect(item.firstElementChild.textContent).toBe('更新任務');
    expect(item.dataset.taskId).toBe(id);
    expect(item.querySelector('.status').textContent).toBe('待辦');
    expect(item.querySelector('form')).toBeNull();
    expect(document.activeElement.textContent).toBe('編輯');
    expect(edit(item).value).toBe('更新任務');
  });

  it.each(['', '   ', '\t\n', '\u3000'])('拒絕空白標題 %j，修正後可儲存', (title) => {
    const item = add('原始任務');
    const input = edit(item);
    input.value = title;
    save(item);
    expect(item.firstElementChild.textContent).toBe('原始任務');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(item.querySelector('[role="alert"]').textContent).toContain('請輸入任務標題');
    input.value = '修正任務';
    save(item);
    expect(item.firstElementChild.textContent).toBe('修正任務');
    expect(item.querySelector('form')).toBeNull();
  });

  it('取消編輯保留原內容，再次編輯預填原標題', () => {
    const item = add('原始任務');
    edit(item).value = '未儲存草稿';
    item.querySelector('[data-cancel]').click();
    expect(item.firstElementChild.textContent).toBe('原始任務');
    expect(item.querySelector('form')).toBeNull();
    expect(edit(item).value).toBe('原始任務');
  });

  it('同標題任務有不同 ID，編輯其中一筆不影響另一筆', () => {
    const first = add('相同任務');
    const second = add('相同任務');
    const secondBefore = second.outerHTML;
    expect(first.dataset.taskId).not.toBe(second.dataset.taskId);
    edit(first).value = '只改第一筆';
    save(first);
    expect(first.firstElementChild.textContent).toBe('只改第一筆');
    expect(second.outerHTML).toBe(secondBefore);
  });

  it('編輯期間可新增任務，其他編輯草稿不受影響', () => {
    const first = add('第一筆');
    const second = add('第二筆');
    edit(first).value = '第一筆草稿';
    edit(second).value = '第二筆更新';
    const third = add('第三筆');
    save(second);
    expect(first.querySelector('input').value).toBe('第一筆草稿');
    expect(second.firstElementChild.textContent).toBe('第二筆更新');
    expect(third.firstElementChild.textContent).toBe('第三筆');
    expect(root.querySelector('[data-empty-state]').hidden).toBe(true);
  });

  it('編輯後的 HTML 仍安全呈現為文字並保存', () => {
    const item = add('原始');
    edit(item).value = '<img src=x onerror=alert(1)>';
    save(item);
    expect(item.firstElementChild.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(item.querySelector('img')).toBeNull();
    mountIssueTracker(root);
    expect(root.querySelector('li').firstElementChild.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(root.querySelector('img')).toBeNull();
  });
});

describe('任務資料保留', () => {
  it('只更新原物件標題，保留 ID、非預設狀態與其他資料', () => {
    const metadata = { owner: 'someone' };
    const task = { id: 'existing-id', title: '原標題', status: '進行中', metadata };
    expect(renameTask(task, ' 新標題 ')).toBe(true);
    expect(task).toEqual({ id: 'existing-id', title: '新標題', status: '進行中', metadata });
    expect(task.metadata).toBe(metadata);
  });

  it('驗證失敗時整個任務資料不變', () => {
    const task = { id: 'existing-id', title: '原標題', status: '待辦', extra: 42 };
    const before = { ...task };
    expect(renameTask(task, '  ')).toBe(false);
    expect(task).toEqual(before);
  });
});
