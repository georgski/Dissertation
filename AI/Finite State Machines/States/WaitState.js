/*
A state waiting for the enemy's weapon to reload
*/
class WaitState extends BaseState{

	private static var instance:WaitState;
	
	public static function Instance():WaitState
    {
    	if (!instance) instance = new WaitState();
    	 
        return instance;
    }
	
	function Execute (controller:BaseEnemyController, stateMachine:FiniteStateMachine) {
		var weaponHandler = controller.weapon.transform.parent.gameObject.GetComponentInChildren(WeaponHandler);
		var weaponInfo:WeaponInfo = weaponHandler.GetWeaponInfo(0);
		
		//If weapon reloaded, look for the target
		if (weaponInfo.activationTime + weaponInfo.loadTime * 2 <  Time.time){
			weaponInfo.activationTime = Time.time;
			stateMachine.ChangeState(TrackState.Instance());
		}
	}

}