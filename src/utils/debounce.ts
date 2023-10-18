const debounce = <F extends (...args: any) => any>(func: F, time = 300) => {
  let timeout: NodeJS.Timeout;

  const debounced = (...args: any) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), time);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
};

export default debounce;
