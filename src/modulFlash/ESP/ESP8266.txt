#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

const char* ssid     = ""; // Ganti pake SSID 2.4 GHz jangan 5GHz
const char* password = ""; // Isi pw Wifi
const String serverUrl = ""; // Api atau lokal

// Pinout, Jangan lupa hapus sebelum upload
// 3V3-VCC'RC522
// GND-GND'RC522
// D3-RST'RC522
// D6-MISO'RC522
// D7-MOSI'RC522
// D5-SCK'RC522
// D8-SDA'RC522
// GND-GND'LCDI2C
// VIN-VCC'LCDI2C
// D2-SDA'LCDI2C
// D1-SCL'LCDI2C
// D0-+'Buzzer
// GND--'Buzzer

// Konfig pin
#define RST_PIN   D3   // Pin D3 (GPIO 0)
#define SS_PIN    D8   // Pin D8 (GPIO 15)
#define BUZZER    D0   // Pin D0 (GPIO 16)

MFRC522 mfrc522(SS_PIN, RST_PIN);      
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- MEMULAI SISTEM RFID MONITORING (ESP8266 NODEMCU) ---");
  
  // Inisialisasi SPI & I2C
  SPI.begin();
  Wire.begin(D2, D1); // SDA = D2, SCL = D1
  
  mfrc522.PCD_Init();
  
  pinMode(BUZZER, OUTPUT);
  digitalWrite(BUZZER, LOW); 
  
  lcd.init();
  lcd.backlight();
  
  // --- PROSES KONEKSI WIFI ---
  lcd.setCursor(0, 0);
  lcd.print("Koneksi WiFi...");
  Serial.print("Menghubungkan ke WiFi: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int timeoutCounter = 0;
  // Timeout 20 detik
  while (WiFi.status() != WL_CONNECTED && timeoutCounter < 40) {
    delay(500);
    Serial.print(".");
    timeoutCounter++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[OK] WiFi Terhubung!");
    Serial.print("NodeMCU IP Address : ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[PERINGATAN] Gagal terhubung ke WiFi!");
  }

  tampilanAwal();
}

void loop() {
  // Cek apakah ada kartu baru
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Coba baca serial kartu
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // 1. Simpan format HEX
  String rfid_hex = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) {
      rfid_hex += "0";
    }
    rfid_hex += String(mfrc522.uid.uidByte[i], HEX);
  }
  rfid_hex.toUpperCase();

  // 2. Simpan format Angka Desimal
  unsigned long rfid_dec = 0;
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    rfid_dec = (rfid_dec << 8) | mfrc522.uid.uidByte[i];
  }

  // --- SERIAL MONITOR DEBUG ---
  Serial.println("\n========================================");
  Serial.println(">>> KARTU BERHASIL DI-SCAN! <<<");
  Serial.print("UID (HEX)     : ");
  Serial.println(rfid_hex);
  Serial.print("UID (Desimal) : ");
  Serial.println(rfid_dec);
  Serial.println("========================================");

  // Tampilkan ke LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Kartu Terbaca!");
  lcd.setCursor(0, 1);
  lcd.print("ID: " + rfid_hex);

  // Bunyikan buzzer singkat
  digitalWrite(BUZZER, HIGH);
  delay(150);
  digitalWrite(BUZZER, LOW);

  // Kirim data ke Web Server
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    String fullUrl = serverUrl + String(rfid_dec); // atau rfid_hex
    
    Serial.print("Kirim URL : ");
    Serial.println(fullUrl);
    
    http.begin(client, fullUrl);
    int httpCode = http.GET();
    
    Serial.print("HTTP Status Code : ");
    Serial.println(httpCode);
    
    if (httpCode > 0) {
      String response = http.getString();
      Serial.print("Respon Server    : ");
      Serial.println(response);

      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Data Terkirim!");
      lcd.setCursor(0, 1);
      lcd.print("Status: " + response);
    } else {
      Serial.printf("[ERROR] Gagal kirim HTTP: %s\n", http.errorToString(httpCode).c_str());
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Gagal Kirim!");
      lcd.setCursor(0, 1);
      lcd.print("HTTP Error");
    }
    http.end();
  } else {
    Serial.println("[ERROR] WiFi tidak terhubung!");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Terputus!");
  }

  delay(2000);
  tampilanAwal();
  mfrc522.PICC_HaltA();
}

// Fungsi pembantu tampilan awal LCD
void tampilanAwal() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Sistem Siap...");
  lcd.setCursor(0, 1);
  lcd.print("Tap Kartu Anda");
}
