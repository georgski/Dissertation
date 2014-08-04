/*
A class implementing fuzzy module handling fuzzy rule evaluation and defuzzification
*/
class FuzzyModule{
	private var rules:List.<FuzzyRule>;
	
	public function FuzzyModule(){
		rules = new List.<FuzzyRule>();
	}
	
	public function AddANDRule(antecedents, consequent:Object){
		rules.Add(new FuzzyANDRule(antecedents, consequent));
	}
	
	public function AddORRule(antecedents, consequent:Object){
		rules.Add(new FuzzyORRule(antecedents, consequent));
	}
	
	//Functions calculating returning the consequent by combining the rules using AND or OR operator
	public function CombineRulesOR():Object{
		var max:float = -1;
		var index:int;
		for(var i:int = 0; i<rules.Count ; i++){
			max = Utils.FuzzyOR(max, rules[i].Antecedents);
			if (rules[i].Antecedents==max){ 
				index = i;
			}
		}
		return rules[index].Consequent;
	}
	
	public function CombineRulesAND():Object{
		var min:float = Mathf.Infinity;
		var index:int;
		for(var i:int = 0; i<rules.Count ; i++){
			min = Utils.FuzzyAND(min, rules[i].Antecedents);
			if (rules[i].Antecedents==min){ 
				index = i;
			}
		}
		return rules[index].Consequent;
	}
	
	//Average of Maxima defuzzification method
	private function AverageOfMaxima(membershipValues:float[], consequents:FuzzySet[]):float{
		var finalOutput:float = 0;
		var sumOfConfidence:float = 0;
		
		//Calculating weighted mean
		for(var i = 0; i<consequents.length ; i++){
			finalOutput += consequents[i].RepresentativePoint * membershipValues[i];
			sumOfConfidence += membershipValues[i];
		}
		
		return finalOutput / sumOfConfidence;
	}
	
	//A function performing defuzzification
	public function Defuzzify():float{
		
		var consequentNames:List.<FuzzySet> = new List.<FuzzySet>(); 
		var membershipValues:List.<float> = new List.<float>();
		
		//Collect all unique consequents
		for(var i:int = 0; i<rules.Count ; i++)
			if (consequentNames.Contains(rules[i].Consequent)==false){
				consequentNames.Add(rules[i].Consequent);
				membershipValues.Add(0.0f);
		}
		
		//Choose best consequents (OR)
		for(var j:int = 0; j<consequentNames.Count ; j++)
			for(i = 0; i<rules.Count ; i++)
				if (rules[i].Consequent==consequentNames[j]){
					membershipValues[j] = Utils.FuzzyOR(membershipValues[j], rules[j].Antecedents);
		}
		
		//Defuzzify
		return AverageOfMaxima(membershipValues.ToArray(), consequentNames.ToArray()); 
	}
}