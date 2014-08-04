/*
A state moving back the character
*/
class MoveBackState extends BaseState{

	private static var instance:MoveBackState;
	public static function Instance():MoveBackState
    {
    	if (!instance) instance = new MoveBackState();
    	 
        return instance;
    }
	
	function Execute (controller:BaseEnemyController, stateMachine:FiniteStateMachine) {
		//If too close to the target
		if (Vector3.Distance(controller.Player.position, controller.Character.position)<controller.targetDistance + controller.attackRange){
			
			//Calculate location behind the enemy
			var	point = controller.Character.position + Vector3.Normalize(controller.Character.position - controller.Player.position)*13;
			
			controller.Follow(point);
		}
		else{	
			//If within attack range, begin to attack
			stateMachine.ChangeState(AttackState.Instance());
		}
	}

}