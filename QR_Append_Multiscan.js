/* Filename:    QR_Append_Multiscan
 * Description: Handle QR Code Structured Appends. One QR Code data symbol can be divided into up to 16 symbols. Each code can be scanned individually.
 * $Title: QR Code Append Multiscan$
 * $Revision: 472 $
 * $Date: 2012-09-12 12:20:26 -0600 (Wed, 12 Sep 2012) $
 * $Author: val.jensen $
 */
///////////////////////////////////////////////
////////////Multi-platform Coding//////////////
var twoX = storage.findFirst(/^\.crx.js/);
var eightX =  storage.findFirst(/^\.cre.js/);

if(twoX)
{
    include(".crx.js");
}

if(eightX)
{
    include(".cre.js");
}
///////////End Platform Coding///////////////
/////////////////////////////////////////////

var Qty = 0; //Quantity of QR Codes scanned
var gotScan = new Array();

reader.onDecodeOld = reader.onDecode;
reader.writeSetting (0x93, 1); //JavaScript handles the beep
reader.writeSetting(0x2b, 1); //QR Codes on (On by default in 8x, but added as precaution)

reader.onDecode = function(decode)
{
    if(decode.symbology == 41) //if barcode is a QR Code
    {
        if( decode.qrPosition > decode.qrTotal)
        {
            beep(3); //You did something horribly wrong, either a misgeneration in your Append program, or you scanned two different appended QR Codes
            return false;
        }

        Qty++; //Any time you see a QR Code, add one to the quantity of QR Code scans

        if(decode.qrTotal == 0) //A non-multiple QR Code
        {
            reader.beep(1);
            Qty = 0;
            return reader.onDecodeOld (decode);
        }
        else if(Qty != decode.qrTotal) //If the scanned quantity of QR Codes doesn't equal the total number indicated in the QR Code
        {
            if(gotScan[decode.qrPosition -1]) //If you rescan a code that's been scanned already
            {
                Qty--
                reader.beep(3); //Error beep indicating bad scan
                return false;
            }

            else
            {
                gotScan[decode.qrPosition -1] = decode.data;
                reader.beep(1);
                return false;
            }
        }
        else if(Qty == decode.qrTotal) //If the scanned quantity of QR Codes equals the total number indicated in the QR Code
        {
            if(gotScan[decode.qrPosition -1]) //If you rescan a code that's been scanned already
            {
                Qty--
                reader.beep(3); //Error beep indicating bad scan
                return false;
            }
            else
            {
                gotScan[decode.qrPosition -1] = decode.data;
                gotScan = gotScan.toString();
                decode.data = gotScan;
                decode.data = decode.data.replace(/,/g, "");

                //Reset the variables//
                gotScan = new Array();
                Qty = 0;
                ///////End Reset///////

                reader.beep(2); //Acknowledge completion beeps
                return reader.onDecodeOld (decode);
            }
        }
    }

    else //if barcode is NOT a QR Code
    {
        reader.beep(1);
        return reader.onDecodeOld (decode);
    }
}