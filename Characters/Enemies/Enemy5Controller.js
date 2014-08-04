/*
A class controlling the fifth enemy type with behaviour based on terrain analysis
*/
class Enemy5Controller extends ShootingEnemyController{
	
	function OnEnable(){
		//Adding map analyser component to the enemy game object
		gameObject.AddComponent(MapAnalyser);
		
		stateMachine.ChangeState(ShootBurstsState.Instance());
	}
		
}