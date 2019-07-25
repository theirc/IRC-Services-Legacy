import React from 'react';

import './Canvas.scss';

const Canvas = props => {
	return <div className={`Canvas ${props.sidebarnav.isOpen ? '' : 'expanded'} ${props.darkMode ? 'bg-dark' : ''}`}>{props.children}</div>
}

export default Canvas;
