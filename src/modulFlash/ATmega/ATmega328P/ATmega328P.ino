#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Pinout, Jangan lupa hapus sebelum upload
// 3.3V-VCC'RC522
// GND-GND'RC522
// D9-RST'RC522
// D12-MISO'RC522
// D11-MOSI'RC522
// D13-SCK'RC522
// D10-SDA'RC522
// GND-GND'LCDI2C
// 5V-VCC'LCDI2C
// A4-SDA'LCDI2C
// A5-SCL'LCDI2C
// D8-+'Buzzer
// GND--'Buzzer

// Konfig pin Arduino Uno (ATmega328P)
#define RST_PIN   9    // Pin D9 untuk RST RFID
#define SS_PIN    10   // Pin D10 untuk SDA/SS RFID
#define BUZZER    8    // Pin D8 untuk Buzzer

MFRC522 mfrc522(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  // Serial digunakan untuk komunikasi dengan ESP8266
  Serial.begin(115200);
  
  SPI.begin();
  mfrc522.PCD_Init();
  
  pinMode(BUZZER, OUTPUT);
  digitalWrite(BUZZER, LOW);
  
  lcd.init();
  lcd.backlight();
  
  tampilanAwal();
}

void loop() {
  // 1. Cek respon dari ESP8266 via Serial
  if (Serial.available()) {
    String responESP = Serial.readStringUntil('\n');
    responESP.trim();
    
    if (responESP.startsWith("OK:")) {
      String dataRespon = responESP.substring(3);
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Data Terkirim!");
      lcd.setCursor(0, 1);
      lcd.print(dataRespon);
      delay(2000);
      tampilanAwal();
    } else if (responESP.startsWith("ERR:")) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Gagal Kirim!");
      lcd.setCursor(0, 1);
      lcd.print("Error Server");
      delay(2000);
      tampilanAwal();
    } else if (responESP == "WIFI_READY") {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("WiFi Siap!");
      delay(1000);
      tampilanAwal();
    }
  }

  // 2. Cek apakah ada kartu baru
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Format HEX
  String rfid_hex = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) rfid_hex += "0";
    rfid_hex += String(mfrc522.uid.uidByte[i], HEX);
  }
  rfid_hex.toUpperCase();

  // Format Desimal
  unsigned long rfid_dec = 0;
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    rfid_dec = (rfid_dec << 8) | mfrc522.uid.uidByte[i];
  }

  // Tampilkan ke LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Kartu Terbaca!");
  lcd.setCursor(0, 1);
  lcd.print("ID: " + rfid_hex);

  // Bunyikan buzzer
  digitalWrite(BUZZER, HIGH);
  delay(150);
  digitalWrite(BUZZER, LOW);

  // Kirim UID ke modul ESP8266 via Serial
  // Format pesan: UID:<nomor_uid>
  Serial.print("UID:");
  Serial.println(rfid_dec);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Mengirim Data...");
  lcd.setCursor(0, 1);
  lcd.print("Tunggu...");

  mfrc522.PICC_HaltA();
}

void tampilanAwal() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Sistem Siap...");
  lcd.setCursor(0, 1);
  lcd.print("Tap Kartu Anda");
}
