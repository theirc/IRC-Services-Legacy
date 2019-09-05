import React, { Suspense } from "react";
import ReactDOM from 'react-dom';
import { shallow, mount, render } from "enzyme";
import { Provider } from 'react-redux';
import  ListView from "./views/ListView/ListView";
import  EditView from "./views/EditView/EditView";
import store from '../../shared/store';
import { act } from 'react-dom/test-utils';
import ServiceCategories from './ServiceCategories'

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
}
const propsForListView = {
  history:{
    goBack: () => { mockedFunction();
    }
  },
  addNew: () => {addNewMockedFunction();}
}

describe('Service Categories tests: ', () => {
  
  it('Edit view with create ID: ', () => {
      const editViewToCreate = mount(<Provider store={store}><EditView {...propsForEditViewWithCreateId} onClick={mockedFunction}/></Provider>);
      const formsElements = editViewToCreate.find('Form');
      expect(formsElements.exists()).toBe(true);
      editViewToCreate.unmount();
    });
  it('Edit view with a ID: ', () => {
    const editViewWithID = mount(<Provider store={store}><EditView {...propsForEditViewWithId} onClick={mockedFunction}/></Provider>);
    const pElement = editViewWithID.find('p');
    expect(pElement.exists()).toBe(true);
    expect(pElement.text()).toBe('loading...');
    editViewWithID.unmount();
  })
  it('List view: ', () => {
    const listView = shallow(<ListView {...propsForListView}/>);
    expect(listView.find('.ListView').exists()).toBe(true);
    expect(listView.find('h2').exists()).toBe(true);
    expect(listView.find('Connect(List)').exists()).toBe(true);
  })
  it('Create Edit View should have a Save button: ', () =>{
    const editViewToCreate = mount(<Provider store={store}><EditView {...propsForEditViewWithCreateId} onClick={mockedFunction}/></Provider>);
    const saveButton = editViewToCreate.find('button');
    expect(saveButton.exists()).toBe(true);
    expect(saveButton.find('[type="submit"]').text()).toBe('Save');
    editViewToCreate.unmount();
  })
  it('Save in Create Edit View: ', () =>{
    const editViewToCreate = mount(<Provider store={store}><EditView {...propsForEditViewWithCreateId} onClick={mockedFunction}/></Provider>);
    expect(editViewToCreate.find('p').length).toBe(1);
    editViewToCreate.find('button').at(1).simulate('submit');
    editViewToCreate.update();
    expect(editViewToCreate.find('p').length).toBe(2);
    expect(editViewToCreate.find('p').at(1).text()).toBe('Saving Service Type...');
    editViewToCreate.unmount();
  })
})