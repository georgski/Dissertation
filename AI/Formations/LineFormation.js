/*
A class implementing the line formation consisting of 2 line segments
*/
class LineFormation extends Formation{

	//Distance between the enemies
	public var interval : int = 5;
	
	//Angle between the line segments
	public var angle : int = 70;

	//A function updating the position of an invisible leader
	private function UpdateLeaderPosition(){
		var directionFromPlayer:Vector3 = (transform.position - player.position);
		var playerDist : float = Vector3.Distance(player.position, transform.position);
		if (playerDist<distance + 0.5){
				transform.position += (transform.position - player.position).normalized * Time.deltaTime * 5;
		}
				
		if (playerDist > distance){
			transform.position = player.position + directionFromPlayer.normalized * distance;
		}
	}
	
	//A function updating the position of enemies
	private function UpdateMembersPosition(){
		var directionFacingPlayer:Vector3 = (player.position - this.transform.position);
		
		//Calculating 2 line segments
		var rightSegment:Vector3 = Quaternion.Euler(0, angle, 0) * directionFacingPlayer;
		var leftSegment:Vector3 = Quaternion.Euler(0, -angle, 0) * directionFacingPlayer;
		
		rightSegment.Normalize();
		leftSegment.Normalize();
		
		//The enemy positions are calculated to be on one of the line segments					
		var middle:int = enemies.length/2;
		var controller:BaseEnemyController = enemies[middle].GetComponentInChildren(BaseEnemyController);
		//Calculating position of the enemy in the middle
		controller.TargetDirection = transform.position + directionFacingPlayer.normalized * ((safetyState[middle]-1)/2) * distance;
			
		//Claculating positions of the enemies on the left hand side
		var count :int = 1;
		for(var i:int = middle+1; i < enemies.length; i++){
			controller = enemies[i].GetComponentInChildren(BaseEnemyController);
			controller.TargetDirection = transform.position + (rightSegment * count * interval);
			controller.TargetDirection += Vector3.Cross(rightSegment, Vector3.up).normalized * ((safetyState[i]-1)/2) * distance;
			count++;
		}
		count = 1;
		
		//Claculating positions of the enemies on the right hand side
		for(i = middle-1; i >= 0; i--){
			controller = enemies[i].GetComponentInChildren(BaseEnemyController);
			controller.TargetDirection = transform.position + (leftSegment * count * interval);
			controller.TargetDirection -= Vector3.Cross(leftSegment, Vector3.up).normalized * ((safetyState[i]-1)/2) * distance;
			count++;
		}
		
		//Fixing the enemy positions
		for(i = 0; i < enemies.length; i++){
				
			controller = enemies[i].GetComponentInChildren(BaseEnemyController);
				
			controller.targetDistance = 1.5;
			controller.TargetDirection.y=0;
				
		}
		
		//Drawing the line segments
		Debug.DrawLine(transform.position, 
			transform.position + (leftSegment* (enemies.length/2) * interval));
		Debug.DrawLine(transform.position, 
			transform.position + (rightSegment* (enemies.length/2) * interval));
	}
	function Update () {
			
		enemies = Utils.RemoveEmptyElements(enemies);
		
		//Formation destroyed in no enemies left
		if (enemies.length==0) {
			DestroyObject(this.gameObject);
			return;
		}
				
		UpdateLeaderPosition();
			
		UpdateMembersPosition();
				
	}

}