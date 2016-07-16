import { connect } from 'react-redux';
import React from 'react';
import { ButtonGroup, ButtonToolbar, Button, Glyphicon, Modal, FormControl } from 'react-bootstrap';
import { createFolder } from '../actions';

class Toolbar extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    view: React.PropTypes.string,
    loc: React.PropTypes.object,
  };

  state = {
    showNewFolderModal: false,
    folderName: '',
  };

  handleOpenNewFolderModal = () => {
    this.setState({ showNewFolderModal: true, folderName: '' });
  };

  handleCloseNewFolderModal = () => {
    this.setState({ showNewFolderModal: false });
  };

  handleChangeFolderName = e => {
    this.setState({ folderName: e.target.value });
  }

  handleCreateFolder = () => {
    this.props.dispatch(createFolder(this.props.loc, this.state.folderName));
    this.setState({ showNewFolderModal: false });
  }

  handleListView = () => {
    this.props.dispatch({ type: 'CHANGE_VIEW', view: 'list' });
  };

  handleThumbnailView = () => {
    this.props.dispatch({ type: 'CHANGE_VIEW', view: 'thumbnail' });
  };

  renderNewFolderModal() {
    if (!this.state.showNewFolderModal) {
      return '';
    }

    return (
      <Modal show onHide={this.handleCloseNewFolderModal}>
        <Modal.Header>
          <Modal.Title>Create new folder</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FormControl
            type="text"
            autoFocus
            placeholder="Folder name"
            value={this.state.folderName}
            onChange={this.handleChangeFolderName}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.handleCloseNewFolderModal}>Cancel</Button>
          <Button onClick={this.handleCreateFolder} bsStyle="primary">Create</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    return (
      <ButtonToolbar className="pull-right">
        <ButtonGroup>
          <Button
            onClick={this.handleOpenNewFolderModal}
          >
            <Glyphicon glyph="folder-open" />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
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
        {this.renderNewFolderModal()}
      </ButtonToolbar>
    );
  }
}

const mapStateToProps = state => ({
  view: state.ui.view,
  loc: state.loc,
});

export default connect(mapStateToProps)(Toolbar);
