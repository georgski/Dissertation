/*
A script handling movement of a bullet
*/
var speed : float = 10;
var lifeTime : float = 0.5;
var dist : float = 10000;
var scale = Vector3(1,1,1);

private var spawnTime : float = 0.0;
private var tr : Transform;

function OnEnable () {
	this.transform.localScale=scale;
	tr = transform;
	spawnTime = Time.time;
}

function Update () {
	//Bullet translation
	tr.position += tr.forward * speed * Time.deltaTime;
	dist -= speed * Time.deltaTime;
	
	//Destroy if too far or is flying for too long
	if (Time.time > spawnTime + lifeTime || dist < 0) {
		Spawner.Destroy (gameObject);
	}
}
