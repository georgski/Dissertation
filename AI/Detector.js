/*
A script detecting the presence of the player and executing specified action
*/

public var behaviourOnSpotted : MonoBehaviour;

private var character : Transform;
private var player : Transform;

function Awake () {
	character = transform;
	player = GameObject.FindWithTag ("Player").transform;

}

function OnEnable () {
	behaviourOnSpotted.enabled = false;
	
}

//A function invoked when the player enters the detector's range
function OnTriggerEnter (collider : Collider) {
	if (collider.transform == player) {
		OnSpotted ();
	}
}

//A function executing the specified action
function OnSpotted () {
	if (behaviourOnSpotted && !behaviourOnSpotted.enabled) {
	
		behaviourOnSpotted.enabled = true;
		
	}
}


