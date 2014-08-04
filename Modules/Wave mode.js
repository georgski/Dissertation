//A script used to create a "wave attack" mode, spawning enemies until a specified number have been destroyed.

//Enemy to spawn
public var enemyType : GameObject;

//Number to destroy
public var enemyNumber:int=4;

//Obstacle activated after destroying enemies
public var obstacle : GameObject;

public var spawnPoint : GameObject;


private var enemySpawned:int;

function Start () {
	enemySpawned = 0;
	Spawn();
}

//A function spawning new enemy
function Spawn(){
	//Spawning new enemy
	var enemy:GameObject = Instantiate(enemyType, spawnPoint.transform.position, Quaternion.identity);
		
	//Adding "received" to the spawned enemy. It will be called by the component message system once the enemy will be destroyed.
	var receiverItem:ReceiverItem = new ReceiverItem();
	receiverItem.receiver = this.gameObject;
	receiverItem.action = "onDeath";
	
	var healthComponent : Health= enemy.GetComponent.<Health> ();
	var newarr = new Array (healthComponent.dieSignals.receivers);
	newarr.Add(receiverItem);
	healthComponent.dieSignals.receivers = newarr.ToBuiltin(ReceiverItem);
	
	//Activating new enemy
	enemy.GetComponentInChildren(BaseEnemyController).enabled = true;
}

//A function called when enemy is destroyed
function onDeath () {
	enemyNumber--;
	if (enemyNumber==0) {
		if (obstacle){
			var healthComponent : Health= obstacle.GetComponent.<Health> ();
			if (healthComponent) {
				healthComponent.invincible = false;
			}
			var glowComponent : Glow= obstacle.GetComponent.<Glow> ();
			glowComponent.enabled = true;
		}
		//Wave mode deactivated once a number of enemies has been destroyed
		this.enabled=false;
		return;
	}
	
	Spawn();
}