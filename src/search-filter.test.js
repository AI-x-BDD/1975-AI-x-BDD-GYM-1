// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountIssueTracker } from './tracker.js';

describe('任務搜尋與篩選', () => {
  let root;
  const add = (title) => {
    root.querySelector('#task-title').value = title;
    root.querySelector('form button').click();
    return [...root.querySelectorAll('li')].at(-1);
  };
  const search = (value) => {
    const input = root.querySelector('#task-search');
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const change = (select, value) => {
    select.value = value;
    select.dispatchEvent(new Event('change'));
  };
  const filter = (value) => change(root.querySelector('#status-filter'), value);
  const visible = () => [...root.querySelectorAll('li')]
    .filter((item) => !item.hidden).map((item) => item.firstElementChild.textContent);
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<main></main>';
    root = document.querySelector('main');
    mountIssueTracker(root);
  });
  afterEach(() => vi.restoreAllMocks());

  it('即時部分搜尋標題，忽略英文大小寫與前後空白，空白還原清單', () => {
    add('修正 Login 問題');
    add('撰寫文件');
    search('  LOGIN  ');
    expect(visible()).toEqual(['修正 Login 問題']);
    search('文件');
    expect(visible()).toEqual(['撰寫文件']);
    search('　 ');
    expect(visible()).toEqual(['修正 Login 問題', '撰寫文件']);
  });

  it.each(['待辦', '進行中', '已完成'])('依 %s 篩選，並與搜尋取交集', (status) => {
    const first = add('修正登入');
    const second = add('撰寫文件');
    add('修正樣式');
    change(first.querySelector('select'), status);
    change(second.querySelector('select'), status);
    filter(status);
    search('登入');
    expect(visible()).toEqual(['修正登入']);
    expect(root.querySelector('[data-filter-summary]').textContent).toBe('顯示 1 / 3 筆任務');
    root.querySelector('[data-reset-filters]').click();
    expect(visible()).toEqual(['修正登入', '撰寫文件', '修正樣式']);
    expect(root.querySelector('#status-filter').value).toBe('');
    expect(root.querySelector('#task-search').value).toBe('');
  });

  it('區分沒有任務與沒有符合條件，並可恢復結果', () => {
    search('不存在');
    expect(root.querySelector('[data-empty-state]').textContent).toBe('目前沒有任務');
    add('任務');
    expect(visible()).toEqual([]);
    expect(root.querySelector('[data-empty-state]').textContent).toBe('沒有符合條件的任務');
    expect(root.querySelector('[data-empty-state]').hidden).toBe(false);
    search('');
    expect(visible()).toEqual(['任務']);
    expect(root.querySelector('[data-empty-state]').hidden).toBe(true);
  });

  it('新增與狀態變更立即套用條件，清除後仍保留資料', () => {
    filter('進行中');
    const item = add('任務');
    expect(visible()).toEqual([]);
    filter('待辦');
    expect(visible()).toEqual(['任務']);
    const select = item.querySelector('select');
    select.focus();
    change(select, '已完成');
    expect(visible()).toEqual([]);
    expect(document.activeElement).toBe(root.querySelector('#task-search'));
    filter('');
    expect(visible()).toEqual(['任務']);
    expect(item.querySelector('.status').textContent).toBe('已完成');
  });

  it('保留被隱藏的編輯草稿，儲存後依最新標題篩選', () => {
    const item = add('原標題');
    search('原');
    item.querySelector('button').click();
    item.querySelector('input').value = '新標題';
    search('不存在');
    search('原');
    expect(item.querySelector('input').value).toBe('新標題');
    item.querySelector('button[type="submit"]').click();
    expect(visible()).toEqual([]);
    expect(document.activeElement).toBe(root.querySelector('#task-search'));
    search('新');
    expect(visible()).toEqual(['新標題']);
  });

  it('刪除最後一筆符合結果後顯示無結果，清除仍可看見其他任務', () => {
    const item = add('目標');
    add('其他');
    search('目標');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    item.querySelector('[data-delete]').click();
    expect(visible()).toEqual([]);
    expect(root.querySelector('[data-empty-state]').textContent).toBe('沒有符合條件的任務');
    root.querySelector('[data-reset-filters]').click();
    expect(visible()).toEqual(['其他']);
  });

  it('特殊字元以字面搜尋，重新掛載重設條件', () => {
    add('<img src=x> [任務]');
    search('[任務]');
    expect(visible()).toEqual(['<img src=x> [任務]']);
    expect(root.querySelector('img')).toBeNull();
    filter('已完成');
    mountIssueTracker(root);
    expect(root.querySelector('#task-search').value).toBe('');
    expect(root.querySelector('#status-filter').value).toBe('');
    expect(root.querySelector('[data-filter-summary]').textContent).toBe('顯示 1 / 1 筆任務');
  });
});
