import React, { Suspense } from "react";
import { shallow, mount, render } from "enzyme";
import  ListView from "./views/ListView/ListView";
import  EditView from "./views/EditView/EditView"
import store from '../../shared/store';
import { Provider } from 'react-redux';
import Edit from '../../components/views/Edit/Edit'
<<<<<<< HEAD

=======
 
>>>>>>> 9b673f12607d3374b8cc729e6b10946980f6381e
const mockedProps={
    match:{
        params:{
            id: 'create'
        }
<<<<<<< HEAD
    }
}

const mockedEmptyProps={
    match:{
        params:{
            id: 'someProp'
        }
    }
}

=======
    }
}
 
const mockedEmptyProps={
    match:{
        params:{
            id: 'someProp'
        }
    }
}
 
>>>>>>> 9b673f12607d3374b8cc729e6b10946980f6381e
const mockedFunction = jest.fn();
const mockedPropsForEdit={
    history:{
        goBack: () => { mockedFunction();
        }
    }
}
<<<<<<< HEAD

=======
 
>>>>>>> 9b673f12607d3374b8cc729e6b10946980f6381e
const viewEdit = mount(<Provider store={store}>
    <Suspense fallback=''>
        <Edit {...mockedPropsForEdit} onClick={mockedFunction}/>
    </Suspense>
</Provider>);
<<<<<<< HEAD


const editWithProps = mount(<Provider store={store}>
		<Suspense fallback=''>
            <EditView {...mockedProps}/>
		</Suspense>
</Provider>);

=======
 
 
const editWithProps = mount(<Provider store={store}>
        <Suspense fallback=''>
            <EditView {...mockedProps}/>
        </Suspense>
</Provider>);
 
>>>>>>> 9b673f12607d3374b8cc729e6b10946980f6381e
const editWithoutProps = mount(<Provider store={store}>
    <Suspense fallback=''>
        <EditView {...mockedEmptyProps}/>
    </Suspense>
</Provider>);
<<<<<<< HEAD


const list = shallow(<ListView />);

=======
 
 
const list = shallow(<ListView />);
 
>>>>>>> 9b673f12607d3374b8cc729e6b10946980f6381e
describe('Providers Tests: ', () => {
    it('Edit view render with match.params.id equeal to create prop:', () => {
        expect(editWithProps.find('Form').exists()).toBe(true);
    })
<<<<<<< HEAD

=======
 
>>>>>>> 9b673f12607d3374b8cc729e6b10946980f6381e
    it('Edit view render with match.params.id not equeal to create prop:', () => {
        expect(editWithoutProps.find('EditView').exists()).toBe(true);
    })
    it('Back button on Edit View: ', () =>{
        const backButton = viewEdit.find('button');
        backButton.simulate('click');
        expect(mockedFunction).toHaveBeenCalled();
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