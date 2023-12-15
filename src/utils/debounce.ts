export default <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  time = 300,
) => {
  let timeout: NodeJS.Timeout;

  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), time);
  };

  return debounced;
};
