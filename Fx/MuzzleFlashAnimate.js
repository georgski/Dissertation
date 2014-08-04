/*
A script animating muzzle flash effect upon firing 
*/
function Update () {
	transform.localScale = Vector3.one * Random.Range(0.6,1.4);
	transform.localEulerAngles.z = Random.Range(0,90.0);
}