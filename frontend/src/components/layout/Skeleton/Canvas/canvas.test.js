import React, { Suspense } from "react";
import ReactDOM from 'react-dom';
import { shallow, mount, render } from "enzyme";
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import Canvas from './Canvas'

const sidebarnavOpenProps = {
    sidebarnav:{
        isOpen: true
    },
    darkMode:true,
    children: 'test text'
}
const sidebarnavNotOpenProps = {
    sidebarnav:{
        isOpen: false
    }
}


describe('Canvas tests: ', () => {
    
    it('Canvas component: ', () => {
        const canvasComponent = mount(<Canvas {...sidebarnavOpenProps}/>);
        expect(canvasComponent.find('.Canvas').length).toBe(1);
        expect(canvasComponent.find('.expanded').length).toBe(0);
        expect(canvasComponent.find('div').text()).toBe(sidebarnavOpenProps.children);
        canvasComponent.unmount();
    })
    it('Expanded canvas component: ', () => {
        const expandedCanvasComponent = mount(<Canvas {...sidebarnavNotOpenProps}/>);
        expect(expandedCanvasComponent.find('.expanded').length).toBe(1);
        expandedCanvasComponent.unmount();
    })
})