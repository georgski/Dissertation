/*
A class placing and distributing objects' influences on a given map
*/
class InfluenceFilter extends MapFilter{
	
	//A function adding the influences to the given map
	public static function ComputeInfluence(originalMap:Cell[,], position:Vector3, matrixSize:int, amplificationFactor:int, sigma:float):Cell[,]{
		var newMap:Cell[,] = super.CloneMap(originalMap);
		
		ComputeDangerLevels(newMap, position);
		SpreadDangerLevels(newMap, matrixSize, amplificationFactor, sigma);
		
		return newMap;
	}
	
	//A function placing marking cells as dangerous
	private static function ComputeDangerLevels(map:Cell[,], position:Vector3){
		
		var objectsInMap = Physics.OverlapSphere (position, map.GetLength(0) *0.5, Utils.GetDangerousMask());
		
		for(cell in map)
			for (object in objectsInMap)
				if (object.bounds.Intersects(new Bounds(cell.position, Vector3(1,1,1)))){
					if (cell.inaccessible){
						cell.value = 0.5;
					}else{
						if (object.gameObject.layer == 10){
							cell.value = 1;
						}
						else{
							cell.value = 1;
						}
					}
				}
	}
	
	/*A function computing the matrix of gaussian filter
	The amplification factor makes the cell values more distinctive
	*/
	private static function GenerateMatrix(matrixSize : int, amplificationFactor : int, sigma : float){
		
		var matrix:float[,] = new float[matrixSize,matrixSize];
		var half:float = matrixSize/2;
		
		var sum:float=0;
		//Calculating a matrix
		for (var x:int = 0; x < matrixSize; x++) for (var y:int = 0; y < matrixSize; y++)
		{
		    matrix[x,y] = Mathf.Exp( -0.5 * (Mathf.Pow((x - half) / sigma, 2.0) + Mathf.Pow((y - half) / sigma,2.0)) )
		                     / (2 * Mathf.PI * sigma * sigma);
		    sum = matrix[x,y]+sum;
		}
		
		sum = sum/amplificationFactor;
		
		//Normalising the cell values
		for (x = 0; x < matrixSize; x++) 
			for (y = 0; y < matrixSize; y++)
				matrix[x,y] = matrix[x,y]/sum;
				
		return matrix;
	}
	
	//A function spreading the danger levels
	private static function SpreadDangerLevels(cells:Cell[,], matrixSize:int, amplificationFactor:int, sigma:float){
		
		var mapSize:int = cells.GetLength(0);
							
		var matrix = GenerateMatrix(matrixSize, amplificationFactor, sigma);
		var newMap:float[,] = new float[mapSize,mapSize];
		var halfSize = ((matrixSize-1)/2);
		
		//Applying convolution filter to the map
		for (var i:int=0; i<mapSize; i++)
			for (var j:int=0; j<mapSize; j++){
				newMap[i,j] = 0;
				for (var k:int=0; k<matrixSize; k++)
					for (var m:int=0; m<matrixSize; m++){
						var indexX=i+k-halfSize;
						var indexY=j+m-halfSize;
						
						if (indexX>=0 && indexY>=0)
							if (indexX<mapSize && indexY<mapSize)
								newMap[i,j] += cells[indexX, indexY].value * matrix[k,m];
						
			}

		}
		
		//Updating the map values
		for (i=0; i<mapSize; i++)
			for (j=0; j<mapSize; j++)
				cells[i,j].value = newMap[i,j];
						
	}

	

	
}