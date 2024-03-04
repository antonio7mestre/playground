import Foundation
import CoreLocation
import AVFoundation

protocol LocationManagerDelegate: AnyObject {
    func didUpdateMonitoredCheckpoints()
}

class LocationManager: NSObject, CLLocationManagerDelegate {
    static let shared = LocationManager()
    let locationManager = CLLocationManager()
    
    var currentRunID: String?
    var checkpoints: [Checkpoint] = []
    var monitoredCheckpoints: [Checkpoint] = []
    var lastCheckpointIndex: Int = 0
    weak var delegate: LocationManagerDelegate?
    
    private var audioPlayer: AVAudioPlayer?
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.activityType = .fitness
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
    }
    
    func requestLocationAuthorization() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func startLocationUpdates() {
        locationManager.startUpdatingLocation()
    }
    
    func startMonitoringCheckpoints(_ checkpoints: [Checkpoint], forRunID runID: String) {
        self.currentRunID = runID
        self.checkpoints = checkpoints.sorted { $0.order < $1.order }
        lastCheckpointIndex = 0 // Reset the index if starting monitoring anew
        updateGeofences()
    }
    
    func updateGeofences() {
        // Clear existing geofences
        locationManager.monitoredRegions.forEach { locationManager.stopMonitoring(for: $0) }
        
        // Determine the range of checkpoints to monitor next
        let range = (lastCheckpointIndex..<min(lastCheckpointIndex + 100, checkpoints.count))
        monitoredCheckpoints = Array(checkpoints[range])
        
        // Start monitoring the next set of checkpoints
        monitoredCheckpoints.forEach { checkpoint in
            let region = CLCircularRegion(center: CLLocationCoordinate2D(latitude: checkpoint.latitude, longitude: checkpoint.longitude),
                                          radius: checkpoint.radius,
                                          identifier: checkpoint.id ?? UUID().uuidString)
            region.notifyOnEntry = true
            locationManager.startMonitoring(for: region)
        }
        
        // Notify delegate about the update
        delegate?.didUpdateMonitoredCheckpoints()
    }

    func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        guard let checkpointRegion = region as? CLCircularRegion,
              let checkpointIndex = checkpoints.firstIndex(where: { $0.id == region.identifier }),
              checkpointIndex == lastCheckpointIndex else { return }
        
        let checkpoint = checkpoints[checkpointIndex]
        playAudioForCheckpoint(checkpoint)
        
        lastCheckpointIndex += 1 // Move to the next checkpoint
        updateGeofences() // Update geofences to monitor next set of checkpoints
    }
    
    func playAudioForCheckpoint(_ checkpoint: Checkpoint) {
        guard let runId = currentRunID else {
            print("Error: runId is nil.")
            return
        }
        
        AudioService.shared.downloadAndPlay(runId: runId, filename: checkpoint.audioFileName) {
            print("Audio playback completed or failed.")
        }
    }

    
    func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        // Implement if needed
    }
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        if status == .authorizedWhenInUse || status == .authorizedAlways {
            locationManager.startUpdatingLocation()
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location Manager failed with error: \(error)")
    }
    
    func locationManager(_ manager: CLLocationManager, monitoringDidFailFor region: CLRegion?, withError error: Error) {
        print("Monitoring failed for region with identifier: \(region?.identifier ?? "unknown")")
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        // Implement if you need to handle location updates
    }
}
