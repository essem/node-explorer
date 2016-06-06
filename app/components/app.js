import { connect } from 'react-redux';
import * as actions from '../actions';
import React from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import { urlToLoc } from '../common/util';
import Alert from './alert';
import Bookmark from './bookmark';
import Location from './location';
import ViewSwitcher from './viewSwitcher';
import Upload from './upload';
import FileList from './fileList';
import ThumbnailList from './thumbnailList';
import Preview from './preview';

class App extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    view: React.PropTypes.string,
    bookmarks: React.PropTypes.array,
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

  renderList() {
    switch (this.props.view) {
      case 'thumbnail': return <ThumbnailList />;
      default:
        return <FileList />;
    }
  }

  render() {
    if (this.props.bookmarks.length === 0) {
      return <div></div>;
    }

    return (
      <div className="container">
        <ButtonToolbar>
          <Bookmark />
          <Location />
          <ViewSwitcher />
        </ButtonToolbar>
        <Upload />
        <Alert />
        {this.renderList()}
        <Preview />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  view: state.ui.view,
  bookmarks: state.bookmarks,
});

export default connect(mapStateToProps)(App);
