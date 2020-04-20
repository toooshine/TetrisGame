import React from 'react';
import './Modal.scss';

function Modal({ active }) {
	return (
		<div id="modal" className={active === true ? 'open' : ''}>
			<div className="mask" />
			<div className="container auto">
				<div className="message">Push on touch on your keyboard !</div>
				<button className="close">&times;</button>
			</div>
		</div>
	);
}

export default Modal;
