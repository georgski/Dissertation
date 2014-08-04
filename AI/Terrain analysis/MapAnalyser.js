/*
A class performing the terrain analysis, to:
-find cover spots
*/
class MapAnalyser extends MonoBehaviour{
	
	public var drawingEnabled:boolean = false;
	public var visibilityFilterEnabled:boolean = true;
	public var influenceFilterEnabled:boolean = true;
	
	//Parameters of visibility map computation
	public var vFilterMatrixSize:int = 23;
	public var vFilterAmplificationFactor:int = 30;
	public var vFilterSigma:float = 1.6;
	
	public var coverPoint:Vector3;
	public var size = 2.0;
	
	//A map on which the results of the analysis are marked
	private var terrainMap:TerrainMap;
	
	private var updateTime:float;
	private var player:Transform;
	

	public function OnEnable(){
		terrainMap = new TerrainMap(transform);
		
		//Adding nearby objects to the dynamic navigation mesh
		var objectsInMap = Physics.OverlapSphere (transform.position, terrainMap.mapSize/2, Utils.GetPathfindingMask());
		
		for(object in objectsInMap)
			PathFinder.Instance().AddObjectToMesh(object);
			
		player= GameObject.FindGameObjectWithTag("Player").transform;
	}
	
	//A function finding location providing best cover
	public function FindCover():Vector3{
	
		//Computing the spatial safety data
		FindSafeLocations();
		
		var bestValue:int = -1;
		var bestCellPosition:Vector3;
				
		for(var i:int = 0; i<terrainMap.mapSize;i++){
			for(var j:int = 0; j<terrainMap.mapSize;j++){
				if (terrainMap.Cells[i,j].value>bestValue){
					bestValue = terrainMap.Cells[i,j].value;
					bestCellPosition = terrainMap.Cells[i,j].position;
				}
			}
		}
		coverPoint = bestCellPosition;
		
		return bestCellPosition;
	}
	
	//A function substracting values of one map from the other map
	private function SubstractMap(baseMap:Cell[,], substractedMap:Cell[,]):Cell[,]{
		for(var i:int = 0; i<terrainMap.mapSize;i++){
				for(var j:int = 0; j<terrainMap.mapSize;j++){
					baseMap[i,j].value = Mathf.Clamp01(baseMap[i,j].value-substractedMap[i,j].value);
				}
		}
		
		return baseMap;
	}
	
	//A function creating a map of safe locations
	private function FindSafeLocations(){
		terrainMap.GenerateMap();
				
		var visibilityMap:Cell[,];
		var influenceMap:Cell[,];
		
		//Visibility map
		if (visibilityFilterEnabled){
			visibilityMap = 
				VisibilityFilter.ComputeVisibility(terrainMap.Cells, player.position);
			if (!influenceFilterEnabled)
				terrainMap.cells = visibilityMap;
			
		}
		
		//Influence map
		if (influenceFilterEnabled){
			influenceMap = 
				InfluenceFilter.ComputeInfluence(terrainMap.cells, transform.position, vFilterMatrixSize, vFilterAmplificationFactor, vFilterSigma);
			if (!visibilityFilterEnabled)
				terrainMap.cells = influenceMap;
		}
		
		//Combining both maps
		if (visibilityFilterEnabled && influenceFilterEnabled)
			terrainMap.cells = SubstractMap(visibilityMap, influenceMap);
			
	}
	
	//Creating the safety map during game execution for demonstration
	function Update(){
		
		if ((drawingEnabled)&&(updateTime+0.5<Time.time)){ 
			updateTime = Time.time;
			terrainMap.cellSize = size;
			
			FindSafeLocations();		
		}
	
	}
	
	//Drawing the map
	function OnDrawGizmos(){
		
		if (drawingEnabled){ 
			var cells:Cell[,] = terrainMap.cells;
			
			var cellsLength = cells.GetLength(0);
			for (cell in cells)
				if (!cell.inaccessible){
				Gizmos.color = Color (1,1-cell.value,1-cell.value,1);
				
				Gizmos.DrawCube ((cell.position), 
					Vector3(terrainMap.cellSize*0.9, 0.5, terrainMap.cellSize*0.9));
				
				
			
			}
		}
	}
}