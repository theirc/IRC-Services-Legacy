import auth from "./auth";
import { combineReducers } from 'redux';
 
const cmsApp = combineReducers({
    auth,
})

export default cmsApp;
