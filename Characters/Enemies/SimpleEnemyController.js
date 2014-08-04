/*
A class controlling the first eenemy type, attacking with bare hands
*/
class SimpleEnemyController extends BaseEnemyController{
	
	//Variables storing data related to attacking
	private var lastAttackTime : float = -1;
	private var damageAmount : float = 10;
	private var attackFrequency : float = 2;
	
	protected var inRange : boolean = false;
	
	function Awake () { 
		super.Awake();
		//Create finite-state machine with follow state
		stateMachine = new FiniteStateMachine();
		stateMachine.Configure(this, FollowState.Instance());
		
	}
	
	function OnEnable () {
		inRange = false;
	}
	
	//Function performing the attack
	function Attack () {
	
		//Turning to the player
		motor.movementDirection = Vector3.zero;
		motor.facingDirection = (player.position - character.position);
		motor.facingDirection.y = 0;
		
		//Playing attack animation
		motor.animation.CrossFade("Take 002");
		
		//Applying damage
		ApplyDamage();
				
	}
	
	
	function ApplyDamage(){
	
		if (Time.time > lastAttackTime + 1 / attackFrequency) {
			lastAttackTime = Time.time;
			var healthComponent : Health = player.GetComponent.<Health> ();
			if (healthComponent) {
			// Apply damage
			
				healthComponent.OnDamage (damageAmount, -transform.forward);
			}
		}
	}
	
	//Function activating behaviour specific for following
	function Follow() {
	
		//Animation of walking
		motor.animation.CrossFade("Take 001");
		motor.animation.wrapMode = WrapMode.Loop;
					
	}
	
	function Update () {
		super.Update();
		//Setting player as the target
		targetDirection = player.position;
				
	}
}