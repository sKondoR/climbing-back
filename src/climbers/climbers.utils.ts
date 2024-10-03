export const getNow = () =>
  new Date().toLocaleDateString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
