export const debouncer = function (callback, wait) {
  let timeout = 1000;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      callback.apply(this, args);
    }, wait);
  };
};
