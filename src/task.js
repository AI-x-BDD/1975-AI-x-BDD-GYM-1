// Mutate only the title so identity, status, and any other task data survive.
export function renameTask(task, title) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return false;
  task.title = trimmedTitle;
  return true;
}
