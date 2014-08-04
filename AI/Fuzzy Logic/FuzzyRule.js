/*
A class representing a fuzzy rule
*/
class FuzzyRule{
	
	protected var antecedents:float;
	protected var consequent:Object;
	
	public function FuzzyRule(antecedents:float, consequent:Object){
		this.antecedents = antecedents;
		this.consequent = consequent;
	}
	
	public function get Antecedents () : float { 
		return antecedents; 
	}
	
	public function get Consequent ():Object { 
		return consequent; 
	}
}