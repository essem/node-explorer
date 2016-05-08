import React from 'react';
import { ButtonToolbar, SplitButton, MenuItem, ButtonGroup, Button } from 'react-bootstrap';

export default class Location extends React.Component {
  static propTypes = {
    bookmarks: React.PropTypes.array,
    curBookmarkIndex: React.PropTypes.number,
    dir: React.PropTypes.array,
    onChangeBookmark: React.PropTypes.func,
    onClick: React.PropTypes.func,
  };

  handleBookmarkClick = e => {
    const index = parseInt(e.target.dataset.index, 10);
    this.props.onChangeBookmark(index);
  };

  handleRootClick = () => {
    this.props.onClick(0);
  };

  handleClick = e => {
    const index = parseInt(e.target.dataset.index, 10);
    this.props.onClick(index);
  };

  render() {
    return (
      <ButtonToolbar>
        <SplitButton
          id="location"
          bsStyle="primary"
          title={this.props.bookmarks[this.props.curBookmarkIndex]}
          onClick={this.handleRootClick}
        >
          {this.props.bookmarks.map((bookmark, index) => (
            <MenuItem key={index} onClick={this.handleBookmarkClick} data-index={index}>
              {bookmark}
            </MenuItem>
          ))}
        </SplitButton>

        <ButtonGroup>
          {this.props.dir.map((name, index) => (
            <Button key={index} onClick={this.handleClick} data-index={index + 1}>
              {name}
            </Button>
          ))}
        </ButtonGroup>
      </ButtonToolbar>
    );
  }
}
