import UIKit
import FirebaseFirestore
import MapKit

class RunDetailViewController: UIViewController, MKMapViewDelegate {
    
    // Assuming you have outlets for your UI elements like labels and map view
    @IBOutlet var mapView: MKMapView!

    @IBOutlet var nameLabel: UILabel!

    @IBOutlet var descriptionLabel: UILabel!
    
    @IBOutlet var startRunButton: UIButton! // Make sure you have this button in your storyboard

    var run: Run?
            var checkpoints: [Checkpoint] = []

            override func viewDidLoad() {
                super.viewDidLoad()
                configureView()
                LocationManager.shared.delegate = self  // Set as delegate
                if let runID = run?.id {
                    fetchCheckpoints(forRunID: runID)
                }
            }

            func configureView() {
                nameLabel.text = run?.name
                descriptionLabel.text = run?.description
                mapView.delegate = self
                checkLocationAuthorizationStatus()
            }

            private func checkLocationAuthorizationStatus() {
                if CLLocationManager.locationServicesEnabled() {
                    switch CLLocationManager().authorizationStatus {
                    case .notDetermined:
                        LocationManager.shared.requestLocationAuthorization()
                    case .restricted, .denied:
                        // Display an alert or other UI to inform the user
                        break
                    case .authorizedWhenInUse, .authorizedAlways:
                        startLocationTracking()
                    @unknown default:
                        fatalError("Unhandled CLAuthorizationStatus")
                    }
                }
            }
            
    @IBAction func startRunButtonTapped(_ sender: UIButton) {
        guard let runID = run?.id else { return }
                        AudioService.shared.downloadAndPlay(runId: runID, filename: "start.mp3") {
                            self.startLocationTracking()
                            if !self.checkpoints.isEmpty {
                                LocationManager.shared.startMonitoringCheckpoints(Array(self.checkpoints.prefix(100)), forRunID: runID)
                            }
                        }
                    }

                    func fetchCheckpoints(forRunID runID: String) {
                        let db = Firestore.firestore()
                        db.collection("runs").document(runID).collection("checkpoints").getDocuments { [weak self] (querySnapshot, error) in
                            guard let self = self else { return }
                            guard let snapshot = querySnapshot else {
                                print("Error fetching documents: \(error?.localizedDescription ?? "unknown error")")
                                return
                            }
                            self.checkpoints = snapshot.documents.compactMap { document -> Checkpoint? in
                                return try? document.data(as: Checkpoint.self)
                            }.sorted(by: { $0.order < $1.order })
                            self.updateMapViewWithCheckpoints()
                        }
                    }

                    func updateMapViewWithCheckpoints() {
                        mapView.removeOverlays(mapView.overlays)
                        for checkpoint in LocationManager.shared.monitoredCheckpoints {  // Use monitored checkpoints
                            let circle = MKCircle(center: CLLocationCoordinate2D(latitude: checkpoint.latitude, longitude: checkpoint.longitude), radius: checkpoint.radius)
                            mapView.addOverlay(circle)
                        }
                    }

                    func mapView(_ mapView: MKMapView, rendererFor overlay: MKOverlay) -> MKOverlayRenderer {
                        if let circleOverlay = overlay as? MKCircle {
                            let circleRenderer = MKCircleRenderer(circle: circleOverlay)
                            circleRenderer.fillColor = UIColor.blue.withAlphaComponent(0.1)
                            circleRenderer.strokeColor = UIColor.blue
                            circleRenderer.lineWidth = 1.0
                            return circleRenderer
                        }
                        return MKOverlayRenderer(overlay: overlay)
                    }

                    func startLocationTracking() {
                        mapView.showsUserLocation = true
                        mapView.userTrackingMode = .follow
                        LocationManager.shared.startLocationUpdates()
                    }
                }

                extension RunDetailViewController: LocationManagerDelegate {
                    func didUpdateMonitoredCheckpoints() {
                        DispatchQueue.main.async {
                            self.updateMapViewWithCheckpoints()
                        }
                    }
                }
