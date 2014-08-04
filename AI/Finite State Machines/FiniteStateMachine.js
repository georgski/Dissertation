/*
A class representing finite-state machine.
*/
class FiniteStateMachine{
  //A reference to the enemy
  private var owner : BaseEnemyController;
  private var currentState:BaseState;
 
  //A function initialising a finite state machine with a given state
  public function Configure(stateOwner : BaseEnemyController, initialState : BaseState){
    owner = stateOwner;
    ChangeState(initialState);
  }
  
  //A function changing state
  function ChangeState(newState:BaseState) {
  	if (currentState == newState)
  		return;
  		
    if (currentState != null)
      	currentState.Exit(owner);
      
     currentState = newState;
     
      if (currentState != null)
        currentState.Enter(owner);
  }
 	
  //A function executing active state every game cycle
  public function Update() {
  		if (currentState != null) 
    		currentState.Execute(owner, this);
  }
  
}