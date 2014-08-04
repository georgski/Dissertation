/*
A script handling actions related to weapons
*/

//List of managed weapons
public var weapons : GameObject[];

//Currently active weapon
private var activeWeapon : int;

function Awake () {

	activeWeapon = 1;
	
	//Disabling inactive weapons
	for(var i:int = 0; i<weapons.Length; i++){
		if (i != activeWeapon)
			weapons[i].renderer.enabled =false;
	}
}

//Functions turning on and off auto-attack
function OnStartFire () {
	if (Time.timeScale == 0)
		return;
	
	weapons[activeWeapon].GetComponentInChildren(AutoFire).firing = true;
}

function OnStopFire () {
	weapons[activeWeapon].GetComponentInChildren(AutoFire).firing = false;
}

//Functions getting and setting active weapon
function GetWeaponInfo (index:int):WeaponInfo {
	var info = weapons[index].GetComponentInChildren(WeaponInfo);
	return info;
}

function SetWeapon (weapon:GameObject):GameObject  {
	var index = Utils.GetIndexOf(weapon, weapons);
	
	if (index == -1)
		return null;
	
	return SetWeapon (index);
}

function SetWeapon (index:int):GameObject  {
	//If the weapon is already active, terminate
	if (index == activeWeapon) 
		return weapons[activeWeapon];
	
	//Deactivate currently used weapon
	weapons[activeWeapon].renderer.enabled =false;
	
	//Activate new weapon
	weapons[index].renderer.enabled =true;
	weapons[index].GetComponentInChildren(AutoFire).muzzleFlashFront.active = false;
	activeWeapon = index;
	
	return weapons[activeWeapon];
}

function GetWeapon(number:int):GameObject{
	return weapons[number];
}

//Switch weapon to the next one
function OnSwitchWeapon ():GameObject {
	
	weapons[activeWeapon].renderer.enabled =false;
	activeWeapon++;
	
	if (activeWeapon >= weapons.Length)
		activeWeapon = 0;
		
	weapons[activeWeapon].renderer.enabled =true;
	
	weapons[activeWeapon].GetComponentInChildren(AutoFire).muzzleFlashFront.active = false;
	return weapons[activeWeapon];
}