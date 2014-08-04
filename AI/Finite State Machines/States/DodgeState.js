/*
A class implementing state avoiding bullets when hit
*/
class DodgeState extends BaseState{

	private static var instance:DodgeState;
	
	public static function Instance():DodgeState
    {
    	if (!instance) instance = new DodgeState();
    	 
        return instance;
    }
	
	function Enter (controller:BaseEnemyController) {
		
		var enemy3Controller:Enemy3Controller = (controller as Enemy3Controller);
		enemy3Controller.hitTime = Time.time;
		enemy3Controller.hit = false;
		
		//Chosing left or right direction
		var randomDirection:int = Random.Range(0, 2);
		
		if (randomDirection == 0) 
			enemy3Controller.dodgeDirection = false;
		else 
			enemy3Controller.dodgeDirection = true;
	}
	
	function Execute (controller:BaseEnemyController, stateMachine:FiniteStateMachine) {
		var enemy3Controller:Enemy3Controller = (controller as Enemy3Controller);
		enemy3Controller.Attack();
		
		var motor = enemy3Controller.motor;
		
		var dodgeVector:Vector3;
		var normalizedFacingVector:Vector3 = motor.facingDirection.normalized;
		
		//Calulate the position to move to
		if (enemy3Controller.dodgeDirection)
			dodgeVector = Vector3.Cross(normalizedFacingVector, Vector3.up);
		else
			dodgeVector = Vector3.Cross(Vector3.up, normalizedFacingVector);
		
		motor.movementDirection = dodgeVector;
		
		//If finished moving, switch back to the attack state
		if ((Time.time - enemy3Controller.hitTime) > 0.4)
			stateMachine.ChangeState(AttackState.Instance());
			
	}

}