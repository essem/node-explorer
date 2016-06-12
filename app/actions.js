import { locToUrl, urlToLoc } from './common/util';

function request(dispatch, path) {
  dispatch({ type: 'SET_LOADING' });
  return fetch(`${API_HOST}${path}`, { credentials: 'same-origin' })
    .then(res => {
      dispatch({ type: 'CLEAR_LOADING' });
      return res.json();
    })
    .catch(err => {
      dispatch({ type: 'CLEAR_LOADING' });
      throw err;
    });
}

export function changeLoc(loc, addHistory = true) {
  return dispatch => {
    request(dispatch, `/api/dir${locToUrl(loc)}`)
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
    request(dispatch, `/api/delete${locToUrl(loc)}/${name}`)
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
    request(dispatch, `/api/imageInfo${locToUrl(loc)}/${name}`)
      .then(info => {
        const preview = Object.assign({}, info, { index, name });
        dispatch({ type: 'START_PREVIEW', preview });
      });
  };
}

export function initApp() {
  return dispatch => {
    request(dispatch, '/api/bookmarks')
    .then(bookmarks => {
      dispatch({ type: 'SET_BOOKMARKS', bookmarks });
      dispatch(changeLoc(urlToLoc(location.pathname), false));
    })
    .catch(() => {});
  };
}
