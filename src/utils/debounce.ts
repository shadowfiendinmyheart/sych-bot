const debounce = <F extends ((...args: any) => any)>(func: F, time: number = 300) => {
  let timeout: number = 0

  const debounced = (...args: any) => {
      clearTimeout(timeout)
      setTimeout(() => func(...args), time)
  }
  
  return debounced as (...args: Parameters<F>) => ReturnType<F>
}

export default debounce;
