const initialState = {
  view: 'list',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_VIEW':
      return {
        ...state,
        view: action.view,
      };

    default:
      return state;
  }
};

export default reducer;
