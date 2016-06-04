import { fileSizeIEC } from '../common/util';
import moment from 'moment';

const reducer = (state = [], action) => {
  switch (action.type) {
    case 'CHANGE_LOC':
      {
        const files = action.files.map(file => (
          {
            ...file,
            size: fileSizeIEC(file.size),
            mtime: moment(file.mtime).format('YYYY-MM-DD HH:mm:ss'),
          }
        ));

        files.sort((a, b) => {
          if (a.isDirectory === b.isDirectory) {
            return a.name.localeCompare(b.name);
          } else if (a.isDirectory) {
            return -1;
          }

          return 1;
        });

        return files;
      }
    default:
      return state;
  }
};

export default reducer;
