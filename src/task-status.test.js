// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountIssueTracker } from './tracker.js';
import { changeTaskStatus } from './task.js';

const statuses = ['待辦', '進行中', '已完成'];

describe('任務狀態切換', () => {
  let root;
  const add = (title = '任務') => {
    root.querySelector('#task-title').value = title;
    root.querySelector('form button').click();
    return [...root.querySelectorAll('li')].at(-1);
  };
  const change = (item, value) => {
    const select = item.querySelector('select');
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  };
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<main></main>';
    root = document.querySelector('main');
    mountIssueTracker(root);
  });
  afterEach(() => vi.restoreAllMocks());

  it('新增預設待辦，提供有名稱且包含三種狀態的選單', () => {
    const item = add();
    const select = item.querySelector('select');
    expect(select.value).toBe('待辦');
    expect(item.querySelector('.status').textContent).toBe('待辦');
    expect([...select.options].map((option) => option.textContent)).toEqual(statuses);
    expect(select.getAttribute('aria-label')).toBe('任務狀態');
    expect(document.getElementById(select.getAttribute('aria-describedby')).textContent).toBe('任務');
  });

  it.each(statuses.flatMap((from) => statuses.map((to) => [from, to])))(
    '從 %s 自由切換至 %s，立即更新文字及選單', (from, to) => {
      const item = add();
      const id = item.dataset.taskId;
      change(item, from);
      change(item, to);
      expect(item.querySelector('.status').textContent).toBe(to);
      expect(item.querySelector('select').value).toBe(to);
      expect(item.dataset.taskId).toBe(id);
      expect(item.firstElementChild.textContent).toBe('任務');
    },
  );

  it('同名任務獨立管理，新增任務仍為待辦', () => {
    const first = add();
    const second = add();
    change(second, '進行中');
    const before = second.outerHTML;
    change(first, '已完成');
    expect(second.outerHTML).toBe(before);
    expect(second.querySelector('select').value).toBe('進行中');
    expect(add().querySelector('select').value).toBe('待辦');
  });

  it('編輯期間切換狀態保留草稿，儲存及取消均保留新狀態', () => {
    const item = add();
    change(item, '進行中');
    item.querySelector('button').click();
    item.querySelector('input').value = '新標題';
    change(item, '已完成');
    expect(item.querySelector('input').value).toBe('新標題');
    item.querySelector('button[type="submit"]').click();
    expect(item.firstElementChild.textContent).toBe('新標題');
    expect(item.querySelector('.status').textContent).toBe('已完成');
    item.querySelector('button').click();
    change(item, '待辦');
    item.querySelector('[data-cancel]').click();
    expect(item.firstElementChild.textContent).toBe('新標題');
    expect(item.querySelector('.status').textContent).toBe('待辦');
  });

  it('切換後取消刪除保留狀態，確認刪除僅移除目標', () => {
    const item = add();
    const other = add('其他');
    change(item, '已完成');
    change(other, '進行中');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    item.querySelector('[data-delete]').click();
    expect(item.querySelector('select').value).toBe('已完成');
    confirm.mockReturnValue(true);
    item.querySelector('[data-delete]').click();
    expect(root.querySelectorAll('li')).toHaveLength(1);
    expect(other.querySelector('select').value).toBe('進行中');
  });

  it('重新掛載保留狀態，新任務仍為待辦', () => {
    change(add(), '已完成');
    mountIssueTracker(root);
    expect(root.querySelector('li select').value).toBe('已完成');
    expect(add().querySelector('select').value).toBe('待辦');
  });
});

describe('記憶體任務狀態', () => {
  it('只更改狀態，保留其他資料與物件參照', () => {
    const metadata = { owner: 'A' };
    const task = { id: 'a', title: '任務', status: '待辦', metadata };
    expect(changeTaskStatus(task, '已完成')).toBe(true);
    expect(task).toEqual({ id: 'a', title: '任務', status: '已完成', metadata });
    expect(task.metadata).toBe(metadata);
  });

  it('拒絕三種狀態以外的值且保留資料', () => {
    const task = { id: 'a', title: '任務', status: '進行中' };
    expect(changeTaskStatus(task, '未知')).toBe(false);
    expect(task.status).toBe('進行中');
  });
});
