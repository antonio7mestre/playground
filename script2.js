let map;
let isRunning = false;
let watchId;
let userLocationMarker = null;
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
    { lat: 40.7128, lng: -74.0060, radius: 13, audioKey: "checkpoint1" }, // Example coordinates and radius
    { lat: 34.0522, lng: -118.2437, radius: 13, audioKey: "checkpoint2" },
    { lat: 34.0522, lng: -118.2437, radius: 13, audioKey: "checkpoint3" },
    { lat: 34.0522, lng: -118.2437, radius: 13, audioKey: "checkpoint4" },
    { lat: 34.0522, lng: -118.2437, radius: 13, audioKey: "checkpoint5" },
    { lat: 34.0522, lng: -118.2437, radius: 13, audioKey: "checkpoint6" },
    { lat: 34.0522, lng: -118.2437, radius: 13, audioKey: "checkpoint7" }
];

document.getElementById("startButton").addEventListener("click", function() {
    console.log("Run started");
    isRunning = true;
    this.style.display = 'none';
    document.getElementById("stopButton").style.display = 'block';
    document.getElementById("status").innerText = "Status: Running...";
    startLocationTracking();
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
    console.warn(`ERROR(${error.code}): ${error.message}`);
}

function playAudio(audioKey) {
    const audio = new Audio(audioFiles[audioKey]);
    audio.play();
}