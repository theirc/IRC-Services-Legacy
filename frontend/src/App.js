import React, { Component }  from 'react';
import './App.css';
import { Helmet } from "react-helmet";
import AppRouter from "./router";
import { createStore, applyMiddleware } from "redux";
import { Provider, connect } from "react-redux";
import thunk from "redux-thunk";
import {auth} from "./actions";
import cmsApp from "./reducers";

let store = createStore(cmsApp, applyMiddleware(thunk));

class App extends Component {
  render(){
    const initialCsrf = document.getElementById("initialCSRF").value;
    return (
      <Provider store={store}>
        <div className="App">
          <Helmet>
                <title>CMS</title>
          </Helmet>
          <AppRouter initialCsrf={initialCsrf}/>
          
        </div>
      </Provider>
    );
  }
  
}

export default App;
