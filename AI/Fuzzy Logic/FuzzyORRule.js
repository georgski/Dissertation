/*
A class implementing fuzzy rule with antecedants connected using fuzzy OR operator.
*/
class FuzzyORRule extends FuzzyRule{
	
	public function FuzzyORRule(antecedents:float[], consequent:float){
		var max:float = -1;
		
		//Combine the antecedants
		for(var i:int = 0; i<antecedents.length ; i++){
			max = Utils.FuzzyOR(max, antecedents[i]);
		}
		
		super(max, consequent);
	}
	
}