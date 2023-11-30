let map;
let isRunning = false;
let watchId;
let userLocationMarker = null;
let checkpointCircles = [];
const audioFiles = {
    "checkpoint1": "audio/audio1.mp3", // Replace with your actual audio file paths
    "checkpoint2": "audio/audio2.mp3",
    "checkpoint3": "audio/audio3.mp3",
    "checkpoint4": "audio/audio4.mp3",
    "checkpoint5": "audio/audio5.mp3",
    "checkpoint6": "audio/audio6.mp3",
    "checkpoint7": "audio/audio7.mp3"
};
const checkpoints = [
    { lat: 38.890760751698224, lng: -77.09456107931626, radius: 10, audioKey: "checkpoint1" }, // Example coordinates and radius
    { lat: 38.89095162561316, lng: -77.09519500334783, radius: 10, audioKey: "checkpoint2" },
    { lat: 38.89139152494132, lng: -77.09419741012081, radius: 10, audioKey: "checkpoint3" },
    { lat: 38.891828469221075, lng: -77.09312395428827, radius: 10, audioKey: "checkpoint4" },
    { lat: 38.89112581426466, lng: -77.09258153669099, radius: 10, audioKey: "checkpoint5" },
    { lat: 38.89017217737917, lng:  -77.09202687325174, radius: 10, audioKey: "checkpoint6" },
    { lat: 38.89029330568399, lng: -77.09354926107771, radius: 10, audioKey: "checkpoint7" }
];

document.getElementById("startButton").addEventListener("click", function() {
    // Play a silent sound to activate audio context on iOS
    let silentAudio = new Audio('audio/silent.mp3'); // A short 5 second silent audio file
    silentAudio.loop = true; // Loop the audio so it plays continuously
    silentAudio.play().then(() => {
        console.log('Silent audio loop started successfully');
    }).catch((e) => {
        console.error('Error starting silent audio loop', e);
    });


    // Now start the run as usual
    console.log("Run started");
    isRunning = true;
    this.style.display = 'none';
    document.getElementById("stopButton").style.display = 'block';
    document.getElementById("status").innerText = "Status: Running...";
    startLocationTracking();
    drawCheckpointCircles(); // This will draw the checkpoint circles when the run starts

    // Any other code you have for starting the run...
});

document.getElementById("stopButton").addEventListener("click", function() {
    if (silentAudio) {
        silentAudio.pause(); // Stop the silent audio
        silentAudio.currentTime = 0; // Reset the audio position to the start
    }
    console.log("Run stopped");
    isRunning = false;
    this.style.display = 'none';
    document.getElementById("startButton").style.display = 'block';
    document.getElementById("status").innerText = "Status: Stopped";
    stopLocationTracking();
});

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15
    });
}

function startLocationTracking() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(handleLocationUpdate, handleError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function stopLocationTracking() {
    if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
    }
    if (userLocationMarker) {
        userLocationMarker.setMap(null);
    }
}

function drawCheckpointCircles() {
    checkpoints.forEach((checkpoint, index) => {
        const checkpointLocation = new google.maps.LatLng(checkpoint.lat, checkpoint.lng);
        const checkpointCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            center: checkpointLocation,
            radius: checkpoint.radius
        });

        checkpointCircles.push(checkpointCircle);
    });
}

// Function to clear checkpoint circles
function clearCheckpointCircles() {
    checkpointCircles.forEach(circle => circle.setMap(null));
    checkpointCircles = []; // Reset the array
}

function handleLocationUpdate(position) {
    const userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    if (!isRunning) {
        return; // Do not update the map if the user has stopped the run
    }

    map.panTo(userLocation);

    if (!userLocationMarker) {
        userLocationMarker = new google.maps.Marker({
            position: userLocation,
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6, // Original size of the marker
                fillColor: '#1E90FF',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
            },
        });

        // Add a pulsating effect
        let scaleFactor = 0;
        setInterval(() => {
            const scale = 6 + scaleFactor;
            userLocationMarker.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: scale,
                fillColor: '#1E90FF',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
            });

            // Change the factor to grow or shrink the circle size
            scaleFactor = (scaleFactor + 0.1) % 2;
        }, 150);
    } else {
        userLocationMarker.setPosition(userLocation);
    }

    checkpoints.forEach(checkpoint => {
        const checkpointLocation = new google.maps.LatLng(checkpoint.lat, checkpoint.lng);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, checkpointLocation);
        if (distance < checkpoint.radius) {
            playAudio(checkpoint.audioKey);
        }
    });
}

function handleError(error) {
    let errorMessage = '';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            errorMessage = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            errorMessage = "An unknown error occurred.";
            break;
    }
    console.warn(`ERROR(${error.code}): ${errorMessage}`);
    alert(errorMessage); // Optionally alert the user
}


function playAudio(audioKey) {
    const audio = new Audio(audioFiles[audioKey]);
    audio.play();
}

function drawCheckpointCircles() {
    // Clear existing circles first
    clearCheckpointCircles();

    checkpoints.forEach((checkpoint) => {
        const checkpointLocation = new google.maps.LatLng(checkpoint.lat, checkpoint.lng);
        const checkpointCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            center: checkpointLocation,
            radius: checkpoint.radius
        });

        checkpointCircles.push(checkpointCircle);
    });
}

function clearCheckpointCircles() {
    checkpointCircles.forEach((circle) => {
        circle.setMap(null);
    });
    checkpointCircles = [];
}