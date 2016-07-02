import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import FileIcon from './fileIcon';

const selectedStyle = {
  backgroundColor: 'rgba(204,230,250,0.5)',
};

export default class File extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
    fullpath: React.PropTypes.string,
    fileIndex: React.PropTypes.number,
    size: React.PropTypes.string,
    mtime: React.PropTypes.string,
    isDirectory: React.PropTypes.bool,
    selected: React.PropTypes.bool,
    onDirClick: React.PropTypes.func,
    onPreviewClick: React.PropTypes.func,
    onToggle: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  handleClick = () => {
    if (this.props.isDirectory) {
      this.props.onDirClick(this.props.name);
    } else {
      this.props.onPreviewClick(this.props.fileIndex);
    }
  };

  handleIconClick = e => {
    e.stopPropagation(); // to prevent handleClick
    this.props.onToggle(this.props.fileIndex);
  };

  render() {
    return (
      <tr style={this.props.selected ? selectedStyle : {}}>
        <td>
          <div
            className="file"
            onClick={this.handleClick}
          >
            <FileIcon
              directory={this.props.isDirectory}
              filename={this.props.name}
              selected={this.props.selected}
              onClick={this.handleIconClick}
            />
            {this.props.name}
          </div>
        </td>
        <td style={{ textAlign: 'right' }}>
          {this.props.isDirectory ? 'Directory' : this.props.size}
        </td>
        <td style={{ textAlign: 'right' }}>
          {this.props.mtime}
        </td>
      </tr>
    );
  }
}
