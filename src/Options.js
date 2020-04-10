import React from 'react';
import './App.css';

function Options({ actions }) {
	return (
		<div id="options">
			<h1>Tetris</h1>
			Liste des options
			<button onClick={() => actions.launchMenu()}>Back</button>
		</div>
	);
}

export default Options;
