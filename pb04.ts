enum VOLT {
    //% block="V"
    V = 1,

    //% block="mV"
    MV = 2
}

/**
 * PB04 Intelligent Battery Module
 */
//% weight=99 color=#000000 icon="\uf240" block="PB04"
namespace PB04 {
    // Device I2C Address
    const MAX11646_I2C_ADDRESS = 0x36

    // Register Defines
    const MAX11646_REG_SETUP = 0x80
    const MAX11646_REG_CONF = 0x00

    // System Defines
    const MAX11646_VOLTAGE = 0x21
    const MAX11646_CURRENT = 0x23
    const MAX11646_SEL0 = 0x40
    const MAX11646_SEL1 = 0x20
    const MAX11646_SEL2 = 0x10
    const MAX11646_CLK_EX = 0x08
    const MAX11646_BIP_ON = 0x04
    const MAX11646_RST = 0x02
    const MAX11646_SCAN0 = 0x40
    const MAX11646_SCAN1 = 0x20
    const MAX11646_CH_0 = 0x00
    const MAX11646_CH_1 = 0x02
    const MAX11646_MODE_SINGLE = 0x01
    const MAX11646_SETUP = 0xD2

    function readCurrent(): number {
        let var1 = modeADC(MAX11646_CURRENT);
        let var2 = (var1 & 0xFF00) >> 8;
        let var3 = (var1 & 0x00FF);
        let current = (((((((var2 - 252) * 256) + (var3 - 1)) * 2048) * 50) / 1024) / 100);
        return current;
    }

    function readVoltage(): number {
        let var1 = modeADC(MAX11646_VOLTAGE);
        let var2 = (var1 & 0xFF00) >> 8;
        let var3 = (var1 & 0x00FF);
        let voltage = (((((var2 - 252) * 256) + var3) * 2048) * 2) / 1024;
        return voltage;
    }

    /**
	* PB04 Raw ADC  measurement
    * @param reg the state of the output channel
	*/
    function modeADC(reg: number): number {
        let buf: Buffer = pins.createBuffer(2);
        buf[0] = MAX11646_SETUP;
        buf[1] = reg;
        pins.i2cWriteBuffer(MAX11646_I2C_ADDRESS, buf, false);
        let data = pins.i2cReadNumber(MAX11646_I2C_ADDRESS, NumberFormat.UInt16BE, false);
        return data;
    }

    /**
	* PB04 Voltage (V) measurement
	*/
    //% blockId="Voltage" block="get Voltage %unit"
    //% weight=99
    export function getVoltage(unit: VOLT): number {

        let voltage_mv: number = readVoltage()
        let voltage_v: number = voltage_mv / 1000.0
        let voltage_decimal: number = Math.floor(voltage_v)
        let voltage_fractional: number = Math.round((voltage_v % voltage_decimal) * 100.0) / 100.0
        let voltage: number = voltage_decimal + voltage_fractional

        if (unit == VOLT.V) {
            return voltage
        } else {
            return voltage_mv
        }
    }

    /**
	* PB04 Current (mA) measurement
	*/
    //% blockId="Current" block="get Current (mA)"
    //% weight=99
    export function getCurrent(): number {
        return readCurrent();
    }

    /**
    * PB04 Battery percentage
    */
    //% blockId="capacity" block="get remaining Battery %"
    //% weight=99
    export function getCapacity(): number {

        let voltage: number = getVoltage(VOLT.V)
        let current: number = getCurrent()
        voltage = Math.min(voltage, 3.0)
        let percentage_under_100: number
        let percentage_100: number
        let percentage_500: number

        if (current < 100) {
            if (voltage >= 3.0) percentage_100 = 100
            else if (voltage > 2.88 && voltage < 3.0) percentage_under_100 = 90
            else if (voltage > 2.76 && voltage < 2.88) percentage_under_100 = 80
            else if (voltage > 2.68 && voltage < 2.76) percentage_under_100 = 70
            else if (voltage > 2.64 && voltage < 2.68) percentage_under_100 = 60
            else if (voltage > 2.6 && voltage < 2.64) percentage_under_100 = 50
            else if (voltage > 2.56 && voltage < 2.6) percentage_under_100 = 40
            else if (voltage > 2.52 && voltage < 2.56) percentage_under_100 = 30
            else if (voltage > 2.46 && voltage < 2.52) percentage_under_100 = 20
            else if (voltage > 2.4 && voltage < 2.46) percentage_under_100 = 10
            else if (voltage < 2.4) percentage_under_100 = 1
            return percentage_under_100;

        } else if (current > 100 && current < 500) {
            if (voltage >= 3.0) percentage_100 = 100
            else if (voltage > 2.8 && voltage < 3.0) percentage_100 = 90
            else if (voltage > 2.6 && voltage <= 2.8) percentage_100 = 80
            else if (voltage > 2.6 && voltage <= 2.7) percentage_100 = 70
            else if (voltage > 2.55 && voltage <= 2.6) percentage_100 = 60
            else if (voltage > 2.5 && voltage <= 2.55) percentage_100 = 50
            else if (voltage > 2.45 && voltage <= 2.5) percentage_100 = 40
            else if (voltage > 2.3 && voltage <= 2.4) percentage_100 = 30
            else if (voltage > 2.2 && voltage <= 2.3) percentage_100 = 20
            else if (voltage > 2.0 && voltage <= 2.2) percentage_100 = 10
            else if (voltage <= 2.0) percentage_100 = 1

            return percentage_100

        } else if (current > 500) {
            if (voltage >= 2.95) percentage_500 = 100
            else if (voltage > 2.8 && voltage < 2.95) percentage_500 = 90
            else if (voltage > 2.6 && voltage <= 2.8) percentage_500 = 80
            else if (voltage > 2.5 && voltage <= 2.6) percentage_500 = 70
            else if (voltage > 2.4 && voltage <= 2.5) percentage_500 = 60
            else if (voltage > 2.3 && voltage <= 2.4) percentage_500 = 50
            else if (voltage > 2.2 && voltage <= 2.3) percentage_500 = 40
            else if (voltage > 2.15 && voltage <= 2.2) percentage_500 = 30
            else if (voltage > 2.1 && voltage <= 2.15) percentage_500 = 20
            else if (voltage > 2.0 && voltage <= 2.1) percentage_500 = 10
            else if (voltage <= 2.0) percentage_500 = 1

            return percentage_500
        } else {
            return 0
        }

    }

}

