//below is the webcam stuff
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const rgbDisplay = document.getElementById('rgb-display');

//global variable rgb
var rgb = null;

// Request access to the webcam
navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
    video.srcObject = stream;
    })
    .catch(function (error) {
    console.error('Error accessing the webcam: ' + error);
});

// Once the webcam feed is loaded, start capturing and analyzing the pixel data
video.addEventListener('play', function () {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Handle mouse click event to get RGB value at cursor position
    video.addEventListener('click', function (e) {
        const x = e.offsetX;
        const y = e.offsetY;
        const pixelColor = getPixelColor(x, y);
        updateRGBDisplay(pixelColor);
    });

    function getPixelColor(x, y) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        return {
            red: pixel[0],
            green: pixel[1],
            blue: pixel[2],
        };
    }

    // Update the RGB display element with the pixel color
    function updateRGBDisplay(pixelColor) {
        const rgbValue = `RGB Value: (${pixelColor.red}, ${pixelColor.green}, ${pixelColor.blue})`;
        rgbDisplay.textContent = rgbValue;
        rgb = rgbValue;


    }

    // Continuously draw the video feed on the canvas
    function drawVideoOnCanvas() {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawVideoOnCanvas);
    }

    drawVideoOnCanvas(); // Start drawing the video on the canvas

});

//Code below is the openai part
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('submitButton').addEventListener('click', submitPrompt);
});

function submitPrompt() {
    // Check if rgb is set
    if (!rgb) {
        console.error('Error: Requires RGB value.');
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.textContent = 'Error: Requires RGB value. Please click on the video to select a color.';
        }
        return; // Stop further execution
    }

    fetch('/send_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: rgb }), // Send the user's input as 'data'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Handle the response from Python (if any).
        console.log('Response from Python:', data);

        // After sending data, make a GET request to retrieve the result
        fetch('/get_openai_response')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Handle the result from Python
            console.log('Result from Python:', data);
            // Display the result in your HTML
            document.getElementById('result').textContent = data;
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
}