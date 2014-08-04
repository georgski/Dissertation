/*
A state attacking the specified target
*/
class AttackState extends BaseState{

	private static var instance:AttackState;
	//Singleton
	public static function Instance():AttackState
    {
    	if (!instance) instance = new AttackState();
    	 
        return instance;
    }
	
	public function Execute (controller:BaseEnemyController, stateMachine:FiniteStateMachine) {		
			
		var weapon = controller.weapon;
		//Executing attack specific for enemy type
		controller.Attack();
		
		var playerDist : float = Vector3.Distance(controller.TargetDirection, controller.Character.position);
		
		//If too far follow the target
		if (playerDist > controller.targetDistance + controller.attackRange)
			stateMachine.ChangeState(FollowState.Instance());
		
		//if too close move back
		if (playerDist < controller.targetDistance - controller.attackRange)
			stateMachine.ChangeState(MoveBackState.Instance());
		
		//If it is third enemy type, if hit try to avoid bullets
		if (controller instanceof Enemy3Controller){
			var enemy3Controller:Enemy3Controller = controller as Enemy3Controller;
			if (enemy3Controller.hit)
				stateMachine.ChangeState(DodgeState.Instance());
		}
	}

}