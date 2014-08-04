/*
A class marking visibility information on given map
*/
class VisibilityFilter extends MapFilter{
	
	//A function computing visibity information
	static function ComputeVisibility(originalMap:Cell[,], target:Vector3):Cell[,]{
		var newMap:Cell[,] = super.CloneMap(originalMap);
		
		var mapSize:int = newMap.GetLength(0);
		
		//For each cell, a line of sight test from cell to the target is performed
		for (cell in newMap){
			if (cell.inaccessible == false){
				var direction:Vector3 = target - cell.position;
				if (direction.magnitude>15)
					continue; 
				var hit:RaycastHit;
				if (Physics.Raycast(cell.position, direction, hit, direction.magnitude, Utils.GetPathfindingMask())){
					/*If raycast failed, the cell is covered by obstacle. 
					Cell's safety level is calculated depending on the distance to the obstacle*/
					cell.value = 1 - Mathf.Clamp01((Mathf.Pow((cell.position - hit.transform.position).magnitude,2) / mapSize));
				}
			}
		}
		
		return newMap;
	}
	
}