import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import request from 'superagent';

export default class Upload extends React.Component {
  static propTypes = {
    curBookmarkIndex: React.PropTypes.number,
    dir: React.PropTypes.array,
    onUploadEnded: React.PropTypes.func,
  };

  state = {
    upload: [],
    progress: 0,
  };

  handleFileDrop = files => {
    this.setState({ upload: files });

    const curFullPath = `/${this.props.curBookmarkIndex}/${this.props.dir.join('/')}`;
    const req = request.post(`${API_HOST}/api/upload${curFullPath}`);
    files.forEach(file => {
      req.attach(file.name, file, file.name);
    });
    req.on('progress', e => {
      this.setState({ progress: Math.trunc(e.percent) });
    }).end((err) => {
      this.props.onUploadEnded(err);
      this.setState({ upload: [] });
    });
  };

  render() {
    let dropzoneStyle = {
      width: '800px',
      height: '50px',
      lineHeight: '50px',
      margin: '15px 0px',
      textAlign: 'center',
      backgroundColor: '#EEE',
      borderRadius: '5px',
      border: '2px dashed #C7C7C7',
    };

    let dropzoneActiveStyle = JSON.parse(JSON.stringify(dropzoneStyle));
    dropzoneActiveStyle.backgroundColor = '#AAA';
    dropzoneActiveStyle.border = '2px dashed black';

    let uploadStyle = {
      position: 'relative',
      width: '800px',
      height: '50px',
      margin: '15px 0px',
    };

    let progressStyle = {
      position: 'absolute',
      bottom: '0px',
      left: '0px',
      right: '0px',
      marginBottom: '0px',
    };

    if (this.state.upload.length === 0) {
      return (
        <Dropzone
          style={dropzoneStyle}
          activeStyle={dropzoneActiveStyle}
          onDrop={this.handleFileDrop}
        >
          Drag files to upload
        </Dropzone>
      );
    }

    return (
      <div style={uploadStyle}>
        <div>Uploading {this.state.upload.length} files...</div>
        <ProgressBar
          style={progressStyle}
          active
          now={this.state.progress}
          label={`${this.state.progress}%`}
        />
      </div>
    );
  }
}
