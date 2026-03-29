#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include "time.h"
#include "secrets.h"


#define POWERPIN 25
#define SENSORPIN 36
#define RELAYPIN 26
#define MOISTURE_THRESHOLD 400



FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// unix time constants
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 0;       // adjust if you want local time
const int daylightOffset_sec = 0;

unsigned long lastSensorCheck = 0;
unsigned long wateringStart = 0;
int waterLength = 0;


int moistureValue;

bool signUpOK = false;
bool watering = false;

void setup() {
  pinMode(POWERPIN, OUTPUT);
  pinMode(RELAYPIN, OUTPUT);
  digitalWrite(RELAYPIN, LOW);

  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("signUP OK");
    signUpOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);


}

// unix helper function
unsigned long getUnixTime() {
  time_t now;
  time(&now);
  return now;
}


void loop() {
  

  if (Firebase.ready() && signUpOK){

    bool requestMoisture = false;
    bool waterPlantTrigger = false;
    // Request each Firebase value once
    if (Firebase.RTDB.getBool(&fbdo, "requestMoisture") && fbdo.dataType() == "boolean") {
      requestMoisture = fbdo.boolData();
    }
    // check if they are tryna water 
    if (Firebase.RTDB.getBool(&fbdo, "water/watering") && fbdo.dataType() == "boolean") {
      waterPlantTrigger = fbdo.boolData();
    }

    //check how long we are watering for 
    if (Firebase.RTDB.getInt(&fbdo, "water/water_length") && fbdo.dataType() == "int") {
      waterLength = fbdo.intData();
    }
    // ===== Check for "requestMoisture" trigger =====
    if (requestMoisture) {
      readSensorAndUpload();
      Firebase.RTDB.setBool(&fbdo, "requestMoisture", false);
      Serial.println("Processed requestMoisture trigger");
    }
    // ===== Regular moisture check every 10 seconds =====
    if (millis() - lastSensorCheck >10000 || lastSensorCheck == 0){
      lastSensorCheck = millis();
      readSensorAndUpload();
    }
    //water plant
    if (!watering && ((moistureValue < MOISTURE_THRESHOLD) || waterPlantTrigger)){
      if (moistureValue < MOISTURE_THRESHOLD){
        waterLength = 6000;
      }
      waterPlant();
 
    }

    // check if watering is done
    if (watering && ((millis() - wateringStart) >= waterLength)){
      digitalWrite(RELAYPIN, LOW);
      readSensorAndUpload();
      Firebase.RTDB.setBool(&fbdo, "water/watering_complete", true);
      Firebase.RTDB.setBool(&fbdo, "water/watering", false);
      Firebase.RTDB.setInt(&fbdo, "time/last_watered", getUnixTime());
      Serial.println("Watering complete");
      watering = false;
    }

  }
  else{
    Serial.println("Error connecting to firebase.");
  }

}
  

// ===== Helper function to read sensor and upload to Firebase =====
void readSensorAndUpload() {
  digitalWrite(POWERPIN, HIGH);
  delay(50); // short stabilisation
  moistureValue = analogRead(SENSORPIN);
  digitalWrite(POWERPIN, LOW);
  Firebase.RTDB.setInt(&fbdo, "moisture_value", moistureValue);
  Firebase.RTDB.setInt(&fbdo, "time/last_moisture", getUnixTime());
}

void waterPlant(){
  watering = true;
  wateringStart = millis();
  digitalWrite(RELAYPIN, HIGH);
  Serial.println("Started watering...");
}





