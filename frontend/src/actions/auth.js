export const loadUser = () => {
    return (dispatch, getState) => {
      dispatch({type: "USER_LOADING"});
  
      const token = getState().auth.token;
  
      let headers = {
        "Content-Type": "application/json",
      };
  
      if (token) {
        headers["Authorization"] = `Token ${token}`;
      }
      return fetch("/v2/users/login", {headers, })
        .then(res => {
          if (res.status < 500) {
            return res.json().then(data => {
              return {status: res.status, data};
            })
          } else {
            console.log("Server Error!");
            throw res;
          }
        })
        .then(res => {
          if (res.status === 200) {
            dispatch({type: 'USER_LOADED', user: res.data });
            return res.data;
          } else if (res.status >= 400 && res.status < 500) {
            dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
            throw res.data;
          }
        })
    }
  }

  export const login = (username, password) => {
    return (dispatch, getState) => {
      let headers = {"Content-Type": "application/json"};
      let body = JSON.stringify({username, password});
  
      return fetch("/v2/users/login", {headers, body, method: "POST"})
        .then(res => {
          if (res.status < 500) {
            return res.json().then(data => {
              return {status: res.status, data};
            })
          } else {
            console.log("Server Error!");
            throw res;
          }
        })
        .then(res => {
          if (res.status === 200) {
            dispatch({type: 'LOGIN_SUCCESSFUL', data: res.data });
            return res.data;
          } else if (res.status === 403 || res.status === 401) {
            dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
            throw res.data;
          } else {
            dispatch({type: "LOGIN_FAILED", data: res.data});
            throw res.data;
          }
        })
    }
  }