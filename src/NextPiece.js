import React from 'react';

function NextPiece({ grid, color }) {
	return (
		<div id="wrapper-next-piece">
			<span className="title">NEXT PIECE</span>
			<div id="next-piece" className="grid">
				{grid.map((line, y) => {
					return line.map((col, x) => {
						let classes = [];
						if (x === 0) {
							classes.push('first');
						}
						if (grid[y][x] > 0) {
							classes.push('color-' + color);
						}
						return <span key={x + '-' + y} className={classes.join(' ')} />;
					});
				})}
			</div>
		</div>
	);
}

export default NextPiece;
