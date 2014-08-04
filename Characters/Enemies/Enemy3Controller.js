/*
A class controlling the third enemy type, capable of avioding bullets
*/

class Enemy3Controller extends ShootingEnemyController{

	//Data related to the bullet avoidance
	public var hit:boolean = false;
	public var hitTime:float = -1;
	
	//Dodge in left or right direction
	public var dodgeDirection:boolean = false; 
	
	function OnHit () {
		super.OnHit();
		if (formation) 
			return;
			
		hit = true;
	}
	
}