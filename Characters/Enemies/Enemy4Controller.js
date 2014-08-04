/*
A class controlling the fourth enemy type with fuzzy logic weapon management
*/

class Enemy4Controller extends ShootingEnemyController{

	function Awake () { 
		super.Awake(); 
		
		stateMachine.Configure(this, FuzzyFollowState.Instance());
	}
	
	
}