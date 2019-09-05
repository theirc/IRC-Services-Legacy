import React, { Suspense } from "react";
import ReactDOM from 'react-dom';
import { shallow, mount, render } from "enzyme";
import { Provider } from 'react-redux';
import  ListView from "./views/ListView/ListView";
import  EditView from "./views/EditView/EditView";
import  Edit from "../../components/views/Edit/Edit"
import store from '../../shared/store';
import { act } from 'react-dom/test-utils';
import Services from './Services'

const mockedFunction = jest.fn();

const props = {
    history: {
      goBack: mockedFunction
    }
  };


describe('Services tests: ', () => {
    it('Edit View title:', () => {
        const editViewComponent = mount(<Suspense fallback=''><Provider store={store}><EditView /></Provider></Suspense>);
        const h2Element = editViewComponent.find('h2');
        expect(h2Element.exists()).toBe(true);
        expect(h2Element.text()).toBe('edit.title');
        const cb = editViewComponent.find('CardBody');
        expect(cb.exists()).toBe(true);
        editViewComponent.unmount();
    })
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