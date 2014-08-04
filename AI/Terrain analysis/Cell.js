/*
A class representing a single cell of map analysing terrain
*/
class Cell{
	
	//Safety value of a cell
	var value:float;
	
	//Location of the cell
	var position:Vector3;
	
	//Information whether a cell can be accessed
	var inaccessible:boolean;
	
	function Cell(position : Vector3){
		this.position = position;
		this.inaccessible = false;
		this.value = 0;
	}	
	
	function Cell(cell : Cell){
		this.position = cell.position;
		this.inaccessible = cell.inaccessible;
		this.value = cell.value;
	}	
}