import React from 'react';

function LevelAndLine({ lvl, line }) {
	return (
		<div id="level_and_line" className="ui-text">
			<div className="lvl">
				<span className="title">LEVEL</span>
				<span className="value">{lvl}</span>
			</div>
			<div className="score">
				<span className="title">LINE</span>
				<span className="value">{line}/20</span>
			</div>
		</div>
	);
}

export default LevelAndLine;
