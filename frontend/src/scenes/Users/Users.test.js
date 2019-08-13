import React, { Suspense, useEffect, useState} from "react";
import { shallow, mount, render } from "enzyme";
import  ListView from "./views/ListView/ListView";
import  EditView from "./views/EditView/EditView"
import { act } from 'react-dom/test-utils';
import store from '../../shared/store';
import { Provider } from 'react-redux';
import Edit from '../../components/views/Edit/Edit'
const originalError = console.error;
    console.error = jest.fn();
const mockedProps={
    match:{
        params:{
            id: 'create'
        }
    }
}
const submitMockedFunction = jest.fn();

const mockedEmptyProps={
    match:{
        params:{
            id: 'someProp'
        }
    },
    handleSubmit: () => {submitMockedFunction ();},
    data:{
        color:'111###'
    }
}

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


const editWithProps = mount(<Provider store={store}>
		<Suspense fallback=''>
            <EditView {...mockedProps} onSubmit={submitMockedFunction}/>
		</Suspense>
</Provider>);

const editWithoutProps = mount(<Provider store={store}>
    <Suspense fallback=''>
        <EditView {...mockedEmptyProps}/>
    </Suspense>
</Provider>);

const list = shallow(<ListView />);

describe('Providers Tests: ', () => {
    
    it('Edit view render with match.params.id equeal to create prop:', () => {
        expect(editWithProps.find('Form').exists()).toBe(true);
    })
    it('Edit view render with match.params.id not equeal to create prop:', () => {
        expect(editWithoutProps.find('EditView').exists()).toBe(true);
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
console.error = originalError;