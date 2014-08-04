/*
A player controller script taken from the Unity sample project.
*/

// Objects to drag in
public var motor : PlayerMovement;
public var character : Transform;
public var cursorPrefab : GameObject;
public var joystickPrefab : GameObject;

// Camera settings
public var cameraSmoothing : float = 0.01;
public var cameraPreview : float = 2.0f;

// Private memeber data
private var mainCamera : Camera;

private var cursorObject : Transform;
private var joystickLeft : Joystick;
private var joystickRight : Joystick;

private var mainCameraTransform : Transform;
private var cameraVelocity : Vector3 = Vector3.zero;
private var cameraOffset : Vector3 = Vector3.zero;
private var initOffsetToPlayer : Vector3;

// Prepare a cursor point varibale. This is the mouse position on PC and controlled by the thumbstick on mobiles.
private var cursorScreenPosition : Vector3;

//Player movement plane used to calculate position of cursor
private var playerMovementPlane : Plane;

private var joystickRightGO : GameObject;

private var screenMovementSpace : Quaternion;
private var screenMovementForward : Vector3;
private var screenMovementRight : Vector3;

function Awake () {		
	motor.movementDirection = Vector2.zero;
	motor.facingDirection = Vector2.zero;
	
	// Set main camera
	mainCamera = Camera.main;
	mainCameraTransform = mainCamera.transform;
	
	// Setting character
	if (!character)
		character = transform;
	
	// Setting offset between camera and player
	initOffsetToPlayer = mainCameraTransform.position - character.position;
	
	//Setting on-screen controlls depending on targeted platform
	#if UNITY_IPHONE || UNITY_ANDROID
		if (joystickPrefab) {
			// Creating thumbsticks on mobile devices
			var joystickLeftGO : GameObject = Instantiate (joystickPrefab) as GameObject;
			joystickLeftGO.name = "Joystick Left";
			joystickLeft = joystickLeftGO.GetComponent.<Joystick> ();
			
			joystickRightGO = Instantiate (joystickPrefab) as GameObject;
			joystickRightGO.name = "Joystick Right";
			joystickRight = joystickRightGO.GetComponent.<Joystick> ();			
		}
	#else
		if (cursorPrefab) {
			// Creating cursor on PC
			cursorObject = (Instantiate (cursorPrefab) as GameObject).transform;
		}
	#endif
	
	// Saving camera offset to be used in the first frame
	cameraOffset = initOffsetToPlayer;
	
	// Setting the initial cursor position to the center of the screen
	cursorScreenPosition = Vector3 (0.5 * Screen.width, 0.5 * Screen.height, 0);
	
	// caching movement plane
	playerMovementPlane = new Plane (character.up, character.position + character.up);
}

function Start () {
	#if UNITY_IPHONE || UNITY_ANDROID
		// Move to right side of screen
		var guiTex : GUITexture = joystickRightGO.GetComponent.<GUITexture> ();
		guiTex.pixelInset.x = Screen.width - guiTex.pixelInset.x - guiTex.pixelInset.width;			
	#endif	
	
	// it's fine to calculate this on Start () as the camera is static in rotation
	
	screenMovementSpace = Quaternion.Euler (0, mainCameraTransform.eulerAngles.y, 0);
	screenMovementForward = screenMovementSpace * Vector3.forward;
	screenMovementRight = screenMovementSpace * Vector3.right;	
	
}

function OnDisable () {
	if (joystickLeft) 
		joystickLeft.enabled = false;
	
	if (joystickRight)
		joystickRight.enabled = false;
}

function OnEnable () {
	if (joystickLeft) 
		joystickLeft.enabled = true;
	
	if (joystickRight)
		joystickRight.enabled = true;
}

function Update () {
	// Setting direction of player movement
	#if UNITY_IPHONE || UNITY_ANDROID
		motor.movementDirection = joystickLeft.position.x * screenMovementRight + joystickLeft.position.y * screenMovementForward;
	#else
		motor.movementDirection = Input.GetAxis ("Horizontal") * screenMovementRight + Input.GetAxis ("Vertical") * screenMovementForward;
	#endif
	
	// Ensuring that the direction vector is does not exceed 1
	if (motor.movementDirection.sqrMagnitude > 1)
		motor.movementDirection.Normalize();
	
	
	//Updating player movement plane
	playerMovementPlane.distance = -character.position.y;
	
	// Adjusting the camera based on cursor or joysticks position
	
	var cameraAdjustmentVector : Vector3 = Vector3.zero;
	
	#if UNITY_IPHONE || UNITY_ANDROID
	
		// On mobiles, use the thumb stick and convert it into screen movement space
		motor.facingDirection = joystickRight.position.x * screenMovementRight + joystickRight.position.y * screenMovementForward;
				
		cameraAdjustmentVector = motor.facingDirection;		
	
	#else
	
		#if !UNITY_EDITOR && (UNITY_XBOX360 || UNITY_PS3)

			// On consoles use the analog sticks
			var axisX : float = Input.GetAxis("LookHorizontal");
			var axisY : float = Input.GetAxis("LookVertical");
			motor.facingDirection = axisX * screenMovementRight + axisY * screenMovementForward;
	
			cameraAdjustmentVector = motor.facingDirection;		
		
		#else
	
			// On PC, the cursor point is the mouse position
			var cursorScreenPosition : Vector3 = Input.mousePosition;
						
			// Find out where the mouse ray intersects with the movement plane of the player
			var cursorWorldPosition : Vector3 = ScreenPointToWorldPointOnPlane (cursorScreenPosition, playerMovementPlane, mainCamera);
			
			var halfWidth : float = Screen.width / 2.0f;
			var halfHeight : float = Screen.height / 2.0f;
			var maxHalf : float = Mathf.Max (halfWidth, halfHeight);
			
			// Calculating relative screen position			
			var posRel : Vector3 = cursorScreenPosition - Vector3 (halfWidth, halfHeight, cursorScreenPosition.z);		
			posRel.x /= maxHalf; 
			posRel.y /= maxHalf;
						
			cameraAdjustmentVector = posRel.x * screenMovementRight + posRel.y * screenMovementForward;
			cameraAdjustmentVector.y = 0.0;	
									
			// Setting the facing direction to the direction from the character to the cursor world position
			motor.facingDirection = (cursorWorldPosition - character.position);
			motor.facingDirection.y = 0;			
			
			// Drawing cursor
			HandleCursorAlignment (cursorWorldPosition);
			
		#endif
		
	#endif
		
	// Setting the camera
		
	// Set the target position of the camera to point at the focus point
	var cameraTargetPosition : Vector3 = character.position + initOffsetToPlayer + cameraAdjustmentVector * cameraPreview;
	
	// Apply some smoothing to the camera movement
	mainCameraTransform.position = Vector3.SmoothDamp (mainCameraTransform.position, cameraTargetPosition, cameraVelocity, cameraSmoothing);
	
	// Save camera offset so we can use it can be used in the next frame
	cameraOffset = mainCameraTransform.position - character.position;
}

public static function PlaneRayIntersection (plane : Plane, ray : Ray) : Vector3 {
	var dist : float;
	plane.Raycast (ray, dist);
	return ray.GetPoint (dist);
}

public static function ScreenPointToWorldPointOnPlane (screenPoint : Vector3, plane : Plane, camera : Camera) : Vector3 {
	// Set up a ray corresponding to the screen position
	var ray : Ray = camera.ScreenPointToRay (screenPoint);
	
	// Find out where the ray intersects with the plane
	return PlaneRayIntersection (plane, ray);
}

function HandleCursorAlignment (cursorWorldPosition : Vector3) {
	if (!cursorObject)
		return;
	
	// Set the position of the cursor object
	cursorObject.position = cursorWorldPosition;
	
	// Hiding mouse cursor
	Screen.showCursor = (Input.mousePosition.x < 0 || Input.mousePosition.x > Screen.width || Input.mousePosition.y < 0 || Input.mousePosition.y > Screen.height);
	
	
	
	// Cursor rotation
	
	var cursorWorldRotation : Quaternion = cursorObject.rotation;
	if (motor.facingDirection != Vector3.zero)
		cursorWorldRotation = Quaternion.LookRotation (motor.facingDirection);
	
	// Calculate cursor rotation
	var cursorScreenspaceDirection : Vector3 = Input.mousePosition - mainCamera.WorldToScreenPoint (transform.position + character.up);
	cursorScreenspaceDirection.z = 0;
	var cursorBillboardRotation : Quaternion = mainCameraTransform.rotation * Quaternion.LookRotation (cursorScreenspaceDirection, -Vector3.forward);
	
	// Set cursor rotation
	cursorObject.rotation = Quaternion.Slerp (cursorWorldRotation, cursorBillboardRotation, 1/*cursorFacingCamera*/);
	
	//Cursor scaling
	
	// Cursor gets smaller with perspective.
	// Scaling by the inverse of the distance to the camera plane
	var compensatedScale : float = 0.1 * Vector3.Dot (cursorWorldPosition - mainCameraTransform.position, mainCameraTransform.forward);
	
	// Make the cursor smaller when close to character
	var cursorScaleMultiplier : float = Mathf.Lerp (0.7, 1.0, Mathf.InverseLerp (0.5, 4.0, motor.facingDirection.magnitude));
	
	// Set the final scale of the cursor
	cursorObject.localScale = Vector3.one * Mathf.Lerp (compensatedScale, 1, 0/*cursorSmallerWithDistance*/) * cursorScaleMultiplier;
	
}
