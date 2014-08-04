/*
A state following specified target (same as Follow state, but used with fuzzy attack state)
*/
class FuzzyFollowState extends BaseState{

	private static var instance:FuzzyFollowState;
	
	public static function Instance():FuzzyFollowState
    {
    	if (!instance) instance = new FuzzyFollowState();
    	 
        return instance;
    }
	
	function Exit (controller:BaseEnemyController) {
		var motor = controller.motor;
		motor.facingDirection = Vector3.zero;
		motor.movementDirection = Vector3.zero;
	}
	
	function Execute (controller:BaseEnemyController, stateMachine:FiniteStateMachine) {
			
		controller.Follow(controller.TargetDirection);
			
		var playerDist : float = Vector3.Distance(controller.TargetDirection, controller.Character.position);
		if (playerDist <= controller.targetDistance)
			stateMachine.ChangeState(FuzzyAttackState.Instance());
		
	}

}