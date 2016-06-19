import path from 'path';
import { connect } from 'react-redux';
import React from 'react';
import PreviewJpg from './previewJpg';
import PreviewTxt from './previewTxt';

class Preview extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    loc: React.PropTypes.object,
    files: React.PropTypes.array,
    preview: React.PropTypes.object,
  };

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  handleClose = () => {
    this.props.dispatch({ type: 'STOP_PREVIEW' });
  };

  handlePrev = () => {
    if (this.props.preview.index > 0) {
      const index = this.props.preview.index - 1;
      const name = this.props.files[index].name;
      this.props.dispatch({ type: 'START_PREVIEW', loc: this.props.loc, index, name });
    }
  };

  handleNext = () => {
    if (this.props.preview.index < this.props.files.length - 1) {
      const index = this.props.preview.index + 1;
      const name = this.props.files[index].name;
      this.props.dispatch({ type: 'START_PREVIEW', loc: this.props.loc, index, name });
    }
  };

  handleClick = e => {
    const outWidth = window.document.documentElement.clientWidth;
    if (e.clientX < outWidth / 3) {
      this.handlePrev();
    } else if (e.clientX < outWidth * 2 / 3) {
      this.handleClose();
    } else {
      this.handleNext();
    }
  };

  handleKeyUp = e => {
    if (e.keyCode === 27) { // ESC
      this.handleClose();
    } else if (e.keyCode === 37) { // Left arrow
      this.handlePrev();
    } else if (e.keyCode === 39 || e.keyCode === 32) { // Right arrow or Space
      this.handleNext();
    }
  };

  renderByExt() {
    switch (path.extname(this.props.preview.name).toLowerCase()) {
      case '.jpg': return <PreviewJpg />;
      case '.txt': return <PreviewTxt />;
      default:
    }

    const outerStyle = {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const innerStyle = {
      color: 'white',
      backgroundColor: 'black',
      padding: '10px 30px',
      borderRadius: '10px',
    };

    return (
      <div style={outerStyle}>
        <span style={innerStyle}>{this.props.preview.name}: Unknown format</span>
      </div>
    );
  }

  render() {
    if (!this.props.preview) {
      return <div></div>;
    }

    if (this.props.preview.backgroundOnly) {
      return <div className="preview"></div>;
    }

    if (!this.props.preview.name) {
      return <div></div>;
    }

    return (
      <div
        className="preview"
        onClick={this.handleClick}
      >
        {this.renderByExt()}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  loc: state.loc,
  files: state.files,
  preview: state.preview,
});

export default connect(mapStateToProps)(Preview);
