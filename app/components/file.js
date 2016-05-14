import React from 'react';
import { Modal, Button, Glyphicon } from 'react-bootstrap';

export default class File extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
    fullpath: React.PropTypes.string,
    isDirectory: React.PropTypes.bool,
    onDirClick: React.PropTypes.func,
    onPreviewClick: React.PropTypes.func,
    onDeleteClick: React.PropTypes.func,
  };

  state = {
    fileClicked: false,
    showDeleteConfirm: false,
  };

  handleDirClick = () => {
    this.props.onDirClick(this.props.name);
  };

  handleFileEnter = () => {
    this.setState({ fileClicked: true });
  };

  handleFileLeave = () => {
    this.setState({ fileClicked: false });
  };

  handleModalOpen = () => {
    this.setState({ showDeleteConfirm: true });
  };

  handleModalClose = () => {
    this.setState({ showDeleteConfirm: false });
  };

  handleModalDelete = () => {
    this.setState({ showDeleteConfirm: false });
    this.props.onDeleteClick(this.props.name);
  };

  render() {
    let modal = (
      <Modal show={this.state.showDeleteConfirm} onHide={this.handleModalClose}>
        <Modal.Header>
          <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Do you want to delete the file '{this.props.name}'?
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.handleModalClose}>Close</Button>
          <Button onClick={this.handleModalDelete} bsStyle="danger">Delete</Button>
        </Modal.Footer>
      </Modal>
    );

    let content = '';
    if (this.props.isDirectory) {
      content = (
        <div className="file" onClick={this.handleDirClick}>
          <Glyphicon glyph="folder-close" /> {this.props.name}
        </div>
      );
    } else if (this.state.fileClicked) {
      let formStyle = {
        display: 'inline',
        marginLeft: '10px',
        marginRight: '10px',
      };
      content = (
        <div className="file" onMouseLeave={this.handleFileLeave}>
          <Button
            bsStyle="primary"
            bsSize="xsmall"
            onClick={() => this.props.onPreviewClick(this.props.name)}
          >
            Preview
          </Button>
          <form
            method="get"
            style={formStyle}
            action={`${API_HOST}/api/download${this.props.fullpath}/${this.props.name}`}
          >
            <Button type="submit" bsStyle="primary" bsSize="xsmall">Download</Button>
          </form>
          <Button bsStyle="danger" bsSize="xsmall" onClick={this.handleModalOpen}>Delete</Button>
        </div>
      );
    } else {
      content = (
        <div className="file" onMouseEnter={this.handleFileEnter}>
          {this.props.name}
        </div>
      );
    }

    return <div>{content}{modal}</div>;
  }
}
