import React, { Suspense } from "react";
import { shallow, mount, render } from "enzyme";
import { Provider } from 'react-redux';
import  Providers from "./Providers";
import { prop } from '@uirouter/core';
import  ListView from "./views/ListView/ListView";
import  EditView from "./views/EditView/EditView"
//import store from '../.././shared/store';
import configureStore from 'redux-mock-store';
import { create } from "react-test-renderer";
//import { render } from '@testing-library/react'
import expectationResultFactory from "jest-jasmine2/build/expectationResultFactory";
import { findByTestAtrrr, testStore } from '../../.././Utils'
import { isRegExp } from "util";
import TestRenderer from 'react-test-renderer';


describe('Providers tests: ', () => {
  const mockedFunction = jest.fn();
  const mockedFunctionForList = jest.fn();
  const initialProps = {
    history:{
      goBack: () => { mockedFunction();
      }
    }
  }
  const propsForList = {
    history:{},
    rowEvents:{
      onClick: () =>{mockedFunctionForList();}
    }
  }
  const listcomponent = shallow(<ListView {...propsForList} />);
  const edit = shallow(<EditView {...initialProps} onClick={mockedFunction}/>);
  const w = edit.find('button');
  const listToShallow = listcomponent.find('List');
  
  
  it('List view renders ok:', () => {
    const title = listcomponent.find('h2');
    const titleText = title.text();
    expect(listcomponent.exists()).toBe(true);
    expect(titleText).toBe('PROVIDERS');
  })

  it('Checks list view structure:', () => {
    expect(listcomponent.find('.ListView').exists()).toBe(true);
    expect(listcomponent.find('h2').exists()).toBe(true);
    expect(listcomponent.find('List').exists()).toBe(true);
  })

  it('Edit view renders ok:', () => {
    expect(edit.exists()).toBe(true);
    expect(w.text()).toBe('< Back');
  })

  it('Checks edit view structure:', () => {
    const editss = edit.find('Edit');
    const h2s = edit.find('h2');
    expect(editss.length).toBe(6);
    expect(h2s.length).toBe(1);
  })

  it('Back button:', () => {
    w.simulate('click');
    expect(mockedFunction).toHaveBeenCalled();
  })

})