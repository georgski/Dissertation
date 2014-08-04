/*
A base enemy controller class handling enemy behaviour. 
It contains functionality used by all the enemies in game.
*/
class BaseEnemyController extends MonoBehaviour{
	
	//Motor movement component
	public var motor : BaseMovement;
	
	//Current weapon's game object
	public var weapon:GameObject;
	
	//Enemy formation, if any
	public var formation:Formation = null;
	
	//Distances indicating if enemy should follow or attack target
	public var attackRange : float = 0.4;
	public var targetDistance : float = 2.8;
	
	//Direction to attacked / followed target
	protected var targetDirection : Vector3;
	
	//Finite state machine
	protected var stateMachine:FiniteStateMachine;
	
	//Player's coordinates
	protected var player : Transform;
	
	//Enemy's coordinates
	protected var character : Transform;
		
	public function Awake(){
		character = motor.transform;
		player = GameObject.FindWithTag ("Player").transform;
	}
	
	//Functions overriden by other controllers to define any enemy specific actions to attack and follow
	public function Attack(){}
	
	public function Follow(){}
	
	//A function activating "auto-attack": bullets are fired until it is deactivated
	public function AutoShoot(){
		//Activating auto-attack
		weapon.GetComponentInChildren(AutoFire).firing = true;
		
		//Aim at the target
		motor.movementDirection = Vector3.zero;
		motor.facingDirection = player.position - this.transform.position;
	}
	
	//A function firing a single bullet
	public function SingleShoot(){
		weapon.GetComponentInChildren(AutoFire).Fire();
	}
	
	//A function informing that the enemy has been hit
	public function OnHit () {
		if (formation)
			formation.OnEnemyHit(this.transform.parent.gameObject);
	}
	
	//A function activating animation of falling on the ground, when the enemy is destroyed
	public function DeathAnimation () {
		var object = transform.parent.gameObject;
		//Destroying the collider to make the fall smooth
		DestroyObject(object.collider);
		
		//If the enemy contains animation script, smoothly turn off its animation
		var animator = object.GetComponentInChildren(PlayerAnimation);
		if (animator) {
			animator.enabled = false;
			DestroyObject(animator);
			(object.GetComponentInChildren(Animation)).CrossFade("idle");
		}else{
			(object.GetComponentInChildren(Animation)).Stop();
		}
		
		if (weapon)
			weapon.GetComponentInChildren(AutoFire).firing = false;

		//A function playing the animation
		(object.GetComponent(EnemyMovement)).FallSmoothly();
		
		//Disabling the controller
		(object.GetComponentInChildren(BaseEnemyController)).enabled = false;

	}
	
	//A function finding way to a specified location
	public function Follow (destination:Vector3) {
		Follow(destination, 0);
	}
	
	//A function finding way to a specified location, if not within specified range to the target
	public function Follow (destination:Vector3, acceptedRange:float):boolean {
		//Calculating directions from the enemy to the target and the player
		var targetDirection:Vector3 = (destination - character.position);
		var playerDirection:Vector3 = (player.position - character.position);
		
		//Calculating distance to the target		
		var distance:float = targetDirection.magnitude;
		
		//If is withing the specified range, terminate
		if (distance<=acceptedRange) {
		//	motor.facingDirection = playerDirection;
			motor.movementDirection = Vector3.zero;
			return true;
		}
		
		//Reseting facing direction
		motor.facingDirection = Vector3.zero;
		var pathFinder = PathFinder.Instance();
		
		//Calculating path using the A* algorithm
		var solvedPath:List.<MeshNode> = pathFinder.FindPath(character.position, destination, formation == null);
			
		var foundDirection : Vector3 = Vector3.zero;
		
		//If path found, it is followed using reactive path following
		if (solvedPath != null){
			for(var i:int = solvedPath.Count - 1; i >=0; i--){
			var checkPointPosition:Vector3 = solvedPath[i].bounds.center;
			
			//If the enemy is has not reached the location
			if (Vector3.Distance(character.position, checkPointPosition)>1){
				var direction : Vector3 = (checkPointPosition - character.position);
				//If the node can be directly accessed
				if (pathFinder.CanSeeTarget(character.position, checkPointPosition)){
								foundDirection = direction;
								break;
							}
						}
					}
			
			//If any of the path nodes cannot be accessed, try to reach the first one
			if ((foundDirection == Vector3.zero) && (solvedPath.Count>0)){ 
				foundDirection = (solvedPath[0].bounds.center - character.position);
			}
			
		}
		
		//If a path was found		 								
		if (solvedPath!=null){
			//If it contains only one node, go turn to the player directly
			if (solvedPath.Count==1){
				motor.facingDirection = playerDirection;
			}
			//Otherwise look at the found node
			else{
				motor.facingDirection = foundDirection;
			}
			
			//Follow the found node		
			motor.movementDirection = foundDirection;
					//motor.movementDirection = Vector3.zero;
					//motor.facingDirection = playerDirection;
		}
		//If path has not been found (object not accessible), follow the player
		else {
			motor.facingDirection = playerDirection;
			if(formation!=null){
				motor.movementDirection = Vector3.zero;
			}
		}
				
			//	Debug.DrawRay(transform.position+Vector3.up*1, targetDirection, Color.red);
				//Debug.DrawRay(transform.position+Vector3.up*1, foundDirection, Color.cyan);
				
			return false;
	}
	
	//Updating state machine every game cycle
	public function Update(){
		stateMachine.Update();
	}
	
	public function get TargetDirection () : Vector3 { 
		return targetDirection; 
	}
	
	public function set TargetDirection(value : Vector3) { 
		targetDirection = value; 
	}
	
	public function get Player () : Transform { 
		return player; 
	}
	
	public function get Character () : Transform { 
		return character; 
	}
}