function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
        // you should paste the response of the chatGPT here:
        0.17677669, -0.28661165, 0.7391989, 0.3,
        0.30618623, 0.36959946, 0.2803301, -0.25,
        -0.35355338, 0.17677669, 0.61237246, 0.0,
        0.0, 0.0, 0.0, 1.0

    ]);
    return getTransposeMatrix(transformationMatrix);
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function getModelViewMatrix() {
    // Create the individual transformation matrices
    let identityMatrix = createIdentityMatrix();

    // Apply scaling: 0.5 by x-axis, 0.5 by y-axis
    let scaleMatrix = createScaleMatrix(0.5, 0.5, 1.0);

    // Apply rotation around x-axis (30 degrees)
    let rotationXMatrix = createRotationMatrix_X(degToRad(30));

    // Apply rotation around y-axis (45 degrees)
    let rotationYMatrix = createRotationMatrix_Y(degToRad(45));

    // Apply rotation around z-axis (60 degrees)
    let rotationZMatrix = createRotationMatrix_Z(degToRad(60));

    // Apply translation: 0.3 in x-axis, -0.25 in y-axis
    let translationMatrix = createTranslationMatrix(0.3, -0.25, 0);

    let modelViewMatrix = multiplyMatrices(identityMatrix, translationMatrix);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationZMatrix);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationYMatrix);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationXMatrix);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, scaleMatrix);


    // Return the final model view matrix as Float32Array
    //console.log(modelViewMatrix)
    //correct matrix
    return new Float32Array(modelViewMatrix);
}


/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */



function interpolate(start, end, factor) {
    return start + (end - start) * factor;
}

function getPeriodicMovement(startTime) {
    // Get the current time in seconds
    const currentTime = (Date.now() - startTime) / 1000;

    // Calculate the time within the 10-second cycle (looping every 10 seconds)
    const cycleTime = currentTime % 10;
    
    // Normalize cycleTime to the range [0, 1] for each half-cycle (5 seconds for each direction)
    let t;
    if (cycleTime <= 5) {
        // First 5 seconds: moving towards the target
        t = cycleTime / 5;
    } else {
        // Next 5 seconds: moving back to the initial position
        t = 1 - ((cycleTime - 5) / 5);
    }

    // Interpolate the transformation parameters based on t (a value between 0 and 1)

    // Initial and target translation values
    const initialTranslation = [0, 0, 0]; // initial at origin
    const targetTranslation = [0.3, -0.25, 0];
    const translationX = interpolate(initialTranslation[0], targetTranslation[0], t);
    const translationY = interpolate(initialTranslation[1], targetTranslation[1], t);
    const translationZ = 0; // Z remains constant

    // Initial and target scaling values
    const initialScale = [1, 1, 1];
    const targetScale = [0.5, 0.5, 1.0];
    const scaleX = interpolate(initialScale[0], targetScale[0], t);
    const scaleY = interpolate(initialScale[1], targetScale[1], t);
    const scaleZ = 1.0; // Z scaling remains constant

    // Initial and target rotation values in degrees
    const initialRotation = [0, 0, 0]; // no rotation initially
    const targetRotation = [30, 45, 60]; // final rotation angles
    const rotationX = degToRad(interpolate(initialRotation[0], targetRotation[0], t));
    const rotationY = degToRad(interpolate(initialRotation[1], targetRotation[1], t));
    const rotationZ = degToRad(interpolate(initialRotation[2], targetRotation[2], t));

    // Create the individual transformation matrices
    let identityMatrix = createIdentityMatrix();
    let scaleMatrix = createScaleMatrix(scaleX, scaleY, scaleZ);
    let rotationXMatrix = createRotationMatrix_X(rotationX);
    let rotationYMatrix = createRotationMatrix_Y(rotationY);
    let rotationZMatrix = createRotationMatrix_Z(rotationZ);
    let translationMatrix = createTranslationMatrix(translationX, translationY, translationZ);

    // Combine all the transformations: scale -> rotate (X, Y, Z) -> translate
    let modelViewMatrix = multiplyMatrices(identityMatrix, translationMatrix);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationZMatrix);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationYMatrix);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationXMatrix);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, scaleMatrix);

    // Return the final model view matrix
    return new Float32Array(modelViewMatrix);
}




