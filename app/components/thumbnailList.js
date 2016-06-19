import { connect } from 'react-redux';
import * as actions from '../actions';
import React from 'react';
import Thumbnail from './thumbnail';
import { locToUrl } from '../common/util';

class ThumbnailList extends React.Component {
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

  handlePreviewClick = index => {
    const name = this.props.files[index].name;
    this.props.dispatch({ type: 'START_PREVIEW', loc: this.props.loc, index, name });
  };

  render() {
    return (
      <div>
      {this.props.files.map((file, index) => (
        <Thumbnail
          key={index}
          fullpath={locToUrl(this.props.loc)}
          fileIndex={index}
          {...file}
          onDirClick={this.handleDirClick}
          onPreviewClick={this.handlePreviewClick}
        />
      ))}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  bookmarks: state.bookmarks,
  loc: state.loc,
  files: state.files,
});

export default connect(mapStateToProps)(ThumbnailList);
