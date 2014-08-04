/*
A class implementing the attack state with fuzzy logic weapon management
*/
class FuzzyAttackState extends BaseState{

	private static var instance:FuzzyAttackState;
	public static function Instance():FuzzyAttackState
    {
    	if (!instance) instance = new FuzzyAttackState();
    	 
        return instance;
    }
    
	public function Execute (controller:BaseEnemyController, stateMachine:FiniteStateMachine) {
		
		var targetDistance : float = Vector3.Distance(controller.TargetDirection, controller.Character.position);
		controller.motor.facingDirection = controller.TargetDirection - controller.Character.position;
		//Attack behaviour
		Attack(controller, stateMachine, targetDistance);
		
		//If too far, follow the target
		if (targetDistance >  controller.targetDistance + controller.attackRange)
			stateMachine.ChangeState(FuzzyFollowState.Instance());
	}
	
	//A method setting the shooting precision
	private function SetShootingAccuracy(motor:EnemyMovement, attackAccuracy : float){

		if (attackAccuracy < 1){
			var skewedAngle:float = (1 - attackAccuracy) * 40;
			motor.maxAngle = skewedAngle;
			
		}else
			motor.maxAngle = 0;
			
	}
	
	//Set of methods creating fuzzy sets
	private function GetRestSet(weaponInfo : WeaponInfo){
		var fullyRested:float = 1 / weaponInfo.frequency;
		
		return new RightShoulderSet(0.8 * fullyRested, 0, fullyRested*0.8);
	}
	
	private function GetHasAmmunitionSet(weaponInfo : WeaponInfo){
		var ammunitionMax:int = weaponInfo.ammunition;
		return new RightShoulderSet(0.4 * ammunitionMax, 0.2 * ammunitionMax, ammunitionMax * 0.8);
	}
	
	private function GetFarSet(maxTargetDistance : float){
		return new RightShoulderSet(maxTargetDistance * 0.9, 0, maxTargetDistance * 1);
	}
	
	private function GetHealthySet(maxHealth : float){
		return new RightShoulderSet(0.8 * maxHealth, 0.1 * maxHealth, maxHealth * 0.9);
	}
	
	//A function choosing a weapon
	private function ChooseWeapon(controller:BaseEnemyController, targetDistance:float, weaponHandler:WeaponHandler, pistol:GameObject, rocketLauncher:GameObject) : GameObject{
		
		var pistolInfo = pistol.GetComponentInChildren(WeaponInfo);
		
		var rocketLauncherInfo = rocketLauncher.GetComponentInChildren(WeaponInfo);
		
		//Defining sets
		var restSet = GetRestSet(rocketLauncherInfo);
		var farSet = GetFarSet(controller.targetDistance);
		
		var hasAmmunitionSet = GetHasAmmunitionSet(rocketLauncherInfo);
		
		//Calculating degrees of memberships
		var rested:float = restSet.CalculateDOM(Time.time - rocketLauncherInfo.activationTime);
		var far:float = farSet.CalculateDOM(targetDistance);
		var hasAmmunition:float = hasAmmunitionSet.CalculateDOM(rocketLauncherInfo.ammunitionLeft);
		
		var close:float = 1 - far;
		var tired:float = 1 - rested;
		var empty:float = 1 - hasAmmunition;
		
		//Fuzzy module choosing weapon
		var module:FuzzyModule = new FuzzyModule();
		
		//Adding fuzzy AND rules
		module.AddANDRule([Utils.FuzzyVery(hasAmmunition), Utils.FuzzyVery(far)], pistol);
		module.AddANDRule([empty, Utils.FuzzyFairly(far)], pistol);
		module.AddANDRule([empty, close], pistol);
		module.AddANDRule([Utils.FuzzyVery(hasAmmunition), close], pistol);
			
		module.AddANDRule([rested, Utils.FuzzyVery(far)], rocketLauncher);
		module.AddANDRule([rested, close], pistol);
		module.AddANDRule([tired, Utils.FuzzyFairly(far)], pistol);
		module.AddANDRule([tired, close], pistol);
			
		module.AddANDRule([rested, Utils.FuzzyVery(hasAmmunition)], rocketLauncher);
		module.AddANDRule([rested, empty], pistol);
		module.AddANDRule([tired, Utils.FuzzyVery(hasAmmunition)], pistol);
		module.AddANDRule([tired, empty], pistol);
			
		//Returning the weapon chosen
		return module.CombineRulesOR();			
	}
	
	private function ComputePrecision(controller : BaseEnemyController,  targetDistance : float, maxTargetDistance : float){
		
		
		//Defining fuzzy sets and degrees of memberships
		var far:float = GetFarSet(maxTargetDistance).CalculateDOM(targetDistance);
		
		var healthComponent:Health = controller.motor.transform.GetComponent.<Health> ();
		var healthy:float = GetHealthySet(healthComponent.maxHealth).CalculateDOM(healthComponent.health);
		far = Utils.FuzzyVery(far);
		
		var close:float = 1 - far;
		var unhealthy:float = 1 - healthy;	
		
		//Defining accuracy sets
		var goodAccuracy:RightShoulderSet = new RightShoulderSet(0.8, 0.2, 0.8);
		var badAccuracy:LeftShoulderSet = new LeftShoulderSet(0, 0.8, 0.2);
		
		var module:FuzzyModule = new FuzzyModule();
		
		//Fuzzy rules specifying attack accuracy		
		module.AddANDRule([healthy, close], goodAccuracy);
		module.AddANDRule([healthy, far], badAccuracy);
		module.AddANDRule([unhealthy, far], badAccuracy);
		module.AddANDRule([unhealthy, close], badAccuracy);
		
		//Returning the calculated precision
		return module.Defuzzify();
	}
	
	//A function handling attack behaviour
	private function Attack (baseController:BaseEnemyController, stateMachine:FiniteStateMachine, targetDistance:float) {
	
		var controller:Enemy4Controller = (baseController as Enemy4Controller);
		var weaponHandler:WeaponHandler = controller.weaponHandler;
		
		var pistol = weaponHandler.GetWeapon (1);
		var rocketLauncher = weaponHandler.GetWeapon (0);
		
		var maxTargetDistance = controller.targetDistance;
		
		var currentWeaponInfo:WeaponInfo = controller.weapon.GetComponentInChildren(WeaponInfo);
		//If weapon is loaded
		if (currentWeaponInfo.activationTime < 
			Time.time - 0.5/currentWeaponInfo.frequency){
			
			//Choose weapon
			var weaponChosen:GameObject = ChooseWeapon(controller,  targetDistance, weaponHandler, pistol, rocketLauncher);
			
			//Activate the new weapon
			controller.weapon.GetComponentInChildren(AutoFire).firing = false;
			controller.weapon = weaponHandler.SetWeapon(weaponChosen);
			controller.weapon.GetComponentInChildren(WeaponInfo).activationTime = Time.time;
			
			
			//Weapon 1
			if (weaponChosen == pistol){
				//Compute and set attack precision
				var precision:float = ComputePrecision(controller,  targetDistance, maxTargetDistance);
				
				SetShootingAccuracy(controller.motor, precision);
				
				controller.AutoShoot();
			}
			
			//Weapon 2
			if (weaponChosen == rocketLauncher){
			
				SetShootingAccuracy(controller.motor, 1);								
				
				controller.SingleShoot();
			}
			
		}
	}

}