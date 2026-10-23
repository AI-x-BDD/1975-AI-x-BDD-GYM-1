import { TASK_STATUSES } from './task.js';

export const STORAGE_KEY = 'mini-issue-tracker.tasks.v1';

export function loadTasks() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { tasks: [], error: '' };
    const tasks = JSON.parse(raw);
    const ids = new Set();
    if (!Array.isArray(tasks) || !tasks.every((task) => {
      if (!task || typeof task.id !== 'string' || !task.id.trim()
        || ids.has(task.id) || typeof task.title !== 'string'
        || !task.title.trim() || !TASK_STATUSES.includes(task.status)) return false;
      ids.add(task.id);
      return true;
    })) throw new Error('Invalid task data');
    return { tasks, error: '' };
  } catch {
    return { tasks: [], error: '無法讀取已儲存的任務。您仍可新增任務；下次成功儲存時會取代原有資料。' };
  }
}

export function saveTasks(tasks) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}
