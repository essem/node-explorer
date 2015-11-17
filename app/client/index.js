require("./bootstrap/css/bootstrap.css");
require("./style.css");

import React from 'react';
import ReactDOM from 'react-dom';
import { Alert, Button, ButtonGroup, ButtonToolbar, Table, Glyphicon, SplitButton, MenuItem } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import request from 'superagent';
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
          bsStyle="primary"
          title={this.props.bookmarks[this.props.curBookmarkIndex].name}
          onClick={this.handleRootClick}
        >
          {this.props.bookmarks.map((bookmark, index) => {
            return <MenuItem onClick={this.handleBookmarkClick} data-index={index}>{bookmark.name}</MenuItem>;
          })}
        </SplitButton>

        <ButtonGroup>
          {this.props.dir.map((name, index) => {
            return <Button onClick={this.handleClick} data-index={index + 1}>{name}</Button>;
          })}
        </ButtonGroup>
      </ButtonToolbar>
    );
  }
}

class File extends React.Component {
  constructor() {
    super();
    this.state = { fileClicked: false };
    this.handleDirClick = this.handleDirClick.bind(this);
    this.handleFileEnter = this.handleFileEnter.bind(this);
    this.handleFileLeave = this.handleFileLeave.bind(this);
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

  render() {
    if (this.props.isDirectory) {
      return (
        <div className="file" onClick={this.handleDirClick}>
          <Glyphicon glyph="folder-close" /> {this.props.name}
        </div>
      );
    } else if (this.state.fileClicked) {
      return (
        <div className="file" onMouseLeave={this.handleFileLeave}>
          <form method="get" action={'/api/download' + this.props.fullpath + '/' + this.props.name}>
            <Button type="submit" bsStyle="primary" bsSize="xsmall">Download</Button>
          </form>
        </div>
      );
    } else {
      return (
        <div className="file" onMouseEnter={this.handleFileEnter}>
          {this.props.name}
        </div>
      );
    }
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
    this.handleChangeBookmark = this.handleChangeBookmark.bind(this);
    this.handleLocationClick = this.handleLocationClick.bind(this);
    this.handleDirClick = this.handleDirClick.bind(this);
    this.handleFileDrop = this.handleFileDrop.bind(this);
  }

  componentDidMount() {
    let that = this;
    request.get('/api/bookmarks').end(function(err, res) {
      that.setState({ bookmarks: JSON.parse(res.text) }, function() {
        that.queryFiles(that.state.curBookmarkIndex, that.state.dir);
      });
    });
  }

  makeFullPath(bookmarkIndex, dir) {
    return this.state.bookmarks[bookmarkIndex].dir + '/' + dir.join('/');
  }

  makeCurFullPath() {
    return this.makeFullPath(this.state.curBookmarkIndex, this.state.dir);
  }

  queryFiles(bookmarkIndex, dir) {
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
          file.mtime = new Date(file.mtime).toLocaleString();
        });
        that.setState({ curBookmarkIndex: bookmarkIndex, dir: dir, files: files });
      }
    };
    let url = "/api/dir" + this.makeFullPath(bookmarkIndex, dir);
    xhttp.open("GET", url, true);
    xhttp.send();
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

  handleFileDrop(files) {
    this.setState({ upload: files });

    let req = request.post("/api/upload" + this.makeCurFullPath());
    files.forEach(file => {
      req.attach(file.name, file);
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

    let fullpath = this.makeCurFullPath();
    let files = this.state.files.map(file => {
      return (
        <tr>
          <td>
            <File key={file.name} fullpath={fullpath} {...file} onDirClick={this.handleDirClick} />
          </td>
          <td>{file.size}</td>
          <td>{file.mtime}</td>
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
              <th width="130px"> Size</th>
              <th width="200px">Modified</th>
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
