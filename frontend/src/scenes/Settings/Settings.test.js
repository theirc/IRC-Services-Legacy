import React, { Suspense } from "react";
import { shallow, mount, render } from "enzyme";
import { Provider } from 'react-redux';
import  Settings from "./Settings";
import { prop } from '@uirouter/core';
//import store from '../.././shared/store';
import configureStore from 'redux-mock-store';
import { create } from "react-test-renderer";
//import { render } from '@testing-library/react'
import expectationResultFactory from "jest-jasmine2/build/expectationResultFactory";
import { findByTestAtrrr, testStore } from '../../.././Utils'
import { isRegExp } from "util";
import TestRenderer from 'react-test-renderer';
import renderer from 'react-test-renderer';

const settingsComponent = shallow(<Suspense fallback=''><Settings /></Suspense>);
console.log(settingsComponent.debug());

describe('Setting tests: ', () => {
    it('Setting component renders ok', () => {
        const tree = renderer.create(<Suspense fallback=''><Settings /></Suspense>).toJSON();
        expect(tree).toMatchSnapshot();
    }) 
  })