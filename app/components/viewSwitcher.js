import { connect } from 'react-redux';
import React from 'react';
import { ButtonGroup, Button, Glyphicon } from 'react-bootstrap';

class ViewSwitcher extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    view: React.PropTypes.string,
  };

  handleListView = () => {
    this.props.dispatch({ type: 'CHANGE_VIEW', view: 'list' });
  };

  handleThumbnailView = () => {
    this.props.dispatch({ type: 'CHANGE_VIEW', view: 'thumbnail' });
  };

  render() {
    return (
      <ButtonGroup className="pull-right">
        <Button
          active={this.props.view === 'list'}
          onClick={this.handleListView}
        >
          <Glyphicon glyph="th-list" />
        </Button>
        <Button
          active={this.props.view === 'thumbnail'}
          onClick={this.handleThumbnailView}
        >
          <Glyphicon glyph="th" />
        </Button>
      </ButtonGroup>
    );
  }
}

const mapStateToProps = state => ({
  view: state.ui.view,
});

export default connect(mapStateToProps)(ViewSwitcher);
