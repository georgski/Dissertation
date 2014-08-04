import System.Collections.Generic;
import System.Threading;
/*
A class handling dynamic mesh generation
*/
public class DynamicNavigationMesh extends BaseNavigationMesh
{
	//List of objects taken into account during mesh generation
 	protected var objectsEncountered:List.<Collider>;
 	
 	//Details of the objects stored in a list below, required for multi-threading
	private var meshes:List.<DynamicObject>;
	
	private var threadLock:boolean = false;

		
	function Awake()
	{			
 		
 		joints = new List.<MeshNode>();
		objectsEncountered = new List.<Collider>();
		initialiseDynamicMesh(new Vector3(10f, 0.0f, 15f));
 		//initialiseDynamicMesh(new Vector3(122f, 0.0f, 15f));
	}
	
	//A function adding new object to a navigation mesh
	public function InsertPositiveRegion(object:Collider){
		
		if (objectsEncountered.Contains(object)) 
			return; 
		
		//If a mesh is currently updated, wait
		while (threadLock) 
			yield;
			
		threadLock = true;
		
		objectsEncountered.Add(object);
		updateMeshes();
		//InsertPositiveRegionAsynchronously();
		var thread = Thread(InsertPositiveRegionAsynchronously);
		thread.Start(); 
	}
	
	//A function initialising mesh with in given position
	protected function initialiseDynamicMesh(position:Vector3){
		
		//Adding map boundaries to the objects encountered to limit the rectangle expansion to the size of a map
		var boundaries:GameObject = GameObject.Find("MapBounds");
		
		for (var child : Transform in boundaries.transform) {

   			objectsEncountered.Add(child.gameObject.collider);

		}
		//Placing initial region
		var region:MeshNode = new MeshNode(Vector2(position.x, position.z), Vector3(1, 1 ,1));
		region.id = 0; 
		numberOfRegionsAdded = numberOfRegionsAdded+1;
		regions = new List.<MeshNode>();
		regions.Add(region);
		
		updateMeshes();
		
		//Expanding initial rectangle
		GrowRegionList(regions, false);

		return regions;
	}

	
	//A function storing data of the encountered objects, which cannot be accessed from another thread directly.
	private function updateMeshes(){
		meshes = new List.<DynamicObject>();
		for (o in objectsEncountered)
			meshes.Add(new DynamicObject(o.transform, o.GetComponent(MeshFilter).mesh.bounds, o.bounds));
	}
	
	//Updating a navigation mesh with a new object
	private function InsertPositiveRegionAsynchronously(){
		
		threadLock = true;
				
		var regionsToSeed: List.<MeshNode> = new List.<MeshNode>();
		var regionsToRemove: List.<MeshNode> = new List.<MeshNode>();
		
		
		for (region in regions){
		
			if (region.CheckOBBIntersectionWithDynamicObj(meshes[meshes.Count-1])){
				
				//Creating list of adjacent regions
				var list: List.<MeshNode> = new List.<MeshNode>();
				for(var i:int = 0 ;i<region.connections.Count;i++){
					for(var j:int = 0 ;j<region.connections[i].connections.Count;j++)
					//If region not already added
						if (!Utils.MeshNodeListContainsObject(list, region.connections[i].connections[j].id)
								&&
						   (!Utils.MeshNodeListContainsObject(regionsToSeed, region.connections[i].connections[j].id))){
								list.Add(region.connections[i].connections[j]);
						}
				}
				
				//Resetting connections of the removed rectangles
				var toremove : List.<MeshNode> = new List.<MeshNode>();
				for(i = 0 ;i<region.connections.Count;i++){
				
					
					for(j = 0 ;j<region.connections[i].connections.Count;j++)						
						if (region.connections[i].connections[j].id == region.id)
							toremove.Add(region.connections[i].connections[j]);
					
					for(o in toremove)
						region.connections[i].connections.Remove(o);
						
				}
				//Adding list of rectangles to seed
				regionsToSeed.AddRange(list);
				//Adding a region containing the added object to remove
				regionsToRemove.Add(region);
			}
		}
		
		//No adjacent regions found, therefore an 'artificial' region is created in the place of the added object
		if (regionsToSeed.Count == 0){
			var r:MeshNode = new MeshNode(Vector2(meshes[meshes.Count-1].bounds.center.x, 
								meshes[meshes.Count-1].bounds.center.z), 
								meshes[meshes.Count-1].bounds.size * 1.2);
			
			r.id = -1;
			regionsToSeed.Add(r);
						
		}
		
		//Removed regions which are in the seed list need to be removed from it
		var regionsToRemoveFromSeeds : List.<MeshNode> = new List.<MeshNode>();
		for (regionToSeed in regionsToSeed)
			for (regionToRemove in regionsToRemove)
				if (regionToSeed.id == regionToRemove.id)
					regionsToRemoveFromSeeds.Add(regionToSeed);
		
		for (region in regionsToRemoveFromSeeds)
			regionsToSeed.Remove(region);	
			
		//Removing regions
		for (region in regionsToRemove)
			regions.Remove(region);
					
		var seeds: List.<MeshNode> = new List.<MeshNode>();
		
		//Filling the created gap with new rectangles (main algorithm)
		SeedAndGrow(regionsToSeed, 14);
				
		threadLock = false;
						
	} 
	
	//A function checking if a region intersects with a list any object in a given list
	virtual function RegionObjectsIntersectionTest(region:MeshNode, list:Collider[]):boolean{
	
		for (var i:int = 0; i<list.length; i++){
			var dynObject:DynamicObject = meshes[i];
				if ((dynObject.name!=region.id)&&(dynObject.bounds!=null))
					if (region.CheckOBBIntersectionWithDynamicObj(dynObject))
						return true;
		}
	
					
		return false;
	}
	
	
	//A fast intersection test (imprecise). Specific for dynamic mesh.
	virtual function FastProximityCheck(vec1:Vector3):boolean{
		var region1:MeshNode = new MeshNode(Vector2(vec1.x, vec1.z),Vector3(fillSize, fillSize, fillSize));
			
		if (RegionObjectsIntersectionTest(region1, getColliding(null))) 
			return true;
			
		return false;
	}
	/*A method returning objects colliding with a sphere contained by a rectangle.
	As in multi-threading environment it is not possible to call such functionality 
	it has been simplified: all objects are returned.
	*/
	virtual function getColliding(region:MeshNode):Collider[]{
		return objectsEncountered.ToArray();
		
	}
	
	function OnDrawGizmos(){
	if (!super.drawingEnabled)return;
		if (regions){
			for(region in regions){
					
				Gizmos.DrawCube (Vector3(region.bounds.center.x,-0.1// region.bounds.center.y 
				, region.bounds.center.z), 
				region.bounds.size);
				
			}
		}
		
		for(o in objectsEncountered){
		
		Gizmos.color = Color (1,0,0,0.9);if (o.gameObject.name != "Bounds")
			Gizmos.DrawCube (Vector3(o.bounds.center.x,1// region.bounds.center.y 
				, o.bounds.center.z), 
				o.bounds.size);}
	}
}