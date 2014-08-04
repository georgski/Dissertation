/*
A base class for other state classes
Unity does not support abstract classes therefore the methods are empty.
*/
public class BaseState{
	
	//A function executed on state activation
	public function Enter (owner:BaseEnemyController){}
	
	//A function executed every game cycle
	public function Execute (owner:BaseEnemyController, stateMachine:FiniteStateMachine){}
	
	//A function executed on state termination
	public function Exit (owner:BaseEnemyController){}
}