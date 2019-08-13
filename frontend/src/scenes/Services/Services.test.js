import React, { Suspense, useEffect, useState} from "react";
import { shallow, mount, render } from "enzyme";
import  {ListView} from "./views/ListView/ListView";
import  EditView from "./views/EditView/EditView"
import { Provider } from 'react-redux';
import store from '../../shared/store';
import Edit from '../../components/views/Edit/Edit'

const backMockedFunction = jest.fn();
const mockedPropsForEdit={
    history:{
        goBack: () => { backMockedFunction();
        }
    }
}

const viewEdit = mount(<Provider store={store}>
    <Suspense fallback=''>
        <Edit {...mockedPropsForEdit} onClick={backMockedFunction}/>
    </Suspense>
</Provider>);

const editView = mount(<Provider store={store}>
    <Suspense fallback=''>
        <EditView />
    </Suspense>
</Provider>);

const list = shallow(<ListView />);

describe('Services Tests: ', () => {
    it('Edit view render:', () => {
        expect(editView.find('EditView').exists()).toBe(true);
    })
    it('Back button on Edit View: ', () =>{
        const backButton = viewEdit.find('button');
        backButton.simulate('click');
        expect(backMockedFunction).toHaveBeenCalled();
    })
    it('List view renders ok:', () => {
        const title = list.find('h2');
        const titleText = title.text();
        expect(list.exists()).toBe(true);
        expect(titleText).toBe('list.title');
    })
    it('Checks list view structure:', () => {
        expect(list.find('.ListView').exists()).toBe(true);
        expect(list.find('h2').exists()).toBe(true);
        expect(list.find('Connect(List)').exists()).toBe(true);
    })
})