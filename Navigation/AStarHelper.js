/*A class implementing the A* algorithm
Implementation based on Wikipedia article: http://en.wikipedia.org/wiki/A*_search_algorithm
*/
public static class AStarHelper
{
	//Calculating heuristic cost
	function CalculateHeuristicCost(start:MeshNode, goal:MeshNode):float
	{
		return Vector3.Distance(start.bounds.center, goal.bounds.center);
	}
 
	// Find the current lowest score path
	function FindBestNode(openSet: List.<MeshNode>, nodeValues:Dictionary.<MeshNode, float>):MeshNode
	{
		var index:int = 0;
		var lowScore:float = float.MaxValue;
 		
		for(var i:int = 0; i < openSet.Count; i++)
		{
			if((nodeValues[openSet[i]] > lowScore))
				continue;
			index = i;
			lowScore = nodeValues[openSet[i]];
		}
		
		return openSet[index];
	}
 
 
	// Calculate the A* path
	function CalculatePath(start:MeshNode, goal:MeshNode):List.<MeshNode>
	{
		if (start == goal) {
			return;
		}
		
		//Evaluated nodes
		var closedSet = new List.<MeshNode>();    
		//Nodes to evaluate
		var openSet = new List.<MeshNode>(); 
		openSet.Add(start);
		
		//Dictionary maintaining path
     	var currentPath:Dictionary.<MeshNode, MeshNode> = new Dictionary.<MeshNode, MeshNode>();    
 		
 		//Costs from start
		var gCost = new Dictionary.<MeshNode, float>();
		gCost[start] = 0.0f; 
 		
 		//Heuristic costs
		var hCost = new Dictionary.<MeshNode, float>();
		hCost[start] = CalculateHeuristicCost(start, goal); 
 		
 		//Total costs
		var fCost = new Dictionary.<MeshNode, float>();
		fCost[start] = hCost[start];
 		
		while(openSet.Count != 0)
		{
			var bestNode:MeshNode = FindBestNode(openSet, fCost);
			
			//Goal found
			if(bestNode.Equals(goal))
			{
				var pathPoints = new List.<MeshNode>();
				ReconstructPath(currentPath, bestNode, pathPoints);
				return pathPoints;
			}
			
			openSet.Remove(bestNode);
			closedSet.Add(bestNode);
			
			//Expanding adjacent nodes
			for (var i:int = 0; i < bestNode.connections.Count; i++)
			{
				var currentNode:MeshNode = bestNode.connections[i];
				if(closedSet.Contains(currentNode))
					continue;
				var tentativeGCost:float = gCost[bestNode] + Vector3.Distance(bestNode.bounds.center, currentNode.bounds.center);
 				
 				//Expanding new node
				if(openSet.Contains(currentNode)==false || (tentativeGCost < gCost[currentNode]))
				{
					openSet.Add(currentNode);
					currentPath[currentNode] = bestNode;
					
					//Calculating costs
					gCost[currentNode] = tentativeGCost;
					hCost[currentNode] = CalculateHeuristicCost(currentNode, goal);
					fCost[currentNode] = gCost[currentNode] + hCost[currentNode];
				}
			}
		}
 
     return null;
 
	}
 
	//Reconstructing the found path
	function ReconstructPath(path:Dictionary.<MeshNode, MeshNode>, currentNode:MeshNode, result:List.<MeshNode>)
	{		
		if(path.ContainsKey(currentNode))
		{
			ReconstructPath(path, path[currentNode], result);
			result.Add(currentNode);
			return;
		}
		result.Add(currentNode);
	}
}