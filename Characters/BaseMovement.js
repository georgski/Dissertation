/*
Base motor movement class
*/
public class BaseMovement extends MonoBehaviour{
//Direction of character's movement
@HideInInspector
public var movementDirection : Vector3;

//Direction the character is facing
@HideInInspector
public var facingDirection : Vector3 = Vector3.zero;

//Walking speed
public var walkingSpeed:float = 3.0;

}