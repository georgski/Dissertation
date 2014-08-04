/*
A health component keeping track of health-points
*/
public var maxHealth : float = 100.0;
public var health : float = 100.0;
public var invincible : boolean = false;

public var glowEffect : MonoBehaviour;

//Signals send to components on damage and destructon events
public var damageSignals : SignalSender;
public var dieSignals : SignalSender;


function Awake () {
	enabled = false;
}

function glow () {
	if (glowEffect.enabled == false)
		glowEffect.enabled = true;
}
function OnDamage (amount : float, fromDirection : Vector3) {
	
	if(invincible)
		return;	
	
	//Substract the health-points
	health -= amount;
	
	//Activate damage-related events
	damageSignals.SendSignals (this);
	
	
	// Die if no health left
	if (health <= 0)
	{
		health = 0;
		//Activate destruction-related events
		dieSignals.SendSignals (this);
		
		enabled = false;
		
	}
}
