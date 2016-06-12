const initialState = {
  view: 'list',
  loading: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_VIEW':
      return {
        ...state,
        view: action.view,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
      };

    case 'CLEAR_LOADING':
      return {
        ...state,
        loading: false,
      };

    default:
      return state;
  }
};

export default reducer;
