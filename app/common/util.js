export function intersperse(arr, sep) {
  if (arr.length === 0) {
    return [];
  }

  return arr.slice(1).reduce((xs, x) => xs.concat([sep, x]), [arr[0]]);
}

export function removeAll(arr, value) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    }
  }
}

export function fileSizeIEC(a) {
  const e = Math.log(a) / Math.log(1024) | 0;
  const number = (a / Math.pow(1024, e)).toFixed(2);
  const unit = (e ? `${'KMGTPEZY'[e - 1]}iB` : 'Bytes');
  return `${number} ${unit}`;
}

export function urlToLoc(str) {
  const dir = decodeURIComponent(str).split('/');
  removeAll(dir, '');
  const bookmark = parseInt(dir[0], 10) || 0;
  return { bookmark, dir: dir.slice(1) };
}

export function locToUrl(loc) {
  if (loc.dir.length === 0) {
    return `/${loc.bookmark}`;
  }

  return `/${loc.bookmark}/${loc.dir.join('/')}`;
}

export function responsiveValue(width, phone, tablet, desktop, largeDesktop) {
  if (width < 768) { return phone; }
  if (width < 992) { return tablet; }
  if (width < 1200) { return desktop; }
  return largeDesktop;
}
