/*
A script handling weapon shooting 
*/
@script RequireComponent (PerFrameRaycast)

public var firing : boolean = false;

//Bullet model
public var bulletPrefab : GameObject;
public var spawnPoint : Transform;

//A variable determining whether the script is used for the player or enemies
public var playerVersion:boolean = false;

//Muzzle flash parameters
public var coneAngle : float = 1.5;
public var muzzleFlashFront : GameObject;


private var activeWeapon : int;
private var lastFireTime : float = -1;
private var raycast : PerFrameRaycast;
private var weaponInfo : WeaponInfo;


public function Awake () {
	weaponInfo = GetComponent(WeaponInfo);
	raycast = GetComponent.<PerFrameRaycast> ();
	if (spawnPoint == null)
		spawnPoint = transform;
}

//A function firing a single bullet
public function Fire(){	
	
	if (weaponInfo.ammunitionLeft==0) 
		return;
		
	weaponInfo.ammunitionLeft--; 
			
	
	lastFireTime = Time.time;
	
	//If low firing frequency, wait (e.g. rocket launcher)
	if (weaponInfo.frequency<1)
		yield WaitForSeconds(0.2/weaponInfo.frequency);
	
	muzzleFlashFront.active = true;	
	var bulletGameObject : GameObject = Spawner.Spawn (bulletPrefab, spawnPoint.position, spawnPoint.rotation) as GameObject;
	
	//Spawn bullet
	var bullet : SimpleBullet = bulletGameObject.GetComponent.<SimpleBullet> ();
						
	// Find the object hit by the raycast
	var hitInfo : RaycastHit = raycast.GetHitInfo ();
	if (hitInfo.transform){
		if (playerVersion || (!playerVersion && hitInfo.transform == GameObject.FindWithTag("Player").transform)){
			// Get the health component of the target if any
			var targetHealth : Health = hitInfo.transform.GetComponent.<Health> ();
			if (targetHealth) {
			// Apply damage
				targetHealth.OnDamage (weaponInfo.damagePerSecond / weaponInfo.frequency, -spawnPoint.forward);
			}
					}		
			bullet.dist = hitInfo.distance;
		//}else {
		//	bullet.dist = 1000;
		//}
	}
}
public function Update () {
	
	//Activating muzzle flash
	if (weaponInfo.frequency<10){
		if ((muzzleFlashFront.active)&&(Time.time > lastFireTime + 0.01)){
			muzzleFlashFront.active = false;
		}
	}
	
	//Auto-attack
	if (firing) {
		if (Time.time > lastFireTime + 1 / weaponInfo.frequency) {
			Fire();
		}
	}else{
		muzzleFlashFront.active = false;
	}
}
