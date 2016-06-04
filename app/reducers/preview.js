const reducer = (state = null, action) => {
  switch (action.type) {
    case 'PREPARE_PREVIEW':
      return { backgroundOnly: true };

    case 'START_PREVIEW':
      return action.preview;

    case 'STOP_PREVIEW':
      return null;

    default:
      return state;
  }
};

export default reducer;
