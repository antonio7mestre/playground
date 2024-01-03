let map; //this one works! BUT audio loops like crazy 
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
    "checkpoint7": "audio/silent.mp3"
};
const checkpoints = [
    { lat: 37.76119955169599, lng: -122.42808196246752, radius: 15, audioKey: "checkpoint1" },
    { lat: 37.760551738444015, lng: -122.42775051084388, radius: 15, audioKey: "checkpoint2" },
    { lat: 37.759925756204, lng: -122.42684822586841, radius: 15, audioKey: "checkpoint3" },
    { lat: 37.75980201490159, lng: -122.42762161299024, radius: 15, audioKey: "checkpoint4" },
    { lat: 37.7591250735247, lng: -122.4277781318125, radius: 15, audioKey: "checkpoint5" },
    { lat: 37.7583171031269, lng: -122.4277781318125, radius: 15, audioKey: "checkpoint6" },
    { lat: 37.759889361724774, lng: -122.42705998662795, radius: 300, audioKey: "checkpoint7" }
];


document.getElementById("startButton").addEventListener("click", function() {
    // Play a silent sound to activate audio context on iOS
    let silentAudio = new Audio('audio/audio0.mp3'); // Make sure you have a silent.mp3 file at the specified path
    silentAudio.play().then(() => {
        console.log('Silent audio played successfully');
    }).catch((e) => {
        console.error('Error playing silent audio', e);
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