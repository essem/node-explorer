import React from 'react';
import ReactDOM from 'react-dom';

class File extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.props.onClick(this.props.name);
  }
  render() {
    if (this.props.isDirectory) {
      return <div><a onClick={this.handleClick}>{this.props.name}</a></div>;
    } else {
      return <div>{this.props.name}</div>;
    }
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.state = { dir: [], files: [] };
    this.handleUpClick = this.handleUpClick.bind(this);
    this.handleFileClick = this.handleFileClick.bind(this);
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
        that.setState({ dir: dir, files: files });
      }
    };
    xhttp.open("GET", "/api/dir" + this.makeDirStr(dir), true);
    xhttp.send();
  }

  handleUpClick() {
    let newDir = this.state.dir.slice(0);
    newDir.splice(-1, 1);
    this.queryFiles(newDir);
  }

  handleFileClick(name) {
    let newDir = this.state.dir.slice(0);
    newDir.push(name);
    this.queryFiles(newDir);
  }

  render() {
    let files = this.state.files.map(file => {
      return <File key={file.name} {...file} onClick={this.handleFileClick} />;
    });
    return (
      <div>
        <div>Dir: {this.makeDirStr(this.state.dir)}</div>
        <div><a onClick={this.handleUpClick}>Up</a></div>
        <div>
          {files}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
