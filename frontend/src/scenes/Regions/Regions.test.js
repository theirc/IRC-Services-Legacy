import React, { Suspense } from "react";
import ReactDOM from 'react-dom';
import { shallow, mount, render } from "enzyme";
import { Provider } from 'react-redux';
import  ListView from "./views/ListView/ListView";
import  EditView from "./views/EditView/EditView";
import store from '../../shared/store';
import { act } from 'react-dom/test-utils';
import Regions from './Regions'
import  Edit from "../../components/views/Edit/Edit"

const mockedFunction = jest.fn();
const addNewMockedFunction = jest.fn();

const props = {
    history: {
      goBack: mockedFunction
    }
};

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

describe('Regions tests: ', () => {

    it('Edit view with: ', () => {
        const editViewComponent = mount(<Provider store={store}><EditView {...propsForEditViewWithCreateId} onClick={mockedFunction}/></Provider>);
        console.log(editViewComponent.debug());
        const formsElements = editViewComponent.find('Card');
        expect(formsElements.exists()).toBe(true);
        editViewComponent.unmount();
    });
    it('Edit view back button: ', () => {
      const edit = mount(<Suspense fallback=''><Provider store={store}><Edit {...props}  /></Provider></Suspense>);
      const backButton = edit.find('button');
      expect(backButton.exists()).toBe(true);
      expect(backButton.text()).toBe('< Back');
      edit.find('button').simulate('click');
      expect(mockedFunction).toHaveBeenCalledTimes(1);
      edit.unmount();
  })
  it('Edit view title: ', () => {
      const testTitle = 'Some text';
      const edit = mount(<Suspense fallback=''><Provider store={store}><Edit {...props} title={testTitle} /></Provider></Suspense>); 
      const titleElement = edit.find('h2');
      expect(titleElement.text()).toBe(testTitle);
      edit.unmount();
  })
})