import React from 'react';
import { Alert, Table } from 'react-bootstrap';
import moment from 'moment';
import util from '../common/util';
import Location from './location';
import Upload from './upload';
import File from './file';
import Preview from './preview';

export default class App extends React.Component {
  state = {
    bookmarks: [],
    curBookmarkIndex: 0,
    alert: '',
    dir: [],
    files: [],
    preview: null,
  };

  componentDidMount() {
    window.addEventListener('popstate', this.handlePopState);

    fetch(`${API_HOST}/api/bookmarks`)
    .then(res => res.json())
    .then(bookmarks => {
      this.setState({ bookmarks }, () => {
        this.updateByUrl(location.pathname);
      });
    })
    .catch(() => {});
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
  }

  makeFullPath(bookmarkIndex, dir) {
    if (dir.length === 0) {
      return `/${bookmarkIndex}`;
    }

    return `/${bookmarkIndex}/${dir.join('/')}`;
  }

  makeCurFullPath() {
    return this.makeFullPath(this.state.curBookmarkIndex, this.state.dir);
  }

  updateByUrl(url) {
    const parts = decodeURIComponent(url).split('/');
    util.removeAll(parts, '');
    const bookmarkIndex = parseInt(parts[0], 10) || 0;
    const dir = parts.slice(1);
    this.queryFiles(bookmarkIndex, dir, false);
  }

  queryFiles(bookmarkIndex, dir, addHistory = true) {
    fetch(`${API_HOST}/api/dir${this.makeFullPath(bookmarkIndex, dir)}`)
    .then(res => res.json())
    .then(files => {
      files.sort((a, b) => {
        if (a.isDirectory === b.isDirectory) {
          return a.name.localeCompare(b.name);
        } else if (a.isDirectory) {
          return -1;
        }

        return 1;
      });
      files.forEach(file => {
        Object.assign(file, {
          size: util.fileSizeIEC(file.size),
          mtime: moment(file.mtime).format('YYYY-MM-DD HH:mm:ss'),
        });
      });
      this.setState({ curBookmarkIndex: bookmarkIndex, dir, files });
      if (addHistory) {
        history.pushState(null, null, `/${bookmarkIndex}/${dir.join('/')}`);
      }
    })
    .catch(() => {});
  }

  handlePopState = () => {
    this.updateByUrl(location.pathname);
  };

  handleChangeBookmark = index => {
    this.queryFiles(index, []);
  };

  handleLocationClick = index => {
    this.queryFiles(this.state.curBookmarkIndex, this.state.dir.slice(0, index));
  };

  handleDirClick = name => {
    const newDir = this.state.dir.slice(0);
    newDir.push(name);
    this.queryFiles(this.state.curBookmarkIndex, newDir);
  };

  handlePreviewClick = name => {
    fetch(`${API_HOST}/api/imageInfo${this.makeCurFullPath()}/${name}`)
    .then(res => res.json())
    .then(info => {
      const preview = Object.assign({}, info, { name });
      this.setState({ preview });
    });
  };

  handleClosePreview = () => {
    this.setState({ preview: null });
  };

  handleDeleteClick = name => {
    let alertStyle = {
      width: '800px',
      marginTop: '10px',
      padding: '5px 10px',
    };

    fetch(`${API_HOST}/api/delete${this.makeCurFullPath()}/${name}`)
    .then(() => {
      this.queryFiles(this.state.curBookmarkIndex, this.state.dir);
      this.setState({ alert: <Alert bsStyle="success" style={alertStyle}>Success</Alert> });
    })
    .catch(err => {
      const alert = <Alert bsStyle="danger" style={alertStyle}>{err.toString()}</Alert>;
      this.setState({ alert });
    });
  };

  handleUploadEnded = err => {
    let alertStyle = {
      width: '800px',
      marginTop: '10px',
      padding: '5px 10px',
    };
    if (err) {
      this.setState({ alert: <Alert bsStyle="danger" style={alertStyle}>{err.toString()}</Alert> });
    } else {
      this.setState({ alert: <Alert bsStyle="success" style={alertStyle}>Success</Alert> });
    }

    this.queryFiles(this.state.curBookmarkIndex, this.state.dir);
  };

  render() {
    if (this.state.bookmarks.length === 0) {
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

    let fullpath = this.makeCurFullPath();
    let files = this.state.files.map(file => (
      <tr key={file.name}>
        <td>
          <File
            fullpath={fullpath}
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
          bookmarks={this.state.bookmarks}
          curBookmarkIndex={this.state.curBookmarkIndex}
          dir={this.state.dir}
          onChangeBookmark={this.handleChangeBookmark}
          onClick={this.handleLocationClick}
        />
        <Upload
          curBookmarkIndex={this.state.curBookmarkIndex}
          dir={this.state.dir}
          onUploadEnded={this.handleUploadEnded}
        />
        {this.state.alert}
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
          {...this.state.preview}
          onClose={this.handleClosePreview}
        />
      </div>
    );
  }
}
