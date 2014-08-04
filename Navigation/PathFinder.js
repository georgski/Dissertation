import System.Collections.Generic;
/*
A class handling pathfinding. Contains method calculating path between two points. 
Also assists in addition of new object to dynamic navigation mesh.
*/
public class PathFinder extends MonoBehaviour
{	
	public var drawPath:boolean = true;
	
	@HideInInspector
	public var graph:List.<MeshNode>;
	
	@HideInInspector
    private var mesh:BaseNavigationMesh;
  	
 	private static var instance:PathFinder;
 	
	public function Awake(){
		/*Creating a navigation mesh on launch:
		please choose either StaticNavigationMesh or DynamicNavigationMesh*/
		this.mesh = gameObject.AddComponent(StaticNavigationMesh);
		instance = this;
		
	}
	
	//Singleton
	public static function Instance():PathFinder
    {
        return instance;
    }
    
    //Adding new object to dynamic navigation mesh
    public function AddObjectToMesh(collider:Collider){
    	//Checking if the used mesh is dynamic
    	if (this.mesh instanceof DynamicNavigationMesh){
    		var dynamicMesh:DynamicNavigationMesh = (this.mesh as DynamicNavigationMesh);
    		dynamicMesh.InsertPositiveRegion(collider);
    	}
    }
    
    //Function determining whether a location can be accessed
    public function IsReachable(toPoint:Vector3):boolean{
    	if (GetContainingRegion(mesh.Regions, toPoint, false) > -1) 
    		return true;
    		
    	return false;
    }
    
    //Function checking whether a location is in the line of sight
    public function CanSeeTarget(position:Vector3, target:Vector3):boolean{
		return CanSeeTarget(position, target, 0.2);
	}
	
	//Function checking whether a location is in the line of sight with given ray thickness
    public function CanSeeTarget(position:Vector3, target:Vector3, rayThickness:float):boolean{
		var objectHit : RaycastHit;
		var direction = target - position;
	
		//Casting 'thick' raycast to check for obstacles
	    if (Physics.SphereCast (position, rayThickness, direction, objectHit,  direction.magnitude-0.01, Utils.GetPathfindingMask())) {
	   		var name :String = objectHit.collider.gameObject.name;
	   		AddObjectToMesh(objectHit.collider);
	   		return false;
	  	}
	   	return true;
	}
	
	//Function calculating route between two points.
	public function FindPath(start:Vector3,end:Vector3, ignoreGapsInTargetLocation : boolean):List.<MeshNode>{				
		graph = mesh.Regions;
		var startIndex:int;
		var endIndex:int;
		
		//Start polygon
		startIndex = GetContainingRegion(graph, start, true);
				
		//Terminate if the starting polygon has not been found
 		if (startIndex==-1)
 			return;
 		//Target polygon
		endIndex = GetContainingRegion(graph, end, true);
		
		//Terminate if target polygon found not found
		//If gaps are taken into account, try to find the closest region
		if (endIndex == -1) {
			if (ignoreGapsInTargetLocation)
 				endIndex = GetClosestRegion(graph, end);
 				if (endIndex == -1) 
 					return;
 			else 
 				return;
 		}
 		
 		//If a start point and the goal are in the same polygon, or in the line of sight, the algorithm terminates.
		if ((startIndex == endIndex) || (CanSeeTarget(start, end))) { 
			var oneRegionList:List.<MeshNode> = new List.<MeshNode>();
			oneRegionList.Add(new MeshNode(Vector2(end.x, end.z), Vector3.zero));
			return oneRegionList;
		}
		//Calculating the path using the A* algorithm
		var solvedPath:List.<MeshNode> = AStarHelper.CalculatePath(graph[startIndex], graph[endIndex]);
		
		//Drawing found path
		if (solvedPath != null){ 
			if (drawPath){
				for(var i:int = 1; i < solvedPath.Count - 1; i++)
					Debug.DrawLine(solvedPath[i].bounds.center+Vector3.up * 2, solvedPath[i + 1].bounds.center+Vector3.up*2, Color.red); 
				
			}
		}
		
		return solvedPath;
	}
	
	//Function returning a region containing specified point. 
	//If the gaps between polygons are taken into account, the AllowGaps is true.
    private function GetContainingRegion(regions :List.<MeshNode>, toPoint:Vector3, AllowGaps:boolean):int
	{			
		//Searching for polygon containing the point
		for(var i:int = 0; i < regions.Count; i++)
			if (regions[i].bounds.Contains(Vector3(toPoint.x, regions[i].bounds.center.y, toPoint.z))) 
				return i;
		
		//If no polygon has been found, it is possible that the point is placed in a small gap between polygons.
		//In this case, the specified point is "enlarged" to overlap polygon in its proximity.
		if (AllowGaps){
			for(i = 0; i < regions.Count; i++)
				if (regions[i].bounds.Intersects(new Bounds(Vector3(toPoint.x, regions[i].bounds.center.y, toPoint.z), Vector3(0.5,0.5,0.5)))) 
					return i;	
		}
		return -1;
	}
    
    //Function getting the closest polygon to the specified point.
	private function GetClosestRegion(inNodes:List.<MeshNode>, toPoint:Vector3):int
	{
		var closestIndex:int = 0;
		var minDist:float = float.MaxValue;
		for(var i:int = 0; i < inNodes.Count; i++)
		{
			var thisDist:float = Vector3.Distance(toPoint, inNodes[i].bounds.center);
			if(thisDist > minDist)
				continue;
 
			minDist = thisDist;
			closestIndex = i;
		}
		
 		if (minDist > 1)	
 			return -1;
 		
		return closestIndex;
	}
 	
}