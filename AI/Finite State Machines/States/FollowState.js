/*
A state following specified target
*/
class FollowState extends BaseState{

	private static var instance:FollowState;
	
	public static function Instance():FollowState
    {
    	if (!instance) instance = new FollowState();
    	 
        return instance;
    }
	
	function Enter (controller:BaseEnemyController) {
		controller.Follow();
	}
	
	function Exit (controller:BaseEnemyController) {
		var motor = controller.motor;
		//Resetting the facing and movement direction
		motor.facingDirection = Vector3.zero;
		motor.movementDirection = Vector3.zero;
	}
	
	function Execute (controller:BaseEnemyController, stateMachine:FiniteStateMachine) {
		//Go to the specified location
		controller.Follow(controller.TargetDirection);
			
		var playerDist : float = Vector3.Distance(controller.TargetDirection, controller.Character.position);
		
		//If close enough, begin to attack
		if (playerDist <= controller.targetDistance)
			stateMachine.ChangeState(AttackState.Instance());
		
	}

	
}