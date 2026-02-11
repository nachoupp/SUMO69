"""Test script for BLE connection to Pybricks Hub
Simple script that blinks the LED to verify connectivity."""

from pybricks.hubs import InventorHub
from pybricks.parameters import Color
from pybricks.tools import wait

# Initialize Hub
hub = InventorHub()

print(">>> Connection Test Started")
print("Hub initialized successfully")

# Blink LED 5 times
for i in range(5):
    print(f"Blink {i+1}/5")
    hub.light.on(Color.GREEN)
    wait(300)
    hub.light.off()
    wait(300)

print(">>> Test Complete!")
print("If you see this, BLE connection is working properly.")
