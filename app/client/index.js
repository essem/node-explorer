require("./bootstrap/css/bootstrap.css");
require("./style.css");

import React from 'react';
import ReactDOM from 'react-dom';
import { Alert, Button, Table, Glyphicon } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import request from 'superagent';

function intersperse(arr, sep) {
  if (arr.length === 0) {
    return [];
  }

  return arr.slice(1).reduce(function(xs, x) {
    return xs.concat([sep, x]);
  }, [arr[0]]);
}

function fileSizeIEC(a, b, c, d, e) {
  return (b=Math,c=b.log,d=1024,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)+' '+(e?'KMGTPEZY'[--e]+'iB':'Bytes');
}

class Location extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.props.onClick(e.target.dataset.index);
  }

  render() {
    let parts = this.props.dir.slice();
    parts.unshift('Home');
    parts = parts.map((part, index) => {
      if (index < parts.length - 1) {
        return <a onClick={this.handleClick} data-index={index}>{part}</a>;
      } else {
        return part;
      }
    });
    return (
      <h3>
        {intersperse(parts, <Glyphicon glyph="menu-right" />)}
      </h3>
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
          <form method="get" action={'/api/download/' + this.props.dir.join('/') + '/' + this.props.name}>
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
    this.state = { dir: [], files: [], upload: [], uploadAlert: '' };
    this.handleLocationClick = this.handleLocationClick.bind(this);
    this.handleDirClick = this.handleDirClick.bind(this);
    this.handleFileDrop = this.handleFileDrop.bind(this);
  }

  componentDidMount() {
    this.queryFiles(this.state.dir);
  }

  makeDirStr(dir) {
    return '/' + dir.join('/');
  }

  queryFiles(dir) {
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
          file.size = fileSizeIEC(file.size);
          file.mtime = new Date(file.mtime).toLocaleString();
        });
        that.setState({ dir: dir, files: files });
      }
    };
    xhttp.open("GET", "/api/dir" + this.makeDirStr(dir), true);
    xhttp.send();
  }

  handleLocationClick(index) {
    this.queryFiles(this.state.dir.slice(0, index));
  }

  handleDirClick(name) {
    let newDir = this.state.dir.slice(0);
    newDir.push(name);
    this.queryFiles(newDir);
  }

  handleFileDrop(files) {
    this.setState({ upload: files });

    let req = request.post("/api/upload" + this.makeDirStr(this.state.dir));
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
        this.queryFiles(this.state.dir);
        this.setState({ upload: [], uploadAlert: <Alert bsStyle="success" style={alertStyle}>Success</Alert> });
      }
    });
  }

  render() {
    let files = this.state.files.map(file => {
      return (
        <tr>
          <td>
            <File key={file.name} dir={this.state.dir} {...file} onDirClick={this.handleDirClick} />
          </td>
          <td>{file.size}</td>
          <td>{file.mtime}</td>
        </tr>
      );
    });

    let uploadDiv = '';
    if (this.state.upload.length == 0) {
      let dropzoneStyle = {
        width: '800px',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
        backgroundColor: '#EEE',
        borderRadius: '5px',
        border: '2px dashed #C7C7C7'
      };
      let dropzoneActiveStyle = {
        width: '800px',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
        backgroundColor: '#AAA',
        borderRadius: '5px',
        border: '2px dashed black'
      };
      uploadDiv = (
        <Dropzone style={dropzoneStyle} activeStyle={dropzoneActiveStyle} onDrop={this.handleFileDrop}>
          Drag files to upload
        </Dropzone>
      );
    } else {
      uploadDiv = <div>Uploading {this.state.upload.length} files...</div>;
    }

    return (
      <div>
        <Location dir={this.state.dir} onClick={this.handleLocationClick} />
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
        {uploadDiv}
        {this.state.uploadAlert}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
