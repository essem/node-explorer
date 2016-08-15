import { locToUrl, urlToLoc } from './common/util';

function request(dispatch, path, json = true) {
  dispatch({ type: 'SET_LOADING' });
  return fetch(`${API_HOST}${path}`, { credentials: 'include' })
    .then(res => {
      if (res.status === 401) {
        dispatch({ type: 'SET_LOGIN', login: false });
        throw new Error('unauthorized');
      }

      dispatch({ type: 'CLEAR_LOADING' });
      return json ? res.json() : res.text();
    })
    .catch(err => {
      dispatch({ type: 'CLEAR_LOADING' });
      throw err;
    });
}

function post(dispatch, path, body) {
  dispatch({ type: 'SET_LOADING' });
  const options = {
    credentials: 'include',
    method: 'post',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(body),
  };
  return fetch(`${API_HOST}${path}`, options)
    .then(res => {
      dispatch({ type: 'CLEAR_LOADING' });
      return res.json();
    })
    .catch(err => {
      dispatch({ type: 'CLEAR_LOADING' });
      throw err;
    });
}

export function updateFiles(loc) {
  return dispatch => {
    request(dispatch, `/api/dir${locToUrl(loc)}`)
      .then(files => {
        dispatch({ type: 'SET_FILES', files });
      })
      .catch(() => {});
  };
}

export function changeLoc(loc) {
  return dispatch => {
    dispatch({ type: 'PUSH_LOC', loc });
    dispatch(updateFiles(loc));
  };
}

export function createFolder(loc, name) {
  return dispatch => {
    post(dispatch, `/api/createFolder${locToUrl(loc)}`, { name })
      .then(() => {
        dispatch({
          type: 'SHOW_ALERT',
          alert: { type: 'success', message: 'Success' },
        });
        dispatch(updateFiles(loc));
      })
      .catch(err => {
        dispatch({
          type: 'SHOW_ALERT',
          alert: { type: 'danger', message: err.toString() },
        });
      });
  };
}

export function deleteFiles(loc, names) {
  return dispatch => {
    post(dispatch, `/api/delete${locToUrl(loc)}`, names)
      .then(() => {
        dispatch({
          type: 'SHOW_ALERT',
          alert: { type: 'success', message: 'Success' },
        });
        dispatch(updateFiles(loc));
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
    if (location.pathname === '/') {
      dispatch({ type: 'SET_LOGIN', login: false });
      return;
    }

    request(dispatch, '/api/bookmarks')
    .then(bookmarks => {
      dispatch({ type: 'SET_BOOKMARKS', bookmarks });

      const loc = urlToLoc(location.pathname);
      dispatch({ type: 'SET_LOC', loc });
      dispatch(updateFiles(loc));
      dispatch({ type: 'SET_LOGIN', login: true });
    })
    .catch(() => {});
  };
}

export function login(account, password) {
  return dispatch => {
    post(dispatch, '/login', { account, password })
    .then(res => {
      if (res.result !== 'success') {
        dispatch({ type: 'SET_LOGIN_MESSAGE', message: 'Login failed' });
        return undefined;
      }
      return request(dispatch, '/api/bookmarks')
      .then(bookmarks => {
        dispatch({ type: 'SET_BOOKMARKS', bookmarks });
        if (location.pathname === '/') {
          dispatch(changeLoc({ bookmark: 0, dir: [] }));
        } else {
          const loc = urlToLoc(location.pathname);
          dispatch({ type: 'SET_LOC', loc });
          dispatch(updateFiles(loc));
        }
        dispatch({ type: 'SET_LOGIN', login: true });
      });
    })
    .catch(err => {
      console.error(err.stack);
    });
  };
}

export function logout() {
  return dispatch => {
    post(dispatch, '/logout')
    .then(() => {
      history.pushState(null, null, '/');
      dispatch({ type: 'SET_LOGIN', login: false });
    })
    .catch(err => {
      console.error(err.stack);
    });
  };
}
