/*
A script performing unit tests
*/
public function Awake () {
	Debug.Log(AStarHelperTest());
	Debug.Log(FuzzyLeftShoulderSetTest());
	Debug.Log(FuzzyRightShoulderSetTest());
	Debug.Log(FuzzyORRuleTest());
	Debug.Log(FuzzyANDRuleTest());
	Debug.Log(FuzzyModuleCombineORTest());
	Debug.Log(FuzzyModuleCombineANDTest());
	Debug.Log(FuzzyModuleDefuzzifyTest());
	Debug.Log(FuzzyORTest());
	Debug.Log(FuzzyANDTest());
	Debug.Log(FuzzyFairlyTest());
	Debug.Log(FuzzyVeryTest());
	Debug.Log(ObbIntersectionTest());
	
}

private function AStarHelperTest() : boolean{
	var numberOfNodes = 10;
	
	var graph:List.<MeshNode> = new List.<MeshNode>();
	
	for(var i:int = 0; i < numberOfNodes; i++){
		var node : MeshNode = new MeshNode(Vector2(0, i), Vector3.zero);
		if (i > 0){
			graph[i-1].connections.Add(node);
			node.connections.Add(graph[i-1]);
		}
		graph.Add(node);
	}
	
	var path : List.<MeshNode> = AStarHelper.CalculatePath(graph[0], graph[numberOfNodes-1]); 
	
	var middle = numberOfNodes / 2;
	
	return (path[middle] == graph[middle]);
}

private function FuzzyLeftShoulderSetTest() : boolean{

	var peakPoint : float = 0;
	var rightOffset : float = 1;
	var middle : float = rightOffset / 2;
	
	var fuzzySet : LeftShoulderSet = new LeftShoulderSet(0, rightOffset, peakPoint);
	var degreeOfMembership = fuzzySet.CalculateDOM(middle);
	
	if (degreeOfMembership != middle) 
		return false;
		
	return true;
}

private function FuzzyRightShoulderSetTest() : boolean{

	var peakPoint : float = 1;
	var leftOffset : float = 1;
	var middle : float = peakPoint / 2;
	
	var fuzzySet : RightShoulderSet = new RightShoulderSet(leftOffset, 0, peakPoint);
	var degreeOfMembership = fuzzySet.CalculateDOM(middle);
	
	if (degreeOfMembership != middle) 
		return false;
		
	return true;
}

private function FuzzyORRuleTest() : boolean{
	
	var numberOfAntecedents : int = 10;
	var antecedents = new float[numberOfAntecedents];
	
	for (var i : int = 0; i < numberOfAntecedents; i++)
		antecedents[i] = i;
		
	var fuzzyORRule : FuzzyORRule = new FuzzyORRule(antecedents, 0);
	
	if (fuzzyORRule.Antecedents != numberOfAntecedents - 1)
		return false;
		
	return true;
}

private function FuzzyANDRuleTest() : boolean{
	
	var numberOfAntecedents : int = 10;
	var antecedents = new float[numberOfAntecedents];
	
	for (var i : int = 0; i < numberOfAntecedents; i++)
		antecedents[i] = i;
		
	var fuzzyORRule : FuzzyANDRule = new FuzzyANDRule(antecedents, 0);
	
	if (fuzzyORRule.Antecedents != 0)
		return false;
		
	return true;
}

private function FuzzyModuleCombineORTest() : boolean{
	
	var fuzzyModule : FuzzyModule = new FuzzyModule();
	
	var numberOfRules : int = 10;
	
	for (var i : float = 0; i < numberOfRules; i++) 
		fuzzyModule.AddORRule([i], numberOfRules - i);
	
	if (fuzzyModule.CombineRulesOR() != 1)
		return false;
		
	return true;
}

private function FuzzyModuleCombineANDTest() : boolean{
	
	var fuzzyModule : FuzzyModule = new FuzzyModule();
	
	var numberOfRules : int = 10;
	
	for (var i : float = 0; i < numberOfRules; i++) 
		fuzzyModule.AddANDRule([i], numberOfRules - i);
	
	if (fuzzyModule.CombineRulesAND() != numberOfRules)
		return false;
		
	return true;
}

private function FuzzyModuleDefuzzifyTest() : boolean{
	
	var fuzzyModule : FuzzyModule = new FuzzyModule();
	
	var numberOfRules : int = 10;
	
	var fuzzySet : RightShoulderSet = new RightShoulderSet(1, 0, 1);
	var inverseFuzzySet : LeftShoulderSet = new LeftShoulderSet(0, 1, 0);
	
	for (var i : float = 0; i < numberOfRules / 2; i++) 
		fuzzyModule.AddANDRule([i], fuzzySet);
		
	for (i = numberOfRules / 2; i < numberOfRules; i++) 
		fuzzyModule.AddANDRule([i], inverseFuzzySet);
		
	if (fuzzyModule.Defuzzify() != 0)
		return false;
		
	return true;
}

private function FuzzyANDTest() : boolean{
	var min : float = 0;
	var max : float = 1;
	var value = Utils.FuzzyAND(min, max);
	
	if (value != Mathf.Min(min, max)) 
		return false;
	
	return true;
}

private function FuzzyORTest() : boolean{
	var min : float = 0;
	var max : float = 1;
	var value = Utils.FuzzyOR(min, max);
	
	if (value != Mathf.Max(min, max)) 
		return false;
	
	return true;
}

private function FuzzyFairlyTest() : boolean{
	var number = 10;
	var value : float = Utils.FuzzyFairly(number);
	
	if (value != Mathf.Sqrt(number)) 
		return false;
	
	return true;
}

private function FuzzyVeryTest() : boolean{
	var number = 10;
	var value : float = Utils.FuzzyVery(number);
	
	if (value != Mathf.Pow(number, 2)) 
		return false;
	
	return true;
}

private function ObbIntersectionTest() : boolean{

	var rectangle = Utils.BuildRectangleArrayFromMinMax(Vector3(0,0), Vector3(10,10));
	var rectangle1 = Utils.BuildRectangleArrayFromMinMax(Vector3(5,5), Vector3(2,2));
		
	if (Utils.ObbIntersectionTest(rectangle, rectangle1) != true) 
		return false;
	
	rectangle = Utils.BuildRectangleArrayFromVertices(Vector3(0, 0, 1), Vector3(1, 0, 1), Vector3(2, 0, 1), Vector3(0, 0, 0));
	rectangle1 = Utils.BuildRectangleArrayFromVertices(Vector3(0, 0, 0), Vector3(0, 0, 1), Vector3(1, 0, 1), Vector3(1, 0, 0));
	
	if (Utils.ObbIntersectionTest(rectangle, rectangle1) != true) 
		return false;
	
	rectangle = Utils.BuildRectangleArrayFromVertices(Vector3(10, 0, 10), Vector3(11, 0, 10), Vector3(11, 0, 11), Vector3(10, 0, 11));
	
	if (Utils.ObbIntersectionTest(rectangle, rectangle1) != false) 
		return false;
			
	return true;
}