/*
A state hiding the character in a safe location
*/
class HideState extends BaseState{

	private static var instance:HideState;
	
	public static function Instance():HideState
    {
    	if (!instance) instance = new HideState();
    	 
        return instance;
    }
	
	function Enter (controller:BaseEnemyController) { 
		//Finding the safe location
		controller.GetComponent(MapAnalyser).FindCover();
	}
	
	function Execute (controller:BaseEnemyController, stateMachine:FiniteStateMachine) {
					
					
		var reached:boolean;
		
		reached = controller.Follow(controller.GetComponent(MapAnalyser).coverPoint, 1);
		
		//If the found location is reached, wait for a weapon to reload
		if (reached)
			stateMachine.ChangeState(WaitState.Instance());
	}

}