//Script destroying specified object

var objectToDestroy : GameObject;
var explosion : GameObject;
var material : GameObject;

//Shown explosion
function Explode (){
	if (explosion){
		explosion = Instantiate(explosion, transform.position, transform.rotation);
	}
}

function OnDestroy () {
	//Shown explosion if specified
	if (explosion){
		explosion.active = false;
	}
	
	//Destroy model material
	if (material){
		DestroyImmediate(material.renderer.material);
	}
	
	Spawner.Destroy (objectToDestroy);
}
