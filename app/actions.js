import { locToUrl, urlToLoc } from './common/util';

export function changeLoc(loc, addHistory = true) {
  return dispatch => {
    fetch(`${API_HOST}/api/dir${locToUrl(loc)}`, {
      credentials: 'same-origin',
    })
    .then(res => res.json())
    .then(files => {
      dispatch({ type: 'CHANGE_LOC', loc, files });
      if (addHistory) {
        history.pushState(null, null, `/${loc.bookmark}/${loc.dir.join('/')}`);
      }
    })
    .catch(() => {});
  };
}

export function deleteFile(loc, name) {
  return dispatch => {
    fetch(`${API_HOST}/api/delete${locToUrl(loc)}/${name}`, {
      credentials: 'same-origin',
    })
    .then(() => {
      dispatch(changeLoc(loc), false);
      dispatch({
        type: 'SHOW_ALERT',
        alert: { type: 'success', message: 'Success' },
      });
    })
    .catch(err => {
      dispatch({
        type: 'SHOW_ALERT',
        alert: { type: 'danger', message: err.toString() },
      });
    });
  };
}

export function startPreview(loc, index, name) {
  return dispatch => {
    dispatch({ type: 'PREPARE_PREVIEW' });
    fetch(`${API_HOST}/api/imageInfo${locToUrl(loc)}/${name}`, {
      credentials: 'same-origin',
    })
    .then(res => res.json())
    .then(info => {
      const preview = Object.assign({}, info, { index, name });
      dispatch({ type: 'START_PREVIEW', preview });
    });
  };
}

export function initApp() {
  return dispatch => {
    fetch(`${API_HOST}/api/bookmarks`, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(bookmarks => {
      dispatch({ type: 'SET_BOOKMARKS', bookmarks });
      dispatch(changeLoc(urlToLoc(location.pathname), false));
    })
    .catch(() => {});
  };
}
