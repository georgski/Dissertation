/*
A state firing all loaded bullets
*/
class ShootBurstsState extends BaseState{

	private static var instance:ShootBurstsState;
	public static function Instance():ShootBurstsState
    {
    	if (!instance) instance = new ShootBurstsState();
    	 
        return instance;
    }
	
	function Enter (controller:BaseEnemyController) {
		//Set weapon activation time
		var weaponHandler = controller.weapon.transform.parent.gameObject.GetComponentInChildren(WeaponHandler);
		var weaponInfo:WeaponInfo = weaponHandler.GetWeaponInfo(0);
		weaponInfo.activationTime = Time.time;
	}
	
	function Exit (controller:BaseEnemyController) {
		//Turn the attack off
		controller.weapon.GetComponentInChildren(AutoFire).firing = false;
	}
	
	function Execute (controller:BaseEnemyController, stateMachine:FiniteStateMachine) {
		var weapon = controller.weapon;
		var weaponHandler = controller.weapon.transform.parent.gameObject.GetComponentInChildren(WeaponHandler);
		var weaponInfo:WeaponInfo = weaponHandler.GetWeaponInfo(0);
		
		controller.Attack();
		
		//If all bullets have been fired, hide to reload
		if (weaponInfo.activationTime + weaponInfo.loadTime <  Time.time){ 
				stateMachine.ChangeState(HideState.Instance());
		}
			
		
		
	}

}