const initialState = {
    token: sessionStorage.getItem("csrf"),
    isAuthenticated: null,
    isLoading: true,
    user: null,
    errors: {},
  };
  
  
  export default function auth(state=initialState, action) {
  
    switch (action.type) {
  
      case 'USER_LOADING':
        return {...state, isLoading: true};
  
      case 'USER_LOADED':
        return {...state, isAuthenticated: true, isLoading: false, user: action.user};
  
      case 'LOGIN_SUCCESSFUL':
        sessionStorage.setItem("csrf", action.data.token);
        return {...state, ...action.data, isAuthenticated: true, isLoading: false, errors: null};
  
      case 'AUTHENTICATION_ERROR':
      case 'LOGIN_FAILED':
      case 'LOGOUT_SUCCESSFUL':
        sessionStorage.removeItem("csrf");
        return {...state, errors: action.data, token: null, user: null,
          isAuthenticated: false, isLoading: false};
  
      default:
        return state;
    }
  }