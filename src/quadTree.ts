class Quad
{
	x: number;
	y: number;
	w: number;
	h: number;
	children: { nw: Quad, ne: Quad, sw: Quad, se: Quad } | {};
	
	constructor(x: number, y: number, w: number, h: number)
	{
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		
		this.children = {};
	}
	
	subdivide()
	{
		
	}
}