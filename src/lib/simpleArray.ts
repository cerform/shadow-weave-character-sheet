
/**
 * Создаёт массив заданной длины и заполняет его элементами,
 * созданными фабричной функцией или повторяющимся значением
 * 
 * @param length Длина массива
 * @param factory Фабричная функция или значение для заполнения массива
 * @returns Новый массив заданной длины
 */
export function simpleArray<T>(length: number, factory?: ((index: number) => T) | T): T[] {
  return Array.from({ length }, (_, index) => {
    if (typeof factory === 'function') {
      return (factory as ((index: number) => T))(index);
    }
    return factory as T;
  });
}
