import { connect } from 'react-redux';
import * as actions from '../actions';
import React from 'react';
import { Table } from 'react-bootstrap';
import { locToUrl } from '../common/util';
import File from './file';

class FileList extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    loc: React.PropTypes.object,
    files: React.PropTypes.array,
  };

  handleDirClick = name => {
    const dir = this.props.loc.dir.concat(name);
    const loc = { bookmark: this.props.loc.bookmark, dir };
    this.props.dispatch(actions.changeLoc(loc));
  };

  preview(index) {
    const name = this.props.files[index].name;
    this.props.dispatch(actions.startPreview(this.props.loc, index, name));
  }

  handlePreviewClick = index => {
    this.preview(index);
  };

  handleDeleteClick = name => {
    this.props.dispatch(actions.deleteFile(this.props.loc, name));
  };

  render() {
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
    );
  }
}

const mapStateToProps = state => ({
  bookmarks: state.bookmarks,
  loc: state.loc,
  files: state.files,
});

export default connect(mapStateToProps)(FileList);
