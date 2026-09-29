#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

const char* ssid     = ""; // Ganti pake SSID 2.4 GHz jangan 5GHz
const char* password = ""; // Isi pw Wifi
const String serverUrl = ""; // Api atau lokal

// Konfig dip switch
// 1. Upload ke ATmega328P : [1:ON, 2:ON, 3:OFF, 4:OFF, 5:OFF, 6:OFF, 7:OFF, 8:OFF]
// 2. Upload ke ESP8266    : [1:OFF, 2:OFF, 3:OFF, 4:OFF, 5:ON, 6:ON, 7:ON, 8:OFF]
// 3. Mode RUN (Komunikasi): [1:OFF, 2:OFF, 3:OFF, 4:OFF, 5:ON, 6:ON, 7:OFF, 8:OFF]

void setup() {
  // Serial baud rate harus sama dengan ATmega328P (115200)
  Serial.begin(115200);
  delay(1000);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int timeout = 0;
  while (WiFi.status() != WL_CONNECTED && timeout < 40) {
    delay(500);
    timeout++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    // Beri tahu ATmega bahwa WiFi sudah siap
    Serial.println("WIFI_READY");
  } else {
    Serial.println("ERR:WIFI_FAILED");
  }
}

void loop() {
  // Dengarkan data Serial dari ATmega328P
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    input.trim();

    // Cek format pesan "UID:<nomor_uid>"
    if (input.startsWith("UID:")) {
      String uid = input.substring(4);
      kirimDataKeServer(uid);
    }
  }
}

void kirimDataKeServer(String uid) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    String fullUrl = serverUrl + uid;

    http.begin(client, fullUrl);
    int httpCode = http.GET();

    if (httpCode > 0) {
      String response = http.getString();
      response.trim();
      // Kirim balik ke ATmega format OK:<respon>
      Serial.print("OK:");
      Serial.println(response);
    } else {
      // Kirim balik error ke ATmega
      Serial.print("ERR:HTTP_");
      Serial.println(httpCode);
    }
    http.end();
  } else {
    Serial.println("ERR:NO_WIFI");
  }
}
