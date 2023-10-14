export const promiseHash = (hash) => {
    const keys = Object.keys(hash);
    return Promise.all(keys.map(key => hash[key]))
      .then(values => {
        const result = {};
        keys.forEach((key, i) => result[key] = values[i]);
        return result;
      });
  };