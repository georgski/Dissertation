/*
A class "tracking" the target: moving towards it until it is within the line of sight
*/
class TrackState extends BaseState{

	private static var instance:TrackState;
	
	public static function Instance():TrackState
    {
    	if (!instance) instance = new TrackState();
    	 
        return instance;
    }
	
	function Enter (controller:BaseEnemyController) {
		controller.Follow();
	}
	
	function Exit (controller:BaseEnemyController) {
		var motor = controller.motor;
		motor.facingDirection = Vector3.zero;
		motor.movementDirection = Vector3.zero;
	}
	
	function Execute (controller:BaseEnemyController, stateMachine:FiniteStateMachine) {
		//Follow the target
		controller.Follow(controller.TargetDirection);
		
		/*If the target is in the line of sight, begin to attack
		0.8 is a typical size of a bullet which here denotes thickness of casted ray*/				
		if (PathFinder.Instance().CanSeeTarget(controller.Character.position, controller.TargetDirection, 0.5))
			stateMachine.ChangeState(ShootBurstsState.Instance());
		
	}

	
}