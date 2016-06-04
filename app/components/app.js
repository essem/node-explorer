import { connect } from 'react-redux';
import * as actions from '../actions';
import React from 'react';
import { Alert } from 'react-bootstrap';
import { urlToLoc } from '../common/util';
import Location from './location';
import Upload from './upload';
import FileList from './fileList';
import Preview from './preview';

class App extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    alert: React.PropTypes.object,
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

    return (
      <div>
        <Location />
        <Upload />
        {this.renderAlert()}
        <FileList />
        <Preview />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  alert: state.alert,
  bookmarks: state.bookmarks,
});

export default connect(mapStateToProps)(App);
