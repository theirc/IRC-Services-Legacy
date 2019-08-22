import React, { Suspense } from "react";
import ReactDOM from 'react-dom';
import { shallow, mount, render } from "enzyme";
import { Provider } from 'react-redux';
import  ListView from "./views/ListView/ListView";
import  EditView from "./views/EditView/EditView";
import store from '../../shared/store';
import { act } from 'react-dom/test-utils';
import expectationResultFactory from "jest-jasmine2/build/expectationResultFactory";

const mockedFunction = jest.fn();
const addNewMockedFunction = jest.fn();

const propsForEditViewWithId = {
    match:{
      params:{
        id:'2'
      }
    },
    history:{
      goBack: () => { mockedFunction();
      }
    }
}
const propsForEditViewWithCreateId = {
    match:{
      params:{
        id:'create'
      }
    },
    history:{
      goBack: () => { mockedFunction();
      }
    },  
    handleSubmit: jest.fn()
}
const propsForListView = {
  history:{
    goBack: () => { mockedFunction();
    }
  },
  addNew: () => {addNewMockedFunction();}
  //addNew: () => {mockedAddFunction();}
}


describe('Providers tests: ', () => {
  

  it('Edit view with create ID: ', () => {
      const editViewToCreate = mount(<Provider store={store}><EditView {...propsForEditViewWithCreateId} onClick={mockedFunction}/></Provider>);
      const formsElements = editViewToCreate.find('Form');
      expect(formsElements.exists()).toBe(true);
      console.log(editViewToCreate.debug());
    });
  it('Edit view with a ID: ', () => {
    const editViewWithID = mount(<Provider store={store}><EditView {...propsForEditViewWithId} onClick={mockedFunction}/></Provider>);
    const pElement = editViewWithID.find('p');
    expect(pElement.exists()).toBe(true);
    expect(pElement.text()).toBe('loading...');
    console.log(editViewWithID.debug());
  })
  it('List view: ', () => {
    const listView = shallow(<ListView />);
    expect(listView.find('.ListView').exists()).toBe(true);
    expect(listView.find('h2').exists()).toBe(true);
    expect(listView.find('Connect(List)').exists()).toBe(true);
    console.log(listView.debug());
  })
})