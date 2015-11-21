module.exports.intersperse = function(arr, sep) {
  if (arr.length === 0) {
    return [];
  }

  return arr.slice(1).reduce(function(xs, x) {
    return xs.concat([sep, x]);
  }, [arr[0]]);
};

module.exports.removeAll = function(arr, value) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    }
  }
};

module.exports.fileSizeIEC = function(a, b, c, d, e) {
  return (b=Math,c=b.log,d=1024,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)+' '+(e?'KMGTPEZY'[--e]+'iB':'Bytes');
};
