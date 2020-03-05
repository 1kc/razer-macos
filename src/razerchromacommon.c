//
//  razerchromacommon.c
//  RazerBlade
//

#include <string.h>

#include "razercommon.h"
#include "razerchromacommon.h"

/*
 * Standard Device Functions
 */

/**
 * Set what mode the device will operate in.
 *
 * Currently known modes
 * 0x00, 0x00: Normal Mode
 * 0x02, 0x00: Unknown Mode
 * 0x03, 0x00: Driver Mode
 *
 * 0x02, 0x00 Will make M1-5 and FN emit normal keystrokes. Some sort of factory test mode. Not recommended to be used.
 */
struct razer_report razer_chroma_standard_set_device_mode(unsigned char mode, unsigned char param) {
    struct razer_report report = get_razer_report(0x00, 0x04, 0x02);
    
    if(mode != 0x00 && mode != 0x03) { // Explicitly blocking the 0x02 mode
        mode = 0x00;
    }
    if(param != 0x00) {
        param = 0x00;
    }
    
    report.arguments[0] = mode;
    report.arguments[1] = param;
    
    return report;
}

/**
 * Get what mode the device is operating in.
 *
 * Currently known modes
 * 0x00, 0x00: Normal Mode
 * 0x02, 0x00: Unknown Mode
 * 0x03, 0x00: Driver Mode
 *
 * 0x02, 0x00 Will make M1-5 and FN emit normal keystrokes. Some sort of factory test mode. Not recommended to be used.
 */
struct razer_report razer_chroma_standard_get_device_mode(void) {
    return get_razer_report(0x00, 0x84, 0x02);
}

/**
 * Get serial from device
 */
struct razer_report razer_chroma_standard_get_serial(void) {
    return get_razer_report(0x00, 0x82, 0x16);
}

/**
 * Get firmware version from device
 */
struct razer_report razer_chroma_standard_get_firmware_version(void) {
    return get_razer_report(0x00, 0x81, 0x02);
}


/*
 * Standard Functions
 */

/**
 * Set the state of an LED on the device
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * 00     3f    0000   00    03       03    00  010801                     | SET LED STATE (VARSTR, GAMEMODE, ON)
 * 00     3f    0000   00    03       03    00  010800                     | SET LED STATE (VARSTR, GAMEMODE, OFF)
 */
struct razer_report razer_chroma_standard_set_led_state(unsigned char variable_storage, unsigned char led_id, unsigned char led_state) {
    struct razer_report report = get_razer_report(0x03, 0x00, 0x03);
    report.arguments[0] = variable_storage;
    report.arguments[1] = led_id;
    report.arguments[2] = clamp_u8(led_state, 0x00, 0x01);
    
    return report;
}

struct razer_report razer_chroma_standard_set_led_blinking(unsigned char variable_storage, unsigned char led_id) {
    struct razer_report report = get_razer_report(0x03, 0x04, 0x04);
    report.arguments[0] = variable_storage;
    report.arguments[1] = led_id;
    report.arguments[2] = 0x05;
    report.arguments[3] = 0x05;
    
    return report;
}

/**
 * Get the state of an LED on the device
 */
struct razer_report razer_chroma_standard_get_led_state(unsigned char variable_storage, unsigned char led_id) {
    struct razer_report report = get_razer_report(0x03, 0x80, 0x03);
    report.arguments[0] = variable_storage;
    report.arguments[1] = led_id;
    
    return report;
}

/**
 * Set LED RGB parameters
 */
struct razer_report razer_chroma_standard_set_led_rgb(unsigned char variable_storage, unsigned char led_id, struct razer_rgb *rgb1) {
    struct razer_report report = get_razer_report(0x03, 0x01, 0x05);
    report.arguments[0] = variable_storage;
    report.arguments[1] = led_id;
    report.arguments[2] = rgb1->r;
    report.arguments[3] = rgb1->g;
    report.arguments[4] = rgb1->b;
    
    return report;
}

/**
 * Get LED RGB parameters
 */
struct razer_report razer_chroma_standard_get_led_rgb(unsigned char variable_storage, unsigned char led_id) {
    struct razer_report report = get_razer_report(0x03, 0x81, 0x05);
    report.arguments[0] = variable_storage;
    report.arguments[1] = led_id;
    return report;
}

/**
 * Set the effect of an LED on the device
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_standard_set_led_effect(unsigned char variable_storage, unsigned char led_id, unsigned char led_effect) {
    struct razer_report report = get_razer_report(0x03, 0x02, 0x03);
    report.arguments[0] = variable_storage;
    report.arguments[1] = led_id;
    report.arguments[2] = clamp_u8(led_effect, 0x00, 0x05);
    
    return report;
}

/**
 * Get the effect of an LED on the device
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_standard_get_led_effect(unsigned char variable_storage, unsigned char led_id) {
    struct razer_report report = get_razer_report(0x03, 0x82, 0x03);
    report.arguments[0] = variable_storage;
    report.arguments[1] = led_id;
    
    return report;
}

/**
 * Set the brightness of an LED on the device
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_standard_set_led_brightness(unsigned char variable_storage, unsigned char led_id, unsigned char brightness) {
    struct razer_report report = get_razer_report(0x03, 0x03, 0x03);
    report.arguments[0] = variable_storage;
    report.arguments[1] = led_id;
    report.arguments[2] = brightness;
    
    return report;
}

/**
 * Get the brightness of an LED on the device
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_standard_get_led_brightness(unsigned char variable_storage, unsigned char led_id) {
    struct razer_report report = get_razer_report(0x03, 0x83, 0x03);
    report.arguments[0] = variable_storage;
    report.arguments[1] = led_id;
    
    return report;
}

/*
 * Standard Matrix Effects Functions
 */

// TODO remove varstore and led_id
/**
 * Set the effect of the LED matrix to None
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_standard_matrix_effect_none(unsigned char variable_storage, unsigned char led_id) {
    struct razer_report report = get_razer_report(0x03, 0x0A, 0x01);
    report.arguments[0] = 0x00; // Effect ID
    
    return report;
}

/**
 * Set the effect of the LED matrix to Wave
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_standard_matrix_effect_wave(unsigned char variable_storage, unsigned char led_id, unsigned char wave_direction) {
    struct razer_report report = get_razer_report(0x03, 0x0A, 0x02);
    report.arguments[0] = 0x01; // Effect ID
    report.arguments[1] = clamp_u8(wave_direction, 0x01, 0x02);
    
    return report;
}

/**
 * Set the effect of the LED matrix to Spectrum
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_standard_matrix_effect_spectrum(unsigned char variable_storage, unsigned char led_id) {
    struct razer_report report = get_razer_report(0x03, 0x0A, 0x01);
    report.arguments[0] = 0x04; // Effect ID
    
    return report;
}

/**
 * Set the effect of the LED matrix to Reactive
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_standard_matrix_effect_reactive(unsigned char variable_storage, unsigned char led_id, unsigned char speed, struct razer_rgb *rgb1) {
    struct razer_report report = get_razer_report(0x03, 0x0A, 0x05);
    report.arguments[0] = 0x02; // Effect ID
    report.arguments[1] = clamp_u8(speed, 0x01, 0x04); // Time
    report.arguments[2] = rgb1->r; /*rgb color definition*/
    report.arguments[3] = rgb1->g;
    report.arguments[4] = rgb1->b;
    
    return report;
}

/**
 * Set the effect of the LED matrix to Static
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_standard_matrix_effect_static(unsigned char variable_storage, unsigned char led_id, struct razer_rgb *rgb1) {
    struct razer_report report = get_razer_report(0x03, 0x0A, 0x04);
    report.arguments[0] = 0x06; // Effect ID
    report.arguments[1] = rgb1->r; /*rgb color definition*/
    report.arguments[2] = rgb1->g;
    report.arguments[3] = rgb1->b;
    
    return report;
}

/**
 * Set the effect of the LED matrix to Starlight
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_standard_matrix_effect_starlight_single(unsigned char variable_storage, unsigned char led_id, unsigned char speed, struct razer_rgb *rgb1) {
    struct razer_report report = get_razer_report(0x03, 0x0A, 0x01);
    
    speed = clamp_u8(speed, 0x01, 0x03); // For now only seen
    
    report.arguments[0] = 0x19; // Effect ID
    report.arguments[1] = 0x01; // Type one color
    report.arguments[2] = speed; // Speed
    
    report.arguments[3] = rgb1->r; // Red 1
    report.arguments[4] = rgb1->g; // Green 1
    report.arguments[5] = rgb1->b; // Blue 1
    
    // For now havent seen any chroma using this, seen the extended version
    report.arguments[6] = 0x00; // Red 2
    report.arguments[7] = 0x00; // Green 2
    report.arguments[8] = 0x00; // Blue 2
    
    return report;
}

/**
 * Set the effect of the LED matrix to Starlight
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_standard_matrix_effect_starlight_dual(unsigned char variable_storage, unsigned char led_id, unsigned char speed, struct razer_rgb *rgb1, struct razer_rgb *rgb2) {
    struct razer_report report = get_razer_report(0x03, 0x0A, 0x01);
    
    speed = clamp_u8(speed, 0x01, 0x03); // For now only seen
    
    report.arguments[0] = 0x19; // Effect ID
    report.arguments[1] = 0x02; // Type two color
    report.arguments[2] = speed; // Speed
    
    report.arguments[3] = rgb1->r; // Red 1
    report.arguments[4] = rgb1->g; // Green 1
    report.arguments[5] = rgb1->b; // Blue 1
    
    // For now havent seen any chroma using this, seen the extended version
    report.arguments[6] = rgb2->r; // Red 2
    report.arguments[7] = rgb2->g; // Green 2
    report.arguments[8] = rgb2->b; // Blue 2
    
    return report;
}

struct razer_report razer_chroma_standard_matrix_effect_starlight_random(unsigned char variable_storage, unsigned char led_id, unsigned char speed) {
    struct razer_report report = get_razer_report(0x03, 0x0A, 0x01);
    
    speed = clamp_u8(speed, 0x01, 0x03); // For now only seen
    
    report.arguments[0] = 0x19; // Effect ID
    report.arguments[1] = 0x03; // Type random color
    report.arguments[2] = speed; // Speed
    
    return report;
}

/**
 * Set the device to "Breathing" effect
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ??
 * ??
 * ??
 */
struct razer_report razer_chroma_standard_matrix_effect_breathing_random(unsigned char variable_storage, unsigned char led_id) {
    struct razer_report report = get_razer_report(0x03, 0x0A, 0x08);
    report.arguments[0] = 0x03; // Effect ID
    report.arguments[1] = 0x03; // Breathing type
    
    return report;
}

struct razer_report razer_chroma_standard_matrix_effect_breathing_single(unsigned char variable_storage, unsigned char led_id, struct razer_rgb *rgb1) {
    struct razer_report report = get_razer_report(0x03, 0x0A, 0x08);
    report.arguments[0] = 0x03; // Effect ID
    report.arguments[1] = 0x01; // Breathing type
    report.arguments[2] = rgb1->r;
    report.arguments[3] = rgb1->g;
    report.arguments[4] = rgb1->b;
    
    return report;
}

struct razer_report razer_chroma_standard_matrix_effect_breathing_dual(unsigned char variable_storage, unsigned char led_id, struct razer_rgb *rgb1, struct razer_rgb *rgb2) {
    struct razer_report report = get_razer_report(0x03, 0x0A, 0x08);
    report.arguments[0] = 0x03; // Effect ID
    report.arguments[1] = 0x02; // Breathing type
    report.arguments[2] = rgb1->r;
    report.arguments[3] = rgb1->g;
    report.arguments[4] = rgb1->b;
    report.arguments[5] = rgb2->r;
    report.arguments[6] = rgb2->g;
    report.arguments[7] = rgb2->b;
    
    return report;
}

/**
 * Set the device to "Custom" effect
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ??
 *
 * Apparently Ultimate2016, Stealth and Stealth2016 need frame id to be 0x00, I dont think its needed (depending on set_custom_frame)
 */
struct razer_report razer_chroma_standard_matrix_effect_custom_frame(unsigned char variable_storage) {
    struct razer_report report = get_razer_report(0x03, 0x0A, 0x02);
    report.arguments[0] = 0x05; // Effect ID
    report.arguments[1] = variable_storage; // Data frame ID
    // report.arguments[1] = 0x01; // Data frame ID
    
    return report;
}

/**
 * Set the RGB or a row
 *
 * Start and stop columns are inclusive
 *
 * This sets the colour of a row on the keyboard. Takes in an array of RGB bytes.
 * The mappings below are correct for the BlackWidow Chroma. The BlackWidow Ultimate 2016
 * contains LEDs under the spacebar and the FN key so there will be changes once I get the
 * hardware.
 *
 * Row 0:
 *  0      Unused
 *  1      ESC
 *  2      Unused
 *  3-14   F1-F12
 *  15-17  PrtScr, ScrLk, Pause
 *  18-19  Unused
 *  20     Razer Logo
 *  21     Unused
 *
 * Row 1:
 *  0-21   M1 -> NP Minus
 *
 * Row 2:
 *  0-13   M2 -> Right Square Bracket ]
 *  14 Unused
 *  15-21 Delete -> NP Plus
 *
 * Row 3:
 *  0-14   M3 -> Return
 *  15-17  Unused
 *  18-20  NP4 -> NP6
 *
 * Row 4:
 *  0-12   M4 -> Forward Slash /
 *  13     Unused
 *  14     Right Shift
 *  15     Unused
 *  16     Up Arrow Key
 *  17     Unused
 *  18-21  NP1 -> NP Enter
 *
 * Row 5:
 *  0-3    M5 -> Alt
 *  4-10   Unused
 *  11     Alt GR
 *  12     Unused
 *  13-17  Context Menu Key -> Right Arrow Key
 *  18     Unused
 *  19-20  NP0 -> NP.
 *  21     Unused
 */
struct razer_report razer_chroma_standard_matrix_set_custom_frame(unsigned char row_index, unsigned char start_col, unsigned char stop_col, unsigned char *rgb_data) {
    size_t row_length = (size_t) (((stop_col + 1) - start_col) * 3);
    struct razer_report report = get_razer_report(0x03, 0x0B, 0x46); // In theory should be able to leave data size at max as we have start/stop
    int index = 4 + (start_col * 3);
    
    // printk(KERN_ALERT "razerkbd: Row ID: %d, Start: %d, Stop: %d, row length: %d\n", row_index, start_col, stop_col, (unsigned char)row_length);
    
    report.arguments[0] = 0xFF; // Frame ID
    report.arguments[1] = row_index;
    report.arguments[2] = start_col;
    report.arguments[3] = stop_col;
    memcpy(&report.arguments[index], rgb_data, row_length);
    
    return report;
}

/*
 * Misc Functions
 */
/**
 * Toggled wether F1-12 act as F1-12 or if they act as the function options (without Fn pressed)
 *
 * If 0 should mean that the F-keys work as normal F-keys
 * If 1 should mean that the F-keys act as if the FN key is held
 */
struct razer_report razer_chroma_misc_fn_key_toggle(unsigned char state) {
    struct razer_report report = get_razer_report(0x02, 0x06, 0x02);
    report.arguments[0] = 0x00; // ?? Variable storage maybe
    report.arguments[1] = clamp_u8(state, 0x00, 0x01); // State
    
    return report;
}

/**
 * Set the brightness of an LED on the device
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_misc_set_blade_brightness(unsigned char brightness) {
    struct razer_report report = get_razer_report(0x0E, 0x04, 0x02);
    report.arguments[0] = 0x01;
    report.arguments[1] = brightness;
    
    return report;
}

/**
 * Get the brightness of an LED on the device
 *
 * Status Trans Packet Proto DataSize Class CMD Args
 * ? TODO fill this
 */
struct razer_report razer_chroma_misc_get_blade_brightness(void) {
    struct razer_report report = get_razer_report(0x0E, 0x84, 0x02);
    report.arguments[0] = 0x01;
    
    return report;
}
