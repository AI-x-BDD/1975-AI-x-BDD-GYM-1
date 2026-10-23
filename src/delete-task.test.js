// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountIssueTracker } from './tracker.js';
import { deleteTask } from './task.js';

describe('刪除任務', () => {
  let root;
  let confirm;
  const add = (title) => {
    root.querySelector('#task-title').value = title;
    root.querySelector('form button').click();
    return [...root.querySelectorAll('li')].at(-1);
  };
  const remove = (item) => item.querySelector('[data-delete]').click();
  beforeEach(() => {
    document.body.innerHTML = '<main></main>';
    root = document.querySelector('main');
    mountIssueTracker(root);
    confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  });
  afterEach(() => vi.restoreAllMocks());

  it('每筆提供刪除按鈕，確認內容指出任務與永久刪除', () => {
    const item = add('準備需求');
    expect(item.querySelector('[data-delete]').textContent).toBe('刪除');
    remove(item);
    expect(confirm).toHaveBeenCalledOnce();
    expect(confirm.mock.calls[0][0]).toContain('準備需求');
    expect(confirm.mock.calls[0][0]).toContain('永久刪除');
    expect(root.querySelectorAll('li')).toHaveLength(1);
  });

  it('確認後立即移除指定 ID，同名任務與其他資料不變', () => {
    const first = add('同名任務');
    const second = add('同名任務');
    const third = add('其他任務');
    const firstBefore = first.outerHTML;
    const thirdBefore = third.outerHTML;
    const id = second.dataset.taskId;
    confirm.mockReturnValue(true);
    remove(second);
    expect([...root.querySelectorAll('li')].map((item) => item.dataset.taskId)).toEqual([
      first.dataset.taskId, third.dataset.taskId,
    ]);
    expect(root.querySelector(`[data-task-id="${id}"]`)).toBeNull();
    expect(first.outerHTML).toBe(firstBefore);
    expect(third.outerHTML).toBe(thirdBefore);
    expect(root.querySelector('[data-empty-state]').hidden).toBe(true);
  });

  it('取消刪除不改變任何列，編輯草稿也保留', () => {
    const item = add('原始標題');
    add('其他任務');
    item.querySelector('button').click();
    item.querySelector('input').value = '未儲存草稿';
    const before = root.querySelector('ul').innerHTML;
    remove(item);
    expect(root.querySelector('ul').innerHTML).toBe(before);
    expect(item.querySelector('input').value).toBe('未儲存草稿');
    item.querySelector('[data-cancel]').click();
    expect(item.firstElementChild.textContent).toBe('原始標題');
  });

  it('刪除最後一筆顯示空清單，再新增仍正常', () => {
    const item = add('最後一筆');
    confirm.mockReturnValue(true);
    remove(item);
    expect(root.querySelectorAll('li')).toHaveLength(0);
    const emptyState = root.querySelector('[data-empty-state]');
    expect(emptyState.hidden).toBe(false);
    expect(emptyState.textContent).toBe('目前沒有任務');
    const next = add('新任務');
    expect(next.firstElementChild.textContent).toBe('新任務');
    expect(next.querySelector('.status').textContent).toBe('待辦');
    expect(emptyState.hidden).toBe(true);
  });

  it('刪除其他任務不影響編輯草稿，草稿仍可儲存', () => {
    const first = add('保留任務');
    const second = add('刪除目標');
    first.querySelector('button').click();
    first.querySelector('input').value = '更新保留任務';
    confirm.mockReturnValue(true);
    remove(second);
    expect(first.querySelector('input').value).toBe('更新保留任務');
    first.querySelector('button[type="submit"]').click();
    expect(first.firstElementChild.textContent).toBe('更新保留任務');
  });

  it('確認使用最新已儲存標題，刪除編輯中的任務不留下表單', () => {
    const item = add('原標題');
    item.querySelector('button').click();
    item.querySelector('input').value = '新標題';
    item.querySelector('button[type="submit"]').click();
    item.querySelector('button').click();
    item.querySelector('input').value = '尚未儲存';
    confirm.mockReturnValue(true);
    remove(item);
    expect(confirm.mock.calls[0][0]).toContain('新標題');
    expect(root.querySelector('.task-edit')).toBeNull();
    expect(root.querySelectorAll('li')).toHaveLength(0);
  });

  it('刪除流程不讀寫 localStorage', () => {
    const calls = ['getItem', 'setItem', 'removeItem', 'clear'].map((key) =>
      vi.spyOn(Storage.prototype, key),
    );
    const item = add('任務');
    remove(item);
    confirm.mockReturnValue(true);
    remove(item);
    calls.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });
});

describe('依 ID 刪除記憶體資料', () => {
  it('只刪除符合 ID 的項目，保留陣列及其他物件與資料', () => {
    const first = { id: 'a', title: '相同', status: '進行中', extra: { owner: 'A' } };
    const second = { id: 'b', title: '相同', status: '待辦' };
    const tasks = [first, second];
    const before = structuredClone(first);
    expect(deleteTask(tasks, 'b')).toBe(true);
    expect(tasks).toEqual([before]);
    expect(tasks[0]).toBe(first);
  });

  it('不存在的 ID 不刪除任何任務', () => {
    const tasks = [{ id: 'a', title: '保留', status: '待辦' }];
    expect(deleteTask(tasks, 'unknown')).toBe(false);
    expect(tasks).toEqual([{ id: 'a', title: '保留', status: '待辦' }]);
  });

  it('刪除最後一筆後陣列為空，再刪除不產生變更', () => {
    const tasks = [{ id: 'a', title: '最後一筆', status: '待辦' }];
    expect(deleteTask(tasks, 'a')).toBe(true);
    expect(tasks).toEqual([]);
    expect(deleteTask(tasks, 'a')).toBe(false);
    expect(tasks).toEqual([]);
  });
});
