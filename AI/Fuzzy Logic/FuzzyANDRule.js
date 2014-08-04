/*
A class implementing fuzzy rule with antecedants connected using fuzzy AND operator.
*/

class FuzzyANDRule extends FuzzyRule{
		
	public function FuzzyANDRule(antecedents:float[], consequent){
		var min:float = Mathf.Infinity;
		
		//Combine the antecedants
		for(var i:int = 0; i<antecedents.length ; i++){
			min = Utils.FuzzyAND(min, antecedents[i]);
		}
		
		super(min, consequent);
	}
		
}