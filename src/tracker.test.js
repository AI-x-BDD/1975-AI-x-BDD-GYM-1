// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountIssueTracker } from './tracker.js';

describe('新增任務', () => {
  let root;
  let input;
  const add = (title) => {
    input.value = title;
    root.querySelector('button').click();
  };

  beforeEach(() => {
    document.body.innerHTML = '<main id="app"></main>';
    root = document.querySelector('#app');
    mountIssueTracker(root);
    input = root.querySelector('input');
  });

  afterEach(() => vi.restoreAllMocks());

  it('點擊新增會建立標題及預設待辦狀態，清空輸入並保留焦點', () => {
    add('準備需求');
    const item = root.querySelector('li');
    expect(item.firstElementChild.textContent).toBe('準備需求');
    expect(item.querySelector('.status').textContent).toBe('待辦');
    expect(input.value).toBe('');
    expect(document.activeElement).toBe(input);
  });

  it.each(['', '   ', '\t\n', '\u3000'])('拒絕空白標題 %j', (title) => {
    add(title);
    expect(root.querySelectorAll('li')).toHaveLength(0);
    expect(root.querySelector('[role="alert"]').textContent).toContain('請輸入任務標題');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('修正錯誤後可以新增，並清除錯誤提示', () => {
    add(' ');
    add('  第一個任務  ');
    expect(root.querySelector('li').firstElementChild.textContent).toBe('第一個任務');
    expect(root.querySelector('[role="alert"]').textContent).toBe('');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('連續新增保留原有任務，允許重複標題', () => {
    add('任務');
    add('任務');
    expect(root.querySelectorAll('li')).toHaveLength(2);
  });

  it('將 HTML 標題顯示為文字', () => {
    add('<img src=x onerror=alert(1)>');
    expect(root.querySelector('li').firstElementChild.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(root.querySelector('img')).toBeNull();
  });

  it('重新掛載後任務清空，且不讀寫 localStorage', () => {
    localStorage.setItem('unrelated', 'preserve');
    const original = { ...localStorage };
    const storageCalls = ['getItem', 'setItem', 'removeItem', 'clear'].map((method) =>
      vi.spyOn(Storage.prototype, method),
    );
    add('暫存任務');
    mountIssueTracker(root);
    expect(root.querySelectorAll('li')).toHaveLength(0);
    storageCalls.forEach((spy) => expect(spy).not.toHaveBeenCalled());
    expect({ ...localStorage }).toEqual(original);
  });
});
