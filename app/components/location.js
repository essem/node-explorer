import { connect } from 'react-redux';
import * as actions from '../actions';
import React from 'react';
import { ButtonToolbar, SplitButton, MenuItem, ButtonGroup, Button } from 'react-bootstrap';

class Location extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    loc: React.PropTypes.object,
    bookmarks: React.PropTypes.array,
  };

  handleBookmarkClick = e => {
    const index = parseInt(e.target.dataset.index, 10);
    const loc = { bookmark: index, dir: [] };
    this.props.dispatch(actions.changeLoc(loc));
  };

  handleRootClick = () => {
    const loc = { bookmark: this.props.loc.bookmark, dir: [] };
    this.props.dispatch(actions.changeLoc(loc));
  };

  handleClick = e => {
    const index = parseInt(e.target.dataset.index, 10);
    const dir = this.props.loc.dir.slice(0, index);
    const loc = { bookmark: this.props.loc.bookmark, dir };
    this.props.dispatch(actions.changeLoc(loc));
  };

  render() {
    return (
      <ButtonToolbar>
        <SplitButton
          id="location"
          bsStyle="primary"
          title={this.props.bookmarks[this.props.loc.bookmark]}
          onClick={this.handleRootClick}
        >
          {this.props.bookmarks.map((bookmark, index) => (
            <MenuItem key={index} onClick={this.handleBookmarkClick} data-index={index}>
              {bookmark}
            </MenuItem>
          ))}
        </SplitButton>

        <ButtonGroup>
          {this.props.loc.dir.map((name, index) => (
            <Button key={index} onClick={this.handleClick} data-index={index + 1}>
              {name}
            </Button>
          ))}
        </ButtonGroup>
      </ButtonToolbar>
    );
  }
}

const mapStateToProps = state => ({
  bookmarks: state.bookmarks,
  loc: state.loc,
});

export default connect(mapStateToProps)(Location);
