/*
A class controlling the second enemy type capable of shooting. 
Can be subclassed by other enemies with such capability.
*/
class ShootingEnemyController extends BaseEnemyController{

	//Reference to the object handling weapons
	public var weaponHandler:WeaponHandler;
	
	function Awake () { 
		super.Awake();
		stateMachine = new FiniteStateMachine();
		stateMachine.Configure(this, FollowState.Instance());
		
		//Setting the weapon handler
		weaponHandler = weapon.transform.parent.gameObject.GetComponentInChildren(WeaponHandler);
	}
	
	//Attack specific behavoiur
	function Attack () {
		//Auto-attack
		AutoShoot();
				
	}
		
	function Update () {
		super.Update();
		if (!formation) targetDirection = player.position;
			
	}
	
}