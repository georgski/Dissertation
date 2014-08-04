/*
A script fading out a scene
*/
 
 
public var dimmingTexture : Texture2D;
public var dimSpeed = 0.2;
 
private var transparency = 0.0; 
 
function OnGUI(){
 	
 	//calculate transparency of the image covering screen
    transparency += dimSpeed * Time.deltaTime;  
    transparency = Mathf.Clamp01(transparency);   
 
    GUI.color.a = transparency;
 	
 	//draw the image
    GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height), dimmingTexture);
  
  	//end game if dimming complete
    if (transparency == 1)
    	Application.Quit();
}