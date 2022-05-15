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

export function resolveLocalRef(ref, schema) {
  const [, path] = ref.split('#');
  let target = schema;
  const pathArray = path.split('/');
  for (let i = 0; i < pathArray.length; i += 1) {
    if (pathArray[i] && target[pathArray[i]]) {
      target = target[pathArray[i]];
    }
  }
  return target;
}

// export let resolving = 0;
// export const resolveReferences = function (obj, root) {
//   resolving += 1;
//   // console.warn('resolving:', resolving);
//   if (root === undefined) root = obj;
//   if (obj && obj.$ref) {
//     const [addr, path] = obj.$ref.split('#');
//     if (addr) {
//       fetch(addr)
//         .then(response => response.json())
//         .then(function(o) {
//           Object.keys(o).forEach((k) => {root[k] = o[k]});
//         }).then(() => {obj.$ref= '#' + path; resolveReferences(obj, root)});
//     }
//     const pathArray = path.split('/');
//     let target = root;
//     for (let i=0; i<pathArray.length; i++) {
//       if (pathArray[i] && target[pathArray[i]]) {
//         target = target[pathArray[i]];
//       }
//     }
//     Object.keys(target).forEach(function(k) {
//         if (k != '$ref') {
//             if (typeof obj[k] == 'object' && obj[k].length === undefined) {
//                 obj[k] = {...obj[k], ...target[k]}
//             } else if (typeof target[k] === 'object' && target[k].length === undefined) {
//                 obj[k] = {...target[k]}
//             } else {
//                 obj[k] = target[k];
//             }
//         }
//       }.bind(obj));
//     if (!addr) {
//       delete obj.$ref
//     }
//   }
//   if (typeof obj === 'object' && obj != null) {
//     try {
//       Object.keys(obj).forEach(function(k) {
//         obj[k] = resolveReferences(obj[k], root);
//       }.bind(obj));
//     } catch(e) {
//       debugger;
//     }
//   }
//   resolving -= 1;
//   console.warn('resolving:', resolving);
//   return obj;
// }

// findLocalRefs(obj) {
//   let refs = [];
//   if (!obj || typeof obj !== 'object') return refs;
//   if (typeof obj.$ref === 'string' && refs.indexOf(obj.$ref) === -1) {
//     refs.push(obj.$ref);
//   } else if (obj.length) {
//     obj.forEach(function(k) {
//       refs.push(...this.findLocalRefs(k));
//     }.bind(this))
//   }
//   Object.keys(obj).forEach(function(refs, k) {
//     refs.push(...this.findLocalRefs(obj[k]));
//   }.bind(this, refs));
//   return refs;
// }
