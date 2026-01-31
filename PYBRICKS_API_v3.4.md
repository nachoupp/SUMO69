# Pybricks Hub API Reference (PrimeHub / InventorHub)

## class InventorHub
This class is the same as the PrimeHub class, shown below. Both classes work on both hubs.
These hubs are completely identical. They use the same Pybricks firmware.

## class PrimeHub(top_side=Axis.Z, front_side=Axis.X, broadcast_channel=None, observe_channels=[])
LEGO® SPIKE Prime Hub.
Initializes the hub. Optionally, specify how the hub is placed in your design by saying in which direction the top side (with the buttons) and front side (with the USB port) are pointing.

### Parameters:
- **top_side (Axis)** – The axis that passes through the top side of the hub.
- **front_side (Axis)** – The axis that passes through the front side of the hub.
- **broadcast_channel** – Channel number (0 to 255) used to broadcast data. Choose None when not using broadcasting.
- **observe_channels** – A list of channels to listen to when hub.ble.observe() is called. Listening to more channels requires more memory. Default is an empty list (no channels).

---

## Using the hub status light

### light.on(color)
Turns on the light at the specified color.
**Parameters:**
- color (Color) – Color of the light.

### light.off()
Turns off the light.

### light.blink(color, durations)
Blinks the light at a given color by turning it on and off for given durations.
The light keeps blinking indefinitely while the rest of your program keeps running.
**Parameters:**
- color (Color) – Color of the light.
- durations (list) – Sequence of time values of the form [on_1, off_1, on_2, off_2, ...].

### light.animate(colors, interval)
Animates the light with a sequence of colors, shown one by one for the given interval.
The animation runs in the background while the rest of your program keeps running. When the animation completes, it repeats.
**Parameters:**
- colors (list) – Sequence of Color values.
- interval (Number, ms) – Time between color updates.

---

## Using the light matrix display

### display.orientation(up)
Sets the orientation of the light matrix display.
Only new displayed images and pixels are affected. The existing display contents remain unchanged.
**Parameters:**
- top (Side) – Which side of the light matrix display is “up” in your design. Choose Side.TOP, Side.LEFT, Side.RIGHT, or Side.BOTTOM.

### display.off()
Turns off all the pixels.

### display.pixel(row, column, brightness=100)
Turns on one pixel at the specified brightness.
**Parameters:**
- row (Number) – Vertical grid index, starting at 0 from the top.
- column (Number) – Horizontal grid index, starting at 0 from the left.
- brightness (Number brightness: %) – Brightness of the pixel.

### display.icon(icon)
Displays an icon, represented by a matrix of brightness: % values.
**Parameters:**
- icon (Matrix) – Matrix of intensities (brightness: %). A 2D list is also accepted.

### display.animate(matrices, interval)
Displays an animation made using a list of images.
Each image has the same format as above. Each image is shown for the given interval. The animation repeats forever while the rest of your program keeps running.
**Parameters:**
- matrices (iter) – Sequence of Matrix of intensities.
- interval (Number, ms) – Time to display each image in the list.

### display.number(number)
Displays a number in the range -99 to 99.
A minus sign (-) is shown as a faint dot in the center of the display. Numbers greater than 99 are shown as >. Numbers less than -99 are shown as <.
**Parameters:**
- number (int) – The number to be displayed.

### display.char(char)
Displays a character or symbol on the light grid. This may be any letter (a–z), capital letter (A–Z) or one of the following symbols: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}.
**Parameters:**
- character (str) – The character or symbol to be displayed.

### display.text(text, on=500, off=50)
Displays a text string, one character at a time, with a pause between each character. After the last character is shown, all lights turn off.
**Parameters:**
- text (str) – The text to be displayed.
- on (Number, ms) – For how long a character is shown.
- off (Number, ms) – For how long the display is off between characters.

---

## Using the buttons

### buttons.pressed() → Set[Button]
Checks which buttons are currently pressed.
**Returns:**
- Set of pressed buttons.

### system.set_stop_button(button)
Sets the button or button combination that stops a running script.
Normally, the center button is used to stop a running script. You can change or disable this behavior in order to use the button for other purposes.
**Parameters:**
- button (Button) – A button such as Button.CENTER, or a tuple of multiple buttons. Choose None to disable the stop button altogether. If you do, you can still turn the hub off by holding the center button for three seconds.

---

## Using the IMU

### imu.ready() → bool
Checks if the device is calibrated and ready for use.
This becomes True when the robot has been sitting stationary for a few seconds, which allows the device to re-calibrate. It is False if the hub has just been started, or if it hasn’t had a chance to calibrate for more than 10 minutes.
**Returns:**
- True if it is ready for use, False if not.

### imu.stationary() → bool
Checks if the device is currently stationary (not moving).
**Returns:**
- True if stationary for at least a second, False if it is moving.

### imu.up(calibrated=True) → Side
Checks which side of the hub currently faces upward.
**Parameters:**
- calibrated (bool) – Choose True to use calibrated gyroscope and accelerometer data to determine which way is up. Choose False to use raw acceleration values.
**Returns:**
- Side.TOP, Side.BOTTOM, Side.LEFT, Side.RIGHT, Side.FRONT or Side.BACK.

### imu.tilt(calibrated=True) → Tuple[int, int]
Gets the pitch and roll angles. This is relative to the user-specified neutral orientation.
The order of rotation is pitch-then-roll. This is equivalent to a positive rotation along the robot y-axis and then a positive rotation along the x-axis.
**Parameters:**
- calibrated (bool) – Choose True to use calibrated gyroscope and accelerometer data to determine the tilt. Choose False to use raw acceleration values.
**Returns:**
- Tuple of pitch and roll angles in degrees.

### imu.acceleration(axis, calibrated=True) → float: mm/s²
### imu.acceleration(calibrated=True) → vector: mm/s²
Gets the acceleration of the device along a given axis in the robot reference frame.
**Parameters:**
- axis (Axis) – Axis along which the acceleration should be measured, or None to get a vector along all axes.
- calibrated (bool) – Choose True to use calibrated acceleration values. Choose False to use raw acceleration values.
**Returns:**
- Acceleration along the specified axis. If you specify no axis, this returns a vector of accelerations along all axes.

### imu.angular_velocity(axis, calibrated=True) → float: deg/s
### imu.angular_velocity(calibrated=True) → vector: deg/s
Gets the angular velocity of the device along a given axis in the robot reference frame.
**Parameters:**
- axis (Axis) – Axis along which the angular velocity should be measured, or None to get a vector along all axes.
- calibrated (bool) – Choose True to compensate for the estimated bias and configured scale of the gyroscope. Choose False to get raw angular velocity values.
**Returns:**
- Angular velocity along the specified axis. If you specify no axis, this returns a vector of accelerations along all axes.

### imu.heading() → float: deg
Gets the heading angle of your robot. A positive value means a clockwise turn.
The heading is 0 when your program starts. The value continues to grow even as the robot turns more than 180 degrees. It does not wrap around to -180 like it does in some apps.
**Note:** For now, this method only keeps track of the heading while the robot is on a flat surface.
**Returns:**
- Heading angle relative to starting orientation.

### imu.reset_heading(angle)
Resets the accumulated heading angle of the robot.
This cannot be called while a drive base is using the gyro to drive or hold position. Use DriveBase.reset() instead, which will stop the robot and then set the new heading value.
**Parameters:**
- angle (Number, deg) – Value to which the heading should be reset.
**Raises:**
- OSError – There is a drive base that is currently using the gyro.

### imu.rotation(axis, calibrated=True) → float: deg
Gets the rotation of the device along a given axis in the robot reference frame.
This value is useful if your robot only rotates along the requested axis. For general three-dimensional motion, use the orientation() method instead.
**Parameters:**
- axis (Axis) – Axis along which the rotation should be measured.
- calibrated (bool) – Choose True to compensate for configured scale of the gyroscope. Choose False to get unscaled values.
**Returns:**
- The rotation angle.

### imu.orientation() → Matrix
Gets the three-dimensional orientation of the robot in the robot reference frame.
It returns a rotation matrix whose columns represent the X, Y, and Z axis of the robot.
**Returns:**
- The 3x3 rotation matrix.

### imu.settings(*, angular_velocity_threshold, acceleration_threshold, heading_correction, angular_velocity_bias, angular_velocity_scale, acceleration_correction)
Configures the IMU settings. If no arguments are given, this returns the current values.

---

## Using the speaker

### speaker.volume(volume)
### speaker.volume() → int: %
Gets or sets the speaker volume.
**Parameters:**
- volume (Number, %) – Volume of the speaker in the 0-100 range.

### await speaker.beep(frequency=500, duration=100)
Play a beep/tone.
**Parameters:**
- frequency (Number, Hz) – Frequency of the beep in the 64-24000 Hz range.
- duration (Number, ms) – Duration of the beep.

### await speaker.play_notes(notes, tempo=120)
Plays a sequence of musical notes.
**Parameters:**
- notes (iter) – A sequence of notes to be played.
- tempo (int) – Beats per minute.

---

## Using connectionless Bluetooth messaging

### await ble.broadcast(data)
Starts broadcasting the given data on the broadcast_channel you selected when initializing the hub.
**Parameters:**
- data – The value or values to be broadcast.

### ble.observe(channel) → bool | int | float | str | bytes | tuple | None
Retrieves the last observed data for a given channel.
**Parameters:**
- channel (int) – The channel to observe (0 to 255).
**Returns:**
- The received data in the same format as it was sent, or None if no recent data is available.

### ble.signal_strength(channel) → int: dBm
Gets the average signal strength in dBm for the given channel.
**Parameters:**
- channel (int) – The channel number (0 to 255).
**Returns:**
- The signal strength or -128 if there is no recent observed data.

### ble.version() → str
Gets the firmware version from the Bluetooth chip.

---

## Using the battery

### battery.voltage() → int: mV
Gets the voltage of the battery.

### battery.current() → int: mA
Gets the current supplied by the battery.

---

## Getting the charger status

### charger.connected() → bool
Checks whether a charger is connected via USB.

### charger.current() → int: mA
Gets the charging current.

### charger.status() → int
Gets the status of the battery charger (0=Not charging, 1=Charging, 2=Complete, 3=Error).

---

## System control

### system.info() → dict
Gets information about the hub as a dictionary.

### system.storage(offset, write=)
### system.storage(offset, read=) → bytes
Reads or writes binary data to persistent storage.
You can store up to 512 bytes of data on this hub.

### system.reset_storage()
Resets all user settings to default values and erases user programs.

### system.shutdown()
Stops your program and shuts the hub down.
