import { connect } from 'react-redux';
import * as actions from '../actions';
import React from 'react';
import { Alert, Table } from 'react-bootstrap';
import { locToUrl, urlToLoc } from '../common/util';
import Location from './location';
import Upload from './upload';
import File from './file';
import Preview from './preview';

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
    this.props.dispatch(actions.initApp());
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
  }

  handlePopState = () => {
    const loc = urlToLoc(location.pathname);
    this.props.dispatch(actions.changeLoc(loc, false));
  };

  handleChangeBookmark = index => {
    const loc = { bookmark: index, dir: [] };
    this.props.dispatch(actions.changeLoc(loc));
  };

  handleLocationClick = index => {
    const dir = this.props.loc.dir.slice(0, index);
    const loc = { bookmark: this.props.loc.bookmark, dir };
    this.props.dispatch(actions.changeLoc(loc));
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
    this.props.dispatch(actions.deleteFile(this.props.loc, name));
  };

  handleUploadEnded = err => {
    if (err) {
      this.props.dispatch({
        type: 'SHOW_ALERT',
        alert: { type: 'danger', message: err.toString() },
      });
    } else {
      this.props.dispatch({
        type: 'SHOW_ALERT',
        alert: { type: 'success', message: 'Success' },
      });
    }

    this.props.dispatch(actions.changeLoc(this.props.loc), false);
  };

  renderAlert() {
    if (!this.props.alert) {
      return '';
    }

    const alertStyle = {
      width: '800px',
      marginTop: '10px',
      padding: '5px 10px',
    };

    return (
      <Alert bsStyle={this.props.alert.type} style={alertStyle}>
        {this.props.alert.message}
      </Alert>
    );
  }

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
        {this.renderAlert()}
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
