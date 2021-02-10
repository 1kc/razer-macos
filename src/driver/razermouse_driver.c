/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA
 *
 * Should you need to contact me, the author, you can do so by
 * e-mail - mail your message to Terry Cain <terry@terrys-home.co.uk>
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "razermouse_driver.h"
#include "razercommon.h"
#include "razerchromacommon.h"

/**
 * Send report to the mouse
 */
static int razer_get_report(IOUSBDeviceInterface **usb_dev, struct razer_report *request_report, struct razer_report *response_report)
{
    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch (product) {
    // These devices require longer waits to read their firmware, serial, and other setting values
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
    case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
    case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
    case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        return razer_get_usb_response(usb_dev, 0x00, request_report, 0x00, response_report, RAZER_NEW_MOUSE_RECEIVER_WAIT_MIN_US);
        break;

    case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
    case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
    case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
    case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
    case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        return razer_get_usb_response(usb_dev, 0x00, request_report, 0x00, response_report, RAZER_VIPER_MOUSE_RECEIVER_WAIT_MIN_US);
        break;

    default:
        return razer_get_usb_response(usb_dev, 0x00, request_report, 0x00, response_report, RAZER_MOUSE_WAIT_MIN_US);
    }
}

/**
 * Function to send to device, get response, and actually check the response
 */
static struct razer_report razer_send_payload(IOUSBDeviceInterface **usb_dev, struct razer_report *request_report)
{
    IOReturn retval = -1;

    struct razer_report response_report = {0};

    request_report->crc = razer_calculate_crc(request_report);

    retval = razer_get_report(usb_dev, request_report, &response_report);

    if(retval == 0) {
        // Check the packet number, class and command are the same
        if(response_report.remaining_packets != request_report->remaining_packets ||
           response_report.command_class != request_report->command_class ||
           response_report.command_id.id != request_report->command_id.id) {
            printf("Response doesn't match request");
//        } else if (response_report.status == RAZER_CMD_BUSY) {
//            print_erroneous_report(&response_report, "razermouse", "Device is busy");
        } else if (response_report.status == RAZER_CMD_FAILURE) {
            printf("Command failed");
        } else if (response_report.status == RAZER_CMD_NOT_SUPPORTED) {
            printf("Command not supported");
        } else if (response_report.status == RAZER_CMD_TIMEOUT) {
            printf("Command timed out");
        }
    } else {
        printf("Invalid Report Length");
    }

    return response_report;
}


/**
 * Read device file "device_type"
 *
 * Returns friendly string of device type
 */
ssize_t razer_mouse_attr_read_device_type(IOUSBDeviceInterface **usb_dev, char *buf)
{
    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);
    char *device_type = "";

    switch (product) {
    case USB_DEVICE_ID_RAZER_DEATHADDER_3_5G:
        device_type = "Razer DeathAdder 3.5G\n";
        break;

    case USB_DEVICE_ID_RAZER_MAMBA_2012_WIRED:
        device_type = "Razer Mamba 2012 (Wired)\n";
        break;

    case USB_DEVICE_ID_RAZER_MAMBA_2012_WIRELESS:
        device_type = "Razer Mamba 2012 (Wireless)\n";
        break;

    case USB_DEVICE_ID_RAZER_MAMBA_WIRED:
        device_type = "Razer Mamba (Wired)\n";
        break;

    case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS:
        device_type = "Razer Mamba (Wireless)\n";
        break;

    case USB_DEVICE_ID_RAZER_MAMBA_TE_WIRED:
        device_type = "Razer Mamba Tournament Edition\n";
        break;

    case USB_DEVICE_ID_RAZER_ABYSSUS:
        device_type = "Razer Abyssus 2014\n";
        break;

    case USB_DEVICE_ID_RAZER_ABYSSUS_1800:
        device_type = "Razer Abyssus 1800\n";
        break;

    case USB_DEVICE_ID_RAZER_ABYSSUS_2000:
        device_type = "Razer Abyssus 2000\n";
        break;

    case USB_DEVICE_ID_RAZER_IMPERATOR:
        device_type = "Razer Imperator 2012\n";
        break;

    case USB_DEVICE_ID_RAZER_OUROBOROS:
        device_type = "Razer Ouroboros\n";
        break;

    case USB_DEVICE_ID_RAZER_OROCHI_2011:
        device_type = "Razer Orochi 2011\n";
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_2013:
        device_type = "Razer DeathAdder 2013\n";
        break;

    case USB_DEVICE_ID_RAZER_OROCHI_2013:
        device_type = "Razer Orochi 2013\n";
        break;

    case USB_DEVICE_ID_RAZER_OROCHI_CHROMA:
        device_type = "Razer Orochi (Wired)\n";
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_CHROMA:
        device_type = "Razer DeathAdder Chroma\n";
        break;

    case USB_DEVICE_ID_RAZER_NAGA_HEX_RED:
        device_type = "Razer Naga Hex (Red)\n";
        break;

    case USB_DEVICE_ID_RAZER_NAGA_HEX:
        device_type = "Razer Naga Hex\n";
        break;

    case USB_DEVICE_ID_RAZER_NAGA_2012:
        device_type = "Razer Naga 2012\n";
        break;

    case USB_DEVICE_ID_RAZER_NAGA_2014:
        device_type = "Razer Naga 2014\n";
        break;

    case USB_DEVICE_ID_RAZER_TAIPAN:
        device_type = "Razer Taipan\n";
        break;

    case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
        device_type = "Razer Naga Hex V2\n";
        break;

    case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
        device_type = "Razer Naga Chroma\n";
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
        device_type = "Razer DeathAdder Elite\n";
        break;

    case USB_DEVICE_ID_RAZER_ABYSSUS_V2:
        device_type = "Razer Abyssus V2\n";
        break;

    case USB_DEVICE_ID_RAZER_DIAMONDBACK_CHROMA:
        device_type = "Razer Diamondback Chroma\n";
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_3500:
        device_type = "Razer DeathAdder 3500\n";
        break;

    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        device_type = "Razer Lancehead (Wired)\n";
        break;

    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        device_type = "Razer Lancehead (Wireless)\n";
        break;

    case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        device_type = "Razer Lancehead Tournament Edition\n";
        break;

    case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        device_type = "Razer Mamba Elite\n";
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
        device_type = "Razer DeathAdder Essential\n";
        break;

    case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
        device_type = "Razer Naga Trinity\n";
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_1800:
        device_type = "Razer DeathAdder 1800\n";
        break;

    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        device_type = "Razer Lancehead Wireless (Receiver)\n";
        break;

    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        device_type = "Razer Lancehead Wireless (Wired)\n";
        break;

    case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        device_type = "Razer Mamba Wireless (Receiver)\n";
        break;

    case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        device_type = "Razer Mamba Wireless (Wired)\n";
        break;

    case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
        device_type = "Razer Abyssus Elite (D.Va Edition)\n";
        break;

    case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
        device_type = "Razer Abyssus Essential\n";
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
        device_type = "Razer DeathAdder Essential (White Edition)\n";
        break;

    case USB_DEVICE_ID_RAZER_VIPER:
        device_type = "Razer Viper\n";
        break;

    case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
        device_type = "Razer Viper 8KHz\n";
        break;

    case USB_DEVICE_ID_RAZER_VIPER_MINI:
        device_type = "Razer Viper Mini\n";
        break;

    case USB_DEVICE_ID_RAZER_BASILISK_V2:
        device_type = "Razer Basilisk V2\n";
        break;


    case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
        device_type = "Razer Viper Ultimate (Wired)\n";
        break;

    case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
        device_type = "Razer Viper Ultimate (Wireless)\n";
        break;

    case USB_DEVICE_ID_RAZER_BASILISK:
        device_type = "Razer Basilisk\n";
        break;

    case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        device_type = "Razer Basilisk Ultimate\n";
        break;

    case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        device_type = "Razer Basilisk Ultimate Wireless\n";
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
        device_type = "Razer Deathadder V2\n";
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        device_type = "Razer DeathAdder V2 Pro (Wired)\n";
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
        device_type = "Razer DeathAdder V2 Pro (Wireless)\n";
        break;

    default:
        device_type = "Unknown Device\n";
    }

    return sprintf(buf, "%s", device_type);
}

ssize_t razer_attr_write_side_mode_wave(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count, int side)
{
    unsigned char direction = (unsigned char)strtol(buf, NULL, 10);
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
            report = razer_chroma_extended_matrix_effect_wave(VARSTORE, side, direction, 0x28);
            break;

        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report = razer_chroma_extended_matrix_effect_wave(VARSTORE, side, direction, 0x28);
            report.transaction_id.id = 0x1f;
            break;

        default:
            printf("razermouse: logo_mode_wave not supported for this model\n");
            return count;
    }

    razer_send_payload(usb_dev, &report);
    return count;
}

ssize_t razer_attr_write_side_mode_static(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count, int side)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    if(count == 3) {
        switch(product) {
            case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
            case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
                report = razer_chroma_mouse_extended_matrix_effect_static(VARSTORE, side, (struct razer_rgb*)&buf[0]);
                break;

            case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
            case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
            case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
            case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
            case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
            case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
            case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
            case USB_DEVICE_ID_RAZER_VIPER:
            case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
            case USB_DEVICE_ID_RAZER_VIPER_MINI:
            case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
            case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
            case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
            case USB_DEVICE_ID_RAZER_BASILISK:
            case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
            case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
            case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
            case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
            case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
                report = razer_chroma_extended_matrix_effect_static(VARSTORE, side, (struct razer_rgb*)&buf[0]);
                break;

            case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
            case USB_DEVICE_ID_RAZER_BASILISK_V2:
                report = razer_chroma_extended_matrix_effect_static(VARSTORE, side, (struct razer_rgb*)&buf[0]);
                report.transaction_id.id = 0x1f;
                break;

            default:
                printf("razermouse: logo_mode_static not supported for this model\n");
                return count;
        }

        razer_send_payload(usb_dev, &report);
    } else {
        printf("razermouse: Static mode only accepts RGB (3byte)\n");
    }
    return count;
}

ssize_t razer_attr_write_side_mode_static_no_store(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count, int side)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    if(count == 3) {
        switch(product) {
            case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
            case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
                report = razer_chroma_mouse_extended_matrix_effect_static(NOSTORE, side, (struct razer_rgb*)&buf[0]);
                break;

            case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
            case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
            case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
            case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
            case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
            case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
            case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
            case USB_DEVICE_ID_RAZER_VIPER:
            case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
            case USB_DEVICE_ID_RAZER_VIPER_MINI:
            case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
            case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
            case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
            case USB_DEVICE_ID_RAZER_BASILISK:
            case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
            case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
            case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
            case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
            case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
                report = razer_chroma_extended_matrix_effect_static(NOSTORE, side, (struct razer_rgb*)&buf[0]);
                break;

            case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
            case USB_DEVICE_ID_RAZER_BASILISK_V2:
                report = razer_chroma_extended_matrix_effect_static(NOSTORE, side, (struct razer_rgb*)&buf[0]);
                report.transaction_id.id = 0x1f;
                break;

            default:
                printf("razermouse: side_mode_static_no_store not supported for this model\n");
                return count;
        }

        razer_send_payload(usb_dev, &report);
    } else {
        printf("razermouse: Static mode only accepts RGB (3byte)\n");
    }
    return count;
}

ssize_t razer_attr_write_side_mode_spectrum(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count, int side)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
        case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
        case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
            report = razer_chroma_mouse_extended_matrix_effect_spectrum(VARSTORE, side);
            break;

        case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_VIPER:
        case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
        case USB_DEVICE_ID_RAZER_VIPER_MINI:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
        case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
        case USB_DEVICE_ID_RAZER_BASILISK:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
            report = razer_chroma_extended_matrix_effect_spectrum(VARSTORE, side);
            break;

        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report = razer_chroma_extended_matrix_effect_spectrum(VARSTORE, side);
            report.transaction_id.id = 0x1f;
            break;

        default:
            printf("razermouse: side_mode_spectrum not supported for this model\n");
            return count;
    }

    razer_send_payload(usb_dev, &report);
    return count;
}

ssize_t razer_attr_write_side_mode_breath(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count, int side)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
        case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
        case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
            switch(count) {
                case 3: // Single colour mode
                    report = razer_chroma_mouse_extended_matrix_effect_breathing_single(VARSTORE, side, (struct razer_rgb*)&buf[0]);
                    break;

                case 6: // Dual colour mode
                    report = razer_chroma_mouse_extended_matrix_effect_breathing_dual(VARSTORE, side, (struct razer_rgb*)&buf[0], (struct razer_rgb*)&buf[3]);
                    break;

                default: // "Random" colour mode
                    report = razer_chroma_mouse_extended_matrix_effect_breathing_random(VARSTORE, side);
                    break;
            }
            break;

        case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
        case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_VIPER:
        case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
        case USB_DEVICE_ID_RAZER_VIPER_MINI:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
        case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
        case USB_DEVICE_ID_RAZER_BASILISK:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
            switch(count) {
                case 3: // Single colour mode
                    report = razer_chroma_extended_matrix_effect_breathing_single(VARSTORE, side, (struct razer_rgb*)&buf[0]);
                    break;

                case 6: // Dual colour mode
                    report = razer_chroma_extended_matrix_effect_breathing_dual(VARSTORE, side, (struct razer_rgb*)&buf[0], (struct razer_rgb*)&buf[3]);
                    break;

                default: // "Random" colour mode
                    report = razer_chroma_extended_matrix_effect_breathing_random(VARSTORE, side);
                    break;
            }
            break;
    }

    switch(product) {
        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report.transaction_id.id = 0x1f;
            break;

        default:
            report.transaction_id.id = 0x3f;
            break;
    }

    razer_send_payload(usb_dev, &report);
    return count;
}

ssize_t razer_attr_write_side_mode_none(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count, int side)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
        case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
        case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
            report = razer_chroma_mouse_extended_matrix_effect_none(VARSTORE, LOGO_LED);
            break;

        case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_VIPER:
        case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
        case USB_DEVICE_ID_RAZER_VIPER_MINI:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
        case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
        case USB_DEVICE_ID_RAZER_BASILISK:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
            report = razer_chroma_extended_matrix_effect_none(VARSTORE, side);
            break;

        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report = razer_chroma_extended_matrix_effect_none(VARSTORE, side);
            report.transaction_id.id = 0x1f;
            break;

        default:
            printf("razermouse: logo_mode_none not supported for this model\n");
            return count;
    }

    razer_send_payload(usb_dev, &report);
    return count;
}

/**
 * Write device file "logo_mode_wave" (for extended mouse matrix effects)
 *
 * Wave effect mode is activated whenever the file is written to
 */
ssize_t razer_attr_write_logo_mode_wave(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    unsigned char direction = (unsigned char)strtol(buf, NULL, 10);
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
    case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
    case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        report = razer_chroma_extended_matrix_effect_wave(VARSTORE, LOGO_LED, direction, 0x28);
        break;

    case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
    case USB_DEVICE_ID_RAZER_BASILISK_V2:
        report = razer_chroma_extended_matrix_effect_wave(VARSTORE, LOGO_LED, direction, 0x28);
        report.transaction_id.id = 0x1f;
        break;

    default:
        printf("razermouse: logo_mode_wave not supported for this model\n");
        return count;
    }

    razer_send_payload(usb_dev, &report);
    return count;
}

/**
 * Write device file "scroll_mode_wave" (for extended mouse matrix effects)
 *
 * Wave effect mode is activated whenever the file is written to
 */
ssize_t razer_attr_write_scroll_mode_wave(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    unsigned char direction = (unsigned char)strtol(buf, NULL, 10);
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
            report = razer_chroma_extended_matrix_effect_wave(VARSTORE, SCROLL_WHEEL_LED, direction, 0x28);
            break;

        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report = razer_chroma_extended_matrix_effect_wave(VARSTORE, SCROLL_WHEEL_LED, direction, 0x28);
            report.transaction_id.id = 0x1f;
            break;

        default:
            printf("razermouse: logo_mode_wave not supported for this model\n");
            return count;
    }

    razer_send_payload(usb_dev, &report);
    return count;
}

/**
 * Write device file "left_mode_wave" (for extended mouse matrix effects)
 *
 * Wave effect mode is activated whenever the file is written to
 */
ssize_t razer_attr_write_left_mode_wave(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_wave(usb_dev, buf, count, LEFT_SIDE_LED);
}

/**
 * Write device file "right_mode_wave" (for extended mouse matrix effects)
 *
 * Wave effect mode is activated whenever the file is written to
 */
ssize_t razer_attr_write_right_mode_wave(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_wave(usb_dev, buf, count, RIGHT_SIDE_LED);
}

/**
 * Write device file "logo_mode_static" (for extended mouse matrix effects)
 *
 * Set the mouse to static mode when 3 RGB bytes are written
 */
ssize_t razer_attr_write_logo_mode_static(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    if(count == 3) {
        switch(product) {
        case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
        case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
            report = razer_chroma_mouse_extended_matrix_effect_static(VARSTORE, LOGO_LED, (struct razer_rgb*)&buf[0]);
            break;

        case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_VIPER:
        case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
        case USB_DEVICE_ID_RAZER_VIPER_MINI:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
        case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
        case USB_DEVICE_ID_RAZER_BASILISK:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
            report = razer_chroma_extended_matrix_effect_static(VARSTORE, LOGO_LED, (struct razer_rgb*)&buf[0]);
            break;

        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report = razer_chroma_extended_matrix_effect_static(VARSTORE, LOGO_LED, (struct razer_rgb*)&buf[0]);
            report.transaction_id.id = 0x1f;
            break;
        case USB_DEVICE_ID_RAZER_ABYSSUS_V2:
            report = razer_chroma_standard_set_led_rgb(VARSTORE, LOGO_LED, (struct razer_rgb*)&buf[0]);
            report.transaction_id.id = 0x3F;
            break;
        default:
            printf("razermouse: logo_mode_static not supported for this model\n");
            return count;
        }

        razer_send_payload(usb_dev, &report);
    } else {
        printf("razermouse: Static mode only accepts RGB (3byte)\n");
    }

    return count;
}

/**
 * Write device file "logo_mode_static" (for extended mouse matrix effects)
 *
 * Set the mouse to static mode when 3 RGB bytes are written
 */
ssize_t razer_attr_write_scroll_mode_static(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    if(count == 3) {
        switch(product) {
            case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
            case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
                report = razer_chroma_mouse_extended_matrix_effect_static(VARSTORE, LOGO_LED, (struct razer_rgb*)&buf[0]);
                break;

            case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
            case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
            case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
            case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
            case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
            case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
            case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
            case USB_DEVICE_ID_RAZER_VIPER:
            case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
            case USB_DEVICE_ID_RAZER_VIPER_MINI:
            case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
            case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
            case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
            case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
            case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
            case USB_DEVICE_ID_RAZER_BASILISK:
            case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
            case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
            case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
                report = razer_chroma_extended_matrix_effect_static(VARSTORE, SCROLL_WHEEL_LED, (struct razer_rgb*)&buf[0]);
                break;

            case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
            case USB_DEVICE_ID_RAZER_BASILISK_V2:
                report = razer_chroma_extended_matrix_effect_static(VARSTORE, SCROLL_WHEEL_LED, (struct razer_rgb*)&buf[0]);
                report.transaction_id.id = 0x1f;
                break;
            case USB_DEVICE_ID_RAZER_ABYSSUS_V2:
                report = razer_chroma_standard_set_led_rgb(VARSTORE, SCROLL_WHEEL_LED, (struct razer_rgb*)&buf[0]);
                report.transaction_id.id = 0x3F;
                break;

            default:
                printf("razermouse: logo_mode_static not supported for this model\n");
                return count;
        }

        razer_send_payload(usb_dev, &report);
    } else {
        printf("razermouse: Static mode only accepts RGB (3byte)\n");
    }

    return count;
}

/**
 * Write device file "left_mode_wave" (for extended mouse matrix effects)
 *
 * Wave effect mode is activated whenever the file is written to
 */
ssize_t razer_attr_write_left_mode_static(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_static(usb_dev, buf, count, LEFT_SIDE_LED);
}

/**
 * Write device file "right_mode_static" (for extended mouse matrix effects)
 *
 * Static effect mode is activated whenever the file is written to
 */
ssize_t razer_attr_write_right_mode_static(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_static(usb_dev, buf, count, RIGHT_SIDE_LED);
}


/**
 * Write device file "logo_mode_static" (for extended mouse matrix effects)
 *
 * ** NOSTORE version for efficiency in custom lighting configurations
 *
 * Set the mouse to static mode when 3 RGB bytes are written
 */
ssize_t razer_attr_write_logo_mode_static_no_store(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    if(count == 3) {
        switch(product) {
        case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
        case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
            report = razer_chroma_mouse_extended_matrix_effect_static(NOSTORE, LOGO_LED, (struct razer_rgb*)&buf[0]);
            break;

        case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_VIPER:
        case USB_DEVICE_ID_RAZER_VIPER_MINI:
        case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
        case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
        case USB_DEVICE_ID_RAZER_BASILISK:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
            report = razer_chroma_extended_matrix_effect_static(NOSTORE, LOGO_LED, (struct razer_rgb*)&buf[0]);
            break;

        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report = razer_chroma_extended_matrix_effect_static(NOSTORE, LOGO_LED, (struct razer_rgb*)&buf[0]);
            report.transaction_id.id = 0x1f;
            break;
        case USB_DEVICE_ID_RAZER_ABYSSUS_V2:
            report = razer_chroma_standard_set_led_rgb(NOSTORE, LOGO_LED, (struct razer_rgb*)&buf[0]);
            report.transaction_id.id = 0x1f;
            break;

        default:
            printf("razermouse: logo_mode_static not supported for this model\n");
            return count;
        }

        razer_send_payload(usb_dev, &report);
    } else {
        printf("razermouse: Static mode only accepts RGB (3byte)\n");
    }

    return count;
}

/**
 * Write device file "logo_mode_static" (for extended mouse matrix effects)
 *
 * ** NOSTORE version for efficiency in custom lighting configurations
 *
 * Set the mouse to static mode when 3 RGB bytes are written
 */
ssize_t razer_attr_write_scroll_mode_static_no_store(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    if(count == 3) {
        switch(product) {
            case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
            case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
                report = razer_chroma_mouse_extended_matrix_effect_static(NOSTORE, SCROLL_WHEEL_LED, (struct razer_rgb*)&buf[0]);
                break;

            case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
            case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
            case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
            case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
            case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
            case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
            case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
            case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
            case USB_DEVICE_ID_RAZER_VIPER:
            case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
            case USB_DEVICE_ID_RAZER_VIPER_MINI:
            case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
            case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
            case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
            case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
            case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
            case USB_DEVICE_ID_RAZER_BASILISK:
            case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
            case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
            case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
                report = razer_chroma_extended_matrix_effect_static(NOSTORE, SCROLL_WHEEL_LED, (struct razer_rgb*)&buf[0]);
                break;

            case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
            case USB_DEVICE_ID_RAZER_BASILISK_V2:
                report = razer_chroma_extended_matrix_effect_static(NOSTORE, SCROLL_WHEEL_LED, (struct razer_rgb*)&buf[0]);
                report.transaction_id.id = 0x1f;
                break;
            case USB_DEVICE_ID_RAZER_ABYSSUS_V2:
                report = razer_chroma_standard_set_led_rgb(NOSTORE, SCROLL_WHEEL_LED, (struct razer_rgb*)&buf[0]);
                report.transaction_id.id = 0x3F;
                break;

            default:
                printf("razermouse: logo_mode_static not supported for this model\n");
                return count;
        }

        razer_send_payload(usb_dev, &report);
    } else {
        printf("razermouse: Static mode only accepts RGB (3byte)\n");
    }

    return count;
}

/**
 * Write device file "left_mode_no_store" (for extended mouse matrix effects)
 *
 * NOSTORE version for efficiency in custom lighting configurations
 */
ssize_t razer_attr_write_left_mode_static_no_store(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_static_no_store(usb_dev, buf, count, LEFT_SIDE_LED);
}

/**
 * Write device file "right_mode_no_store" (for extended mouse matrix effects)
 *
 * NOSTORE version for efficiency in custom lighting configurations
 */
ssize_t razer_attr_write_right_mode_static_no_store(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_static_no_store(usb_dev, buf, count, RIGHT_SIDE_LED);
}

/**
 * Write device file "logo_mode_spectrum" (for extended mouse matrix effects)
 *
 * Spectrum effect mode is activated whenever the file is written to
 */
ssize_t razer_attr_write_logo_mode_spectrum(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
    case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
    case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
        report = razer_chroma_mouse_extended_matrix_effect_spectrum(VARSTORE, LOGO_LED);
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
    case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
    case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
    case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
    case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
    case USB_DEVICE_ID_RAZER_VIPER:
    case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
    case USB_DEVICE_ID_RAZER_VIPER_MINI:
    case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
    case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
    case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
    case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
    case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
    case USB_DEVICE_ID_RAZER_BASILISK:
    case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
    case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
    case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
        report = razer_chroma_extended_matrix_effect_spectrum(VARSTORE, LOGO_LED);
        break;

    case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
    case USB_DEVICE_ID_RAZER_BASILISK_V2:
        report = razer_chroma_extended_matrix_effect_spectrum(VARSTORE, LOGO_LED);
        report.transaction_id.id = 0x1f;
        break;

    default:
        printf("razermouse: logo_mode_spectrum not supported for this model\n");
        return count;
    }

    razer_send_payload(usb_dev, &report);
    return count;
}

/**
 * Write device file "logo_mode_spectrum" (for extended mouse matrix effects)
 *
 * Spectrum effect mode is activated whenever the file is written to
 */
ssize_t razer_attr_write_scroll_mode_spectrum(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
        case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
        case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
            report = razer_chroma_mouse_extended_matrix_effect_spectrum(VARSTORE, SCROLL_WHEEL_LED);
            break;

        case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_VIPER:
        case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
        case USB_DEVICE_ID_RAZER_VIPER_MINI:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
        case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
        case USB_DEVICE_ID_RAZER_BASILISK:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
            report = razer_chroma_extended_matrix_effect_spectrum(VARSTORE, SCROLL_WHEEL_LED);
            break;

        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report = razer_chroma_extended_matrix_effect_spectrum(VARSTORE, SCROLL_WHEEL_LED);
            report.transaction_id.id = 0x1f;
            break;

        default:
            printf("razermouse: logo_mode_spectrum not supported for this model\n");
            return count;
    }

    razer_send_payload(usb_dev, &report);
    return count;
}

/**
 * Write device file "left_mode_spectrum" (for extended mouse matrix effects)
 *
 * Spectrum effect mode is activated whenever the file is written to
 */
ssize_t razer_attr_write_left_mode_spectrum(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_spectrum(usb_dev, buf, count, LEFT_SIDE_LED);
}

/**
 * Write device file "right_mode_spectrum" (for extended mouse matrix effects)
 *
 * Spectrum effect mode is activated whenever the file is written to
 */
ssize_t razer_attr_write_right_mode_spectrum(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_spectrum(usb_dev, buf, count, RIGHT_SIDE_LED);
}


/**
 * Write device file "logo_mode_breath" (for extended mouse matrix effects)
 *
 * Sets breathing mode by writing 1, 3 or 6 bytes
 */
ssize_t razer_attr_write_logo_mode_breath(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
    case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
    case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
        switch(count) {
        case 3: // Single colour mode
            report = razer_chroma_mouse_extended_matrix_effect_breathing_single(VARSTORE, LOGO_LED, (struct razer_rgb*)&buf[0]);
            break;

        case 6: // Dual colour mode
            report = razer_chroma_mouse_extended_matrix_effect_breathing_dual(VARSTORE, LOGO_LED, (struct razer_rgb*)&buf[0], (struct razer_rgb*)&buf[3]);
            break;

        default: // "Random" colour mode
            report = razer_chroma_mouse_extended_matrix_effect_breathing_random(VARSTORE, LOGO_LED);
            break;
        }
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
    case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
    case USB_DEVICE_ID_RAZER_BASILISK_V2:
    case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
    case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
    case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
    case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
    case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
    case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
    case USB_DEVICE_ID_RAZER_VIPER:
    case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
    case USB_DEVICE_ID_RAZER_VIPER_MINI:
    case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
    case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
    case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
    case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
    case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
    case USB_DEVICE_ID_RAZER_BASILISK:
    case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
    case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
    case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
        switch(count) {
        case 3: // Single colour mode
            report = razer_chroma_extended_matrix_effect_breathing_single(VARSTORE, LOGO_LED, (struct razer_rgb*)&buf[0]);
            break;

        case 6: // Dual colour mode
            report = razer_chroma_extended_matrix_effect_breathing_dual(VARSTORE, LOGO_LED, (struct razer_rgb*)&buf[0], (struct razer_rgb*)&buf[3]);
            break;

        default: // "Random" colour mode
            report = razer_chroma_extended_matrix_effect_breathing_random(VARSTORE, LOGO_LED);
            break;
        }
        break;
    }

    switch(product) {
    case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
    case USB_DEVICE_ID_RAZER_BASILISK_V2:
        report.transaction_id.id = 0x1f;
        break;

    default:
        report.transaction_id.id = 0x3f;
        break;
    }

    razer_send_payload(usb_dev, &report);
    return count;
}

/**
 * Write device file "scroll_mode_breath" (for extended mouse matrix effects)
 *
 * Sets breathing mode by writing 1, 3 or 6 bytes
 */
ssize_t razer_attr_write_scroll_mode_breath(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
        case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
        case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
            switch(count) {
                case 3: // Single colour mode
                    report = razer_chroma_mouse_extended_matrix_effect_breathing_single(VARSTORE, SCROLL_WHEEL_LED, (struct razer_rgb*)&buf[0]);
                    break;

                case 6: // Dual colour mode
                    report = razer_chroma_mouse_extended_matrix_effect_breathing_dual(VARSTORE, SCROLL_WHEEL_LED, (struct razer_rgb*)&buf[0], (struct razer_rgb*)&buf[3]);
                    break;

                default: // "Random" colour mode
                    report = razer_chroma_mouse_extended_matrix_effect_breathing_random(VARSTORE, SCROLL_WHEEL_LED);
                    break;
            }
            break;

        case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
        case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_VIPER:
        case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
        case USB_DEVICE_ID_RAZER_VIPER_MINI:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
        case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
        case USB_DEVICE_ID_RAZER_BASILISK:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
            switch(count) {
                case 3: // Single colour mode
                    report = razer_chroma_extended_matrix_effect_breathing_single(VARSTORE, SCROLL_WHEEL_LED, (struct razer_rgb*)&buf[0]);
                    break;

                case 6: // Dual colour mode
                    report = razer_chroma_extended_matrix_effect_breathing_dual(VARSTORE, SCROLL_WHEEL_LED, (struct razer_rgb*)&buf[0], (struct razer_rgb*)&buf[3]);
                    break;

                default: // "Random" colour mode
                    report = razer_chroma_extended_matrix_effect_breathing_random(VARSTORE, SCROLL_WHEEL_LED);
                    break;
            }
            break;
    }

    switch(product) {
        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report.transaction_id.id = 0x1f;
            break;

        default:
            report.transaction_id.id = 0x3f;
            break;
    }

    razer_send_payload(usb_dev, &report);
    return count;
}

/**
 * Write device file "left_mode_breath" (for extended mouse matrix effects)
 *
 * Sets breathing mode by writing 1, 3 or 6 bytes
 */
ssize_t razer_attr_write_left_mode_breath(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_breath(usb_dev, buf, count, LEFT_SIDE_LED);
}

/**
 * Write device file "right_mode_breath" (for extended mouse matrix effects)
 *
 * Sets breathing mode by writing 1, 3 or 6 bytes
 */
ssize_t razer_attr_write_right_mode_breath(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_breath(usb_dev, buf, count, RIGHT_SIDE_LED);
}

/**
 * Write device file "logo_mode_none" (for extended mouse matrix effects)
 *
 * No effect is activated whenever this file is written to
 */
ssize_t razer_attr_write_logo_mode_none(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
    case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
    case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
        report = razer_chroma_mouse_extended_matrix_effect_none(VARSTORE, LOGO_LED);
        break;

    case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
    case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
    case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
    case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
    case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
    case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
    case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
    case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
    case USB_DEVICE_ID_RAZER_VIPER:
    case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
    case USB_DEVICE_ID_RAZER_VIPER_MINI:
    case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
    case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
    case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
    case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
    case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
    case USB_DEVICE_ID_RAZER_BASILISK:
    case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
    case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
    case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
        report = razer_chroma_extended_matrix_effect_none(VARSTORE, LOGO_LED);
        break;

    case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
    case USB_DEVICE_ID_RAZER_BASILISK_V2:
        report = razer_chroma_extended_matrix_effect_none(VARSTORE, LOGO_LED);
        report.transaction_id.id = 0x1f;
        break;


    default:
        printf("razermouse: logo_mode_none not supported for this model\n");
        return count;
    }

    razer_send_payload(usb_dev, &report);
    return count;
}

/**
 * Write device file "logo_mode_none" (for extended mouse matrix effects)
 *
 * No effect is activated whenever this file is written to
 */
ssize_t razer_attr_write_scroll_mode_none(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
        case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
        case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
            report = razer_chroma_mouse_extended_matrix_effect_none(VARSTORE, SCROLL_WHEEL_LED);
            break;

        case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_DEATHADDER_ESSENTIAL_WHITE_EDITION:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_VIPER:
        case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
        case USB_DEVICE_ID_RAZER_VIPER_MINI:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
        case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
        case USB_DEVICE_ID_RAZER_BASILISK:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
            report = razer_chroma_extended_matrix_effect_none(VARSTORE, SCROLL_WHEEL_LED);
            break;

        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report = razer_chroma_extended_matrix_effect_none(VARSTORE, SCROLL_WHEEL_LED);
            report.transaction_id.id = 0x1f;
            break;

        default:
            printf("razermouse: logo_mode_none not supported for this model\n");
            return count;
    }

    razer_send_payload(usb_dev, &report);
    return count;
}

/**
 * Write device file "left_mode_none" (for extended mouse matrix effects)
 *
 * No effect is activated whenever this file is written to
 */
ssize_t razer_attr_write_left_mode_none(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_none(usb_dev, buf, count, LEFT_SIDE_LED);
}

/**
 * Write device file "right_mode_none" (for extended mouse matrix effects)
 *
 * No effect is activated whenever this file is written to
 */
ssize_t razer_attr_write_right_mode_none(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_none(usb_dev, buf, count, RIGHT_SIDE_LED);
}

// These are for older mice, eg DeathAdder 2013

/**
 * Write device file "scroll_led_effect"
 */
ssize_t razer_attr_write_scroll_led_effect(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    unsigned char effect = (unsigned char)strtoul(buf, NULL, 10);
    struct razer_report report = razer_chroma_standard_set_led_effect(VARSTORE, SCROLL_WHEEL_LED, effect);
    report.transaction_id.id = 0x3F;

    razer_send_payload(usb_dev, &report);

    return count;
}

/**
 * Write device file "logo_led_effect"
 */
ssize_t razer_attr_write_logo_led_effect(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    unsigned char effect = (unsigned char)strtoul(buf, NULL, 10);
    struct razer_report report = razer_chroma_standard_set_led_effect(VARSTORE, LOGO_LED, effect);
    report.transaction_id.id = 0x3F;

    razer_send_payload(usb_dev, &report);

    return count;
}

/**
 * Write device file "logo_led_rgb"
 */
ssize_t razer_attr_write_logo_led_rgb(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    if(count == 3) {
        report = razer_chroma_standard_set_led_rgb(VARSTORE, LOGO_LED, (struct razer_rgb*)&buf[0]);
        report.transaction_id.id = 0x3F;
        razer_send_payload(usb_dev, &report);
    } else {
        printf("razermouse: Logo LED mode only accepts RGB (3byte)\n");
    }

    return count;
}

/**
 * Write device file "mode_reactive"
 *
 * Sets reactive mode when this file is written to. A speed byte and 3 RGB bytes should be written
 */
ssize_t razer_attr_write_logo_mode_reactive(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    if(count == 4) {
        unsigned char speed = (unsigned char)buf[0];

        switch(product) {
        case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
        case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
            report = razer_chroma_mouse_extended_matrix_effect_reactive(VARSTORE, LOGO_LED, speed, (struct razer_rgb*)&buf[1]);
            break;

        case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ELITE_DVA_EDITION:
        case USB_DEVICE_ID_RAZER_ABYSSUS_ESSENTIAL:
        case USB_DEVICE_ID_RAZER_VIPER:
        case USB_DEVICE_ID_RAZER_VIPER_8KHZ:
        case USB_DEVICE_ID_RAZER_VIPER_MINI:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRED:
        case USB_DEVICE_ID_RAZER_NAGA_TRINITY:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        case USB_DEVICE_ID_RAZER_VIPER_ULTIMATE_WIRELESS:
        case USB_DEVICE_ID_RAZER_BASILISK:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
            report = razer_chroma_extended_matrix_effect_reactive(VARSTORE, LOGO_LED, speed, (struct razer_rgb*)&buf[1]);
            break;

        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report = razer_chroma_extended_matrix_effect_reactive(VARSTORE, LOGO_LED, speed, (struct razer_rgb*)&buf[1]);
            report.transaction_id.id = 0x1f;
            break;

        default:
            printf("razermouse: logo_mode_reactive not supported for this model\n");
            return count;
        }

        razer_send_payload(usb_dev, &report);

    } else {
        printf("razermouse: Reactive only accepts Speed, RGB (4byte)\n");
    }
    return count;
}

/**
 * Write device file "scroll_mode_reactive" (for extended mouse matrix effects)
 *
 * Sets reactive mode when this file is written to. A speed byte and 3 RGB bytes should be written
 */
ssize_t razer_attr_write_scroll_mode_reactive(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    if(count == 4) {
        unsigned char speed = (unsigned char)buf[0];

        switch(product) {
        case USB_DEVICE_ID_RAZER_NAGA_HEX_V2:
        case USB_DEVICE_ID_RAZER_NAGA_CHROMA:
            report = razer_chroma_mouse_extended_matrix_effect_reactive(VARSTORE, SCROLL_WHEEL_LED, speed, (struct razer_rgb*)&buf[1]);
            break;

        case USB_DEVICE_ID_RAZER_DEATHADDER_ELITE:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_BASILISK:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
            report = razer_chroma_extended_matrix_effect_reactive(VARSTORE, SCROLL_WHEEL_LED, speed, (struct razer_rgb*)&buf[1]);
            break;

        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report = razer_chroma_extended_matrix_effect_reactive(VARSTORE, SCROLL_WHEEL_LED, speed, (struct razer_rgb*)&buf[1]);
            report.transaction_id.id = 0x1f;
            break;

        default:
            printf("razermouse: scroll_mode_reactive not supported for this model\n");
            return count;
        }

        razer_send_payload(usb_dev, &report);

    } else {
        printf("razermouse: Reactive only accepts Speed, RGB (4byte)\n");
    }
    return count;
}

ssize_t razer_attr_write_side_mode_reactive(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count, int side)
{
    struct razer_report report = {0};

    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    if(count == 4) {
        unsigned char speed = (unsigned char)buf[0];

        switch(product) {
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_TE_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
            report = razer_chroma_extended_matrix_effect_reactive(VARSTORE, side, speed, (struct razer_rgb*)&buf[1]);
            break;

        case USB_DEVICE_ID_RAZER_MAMBA_ELITE:
        case USB_DEVICE_ID_RAZER_BASILISK_V2:
            report = razer_chroma_extended_matrix_effect_reactive(VARSTORE, side, speed, (struct razer_rgb*)&buf[1]);
            report.transaction_id.id = 0x1f;
            break;

        default:
            printf("razermouse: left/right mode_reactive not supported for this model\n");
            return count;
        }

        razer_send_payload(usb_dev, &report);

    } else {
        printf("razermouse: Reactive only accepts Speed, RGB (4byte)\n");
    }
    return count;
}

/**
 * Write device file "left_mode_reactive" (for extended mouse matrix effects)
 *
 * Sets reactive mode when this file is written to. A speed byte and 3 RGB bytes should be written
 */
ssize_t razer_attr_write_left_mode_reactive(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_reactive(usb_dev, buf, count, LEFT_SIDE_LED);
}

/**
 * Write device file "right_mode_reactive" (for extended mouse matrix effects)
 *
 * Sets reactive mode when this file is written to. A speed byte and 3 RGB bytes should be written
 */
ssize_t razer_attr_write_right_mode_reactive(IOUSBDeviceInterface **usb_dev, const char *buf, size_t count)
{
    return razer_attr_write_side_mode_reactive(usb_dev, buf, count, RIGHT_SIDE_LED);
}

ushort razer_attr_read_dpi(IOUSBDeviceInterface **usb_dev)
{
    struct razer_report report, response_report;
    report = razer_chroma_misc_get_dpi_xy(0x01);
    response_report = razer_send_payload(usb_dev, &report);
    ushort dpi_x = (response_report.arguments[1] << 8) | (response_report.arguments[2] & 0xFF);
    return dpi_x;
}

void razer_attr_write_dpi(IOUSBDeviceInterface **usb_dev, ushort dpi_x, ushort dpi_y)
{
    struct razer_report report = razer_chroma_misc_set_dpi_xy(0x01, dpi_x, dpi_y);
    razer_send_payload(usb_dev, &report);
}

ssize_t razer_attr_read_get_battery(IOUSBDeviceInterface **usb_dev, char *buf)
{
    struct razer_report report = razer_chroma_misc_get_battery_level();
    struct razer_report response_report = {0};
    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch (product)
    {
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
            report.transaction_id.id = 0x3f;
            break;
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
            report.transaction_id.id = 0x1f;
            break;
    }
    response_report = razer_send_payload(usb_dev, &report);
    return sprintf(buf, "%d\n", response_report.arguments[1]);
}

/**
 * Read device file "is_charging"
 *
 * Returns 0 when not charging, 1 when charging
 */
ssize_t razer_attr_read_is_charging(IOUSBDeviceInterface **usb_dev, char *buf)
{
    struct razer_report report = razer_chroma_misc_get_charging_status();
    struct razer_report response_report = {0};
    UInt16 product = -1;
    (*usb_dev)->GetDeviceProduct(usb_dev, &product);

    switch(product) {
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRED:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_MAMBA_WIRELESS_WIRED:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE:
        case USB_DEVICE_ID_RAZER_BASILISK_ULTIMATE_RECEIVER:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRED:
        case USB_DEVICE_ID_RAZER_DEATHADDER_V2_PRO_WIRELESS:
            report.transaction_id.id = 0x3f;
            break;
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_RECEIVER:
        case USB_DEVICE_ID_RAZER_LANCEHEAD_WIRELESS_WIRED:
            report.transaction_id.id = 0x1f;
            break;
    }

    response_report = razer_send_payload(usb_dev, &report);
    return sprintf(buf, "%d\n", response_report.arguments[1]);
}
