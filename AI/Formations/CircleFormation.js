/*
A class implementing cirular formation
*/

class CircleFormation extends Formation{

	//A function updating the position of enemies
	public function UpdateMembersPosition(){
	
		for(var i:int = 0; i < enemies.length; i++){
			var angle:float = 360/enemies.length;
			
			var stepAngle = i * angle;
			var controller:BaseEnemyController = (enemies[i].GetComponentInChildren(BaseEnemyController));
			controller.targetDistance = 1.5; 
			
			//Calculating the distance from the player with relation to the safety value
			var distanceFromPlayer:float = distance/2+distance*(1-(safetyState[i])/2);
			
			//Positioning the enemy in a circle
			controller.TargetDirection = player.position + 
				Quaternion.Euler(0, stepAngle, 0) * Vector3.forward * distanceFromPlayer;
				
			controller.TargetDirection.y = 0;
				
			Debug.DrawLine((enemies[i].GetComponentInChildren(BaseEnemyController)).TargetDirection, player.position);
		}
		
	}
	
	public function Update () {
	
		enemies = Utils.RemoveEmptyElements(enemies);
		
		//Formation destroyed in no enemies left
		if (enemies.length == 0) {
			DestroyObject(this.gameObject);
		}
		
		UpdateMembersPosition();
					
	}
	
}