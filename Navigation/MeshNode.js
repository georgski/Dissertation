import System.Collections.Generic;
/*
A class representing a single rectangle
*/
public class MeshNode 
{
	//Rectangles connected to it
	public var connections : List.<MeshNode>;
	
	public var edgeExpandable:boolean[];
	public var bounds:Bounds;
	public var id:int;
		
	public function MeshNode(position:Vector2, scale:Vector3){	
		connections = new List.<MeshNode>();
	
		var center:Vector3 = new Vector3(position.x, 0.0f, position.y);
		
		bounds = Bounds(center, scale); 
		edgeExpandable = new boolean[4];
		
		for (var i:int;i<4;i++) {
        	edgeExpandable[i] = true;
    	}
    	
	}
	
	//A function checking whether the rectangle can be expanded further (in any direction)
	public function IsExpandable():boolean{
		for (var i:int = 0; i<4;i++)
			if (edgeExpandable[i]) 
				return true;
		return false;
	}
	
	//A function checking if the rectangle intersects with any of the rectangles in a list
	public function IntersectsWithRegions(regionList:List.<MeshNode>):MeshNode{
		for (var region:MeshNode in regionList)
			if (region.id!=id)
				if (region.bounds.Intersects(bounds))  
					return region;
						
		return null;
	}
	
	//A function checking if the rectangle intersects with an object (during dynamic mesh update)
	public function CheckOBBIntersectionWithDynamicObj(mesh:DynamicObject):boolean{
		//Initial, approximate intersection check
		if (!this.bounds.Intersects(mesh.bounds)) 
			return false;
		
		//Precise intersection check
		return BoundsRectangleIntersectionTest(this.bounds, mesh.point1, mesh.point2, mesh.point3, mesh.point4);
	}
	
	//A function checking if the rectangle intersects with an object
	public function CheckOBBIntersection(object:Collider):boolean{
		
		var meshComponent = object.GetComponent(MeshFilter);
		if (!meshComponent) 
			return false;
			
		var mesh = meshComponent.sharedMesh;
		if (mesh ==null) 
			return false;
			
		return CheckOBBIntersectionWithMesh(object, mesh);		    
	}
		
	//A function checking if the rectangle intersects with an objects mesh
	private function CheckOBBIntersectionWithMesh(object:Collider, mesh:Mesh):boolean{
		
		    var min = mesh.bounds.min;
		    var max = mesh.bounds.max;
		   
		    var transform = object.transform;
		   
		    var point1 = transform.TransformPoint(Vector3(min.x, 0, min.z));
		    var point2 = transform.TransformPoint(Vector3(max.x, 0, min.z));
		    var point3 = transform.TransformPoint(Vector3(max.x, 0, max.z));
		    var point4 = transform.TransformPoint(Vector3(min.x, 0, max.z));
		    
		   return BoundsRectangleIntersectionTest(this.bounds, point1, point2, point3, point4);
	}
	
	//A function checking if AABB rectangle intersects with OBB rectangle
	private function BoundsRectangleIntersectionTest(bounds:Bounds, point1:Vector3, point2:Vector3, point3:Vector3, point4:Vector3){
		var rectangle:Vector2[] = Utils.BuildRectangleArrayFromVertices(point1, point2, point3, point4);
		
		//Initial, approximate intersection check
		if (PointsBoundsIntersectonTest(bounds, rectangle)) 
			return true;
		   
		var rect1:Vector2[] = Utils.BuildRectangleArrayFromMinMax(bounds.min, bounds.max);
		
		//Precise intersection check
		if (Utils.ObbIntersectionTest(rect1, rectangle)) 
		 	return true; 
		 
		 return false;
	}
	
	//A function checking whether a rectangle contains any point in a list
	private function PointsBoundsIntersectonTest(bounds:Bounds, rectangle:Vector2[]):boolean{
		for(point in rectangle){
			if (bounds.Contains(Vector3(point.x, 0, point.y))) 
				return true;
		}
		
		return false;
	}
	
}