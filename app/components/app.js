import { connect } from 'react-redux';
import React from 'react';
import { Alert, Table } from 'react-bootstrap';
import util from '../common/util';
import Location from './location';
import Upload from './upload';
import File from './file';
import Preview from './preview';

function urlToLoc(str) {
  const dir = decodeURIComponent(str).split('/');
  util.removeAll(dir, '');
  const bookmark = parseInt(dir[0], 10) || 0;
  return { bookmark, dir: dir.slice(1) };
}

function locToUrl(loc) {
  if (loc.dir.length === 0) {
    return `/${loc.bookmark}`;
  }

  return `/${loc.bookmark}/${loc.dir.join('/')}`;
}

class App extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    alert: React.PropTypes.object,
    bookmarks: React.PropTypes.array,
    loc: React.PropTypes.object,
    files: React.PropTypes.array,
    preview: React.PropTypes.object,
  };

  componentDidMount() {
    window.addEventListener('popstate', this.handlePopState);

    fetch(`${API_HOST}/api/bookmarks`, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(bookmarks => {
      this.props.dispatch({ type: 'SET_BOOKMARKS', bookmarks });
      this.queryFiles(urlToLoc(location.pathname), false);
    })
    .catch(() => {});
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
  }

  queryFiles(loc, addHistory = true) {
    fetch(`${API_HOST}/api/dir${locToUrl(loc)}`, {
      credentials: 'same-origin',
    })
    .then(res => res.json())
    .then(files => {
      this.props.dispatch({ type: 'CHANGE_LOC', loc, files });
      if (addHistory) {
        history.pushState(null, null, `/${loc.bookmark}/${loc.dir.join('/')}`);
      }
    })
    .catch(() => {});
  }

  handlePopState = () => {
    this.queryFiles(urlToLoc(location.pathname), false);
  };

  handleChangeBookmark = index => {
    this.queryFiles({ bookmark: index, dir: [] });
  };

  handleLocationClick = index => {
    const dir = this.props.loc.dir.slice(0, index);
    const loc = { bookmark: this.props.loc.bookmark, dir };
    this.queryFiles(loc);
  };

  handleDirClick = name => {
    const dir = this.props.loc.dir.concat(name);
    const loc = { bookmark: this.props.loc.bookmark, dir };
    this.queryFiles(loc);
  };

  preview(index) {
    this.props.dispatch({ type: 'PREPARE_PREVIEW' });
    const name = this.props.files[index].name;
    fetch(`${API_HOST}/api/imageInfo${locToUrl(this.props.loc)}/${name}`, {
      credentials: 'same-origin',
    })
    .then(res => res.json())
    .then(info => {
      const preview = Object.assign({}, info, { index, name });
      this.props.dispatch({ type: 'START_PREVIEW', preview });
    });
  }

  handlePreviewClick = index => {
    this.preview(index);
  };

  handleClosePreview = () => {
    this.props.dispatch({ type: 'STOP_PREVIEW' });
  };

  handlePrevPreview = () => {
    if (this.props.preview.index > 0) {
      this.preview(this.props.preview.index - 1);
    }
  };

  handleNextPreview = () => {
    if (this.props.preview.index < this.props.files.length - 1) {
      this.preview(this.props.preview.index + 1);
    }
  };

  handleDeleteClick = name => {
    let alertStyle = {
      width: '800px',
      marginTop: '10px',
      padding: '5px 10px',
    };

    fetch(`${API_HOST}/api/delete${locToUrl(this.props.loc)}/${name}`, {
      credentials: 'same-origin',
    })
    .then(() => {
      this.queryFiles(this.props.loc, false);
      const alert = <Alert bsStyle="success" style={alertStyle}>Success</Alert>;
      this.props.dispatch({ type: 'SHOW_ALERT', alert });
    })
    .catch(err => {
      const alert = <Alert bsStyle="danger" style={alertStyle}>{err.toString()}</Alert>;
      this.props.dispatch({ type: 'SHOW_ALERT', alert });
    });
  };

  handleUploadEnded = err => {
    let alertStyle = {
      width: '800px',
      marginTop: '10px',
      padding: '5px 10px',
    };
    if (err) {
      const alert = <Alert bsStyle="danger" style={alertStyle}>{err.toString()}</Alert>;
      this.props.dispatch({ type: 'SHOW_ALERT', alert });
    } else {
      const alert = <Alert bsStyle="success" style={alertStyle}>Success</Alert>;
      this.props.dispatch({ type: 'SHOW_ALERT', alert });
    }

    this.queryFiles(this.props.loc, false);
  };

  render() {
    if (this.props.bookmarks.length === 0) {
      return <div></div>;
    }

    let sizeColumnStyle = {
      width: '130px',
      textAlign: 'right',
    };
    let timeColumnStyle = {
      width: '170px',
      textAlign: 'right',
    };

    let fullpath = locToUrl(this.props.loc);
    let files = this.props.files.map((file, index) => (
      <tr key={file.name}>
        <td>
          <File
            fullpath={fullpath}
            fileIndex={index}
            {...file}
            onDirClick={this.handleDirClick}
            onPreviewClick={this.handlePreviewClick}
            onDeleteClick={this.handleDeleteClick}
          />
        </td>
        <td style={sizeColumnStyle}>{file.size}</td>
        <td style={timeColumnStyle}>{file.mtime}</td>
      </tr>
    ));

    return (
      <div>
        <Location
          bookmarks={this.props.bookmarks}
          curBookmarkIndex={this.props.loc.bookmark}
          dir={this.props.loc.dir}
          onChangeBookmark={this.handleChangeBookmark}
          onClick={this.handleLocationClick}
        />
        <Upload
          curBookmarkIndex={this.props.loc.bookmark}
          dir={this.props.loc.dir}
          onUploadEnded={this.handleUploadEnded}
        />
        {this.props.alert}
        <Table striped hover className="explorer">
          <thead>
            <tr>
              <th>Name</th>
              <th style={sizeColumnStyle}>Size</th>
              <th style={timeColumnStyle}>Modified</th>
            </tr>
          </thead>
          <tbody>
            {files}
          </tbody>
        </Table>
        <Preview
          fullpath={fullpath}
          {...this.props.preview}
          onClose={this.handleClosePreview}
          onPrev={this.handlePrevPreview}
          onNext={this.handleNextPreview}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  alert: state.alert,
  bookmarks: state.bookmarks,
  loc: state.loc,
  files: state.files,
  preview: state.preview,
});

export default connect(mapStateToProps)(App);
