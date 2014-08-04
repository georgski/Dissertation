/*
A script moving object (boat) towards the specified destination
*/

public var glowBehaviour:Glow;
public var destination:GameObject;
public var speed:float = 2.5;

function OnEnable () {

	/*Setting the player to be a child of boat game object, 
	so that the player moves with the boat*/
	var player = GameObject.FindWithTag ("Player");
	player.transform.parent = transform;
	
	//Stopping player's animations
	var animator = player.GetComponentInChildren(PlayerAnimation);
		if (animator) {
			animator.enabled = false;
			DestroyObject(animator);
			(player.GetComponentInChildren(Animation)).CrossFade("idle");
		}
	
	//Stop glowing
	glowBehaviour.continous = false;
	
	//Dim screen
	Camera.main.GetComponentInChildren(Dim).enabled = true;
}

function Update () {
	//boat translation
	var direction = destination.transform.position - transform.position;
	transform.position +=  direction.normalized * Time.deltaTime * speed;
}
