import System.Collections.Generic;
import System.Threading;
/*
A class handling static mesh generation.
*/
public class StaticNavigationMesh extends BaseNavigationMesh
{
	
	function Awake()
	{			
		//Different position configurations to test
		initialiseMesh(new Vector3(122f, 0.0f, 15f));
		
 		//initialiseMesh(new Vector3(10f, 0.0f, 15f));
 		
 		//initialiseMesh(new Vector3(32f, 0.0f, 15f));
 		
 		
	}
	
	
	//A method initialising a mesh in a given position
	private function initialiseMesh(inPosition:Vector3)
	{	
		joints = new List.<MeshNode>();
		
		//Different parameter configurations to test
		GenerateMesh(inPosition, Vector3.one * 8f, 39,2); 
			
		//GenerateMesh(inPosition, Vector3.one * 8f, 10,2);
			
		//GenerateMesh(inPosition, Vector3.one * 8f, 4,1);
		
	}
	
	//A function checking if a region intersects with a list any object in a given list
	virtual function RegionObjectsIntersectionTest(region:MeshNode, list:Collider[]):boolean{
		for (var obj in list)
			if (obj.bounds!=null)
				if (region.CheckOBBIntersection(obj))
					return true;
					
		return false;
	}
	
	//A fast intersection test (imprecise). Specific for static mesh.
	virtual function FastProximityCheck(vec1:Vector3):boolean{
		return Physics.CheckSphere(vec1, fillSize, Utils.GetPathfindingMask());
	}
	//A method returning objects colliding with a sphere contained by a rectangle.
	virtual function getColliding(region:MeshNode):Collider[]{
		return Physics.OverlapSphere(Vector3(region.bounds.center.x, 0.0f, region.bounds.center.z), 
									1.0f+region.bounds.size.magnitude, 
									Utils.GetPathfindingMask());
	}
	
	
	//A function placing the initial rectangles in the game world
	private function SeedWorld(center:Vector3, spacing:Vector3, width:int, height:int):List.<MeshNode>{
		
		
		var mapWidth:float = spacing.x * width;
		var mapHeight:float = spacing.z * height;
 
		var xStart:float = center.x - (mapWidth / 2.0f) + (spacing.x / 2.0f);
		var yStart:float = center.z - (mapHeight / 2.0f) + (spacing.z / 2.0f);
 
 		var seeds:List.<MeshNode> = new List.<MeshNode>();
		for(var x:int = 0; x < width; x++)
		{
			var xPos:float = (x * spacing.x) + xStart;
 
			for(var y:float = 0; y < height; y++)
			{
				var yPos:float = (y * spacing.z) + yStart;
				
				var region:MeshNode = new MeshNode(Vector2(xPos, yPos), Vector3(1, 1, 1));
				
				if (getColliding(region).length==0)
				{
					region.id = numberOfRegionsAdded; 
					numberOfRegionsAdded = numberOfRegionsAdded + 1;
					seeds.Add(region);
 				}
			}
		}
		return seeds;
	}
	
	//A function generating a mesh
	private function GenerateMesh(center:Vector3, spacing:Vector3, width:int, height:int):List.<MeshNode>
	{
		var time:float = Time.realtimeSinceStartup;
		
		regions = new List.<MeshNode>();
		
		//Seeding the world with initial rectangles
		regions = SeedWorld(center, spacing, width, height);
		
		//Growing the initial rectangles
		GrowRegionList(regions, false);
		
		//Main algorithm performs rectangle seeding and growing
		SeedAndGrow(regions, 11);
				
		return regions;
 
	}
	
	
}