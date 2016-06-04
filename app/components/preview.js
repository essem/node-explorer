import { connect } from 'react-redux';
import * as actions from '../actions';
import React from 'react';
import { locToUrl } from '../common/util';

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
      this.props.dispatch(actions.startPreview(this.props.loc, index, name));
    }
  };

  handleNext = () => {
    if (this.props.preview.index < this.props.files.length - 1) {
      const index = this.props.preview.index + 1;
      const name = this.props.files[index].name;
      this.props.dispatch(actions.startPreview(this.props.loc, index, name));
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

  calcDisplaySize(outWidth, outHeight, imageWidth, imageHeight) {
    const outRatio = outWidth / outHeight;
    const imageRatio = imageWidth / imageHeight;
    if (outRatio > imageRatio) {
      const height = outHeight * 0.8;
      const width = height * imageRatio;
      return { width, height };
    }

    const width = outWidth * 0.8;
    const height = width / imageRatio;
    return { width, height };
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

    const fullpath = locToUrl(this.props.loc);
    const src = `${API_HOST}/api/image${fullpath}/${this.props.preview.name}?type=max800`;
    const imageStyle = {
      position: 'relative',
      display: 'block',
      margin: 'auto',
      top: '50%',
      transform: 'translateY(-50%)',
    };
    const captionStyle = {
      position: 'absolute',
      width: '100%',
      textAlign: 'center',
      color: '#ccc',
    };

    const outWidth = window.document.documentElement.clientWidth;
    const outHeight = window.document.documentElement.clientHeight;
    const { width, height } = this.props.preview.size;
    let displaySize = null;

    if (this.props.preview.orientation === 'RightTop') {
      // swap width and height
      displaySize = this.calcDisplaySize(outWidth, outHeight, height, width);
      imageStyle.width = `${displaySize.height}px`;
      imageStyle.transform += ' rotate(90deg)';
    } else if (this.props.preview.orientation === 'BottomRight') {
      displaySize = this.calcDisplaySize(outWidth, outHeight, width, height);
      imageStyle.width = `${displaySize.width}px`;
      imageStyle.transform += ' rotate(180deg)';
    } else if (this.props.preview.orientation === 'LeftBottom') {
      // swap width and height
      displaySize = this.calcDisplaySize(outWidth, outHeight, height, width);
      imageStyle.width = `${displaySize.height}px`;
      imageStyle.transform += ' rotate(270deg)';
    } else { // TopLeft or unknown
      displaySize = this.calcDisplaySize(outWidth, outHeight, width, height);
      imageStyle.width = `${displaySize.width}px`;
    }

    const captionY = (outHeight - displaySize.height) / 2 + displaySize.height;
    captionStyle.top = `${captionY}px`;

    return (
      <div className="preview">
        <span
          className="close"
          onClick={this.handleClose}
        >
          &times;
        </span>
        <img
          style={imageStyle}
          src={src}
          alt={this.props.preview.name}
        />
        <div style={captionStyle}>
          {this.props.preview.name}
        </div>
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
