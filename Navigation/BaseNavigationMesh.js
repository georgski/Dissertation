import System.Collections.Generic;
import System.Threading;
/*
A base mesh generation class. Contains various functions handling rectangle expansion and seeding.
*/
public class BaseNavigationMesh extends MonoBehaviour
{
	public var drawingEnabled:boolean=true;
	
	//Amount of single growth step
	protected var step:float = 0.3;
	
	//Size of newly placed rectangles
	protected var fillSize:float = 0.6;
	
	//Rectangle list
	protected var regions:List.<MeshNode>;
	
	//List of nodes connecting rectangles
	protected var joints:List.<MeshNode>;
	
	protected var numberOfRegionsAdded:int = 0;
			
	public function get Regions () : List.<MeshNode> { 
		return regions; 
	}	
	
	//Main function performing rectangle seeding and growing
	protected function SeedAndGrow(seeds:List.<MeshNode>, maxIterationNumber:int){
		var regionsToSeed: List.<MeshNode> = new List.<MeshNode>();
		
		if (maxIterationNumber < 0) 
			maxIterationNumber = Mathf.Infinity;
		
		var iteration:int = 0;
		var lookForGaps:boolean = true;
		
		while (lookForGaps){
			regionsToSeed = seeds;
			seeds = new List.<MeshNode>(); 
			lookForGaps = lookForGaps(regionsToSeed,seeds);
			GrowRegionList(seeds, true);	
			
			if (iteration>maxIterationNumber) 
				break;
			iteration++;
		}
		
		
		RemoveOverlappingRegions();
		calculateGraphNodes();
	}
	
	/*
	A function expanding given polygon.
	This function has not been split into a smaller pieces, 
	because it is called very frequently and since additional function calls increase the performance overhead,
	whole system would operate more slowly.*/
	protected function GrowRegion(region:MeshNode){
		//If each edge of the rectangle can be expanded
		while(region.IsExpandable()){
			for (var i:int = 0; i<4;i++)
				if (region.edgeExpandable[i]){
					//Getting objects colliding with a sphere containing the rectangle
					var objectsColliding = getColliding(region);
					if (regions.Count>1)
						if (region.bounds.size.magnitude>120) {
							region.edgeExpandable[i]=false;
							break;
						}
					
					var intersectedRegion:MeshNode;
					var jointPoint:Vector3;
					//For each edge
					switch (i){
						case 0:
							//Expanding the polygon in the direction of the edge
							region.bounds.size.z = region.bounds.size.z+step;
							region.bounds.center.z = region.bounds.center.z-step/2;
							
							//Checking if the rectangle intersects with other rectnagle, after expansion
							intersectedRegion = region.IntersectsWithRegions(regions);
							
							//Checking if the rectangle intersects with nearby objects, after expansion
							if (intersectedRegion || RegionObjectsIntersectionTest(region, objectsColliding)){
								//Reversing the last expansion step and stopping further growth
								region.edgeExpandable[i]=false;
								region.bounds.size.z = region.bounds.size.z-step;
								region.bounds.center.z = region.bounds.center.z+step/2;
								
								//If the rectangle collided with another rectangle, connect them
								if (intersectedRegion){
									connectRegions(region, intersectedRegion, 0); 
								}
									
								break;
							}
							
							break;
							
						case 1:
							region.bounds.size.x = region.bounds.size.x+step;
							region.bounds.center.x = region.bounds.center.x+step/2;
							 	
							intersectedRegion = region.IntersectsWithRegions(regions);
							if (intersectedRegion || RegionObjectsIntersectionTest(region, objectsColliding)){
								region.edgeExpandable[i]=false;
								region.bounds.size.x = region.bounds.size.x-step;
								region.bounds.center.x = region.bounds.center.x-step/2;
								
								if (intersectedRegion){
									connectRegions(region, intersectedRegion, 1); 
								}
								break;
							}
							break;
						
						case 2:
							region.bounds.size.z = region.bounds.size.z+step;
							region.bounds.center.z = region.bounds.center.z+step*0.51;
							
							intersectedRegion = region.IntersectsWithRegions(regions);
							
							if (intersectedRegion || RegionObjectsIntersectionTest(region, objectsColliding)){
										
								region.edgeExpandable[i]=false;
								region.bounds.size.z = region.bounds.size.z-step;
								region.bounds.center.z = region.bounds.center.z-step*0.51;
								
								if (intersectedRegion){
									
									connectRegions(region, intersectedRegion, 2); 
								}
								break;
							}
							break;
					
					case 3:
							region.bounds.size.x = region.bounds.size.x+step;
							region.bounds.center.x = region.bounds.center.x-step/2;
							
							intersectedRegion = region.IntersectsWithRegions(regions);
							
							if (intersectedRegion || RegionObjectsIntersectionTest(region, objectsColliding)){
								region.edgeExpandable[i]=false;
								region.bounds.size.x = region.bounds.size.x-step;
								region.bounds.center.x = region.bounds.center.x+step/2;
									
								if (intersectedRegion){
									connectRegions(region, intersectedRegion, 3); 
								}
								break;
							}
							break;
						
				}
			}
		}
	}
	
	//A function connecting rectangles by additional joint node (edge midpoints)
	//The 'type' parameter specifies the edge connecting the rectangles
	protected function connectRegions(region1:MeshNode, region2:MeshNode, type:int){
		var jointNode:MeshNode = new MeshNode(Vector2.zero, Vector3.zero);
		jointNode.id = type;
		jointNode.connections.Add(region1);
		jointNode.connections.Add(region2);
		
		region1.connections.Add(jointNode);
		region2.connections.Add(jointNode);
		
		joints.Add(jointNode);
		
	}
	
	//A function calculating positions of joint nodes (edge midpoints)
	protected function calculateGraphNodes(){
		for (var joint:MeshNode in joints){
			//Continue if a joint does not have 2 rectangles associated
			if (joint.connections.Count<2) 
				continue;
				
			var region = joint.connections[0];
			var region1 = joint.connections[1];
			var jointPoint:Vector3;
			
			//Depending on the edge connecting
			switch (parseInt(joint.id)){
				case 0:
					//Calculating the midpoint of the edge of the longer rectangle
					if (region.bounds.size.x > region1.bounds.size.x)
						jointPoint = Vector3(region1.bounds.center.x, region1.bounds.center.y, region1.bounds.center.z + region1.bounds.size.z/2);
					else
						jointPoint = Vector3(region.bounds.center.x, region.bounds.center.y, region.bounds.center.z - region.bounds.size.z/2);
																		
					break;
				case 1:
					if (region.bounds.size.z > region1.bounds.size.z)
						jointPoint = Vector3(region1.bounds.center.x - region1.bounds.size.x/2, region1.bounds.center.y, region1.bounds.center.z);
					else
						jointPoint = Vector3(region.bounds.center.x + region.bounds.size.x/2, region.bounds.center.y, region.bounds.center.z);
													
					break;
				case 2:
					if (region.bounds.size.x > region1.bounds.size.x)
						jointPoint = Vector3(region1.bounds.center.x, region1.bounds.center.y, region1.bounds.center.z - region1.bounds.size.z/2);
					else
						jointPoint = Vector3(region.bounds.center.x, region.bounds.center.y, region.bounds.center.z + region.bounds.size.z/2);
																		
					break;
				case 3:
					if (region.bounds.size.z > region1.bounds.size.z)
						jointPoint = Vector3(region1.bounds.center.x + region1.bounds.size.x/2, region1.bounds.center.y, region1.bounds.center.z);
					else
						jointPoint = Vector3(region.bounds.center.x - region.bounds.size.x/2, region.bounds.center.y, region.bounds.center.z);
													
					break;
			}
				joint.bounds.center = jointPoint;  
		}
	}
	
	/*A function expanding all given regions. 
	If parameter growingGaps is true, the passed regions will be also added to the region list
	*/
	protected function GrowRegionList(regionList:List.<MeshNode>, growingGaps:boolean){
		for (var region:MeshNode in regionList){
			if (growingGaps) 
				if (regions.Contains(region)==false) 
					regions.Add(region);
						
			GrowRegion(region);
		}
	}
	
	/*A function searching for empty locations adjacent to the given regions.
	The found gaps are filled with regions placed into 'seeds' list*/
	protected function lookForGaps(regionList:List.<MeshNode>, seeds:List.<MeshNode>):boolean{
		var gapFound = false;
		for (var region:MeshNode in regionList){
			var cube:MeshNode = region;
			//For each edge
			for (var i:int = 0; i<4;i++){
				var result:boolean;
				switch (i){
					case 0:
						//Search for empty space
						result = tryToFillVertically(cube,  false, seeds);
						break;
					case 1:
						result = tryToFillHorizontally(cube,  true, seeds);
						break;
					case 2:
						result = tryToFillVertically(cube,  true, seeds);
						break;
					case 3: 
						result = tryToFillHorizontally(cube, false, seeds); 
						break;
				}
				if (result) {
					gapFound = true; 
				}
			}
		}
		
		return gapFound;
	}
	
	//A function searching for gaps near upper or lower edge
	private function tryToFillHorizontally(cube:MeshNode, up:boolean, seeds:List.<MeshNode>):boolean{
		var fillingEnabled:boolean = true;
		var regionsToAdd:List.<MeshNode> = new List.<MeshNode>();
		var terminate:boolean = false;
		
		//Checking if locations along the edge are empty
		for(var y:float = cube.bounds.min.z+fillSize/2 ; y<cube.bounds.max.z-fillSize/2;y=y+fillSize){
							
			var location:Vector3;
			
			if (up){
				location = Vector3(cube.bounds.max.x+fillSize*(0.5+step), cube.bounds.min.y, y);
			}
			else{
			    location = Vector3(cube.bounds.min.x-fillSize*(0.5+step), cube.bounds.min.y, y);
			}
			
			var result = fillGap(location, seeds, cube.id, fillingEnabled);
			/*If gap found set 'terminate' to return true
			and set gap to false to stop searching for gaps*/
			if (result==2){
				terminate = true; 
				fillingEnabled=false;
			}
			//If intersection occured, start filling gaps again
			if (result==1){
				fillingEnabled=true;
			}
			
		}
								
		return terminate;
	}
	
	//A function searching for gaps near left or right edge.
	private function tryToFillVertically(cube:MeshNode, left:boolean, seeds:List.<MeshNode>):boolean{
		var fillingEnabled:boolean = true;
		var regionsToAdd:List.<MeshNode> = new List.<MeshNode>();
		var terminate:boolean = false;
		
		for(var y:float = cube.bounds.min.x+fillSize/2 ; y<cube.bounds.max.x-fillSize/2;y=y+fillSize){									
			var location:Vector3;
			
			if (left){
				location = Vector3(y, cube.bounds.min.y, cube.bounds.max.z+fillSize*(0.5+step));
			}
			else{
			    location = Vector3(y, cube.bounds.min.y, cube.bounds.min.z-fillSize*(0.5+step));
			}					
									
			var result = fillGap(location, seeds, cube.id, fillingEnabled);
			if (result==2){
				terminate = true; 
				fillingEnabled=false;
			}	
			if (result==1){
				fillingEnabled=true;
			}
		}
																
		return terminate;
	}
	
	//A function checking if it is possible to fill gap in specified location
	//Returns: 0 if no intersection occured, otherwise 1. 2 if a gap was filled
	private function fillGap(location:Vector3, regionsToAdd:List.<MeshNode>, name:int, fillingEnabled:boolean):int{
		var elevatedLocation:Vector3 = Vector3(location.x, location.y+fillSize+0.5, location.z);
		var result:int = 0;
		
		//Initial (imprecise) check for intersection to improve the performance
		if (FastProximityCheck(elevatedLocation)==false){
			if (fillingEnabled){
				var newRegion:MeshNode = new MeshNode(Vector2(location.x, location.z),Vector3(fillSize, fillSize, fillSize));
				numberOfRegionsAdded++;												
				newRegion.id =  numberOfRegionsAdded; 
				
				//Precise intersection checks	
				if (newRegion.IntersectsWithRegions(regions) || newRegion.IntersectsWithRegions(regionsToAdd)) 
					return 1; 
					
				regionsToAdd.Add(newRegion);
				fillingEnabled = false;												
				result = 2;
			}														
				
		}else
			result = 1;
	
		return result;
	}
	
	//A function removing small overlapping regions which has been placed during seeding phase, but did not have a chance to grow further.
	protected function RemoveOverlappingRegions(){
		var toRemove:List.<MeshNode> = new List.<MeshNode>();
		
		for (var region:MeshNode in regions) 
		//if ((region.bounds.size.x<=0.6)&&(region.bounds.size.z<=0.6))
			for (var region1:MeshNode in regions) 
				if (region!=region1)
				if (region1.bounds.size.x>region.bounds.size.x)
					if (Utils.BoundsIsEncapsulated(region1.bounds, region.bounds))
						toRemove.Add(region);
						
		for (region in toRemove){
			regions.Remove(region);
		}
	}
	
	//Virtual functions overriden by subclasses
	virtual function getColliding(region:MeshNode):Collider[]{
		
	}
	
	virtual function RegionObjectsIntersectionTest(region:MeshNode, list:Collider[]):boolean{
		return false;
	}
		
	virtual function FastProximityCheck(vec1:Vector3):boolean{
		
	}
	
	//Drawing rectangles in Debug mode
	function OnDrawGizmos(){
		if (!drawingEnabled)return;
	
		if (regions){
			for(region in regions){
					
				Gizmos.DrawCube (Vector3(region.bounds.center.x,-0.1
				, region.bounds.center.z), 
				region.bounds.size);
				
			}
		}
	}
}