import React from 'react';

export default class Preview extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
    fullpath: React.PropTypes.string,
    size: React.PropTypes.object,
    orientation: React.PropTypes.string,
    onClose: React.PropTypes.func,
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
    if (!this.props.name) {
      return <div></div>;
    }

    const src = `${API_HOST}/api/download${this.props.fullpath}/${this.props.name}`;
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
    const { width, height } = this.props.size;
    let displaySize = null;

    if (this.props.orientation === 'RightTop') {
      // swap width and height
      displaySize = this.calcDisplaySize(outWidth, outHeight, height, width);
      imageStyle.width = `${displaySize.height}px`;
      imageStyle.transform += ' rotate(90deg)';
    } else if (this.props.orientation === 'BottomRight') {
      displaySize = this.calcDisplaySize(outWidth, outHeight, width, height);
      imageStyle.width = `${displaySize.width}px`;
      imageStyle.transform += ' rotate(180deg)';
    } else if (this.props.orientation === 'LeftBottom') {
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
          onClick={this.props.onClose}
        >
          &times;
        </span>
        <img
          style={imageStyle}
          src={src}
          alt={this.props.name}
        />
        <div style={captionStyle}>
          {this.props.name}
        </div>
      </div>
    );
  }
}
