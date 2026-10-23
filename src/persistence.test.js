// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mountIssueTracker } from './tracker.js';
import { STORAGE_KEY } from './storage.js';

let root;
beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<main></main>';
  root = document.querySelector('main');
});
afterEach(() => vi.restoreAllMocks());
const add = (title) => {
  root.querySelector('#task-title').value = title;
  root.querySelector('form button').click();
};

it.each(['{', '{}', '[null]', '[{"id":"a","title":" ","status":"待辦"}]',
  '[{"id":"a","title":"任務","status":"未知"}]',
  JSON.stringify(Array(2).fill({ id: 'a', title: '任務', status: '待辦' })),
])('損壞資料 %s 不阻止操作，掛載不覆寫原資料', (raw) => {
  localStorage.setItem(STORAGE_KEY, raw);
  mountIssueTracker(root);
  expect(root.querySelectorAll('li')).toHaveLength(0);
  expect(root.querySelector('[data-storage-message]').textContent).toContain('無法讀取');
  expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
  add('新任務');
  mountIssueTracker(root);
  expect(root.querySelector('li').firstElementChild.textContent).toBe('新任務');
});

it('無法讀取儲存空間時仍可操作', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
  mountIssueTracker(root);
  expect(root.querySelector('[data-storage-message]').textContent).toContain('無法讀取');
  add('任務');
  expect(root.querySelectorAll('li')).toHaveLength(1);
});

it('寫入失敗會提示，後續成功會保存所有變更並清除提示', () => {
  mountIssueTracker(root);
  const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  add('第一筆');
  expect(root.querySelectorAll('li')).toHaveLength(1);
  expect(root.querySelector('[data-storage-message]').textContent).toContain('無法儲存');
  write.mockRestore();
  add('第二筆');
  expect(root.querySelector('[data-storage-message]').textContent).toBe('');
  mountIssueTracker(root);
  expect([...root.querySelectorAll('li')].map((item) => item.firstElementChild.textContent))
    .toEqual(['第一筆', '第二筆']);
});

it('取消、無效編輯及未儲存草稿不改變已保存任務', () => {
  mountIssueTracker(root);
  add('原標題');
  const saved = localStorage.getItem(STORAGE_KEY);
  const item = root.querySelector('li');
  item.querySelector('button').click();
  item.querySelector('input').value = ' ';
  item.querySelector('[type="submit"]').click();
  expect(localStorage.getItem(STORAGE_KEY)).toBe(saved);
  item.querySelector('input').value = '草稿';
  item.querySelector('[data-cancel]').click();
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  item.querySelector('[data-delete]').click();
  expect(localStorage.getItem(STORAGE_KEY)).toBe(saved);
  mountIssueTracker(root);
  expect(root.querySelector('li').firstElementChild.textContent).toBe('原標題');
});
