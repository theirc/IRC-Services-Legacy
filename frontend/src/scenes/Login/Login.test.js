import React, { Suspense } from "react";
import { shallow, mount } from "enzyme";
import { Provider } from 'react-redux';
import  ConnectedLogin,{Login} from "./Login";
import  Providers from "../Providers/Providers";
import  ListView from "../Providers/views/ListView/ListView";
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

  const onButtonClickMock = jest.fn();
  const wrapper = shallow(<ConnectedLogin store={store} onSubmit={onButtonClickMock}/>);
  const c = shallow(<Suspense fallback=''> <Login onSubmit={onButtonClickMock}/> </Suspense>);
  const p = shallow(<Suspense fallback=''> <Providers /> </Suspense>);
  const list = shallow(<ListView />);
  //console.log("List");
  //console.log(list.debug());
  //console.log("Providers");
  //console.log(p.debug());
  //console.log("Disconected");
  //console.log(c.debug());
  //console.log("Connected");
  //console.log(wrapper.debug());
  const buttonElement = c.find('form');
  //console.log(buttonElement.debug())

  describe('Login tests: ', () => {
    it('Login component renders ok', () => {
      expect(wrapper).toMatchSnapshot();
    }) 
    
    it('Submmit button work ok', () => {
     // const wrapper = shallow(<ConnectedLogin store={store}/>);
      //const buttonElement = c.find('form');
      //console.log(buttonElement.debug())
     // buttonElement.simulate('submit');


    })
  })

  