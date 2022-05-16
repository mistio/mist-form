export function debouncer(callback, wait) {
  let timeout = 1000;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback.apply(this, args);
    }, wait);
  };
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else if (Array.isArray(source[key])) {
        Object.assign(target, {
          [key]: [...new Set([...(target[key] || []), ...source[key]])],
        });
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  } else if (Array.isArray(target) && Array.isArray(source)) {
    return target.concat(source);
  }

  return mergeDeep(target, ...sources);
}
