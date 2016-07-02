import { connect } from 'react-redux';
import * as actions from '../actions';
import React from 'react';
import ReactDOM from 'react-dom';
import { Table } from 'react-bootstrap';
import { locToUrl } from '../common/util';
import File from './file';

class FileList extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    loc: React.PropTypes.object,
    files: React.PropTypes.array,
  };

  componentDidMount() {
    window.addEventListener('click', this.handleWindowClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleWindowClick);
  }

  handleWindowClick = e => {
    const clickedOutside = !ReactDOM.findDOMNode(this).contains(e.target);
    if (clickedOutside) {
      this.props.dispatch({ type: 'SELECT_NONE' });
    }
  };

  handleDirClick = name => {
    const dir = this.props.loc.dir.concat(name);
    const loc = { bookmark: this.props.loc.bookmark, dir };
    this.props.dispatch(actions.changeLoc(loc));
  };

  handlePreviewClick = index => {
    const name = this.props.files[index].name;
    this.props.dispatch({ type: 'START_PREVIEW', loc: this.props.loc, index, name });
  };

  handleToggle = index => {
    this.props.dispatch({ type: 'TOGGLE_FILE', index });
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
        {this.props.files.map((file, index) => (
          <File
            key={file.name}
            fullpath={fullpath}
            fileIndex={index}
            {...file}
            onDirClick={this.handleDirClick}
            onPreviewClick={this.handlePreviewClick}
            onToggle={this.handleToggle}
          />
        ))}
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
