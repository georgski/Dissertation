/*
A state turning the enemy to look in a specified direction
*/
class LookAtState extends BaseState{

	private static var instance:LookAtState;
	
	public static function Instance():LookAtState
    {
    	if (!instance) instance = new LookAtState();
    	 
        return instance;
    }
	
	function Execute (controller:BaseEnemyController, stateMachine:FiniteStateMachine) {
		var motor = controller.motor;
		
		//Calculate the direction to target
		var targetDirection:Vector3 = (controller.TargetDirection- controller.Character.position);
		
		motor.facingDirection = targetDirection;
	}

}