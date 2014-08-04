/*
A class controlling movement and rotation of enemies (motor movement)
*/
class EnemyMovement extends BaseMovement {
	
	public var drawLocalAvoidance:boolean = false;
	
	//Data related to the attack precision
	public var smoothingDuration:float = 0.5;
	public var maxAngle:float = 0;
	private var smoothingTime:float;
	private var angleStep:float = 1;
	
	
	//Data related to the animation of falling
	private var originalRotY:float;
	private var originalRotZ:float;
	private var rotationSmoothness:float = 1;
	private var isFalling:boolean = false;
	
	private var lastAvoidanceTime:float = 1;
	
	//A function starting animation of falling
	function FallSmoothly(){
		isFalling = true;
		//Saving original Y and Z rotations
		originalRotY=transform.eulerAngles.y;
		originalRotZ=transform.eulerAngles.z;
		
		//Freezing rotation
		rigidbody.constraints = RigidbodyConstraints.FreezePosition;
	}
	
	//A function creating animation of falling
	private function ProcessFalling(){
		var rotation = Quaternion.Euler(-90, 0, 0);
		
		transform.rotation = Quaternion.Lerp(transform.rotation,
			
	   	rotation, 5.0f*Time.deltaTime*rotationSmoothness); 
	   		
	   	transform.eulerAngles.y = originalRotY;
		transform.eulerAngles.z = originalRotZ;
	}
	
	//A function calculating attack precision (rotation)
	private function GetSpreadAngle():float{

		var angle:float = maxAngle * angleStep * ((Time.time-smoothingTime)-smoothingDuration);
		
		//If turn in one direction is finished, change the direction		
		if ((maxAngle != 0) && (Time.time > smoothingTime + smoothingDuration * 2)){

			smoothingTime = Time.time;
			angleStep = angleStep * -1;

		}
		
		return angle;
	}
	
	//A function handling local obstacle avoidance
	private function LocalNavigation(){
		//For perfromance, limit the number of avoidances per second
		if (lastAvoidanceTime + 0.001 > Time.time)
			return;
			
		lastAvoidanceTime = Time.time;
		
		var hit:RaycastHit;
		if (movementDirection!=Vector3.zero){
			//Detecting obstacles in front of the enemy
			var didHit = Physics.SphereCast(transform.position, 1.6, movementDirection,hit, 1, Utils.GetLocalNavigationMask());
			
			//Obstacle found
			if ((didHit) && (hit.transform!=transform))
			{
			
					var direction = hit.normal;
					
					//Add the object to the dynamic navigation mesh
					if (hit.collider.gameObject.layer != 9)
						PathFinder.Instance().AddObjectToMesh(hit.collider);
					
					//Calculating normal to the obstacle edge
					var direction2d:Vector2 = Vector2(movementDirection.x, movementDirection.z);
					var hitNormal2d:Vector2 = Vector2(direction.x, direction.z);
					
					//Calculating new direction between the old direction and the normal
					movementDirection = Vector3.Slerp(Vector3(direction2d.x, 0, direction2d.y), Vector3(hitNormal2d.x,0,hitNormal2d.y), Time.deltaTime*20);
								
					facingDirection = movementDirection;
					
					if (drawLocalAvoidance){
						Debug.DrawRay(transform.position, Vector3(direction2d.x, 0, direction2d.y).normalized*3, Color.black);
						Debug.DrawRay(transform.position, Vector3(hitNormal2d.x, 0, hitNormal2d.y)*3, Color.blue);
						Debug.DrawRay(transform.position, movementDirection.normalized*3, Color.green);
					}
			}
		}	
	}
	
	//A function handling enemy rotation
	private function Rotate(angle:float){
		var rotation:Quaternion = Quaternion.LookRotation(facingDirection);
		
		rotation = Quaternion.Euler(rotation.eulerAngles.x, rotation.eulerAngles.y + angle, rotation.eulerAngles.z);
		
		//Smoothing the rotation
		transform.rotation = Quaternion.Lerp(transform.rotation, rotation, 5.0f * Time.deltaTime * rotationSmoothness);
	}
	
	//A function handling enemy translation
	private function Translate(){
		transform.position += movementDirection.normalized * Time.deltaTime * walkingSpeed;
	}
	
	public function FixedUpdate() {
		rigidbody.centerOfMass = Vector3 (0, -4, 0);
		
		//Processing animation of falling
		if (isFalling){
			ProcessFalling();
	   		return;
		}
		
		//Creating "shooting spread" decreasing the attack accuracy
		var spreadAngle : float = GetSpreadAngle();
		
		//Handling local navigation
		LocalNavigation();
		
		//Rotating the enemy
		if (facingDirection!=Vector3.zero)
			Rotate(spreadAngle);
		
		//Translating the enemy
		if (movementDirection!=Vector3.zero)
			Translate();
			
		transform.eulerAngles.x = 0;
		transform.eulerAngles.z = 0;
	}

	
}
