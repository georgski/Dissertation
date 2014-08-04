/*
A class storing information about a given weapon type. The values are set from the Unity panel
*/

public var frequency : float;
public var damagePerSecond : float;
public var forcePerSecond : float;
public var ammunition:int = Mathf.Infinity;
public var ammunitionLeft:int = Mathf.Infinity;
public var activationTime:float;
public var loadTime:float;
public var shot:boolean = false;