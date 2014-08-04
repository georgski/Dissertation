/*
A class containing functionality used by enemy formations
*/
public class Formation extends MonoBehaviour{

	public var enemies : GameObject[];
	public var safetyState : float[];
	
	//Distance from the enemies to the player
	public var distance : int =5;
	
	protected var player : Transform;
	
	function Start () {
		safetyState = new float[enemies.length];
		player = GameObject.FindWithTag ("Player").transform;
		//Activating all the enemies in a formation
		for(var i:int = 0; i < enemies.length; i++){
			(enemies[i].GetComponentInChildren(Detector)).OnSpotted();
			(enemies[i].GetComponentInChildren(BaseEnemyController)).formation = this;
			safetyState[i] = 1;
		}
	}
	
	//A function called when one of the enemies has been hit, calculating safety states
	function OnEnemyHit (enemy : GameObject) {
				
		var transitionVector : float[] = new float[enemies.length];
		//Find the slot in a formation of the hit enemy
		var enemyHitIndex:int = Utils.GetIndexOf(enemy, enemies);
		
		//Calculating the transition vector
		for(var i:int = 0; i < enemies.length; i++){
			var distanceToEnemyHit:int = Mathf.Abs(enemyHitIndex - i);
			//Safe increases with the distance to the hit enemy
			var safeFactor:float = distanceToEnemyHit/enemies.length;
			
			//Setting the safety of the hit and the other enemies
			if (enemy == enemies[i])
				transitionVector[i] = 0.6;
			else 
				transitionVector[i] = 1 + (distanceToEnemyHit/(enemies.length * 2.0));
		}	 
		
		//Computing new safety state vector 	 	 
		for(i = 0; i < enemies.length; i++){
			safetyState[i] = safetyState[i] * transitionVector[i];
			safetyState[i] = Mathf.Clamp(safetyState[i], 0, 2);
		}
	}

}