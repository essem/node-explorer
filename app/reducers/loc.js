const initialState = {
  bookmark: 1,
  dir: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_LOC':
      return action.loc;

    default:
      return state;
  }
};

export default reducer;
