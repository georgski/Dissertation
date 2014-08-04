/*
A class containing functionality common for terrain analysis filters
*/
class MapFilter{
	
	//A method cloning the given map
	static protected function CloneMap(cells:Cell[,]):Cell[,]{
		var mapSize:int = cells.GetLength(0);
		
		var newMap:Cell[,] = new Cell[mapSize, mapSize];
		for (var i:int=0; i<mapSize; i++)
			for (var j:int=0; j<mapSize; j++)
				newMap[i,j] = new Cell(cells[i,j]);
		
		return newMap;
	}	
}