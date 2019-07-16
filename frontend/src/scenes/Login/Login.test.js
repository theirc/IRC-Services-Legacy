import React, { Suspense } from "react";
import { shallow } from "enzyme";
import { Provider } from 'react-redux';
import  ConnectedLogin,{Login} from "./Login";
//import store from '../.././shared/store';
import configureStore from 'redux-mock-store';
import { create } from "react-test-renderer";
import expectationResultFactory from "jest-jasmine2/build/expectationResultFactory";
import { findByTestAtrrr, testStore } from '../../.././Utils'
import { isRegExp } from "util";
import TestRenderer from 'react-test-renderer';


  const initialState = {};
  const props = {};
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const store = mockStore(initialState);

  const wrapper = shallow(<ConnectedLogin store={store}/>);
  const c = shallow(<Suspense callback=''> <Login /> <Suspense>);

  describe('Login tests: ', () => {
    it('Login component renders ok', () => {
      expect(wrapper.length).toEqual(1);
    }) 

    it('Fields for username and password and submit button show ok', () => {
      expect(wrapper.find('#username').length).toEqual(1);
      expect(wrapper.find('#password').length).toEqual(1);
      expect(wrapper.find('#submitButton').length).toEqual(1);
    })

    it('Login button', () => {
    const instance  = wrapper.root;
    const button = instance.find('#submitButton');
    expect(button().click());
    })
    
    it('Home page shows after login', () => {
      
    })
  })

  