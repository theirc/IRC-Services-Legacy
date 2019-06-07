import React from 'react';
import PropTypes from 'prop-types';

class Login extends React.Component {
    static contextTypes = {
        router: PropTypes.object
    }
    componentWillUpdate(nextProps) {
    }
    componentWillMount() {
    }

    render() {
        return <div>
            LOGIN
        </div>
    }
}


export default Login;
