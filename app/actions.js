import { locToUrl, urlToLoc } from './common/util';

function request(dispatch, path, json = true) {
  dispatch({ type: 'SET_LOADING' });
  return fetch(`${API_HOST}${path}`, { credentials: 'same-origin' })
    .then(res => {
      dispatch({ type: 'CLEAR_LOADING' });
      return json ? res.json() : res.text();
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

export function startPreviewJpg(loc, name) {
  return dispatch => {
    request(dispatch, `/api/imageInfo${locToUrl(loc)}/${name}`)
      .then(info => {
        dispatch({ type: 'START_PREVIEW_JPG', info });
      });
  };
}

export function startPreviewTxt(loc, name) {
  return dispatch => {
    request(dispatch, `/api/download${locToUrl(loc)}/${name}`, false)
      .then(text => {
        dispatch({ type: 'START_PREVIEW_TXT', text });
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
