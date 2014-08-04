/*
A script creating a glow effect, smoothly changing the colour of a model
*/

//A reference to the model
public var damageMaterial : GameObject;
public var initialColor : Color = Color.white;
public var glowColor : Color = Color.red;
public var duration : float = 0.5;
public var continous : boolean = false;

private var startTime : float;
private var fadeout : boolean;


//A function enabling the glow component
function OnGlow () { 
	this.enabled = true;
	
	fadeout = false;
	startTime =  Time.time;
		
}

function Update () {
	
	var time : float = Time.time - startTime;
	
	if (fadeout == true){
		time = duration * 2 - time;
	}
	
	//Calculating the colour in relation to the time passed
	var r : float = Mathf.Lerp(initialColor.r, glowColor.r, time);
	var g : float = Mathf.Lerp(initialColor.g, glowColor.g, time);
	var b : float = Mathf.Lerp(initialColor.b, glowColor.b, time);
	
	var appliedColor:Color = Color(r , g, b, time);
	
	//Changing the colour back
	if (time >= duration) 
		fadeout = true; 
	
	
	if (Time.time - startTime >= duration * 2) {
		if (continous){
			startTime =  Time.time;
			fadeout = false; 
		}else{
			this.enabled = false;
		}
	}
	damageMaterial.renderer.material.SetColor ("_Color", appliedColor);	
	
}
