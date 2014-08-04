/*
A class representing fuzzy set
*/
class FuzzySet{
	//Set's boundaries
	protected var leftOffset:float;
	protected var rightOffset:float;
	protected var peakPoint:float;
	//Representative point used by defuzzification method
	protected var representativePoint:float;
	
	function FuzzySet(leftOffset, rightOffset, peakPoint){
		this.leftOffset = leftOffset;
		this.rightOffset = rightOffset;
		this.peakPoint = peakPoint;
	}
	
	public function get RepresentativePoint () : float { 
		return representativePoint; 
	}
}