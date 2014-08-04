/*
A class storing data about a game object, not accessible from a separate thread
*/
public class DynamicObject
{
	//Four corners of the oriented bounding box
	public var point1:Vector3;
	public var point2:Vector3;
	public var point3:Vector3;
	public var point4:Vector3;
	
	public var bounds:Bounds;
	public var name:String;
	
	function DynamicObject(object:Transform, meshBounds:Bounds,  objectBounds:Bounds){
		name = object.name;
		bounds = objectBounds;
		
		var min = meshBounds.min;
		var max = meshBounds.max;
		
		//Transforming axis-aligned bounding box to oriented bouding box
		point1 = object.transform.TransformPoint(Vector3(min.x, 0, min.z));
		point1.y=0;
		    
		point2 = object.transform.TransformPoint(Vector3(max.x, 0, min.z));
		point2.y=0;
		    
		point3 = object.transform.TransformPoint(Vector3(max.x, 0, max.z));
		point3.y=0;
		    
		point4 = object.transform.TransformPoint(Vector3(min.x, 0, max.z));
		point4.y = 0;
		    
	}
}