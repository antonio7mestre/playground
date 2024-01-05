let map;
let isRunning = false;
let watchId;
let userLocationMarker = null;
let checkpointCircles = [];
const audioFiles = {
    "checkpoint1": "audio/audio1.mp3",
    "checkpoint2": "audio/audio2.mp3",
    "checkpoint3": "audio/audio3.mp3",
    "checkpoint4": "audio/audio4.mp3",
    "checkpoint5": "audio/audio5.mp3",
    "checkpoint6": "audio/audio6.mp3",
    "checkpointBig": "audio/silent.mp3"
};

// Enhanced checkpoints array with additional properties
const checkpoints = [
    { lat: 37.763158753593004, lng: -122.43700119937125, radius: 2, audioKey: "checkpoint1", audioPlayed: false },
    { lat: 37.76321547479275, lng: -122.43704009133143, radius: 2, audioKey: "checkpoint2", audioPlayed: false },
    { lat: 37.763295520569066, lng: -122.43706423115326, radius: 2, audioKey: "checkpoint3", audioPlayed: false },
    { lat: 37.76263420233611, lng: -122.43496352624764, radius: 15, audioKey: "checkpoint4", audioPlayed: false },
    { lat: 37.76292229218876, lng: -122.43448647025788, radius: 15, audioKey: "checkpoint5", audioPlayed: false },
    { lat: 37.76349055985091, lng: -122.43374489854205, radius: 15, audioKey: "checkpoint6", audioPlayed: false },
    { lat: 37.76278785560075, lng: -122.43507155436443, radius: 900, audioKey: "checkpointBig"}
];

document.getElementById("startButton").addEventListener("click", function() {
    console.log("Run started");
    isRunning = true;
    resetCheckpointFlags(); // Reset checkpoint flags before starting
    this.style.display = 'none';
    document.getElementById("stopButton").style.display = 'block';
    document.getElementById("status").innerText = "Status: Running...";
    startLocationTracking();
    drawCheckpointCircles();
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
    checkpointCircles.forEach(circle => circle.setMap(null));
    checkpointCircles = [];
}

function handleLocationUpdate(position) {
    const userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    if (!isRunning) {
        return; // Do not update the map if the user has stopped the run
    }

    map.panTo(userLocation);
    updateLocationMarker(userLocation);
    checkCheckpointProximity(userLocation);
}

function updateLocationMarker(userLocation) {
    if (!userLocationMarker) {
        userLocationMarker = createLocationMarker(userLocation);
    } else {
        userLocationMarker.setPosition(userLocation);
    }
}

function createLocationMarker(userLocation) {
    return new google.maps.Marker({
        position: userLocation,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: '#1E90FF',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
        },
    });
}

function checkCheckpointProximity(userLocation) {
    checkpoints.forEach(checkpoint => {
        const checkpointLocation = new google.maps.LatLng(checkpoint.lat, checkpoint.lng);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, checkpointLocation);

        if (distance < checkpoint.radius && !checkpoint.audioPlayed) {
            playAudio(checkpoint.audioKey);
            checkpoint.audioPlayed = true; // Mark as played
        }
    });
}

function resetCheckpointFlags() {
    checkpoints.forEach(checkpoint => checkpoint.audioPlayed = false);
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
    alert(errorMessage);
}

function playAudio(audioKey) {
    const audio = new Audio(audioFiles[audioKey]);
    audio.play();
}
