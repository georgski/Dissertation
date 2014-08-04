//Script respawning the player
var checkpoint : Transform;

function OnRespawn() {
	//Setting new position
	transform.position = checkpoint.position;
	transform.rotation = checkpoint.rotation;
	
	ResetEntities ();
}

//Respawning enemies
static function ResetEntities () {
	var healthObjects : Health[] = FindObjectsOfType (Health);
	for (var health : Health in healthObjects) {
		health.health = health.maxHealth;
	}
}
