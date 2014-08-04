/*
A class representing a map used for terrain analysis
*/
class TerrainMap{
	public var cells:Cell[,];
	//Parameters defining map resolution
	public var mapSize:int;
	public var cellSize:float = 2.0;
	public var maxMapSize:int = 70;
	
	private var mapTransform:Transform;
	
	function TerrainMap(transform:Transform){
		this.mapTransform = transform;
	}
	
	//A function initialising a map
	private function Initialise(){
		mapSize = maxMapSize / cellSize;
		cells = new Cell[mapSize, mapSize];
		
		var halfMapSize = mapSize/2;
		//Creating map cells
		for(var i:int = 0; i<mapSize;i++){
			for(var j:int = 0; j<mapSize;j++){
				//Calculating cell position
				var x:float = mapTransform.position.x+(i - halfMapSize) * cellSize;
				var y:float = mapTransform.position.z+(j - halfMapSize) * cellSize;
				cells[i,j] = new Cell(Vector3(x, 0, y)); 
			}
		}
	}
	
	//A function marking cells as inaccessible
	private function MarkInaccessibleCells(){
		for (cell in cells)
			if (PathFinder.Instance().IsReachable(cell.position) == false)
				if (Physics.CheckSphere(cell.position, 1, Utils.GetPathfindingMask()))
					cell.inaccessible = true;
	}	
	
	//A function generating a map
	public function GenerateMap(){
		Initialise();
		MarkInaccessibleCells();
	}
	
	//A function generating a given map
	private function GenerateMap(cells:Cell[,]){
		if (cells == null)
			GenerateMap();
		else{
			this.cells = new Cell[mapSize, mapSize];
			for(var i:int = 0; i<mapSize;i++)
				for(var j:int = 0; j<mapSize;j++)
					this.cells[i,j] = new Cell(cells[i,j]);
		}
	}
	
	public function get Cells () : Cell[,] { 
		return cells; 
	}
}