module.exports.intersperse = (arr, sep) => {
  if (arr.length === 0) {
    return [];
  }

  return arr.slice(1).reduce((xs, x) => xs.concat([sep, x]), [arr[0]]);
};

module.exports.removeAll = (arr, value) => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    }
  }
};

module.exports.fileSizeIEC = a => {
  const e = Math.log(a) / Math.log(1024) | 0;
  const number = (a / Math.pow(1024, e)).toFixed(2);
  const unit = (e ? `${'KMGTPEZY'[e - 1]}iB` : 'Bytes');
  return `${number} ${unit}`;
};
