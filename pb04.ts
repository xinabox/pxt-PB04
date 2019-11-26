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
        basic.showNumber(voltage_v)
        let voltage_decimal: number = Math.floor(voltage_v)
        basic.showNumber(voltage_decimal)
        let voltage_fractional: number = Math.round((voltage_v % voltage_decimal) * 100.0) / 100.0
        basic.showNumber(voltage_fractional)
        let voltage: number = voltage_decimal + voltage_fractional
        basic.showNumber(voltage)

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
        voltage = Math.min(voltage, 3.0)
        let percentage: number = Math.map(voltage, 2.0, 3.0, 0, 100)

        return percentage
    }

}

