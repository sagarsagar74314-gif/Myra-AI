package com.myra.ai.service

import android.annotation.SuppressLint
import android.content.Context
import android.location.Address
import android.location.Geocoder
import android.location.Location
import android.os.Looper
import android.util.Log
import com.google.android.gms.location.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.Locale

/**
 * HighAccuracyLocationProvider
 * Uses Google Play Services FusedLocationProviderClient with PRIORITY_HIGH_ACCURACY
 * to get exact coordinates, accuracy, altitude, speed, and real-time reverse geocoding anywhere.
 */
data class MyraLocationData(
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val accuracyMeters: Float = 0f,
    val altitudeMeters: Double = 0.0,
    val addressLine: String = "स्थान लोड हो रहा है...",
    val city: String = "",
    val state: String = "",
    val country: String = "",
    val postalCode: String = "",
    val timestamp: Long = System.currentTimeMillis()
)

object HighAccuracyLocationProvider {

    private const val TAG = "MyraLocation"
    private var fusedLocationClient: FusedLocationProviderClient? = null
    private var locationCallback: LocationCallback? = null

    private val _currentLocation = MutableStateFlow(MyraLocationData())
    val currentLocation: StateFlow<MyraLocationData> = _currentLocation

    @SuppressLint("MissingPermission")
    fun startLiveTracking(context: Context) {
        if (fusedLocationClient != null) return

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)

        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            5000L // 5 seconds interval
        ).apply {
            setMinUpdateIntervalMillis(2000L)
            setMinUpdateDistanceMeters(2f) // 2 meters sensitivity
            setWaitForAccurateLocation(true)
        }.build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                for (location in result.locations) {
                    processNewLocation(context, location)
                }
            }
        }

        try {
            fusedLocationClient?.requestLocationUpdates(
                locationRequest,
                locationCallback as LocationCallback,
                Looper.getMainLooper()
            )
            Log.d(TAG, "High-accuracy location updates started.")
        } catch (e: SecurityException) {
            Log.e(TAG, "Location permissions not granted", e)
        }
    }

    private fun processNewLocation(context: Context, location: Location) {
        val geocoder = Geocoder(context, Locale("hi", "IN"))
        var addressLine = "सटीक GPS स्थान: ${String.format(Locale.US, "%.5f", location.latitude)}, ${String.format(Locale.US, "%.5f", location.longitude)}"
        var city = ""
        var state = ""
        var country = "भारत"
        var postalCode = ""

        try {
            val addresses: List<Address>? = geocoder.getFromLocation(location.latitude, location.longitude, 1)
            if (!addresses.isNullOrEmpty()) {
                val addr = addresses[0]
                addressLine = addr.getAddressLine(0) ?: addressLine
                city = addr.locality ?: addr.subAdminArea ?: ""
                state = addr.adminArea ?: ""
                country = addr.countryName ?: "भारत"
                postalCode = addr.postalCode ?: ""
            }
        } catch (e: Exception) {
            Log.w(TAG, "Geocoder reverse lookup failed", e)
        }

        _currentLocation.value = MyraLocationData(
            latitude = location.latitude,
            longitude = location.longitude,
            accuracyMeters = location.accuracy,
            altitudeMeters = location.altitude,
            addressLine = addressLine,
            city = city,
            state = state,
            country = country,
            postalCode = postalCode,
            timestamp = System.currentTimeMillis()
        )
    }

    fun stopTracking() {
        locationCallback?.let {
            fusedLocationClient?.removeLocationUpdates(it)
        }
        fusedLocationClient = null
    }
}
