require("./bootstrap/css/bootstrap.css");
require("./style.css");

import React from 'react';
import ReactDOM from 'react-dom';
import { Alert, Button, ButtonGroup, ButtonToolbar, Table, Glyphicon, SplitButton, MenuItem, Modal } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import request from 'superagent';
import moment from 'moment';
import util from '../common/util';

class Location extends React.Component {
  constructor() {
    super();
    this.handleBookmarkClick = this.handleBookmarkClick.bind(this);
    this.handleRootClick = this.handleRootClick.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleBookmarkClick(e) {
    this.props.onChangeBookmark(e.target.dataset.index);
  }

  handleRootClick() {
    this.props.onClick(0);
  }

  handleClick(e) {
    this.props.onClick(e.target.dataset.index);
  }

  render() {
    return (
      <ButtonToolbar>
        <SplitButton
          id="location"
          bsStyle="primary"
          title={this.props.bookmarks[this.props.curBookmarkIndex].name}
          onClick={this.handleRootClick}
        >
          {this.props.bookmarks.map((bookmark, index) => {
            return <MenuItem key={index} onClick={this.handleBookmarkClick} data-index={index}>{bookmark.name}</MenuItem>;
          })}
        </SplitButton>

        <ButtonGroup>
          {this.props.dir.map((name, index) => {
            return <Button key={index} onClick={this.handleClick} data-index={index + 1}>{name}</Button>;
          })}
        </ButtonGroup>
      </ButtonToolbar>
    );
  }
}

class File extends React.Component {
  constructor() {
    super();
    this.state = { fileClicked: false, showDeleteConfirm: false };
    this.handleDirClick = this.handleDirClick.bind(this);
    this.handleFileEnter = this.handleFileEnter.bind(this);
    this.handleFileLeave = this.handleFileLeave.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleModalDelete = this.handleModalDelete.bind(this);
  }

  handleDirClick() {
    this.props.onDirClick(this.props.name);
  }

  handleFileEnter() {
    this.setState({ fileClicked: true });
  }

  handleFileLeave() {
    this.setState({ fileClicked: false });
  }

  handleModalOpen() {
    this.setState({ showDeleteConfirm: true });
  }

  handleModalClose() {
    this.setState({ showDeleteConfirm: false });
  }

  handleModalDelete() {
    this.props.onDeleteClick(this.props.name);
  }

  render() {
    let modal = (
      <Modal show={this.state.showDeleteConfirm} onHide={this.handleModalClose}>
        <Modal.Header>
          <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Do you want to delete the file '{this.props.name}'?
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.handleModalClose}>Close</Button>
          <Button onClick={this.handleModalDelete} bsStyle="danger">Delete</Button>
        </Modal.Footer>
      </Modal>
    );

    let content = '';
    if (this.props.isDirectory) {
      content = (
        <div className="file" onClick={this.handleDirClick}>
          <Glyphicon glyph="folder-close" /> {this.props.name}
        </div>
      );
    } else if (this.state.fileClicked) {
      let formStyle = {
        display: 'inline',
        marginRight: '10px'
      };
      content = (
        <div className="file" onMouseLeave={this.handleFileLeave}>
          <form method="get" style={formStyle} action={'/api/download' + this.props.fullpath + '/' + this.props.name}>
            <Button type="submit" bsStyle="primary" bsSize="xsmall">Download</Button>
          </form>
          <Button bsStyle="danger" bsSize="xsmall" onClick={this.handleModalOpen}>Delete</Button>
        </div>
      );
    } else {
      content = (
        <div className="file" onMouseEnter={this.handleFileEnter}>
          {this.props.name}
        </div>
      );
    }
    return <div>{content}{modal}</div>;
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      bookmarks: [],
      curBookmarkIndex: 0,
      dir: [],
      files: [],
      upload: [],
      uploadAlert: ''
    };
    this.handlePopState = this.handlePopState.bind(this);
    this.handleChangeBookmark = this.handleChangeBookmark.bind(this);
    this.handleLocationClick = this.handleLocationClick.bind(this);
    this.handleDirClick = this.handleDirClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleFileDrop = this.handleFileDrop.bind(this);
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handlePopState);
    let that = this;
    request.get('/api/bookmarks').end(function(err, res) {
      that.setState({ bookmarks: JSON.parse(res.text) }, function() {
        this.updateByUrl(location.pathname);
      });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
  }

  makeFullPath(bookmarkIndex, dir) {
    return this.state.bookmarks[bookmarkIndex].dir + '/' + dir.join('/');
  }

  makeCurFullPath() {
    return this.makeFullPath(this.state.curBookmarkIndex, this.state.dir);
  }

  updateByUrl(url) {
    let parts = url.split('/');
    util.removeAll(parts, "");
    let bookmarkIndex = parseInt(parts[0]);
    let dir = parts.slice(1);
    this.queryFiles(bookmarkIndex, dir, false);
  }

  queryFiles(bookmarkIndex, dir, addHistory = true) {
    let xhttp = new XMLHttpRequest();
    let that = this;
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        let files = JSON.parse(xhttp.responseText);
        files.sort(function(a, b) {
          if (a.isDirectory == b.isDirectory) {
            return a.name.localeCompare(b.name);
          } else if (a.isDirectory) {
            return -1;
          } else {
            return 1;
          }
        });
        files.forEach(function(file) {
          file.size = util.fileSizeIEC(file.size);
          file.mtime = moment(file.mtime).format('YYYY-MM-DD HH:mm:ss');
        });
        that.setState({ curBookmarkIndex: bookmarkIndex, dir: dir, files: files });
        if (addHistory) {
          history.pushState(null, null, `/${bookmarkIndex}/${dir.join('/')}`);
        }
      }
    };
    let url = "/api/dir" + this.makeFullPath(bookmarkIndex, dir);
    xhttp.open("GET", url, true);
    xhttp.send();
  }

  handlePopState() {
    this.updateByUrl(location.pathname);
  }

  handleChangeBookmark(index) {
    this.queryFiles(index, []);
  }

  handleLocationClick(index) {
    this.queryFiles(this.state.curBookmarkIndex, this.state.dir.slice(0, index));
  }

  handleDirClick(name) {
    let newDir = this.state.dir.slice(0);
    newDir.push(name);
    this.queryFiles(this.state.curBookmarkIndex, newDir);
  }

  handleDeleteClick(name) {
    let req = request.post("/api/delete" + this.makeCurFullPath() + '/' + name);
    req.end((err) => {
      let alertStyle = {
        width: '800px',
        marginTop: '10px',
        padding: '5px 10px'
      };
      if (err) {
        this.setState({ uploadAlert: <Alert bsStyle="danger" style={alertStyle}>{err.toString()}</Alert> });
      } else {
        this.queryFiles(this.state.curBookmarkIndex, this.state.dir);
        this.setState({ uploadAlert: <Alert bsStyle="success" style={alertStyle}>Success</Alert> });
      }
    });
  }

  handleFileDrop(files) {
    this.setState({ upload: files });

    let req = request.post("/api/upload" + this.makeCurFullPath());
    files.forEach(file => {
      req.attach(file.name, file, file.name);
    });
    req.end((err) => {
      let alertStyle = {
        width: '800px',
        marginTop: '10px',
        padding: '5px 10px'
      };
      if (err) {
        this.setState({ upload: [], uploadAlert: <Alert bsStyle="danger" style={alertStyle}>{err.toString()}</Alert> });
      } else {
        this.queryFiles(this.state.curBookmarkIndex, this.state.dir);
        this.setState({ upload: [], uploadAlert: <Alert bsStyle="success" style={alertStyle}>Success</Alert> });
      }
    });
  }

  render() {
    if (this.state.bookmarks.length == 0) {
      return <div></div>;
    }

    let sizeColumnStyle = {
      width: '130px',
      textAlign: 'right'
    };
    let timeColumnStyle = {
      width: '170px',
      textAlign: 'right'
    };

    let fullpath = this.makeCurFullPath();
    let files = this.state.files.map(file => {
      return (
        <tr key={file.name}>
          <td>
            <File
              fullpath={fullpath}
              {...file}
              onDirClick={this.handleDirClick}
              onDeleteClick={this.handleDeleteClick}
            />
          </td>
          <td style={sizeColumnStyle}>{file.size}</td>
          <td style={timeColumnStyle}>{file.mtime}</td>
        </tr>
      );
    });

    let dropzoneStyle = {
      width: '800px',
      height: '50px',
      lineHeight: '50px',
      margin: '15px 0px',
      textAlign: 'center',
      backgroundColor: '#EEE',
      borderRadius: '5px',
      border: '2px dashed #C7C7C7'
    };
    let dropzoneActiveStyle = {
      width: '800px',
      height: '50px',
      lineHeight: '50px',
      margin: '15px 0px',
      textAlign: 'center',
      backgroundColor: '#AAA',
      borderRadius: '5px',
      border: '2px dashed black'
    };
    let uploadDiv = '';
    if (this.state.upload.length == 0) {
      uploadDiv = (
        <Dropzone style={dropzoneStyle} activeStyle={dropzoneActiveStyle} onDrop={this.handleFileDrop}>
          Drag files to upload
        </Dropzone>
      );
    } else {
      uploadDiv = <div style={dropzoneStyle}>Uploading {this.state.upload.length} files...</div>;
    }

    return (
      <div>
        <Location
          bookmarks={this.state.bookmarks}
          curBookmarkIndex={this.state.curBookmarkIndex}
          dir={this.state.dir}
          onChangeBookmark={this.handleChangeBookmark}
          onClick={this.handleLocationClick}
        />
        {uploadDiv}
        {this.state.uploadAlert}
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
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
