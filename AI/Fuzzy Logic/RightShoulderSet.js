/*
A class representing fuzzy set with plateau on the left hand side
*/
class RightShoulderSet extends FuzzySet{

	public function RightShoulderSet(leftOffset:float, rightOffset:float, peakPoint:float){
		super(leftOffset, rightOffset, peakPoint);
		representativePoint = ((peakPoint + rightOffset) + peakPoint) / 2;
	}
	
	public function CalculateDOM(value : float):float{
		if (value == peakPoint) return 1;
		//find DOM if left of center 
		
		if ( (value <= peakPoint) && (value > (peakPoint - leftOffset)) ) { 
			var grad:float = 1.0 / leftOffset;
			return grad * (value - (peakPoint - leftOffset));
		}
		//find DOM if right of center 
		else if (value > peakPoint) { 
			return 1; 
		}
		//out of range
		else { 
			return 0; 
		}
	}
	
}