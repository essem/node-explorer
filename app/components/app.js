import { connect } from 'react-redux';
import * as actions from '../actions';
import React from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import { urlToLoc } from '../common/util';
import Alert from './alert';
import Bookmark from './bookmark';
import Location from './location';
import Upload from './upload';
import FileList from './fileList';
import Preview from './preview';

class App extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
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

  render() {
    if (this.props.bookmarks.length === 0) {
      return <div></div>;
    }

    return (
      <div>
        <ButtonToolbar>
          <Bookmark />
          <Location />
        </ButtonToolbar>
        <Upload />
        <Alert />
        <FileList />
        <Preview />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  bookmarks: state.bookmarks,
});

export default connect(mapStateToProps)(App);
