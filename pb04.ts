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
        let current = (((((((var2 - 252)*256) + (var3-1)) * 2.048)/1024)/100) * 50 ) * 1000;
        return current;
    }

    function readVoltage(): number {
        let var1 = modeADC(MAX11646_VOLTAGE);
        let var2 = (var1 & 0xFF00) >> 8;
        let var3 = (var1 & 0x00FF);       
        let voltage = (((((var2 - 252)*256) + var3) * 2.048)/1024)*2;
        return voltage;
    }

    function modeADC(reg: number): number {
        let buf: Buffer = pins.createBuffer(2);
        buf[0] = MAX11646_SETUP;
        buf[1] = reg;
        pins.i2cWriteBuffer(MAX11646_I2C_ADDRESS, buf, false);
        let data = pins.i2cReadNumber(MAX11646_I2C_ADDRESS, NumberFormat.UInt16LE, false);
        return data;
    }

    /**
	* PB04 Voltage (V) measurement
	*/
    //% blockId="Voltage" block="get Voltage (V)"
    //% weight=99
    export function getVoltage(): number {
        return readVoltage();
    }

    /**
	* PB04 Current (mA) measurement
	*/
    //% blockId="Current" block="get Current (mA)"
    //% weight=99
    export function getCurrent(): number {
        return readCurrent();
    }

}
