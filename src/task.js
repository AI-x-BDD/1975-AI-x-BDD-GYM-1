// Mutate only the title so identity, status, and any other task data survive.
export function renameTask(task, title) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return false;
  task.title = trimmedTitle;
  return true;
}

export function deleteTask(tasks, id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}
