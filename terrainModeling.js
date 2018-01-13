/**
* @fileoverview This file is responsible for all of the terrain generation and manipulation
* calls. 
*/

/**
* Function to initialize a flat, square terrain with (n+1) x (n+1) vertices
* @param {int} n Number of vertices to create in each direction
* @param {float} minX Lower bound of X values to position terrain
* @param {float} maxX Upper bound of X values to position terrain
* @param {float} minY Lower bound of Y values to position terrain
* @param {float} maxY Upper bound of Y values to position terrain
* @param {Array.<[float, float, float]>} vertexArray Array of floats
* @param {Array.<[int, int, int]>} faceArray Array of integers specifing
* @param {Array.<[float, float, float]>} normalArray Array of floats
* @return {int} Number of triangles created
*/
function terrainFromIteration(n, minX,maxX,minY,maxY, vertexArray, faceArray, normalArray)
{
    // segment X and Y range into n parts
    var deltaX=(maxX-minX)/n;
    var deltaY=(maxY-minY)/n;
    
    // create all arrays by iterating over each vertex
    for(var i=0;i<=n;i++)
       for(var j=0;j<=n;j++)
       {
           vertexArray.push(minX+deltaX*j);
           vertexArray.push(minY+deltaY*i);
           vertexArray.push(0);
           
           normalArray.push(0);
           normalArray.push(0);
           normalArray.push(0);
       }

    var numT=0;
    // create triangles from left to right, row by row
    for(var i=0;i<n;i++)
       for(var j=0;j<n;j++)
       {
           var vid = i*(n+1) + j;
           faceArray.push(vid);
           faceArray.push(vid+1);
           faceArray.push(vid+n+1);
           
           faceArray.push(vid+1);
           faceArray.push(vid+1+n+1);
           faceArray.push(vid+n+1);
           numT+=2;
       }
    
    return numT;
}

/**
* This function applies the color map to the terrain. Depending on the height
*   vertices take on different colors
* @param {Array.<[float, float, float]} vTerrain Array of floats
*   indicating the X,Y,Z coordinates of each vertex in space
* @param {int} numV Number of vertices
* @param {Array.<[float, float, float, float]} cTerrain Array of RGB(alpha) values
*   to color the terrain. Initially is empty. After this function, is completely full.
* @return None
*/
function colorTerrain(vTerrain, numV, colorOfTerrain){
    for (var i = 0; i < numV; i++){
        // color terrain white
        if (vTerrain[3*i + 2] >= 0.9*max){
            colorOfTerrain.push(1.0);
            colorOfTerrain.push(1.0);
            colorOfTerrain.push(1.0);
            colorOfTerrain.push(1.0);
        }
        // color terrain brown
        else if (vTerrain[3*i + 2] >= 0.7 * max){
            colorOfTerrain.push(0.64);
            colorOfTerrain.push(0.16);
            colorOfTerrain.push(0.16);
            colorOfTerrain.push(1.0);
        }
        // color terrain green
        else if (vTerrain[3*i + 2] >= 0.4 * max){
            colorOfTerrain.push(0.0);
            colorOfTerrain.push(0.34);
            colorOfTerrain.push(0.0);
            colorOfTerrain.push(1.0);
        } else {
            colorOfTerrain.push(0.15);
            colorOfTerrain.push(0.6);
            colorOfTerrain.push(0.2);
            colorOfTerrain.push(1.0);
        }
    }
}

/**
* This function performs the diamond-square algorithm for terrain generation.
*   It takes in a flat terrain and adds height to the terrain to give the
*   impression of mountains.
* @param {Array.<[float, float, float]>} vTerrain Array of floats
*   indicating the X,Y,Z coordinates of each vertex in space
* @param {int} num_col Number of columns (and rows) in the terrain
* @return None
*/
function diamondSquare(n, vTerrain){
    
    var corner1 = 0;
    var corner2 = n;
    var corner3 = n*(n + 1);
    var corner4 = (n + 1) * (n + 1) - 1;
    var num_col = n + 1;
    
    // calculate heights for original corners
    vTerrain[corner1*3 + 2] = Math.random();
    vTerrain[corner2*3 + 2] = Math.random();
    vTerrain[corner3*3 + 2] = Math.random();
    vTerrain[corner4*3 + 2] = Math.random();
    
    var queue = new Queue();
    var size = 0.5*(corner2-corner1)*3
    // intial middle
    var mid = corner1 + size + size*num_col; 
    // scale for controling the increment of height
    var scale = 1;
    
    queue.push(mid);
    queue.push(size/2);
    queue.push(scale*2);
   
    // iterate over all vertices in the terrain to give height
    while (!queue.isEmpty()){
        // get last center point index, size of square and new scale
        mid = queue.pop();
        size = queue.pop();
        scale = queue.pop();
                
        // calculate middle height
        vTerrain[mid+2] = averageOfNeighbors(mid, 2*size, num_col, vTerrain) + Math.random()/scale;
        
        // calculate square midpoints
        // generate new height
        vTerrain[mid - 2*size*num_col + 2] = averageOfSquareNeighbors(mid - 2*size*num_col, 3*corner1, 3*corner2, 3*corner3, 3*corner4, 2*size, num_col, vTerrain) + Math.random()/scale;
        // find max height
        if (vTerrain[mid - 2*size*num_col + 2] > max)
            max = vTerrain[mid - 2*size*num_col + 2];
        
        // generate new height
        vTerrain[mid + 2*size*num_col + 2] = averageOfSquareNeighbors(mid + 2*size*num_col, 3*corner1, 3*corner2, 3*corner3, 3*corner4, 2*size, num_col, vTerrain) +  Math.random()/scale;
        // find max height
        if (vTerrain[mid + 2*size*num_col + 2] > max)
            max = vTerrain[mid + 2*size*num_col + 2];
        
        // generate new height
        vTerrain[mid - 2*size + 2] = averageOfSquareNeighbors(mid - 2*size, 3*corner1, 3*corner2, 3*corner3, 3*corner4, 2*size, num_col, vTerrain) + Math.random()/scale;
        // find max height
        if (vTerrain[mid - 2*size + 2] > max)
            max = vTerrain[mid - 2*size + 2];
        
        // generate new height
        vTerrain[mid + 2*size + 2] = averageOfSquareNeighbors(mid + 2*size, 3*corner1, 3*corner2, 3*corner3, 3*corner4, 2*size, num_col, vTerrain) + Math.random()/scale;
        // find max height
        if (vTerrain[mid + 2*size + 2] > max)
            max = vTerrain[mid + 2*size + 2];
        
        // queue diags, new size values, and scale
        if (size > 2){
            queue.push(mid - size - size*num_col);
            queue.push(size/2);
            queue.push(scale*1.8);
            
            queue.push(mid + size - size*num_col);
            queue.push(size/2);
            queue.push(scale*1.8);
            
            queue.push(mid - size + size*num_col);
            queue.push(size/2);
            queue.push(scale*1.8);
            
            queue.push(mid + size + size*num_col);
            queue.push(size/2);
            queue.push(scale*1.8);
        }
    }
    
//   for (var i = 0; i < num_col*num_col; i++) {
//        vTerrain[i * 3 + 2] /= max;
//    } 
    
}

/**
* This function determines the average height of a vertex in edges
* @param {int} idx Index of vertex currently being given a new height
* @param {int} corner1 
* @param {int} corner2 
* @param {int} corner3
* @param {int} corner4
* @param {int} size Size of current subsquare
* @param {int} num_col Number of columns in terrain
* @param {Array.<[float, float, float]>} vTerrain Array of floats
*   indicating the X,Y,Z coordinates of each vertex in space
* @return Average height of adjacent peaks
*/
function averageOfSquareNeighbors(idx, corner1, corner2, corner3, corner4, size, num_col, vTerrain){
    // check boundary conditions //
    var count = 0;
    var bottom = true;
    var top = true;
    var left = true;
    var right = true;
        
    if (idx < corner2) {
        bottom = false;
    }
    if ((corner3 <= idx) && (corner4 >= idx)) {
        top = false;
    }
    if (idx % num_col == 0) {
        left = false;
    }
    if (idx % (num_col-1) == 0) {
        right = false;
    }
    
    height_sum = 0;
    if (bottom){
        height_sum = height_sum + vTerrain[idx - size*num_col + 2];
        count = count + 1;
    }
    if (top){
        height_sum = height_sum + vTerrain[idx + size*num_col + 2];
        count = count + 1;
    }
    if (left){
        height_sum = height_sum + vTerrain[idx + size + 2];
        count = count + 1;
    }
    if (right){
        height_sum = height_sum + vTerrain[idx - size + 2];
        count = count + 1;
    }
    
    return height_sum/count;
}

/**
* calculate the average height of a vertex's neighbors for center
* @param {int} index Index of vertex 
* @param {int} size Size of current subsquare
* @param {int} num Number of rows in terrain
* @param {Array.<[float, float, float]>} 
* @return average height of corners
*/
function averageOfNeighbors(index, size, num, vTerrain){
    var sum = vTerrain[index - size - size*num + 2] + vTerrain[index + size - size*num + 2] + vTerrain[index - size + size*num + 2] + vTerrain[index + size + size*num + 2];
    return sum/4;
}

/**
* This function calculates the vertex normals 
* @param {Array.<[float, float, float]>} vTerrain Array of floats
*   indicating the X,Y,Z coordinates of each vertex in space
* @param {Array.<[int, int, int]>} Array of integers specifing
*   which verticies constitute the triangle face
* @param {int} numT Number of triangles in the terrain
* @param {int} numV Number of verticies in the terrain
* @param {Array.<[float, float, float]>} Array of floats
*   indicating the X,Y,Z components of each face's normal vector
* @return None
*/
function calculateNormals(vTerrain, fTerrain, numT, numV, tVertexNormalBuffer){
    var faceNormals = [];
    
    // calculate normals for each triangle
    for (var i = 0; i < numT; i++){
        var v1 = fTerrain[i*3];
        var v2 = fTerrain[i*3 + 1];
        var v3 = fTerrain[i*3 + 2];
        
        // compute surface normal
        var vector1 = vec3.fromValues(vTerrain[3*v2]-vTerrain[3*v1], vTerrain[3*v2+1]-vTerrain[3*v1+1], vTerrain[3*v2+2]-vTerrain[3*v1+2]);
        var vector2 = vec3.fromValues(vTerrain[3*v3]-vTerrain[3*v1], vTerrain[3*v3+1]-vTerrain[3*v1+1], vTerrain[3*v3+2]-vTerrain[3*v1+2]);
        var normal = vec3.create();
        vec3.cross(normal, vector1, vector2);
        
        faceNormals.push(normal[0]);
        faceNormals.push(normal[1]);
        faceNormals.push(normal[2]);
    }
    
    // initialize count array to all 0s
    var count = []
    for (var i = 0; i < numV; i++)
        count.push(0);
    
    // calculate sum of the surface normal vectors to which each vertex belongs
    for (var i = 0; i < numT; i++){
        var v1 = fTerrain[i*3 + 0]
        var v2 = fTerrain[i*3 + 1]
        var v3 = fTerrain[i*3 + 2]
        // iterate over each vertex in triangle
        count[v1] += 1
        count[v2] += 1
        count[v3] += 1
        
        // vertex 0
        tVertexNormalBuffer[3*v1 + 0] += faceNormals[i*3 + 0];
        tVertexNormalBuffer[3*v1 + 1] += faceNormals[i*3 + 1];
        tVertexNormalBuffer[3*v1 + 2] += faceNormals[i*3 + 2];
        
        // vertex 1
        tVertexNormalBuffer[3*v2+1 + 0] += faceNormals[i*3 + 0];
        tVertexNormalBuffer[3*v2+1 + 1] += faceNormals[i*3 + 1];
        tVertexNormalBuffer[3*v2+1 + 2] += faceNormals[i*3 + 2];
        
        // vertex 2
        tVertexNormalBuffer[3*v3+2 + 0] += faceNormals[i*3 + 0];
        tVertexNormalBuffer[3*v3+2 + 1] += faceNormals[i*3 + 1];
        tVertexNormalBuffer[3*v3+2 + 2] += faceNormals[i*3 + 2];
    }
    
    // average each normal vector in tVertexNormalBuffer
    // then normalize each normal vector in tVertexNormalBuffer
    for (var i = 0; i < numV; i++){
        // average out the adjacent surface normal vectors for point
        tVertexNormalBuffer[3*i+0] = tVertexNormalBuffer[3*i+0]/count[i];
        tVertexNormalBuffer[3*i+1] = tVertexNormalBuffer[3*i+1]/count[i];
        tVertexNormalBuffer[3*i+2] = tVertexNormalBuffer[3*i+2]/count[i];
        
        // normalize the normal vector
        var normal = vec3.fromValues(tVertexNormalBuffer[i*3+0], tVertexNormalBuffer[i*3+1], tVertexNormalBuffer[i*3+2]);
        var normalized = vec3.create();
        vec3.normalize(normalized, normal);
        
        // store the normal vector
        tVertexNormalBuffer[i*3+0] = normalized[0];
        tVertexNormalBuffer[i*3+1] = normalized[1];
        tVertexNormalBuffer[i*3+2] = normalized[2];
    }
    
}

/**
 * This code implements an efficient queue data structure.
 * This is needed as using an array is inefficient as each pop requires for all element to be shifted.
 */
function Queue(){
    var a=[],b=0;
    this.getLength=function(){
        return a.length-b
    };
    this.isEmpty=function(){
        return 0==a.length
    };
    this.push=function(b){
        a.push(b)
    };
    this.pop=function(){
        if(0!=a.length){
            var c=a[b];
            2*++b>=a.length&&(a=a.slice(b),b=0);
            return c
        }
    };
    this.peek=function(){
        return 0<a.length?a[b]:void 0
    }
};