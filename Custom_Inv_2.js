/* Filename:   Custom_Inv_2.js
 * Description: Custom Inventory Application
 * $Title: MMIA$
 * $Revision: 721 $
 * $Date: 2014-09-11 13:22:37 -0600 (Thu, 11 Sep 2014) $
 * $Author: val.jensen $
 */

include(".cre.js");

ready.oldShow = ready.show;
ready.show = function(text, busy)
{
}

/////////////Global Settings/////////////////
reader.processCommand('C', "(1b)5");        //USB HID Communication (Downloader Mode)
reader.writeSetting(0x93, 1);               //Let JavaScript handle the beep
///////////////End Settings/////////////////

//////////////Global Variables//////////////
var beep = "";
var vibrate = reader.readSetting(0xa1);
var checked2 = reader.readSetting(0x26);

var file = storage.findFirst(/^InOut.txt$/);
if(!file)
{
    storage.write("InOut.txt", "");
    file = storage.findFirst(/^InOut.txt$/);
}

var esen = "";
var C = "";
var vari = "";

var d = new Date();

var year  = "";
var month = new Array();
month[0] = "Jan.";
month[1] = "Feb.";
month[2] = "Mar.";
month[3] = "Apr.";
month[4] = "May";
month[5] = "Jun.";
month[6] = "Jul.";
month[7] = "Aug.";
month[8] = "Sep.";
month[9] = "Oct.";
month[10] = "Nov.";
month[11] = "Dec.";
var n = "";
var day = "";
var hour = "";
var minute = "";
var second = "";
var apm = "AM";
////////////End Global Variables////////////

function Main()
{
    PM = new gui.Menu();
    menu = PM;
    C = "";
    PM.append(new gui.Label(" "));
    PM.append(new gui.Separator(0, gui.separatorStyle.horizontalLine));
    PM.append(new gui.Separator(0, gui.separatorStyle.horizontalLine));
    PM.append(new gui.Label("Mercury Marine"));
    PM.append(new gui.Label("  Check In/Out"));
    PM.append(new gui.Label("   Application"));
    PM.append(new gui.Separator(0, gui.separatorStyle.horizontalLine));
    PM.append(new gui.Separator(0, gui.separatorStyle.horizontalLine));
    PM.leftSoftkey = new gui.Softkey("Sign In", CIn);
    PM.rightSoftkey = new gui.Softkey("");
    gui.showForm(menu);
}
    gui.splash("MML.img");
    setTimeout(function(){gui.clearSplash(); Main();}, 3000);
//~ Main();

function Options()
{
    PM.opt = new gui.Menu();
    menu = PM.opt;
    mode = "ScanSN";
    PM.opt.rightSoftkey = new gui.Softkey("Sign Out", Main);
    PM.opt.append(new gui.Label("  User: " + C));
    PM.opt.append(new gui.Separator(0, gui.separatorStyle.horizontalLine));
    PM.opt.append(new gui.Button("Check In", function(){vari = "In"; check();}));
    PM.opt.append(new gui.Button("Check Out", function(){vari = "Out"; check();}));
    PM.opt.append(new gui.Button("Calibrate", function(){vari = "Calibrate"; check();}));
    PM.opt.append(new gui.Button("Settings", lc));
    gui.showForm(menu);
}

function check()
{
    file = storage.findFirst(/^InOut.txt$/);
    if(!file)
    {
        storage.write("InOut.txt", "");
        file = storage.findFirst(/^InOut.txt$/);
    }

    PM.check = new gui.Form(scanSkuOnOK);
    menu = PM.check;
    PM.check.caption = vari;

    timeCapture();

    if(esen && C)
    {
        PM.check.leftSoftkey = new gui.Softkey("Confirm", create);
    }
    PM.check.rightSoftkey = new gui.Softkey("Back", function(){esen = ""; Options();});
    PM.check.append(new gui.Label("  User: " + C));
    PM.check.append(new gui.Separator(0, gui.separatorStyle.horizontalLine));
    if(esen)
    {
        PM.check.append(new gui.Label("S/N: " + esen));
    }
    else
    {
        PM.check.append(new gui.Label(" "));
    }
    if(C && esen)
    {
        PM.check.append(new gui.Label(n + " " + day + ", " + year));
        PM.check.append(new gui.Label(hour+":"+minute+":"+second+" "+apm));
        PM.check.append(new gui.Label("         OK?"));
    }
    else if(!esen)
    {
        PM.check.append(new gui.Label("  Scan or type"));
        PM.check.append(new gui.Label("     Serial #:"));
    }
    else if(esen)
    {
        PM.check.append(new gui.Label("  Scan or type"));
        PM.check.append(new gui.Label("      User #:"));
    }
    PM.check.edit = new gui.Edit("", gui.inputMode.numeric, gui.inputMode.numeric);
    if(!esen)
    {
        PM.check.append(PM.check.edit);
    }
    gui.showForm(menu);
}

function scanSkuOnOK()
{
    if(!PM.check.edit.text)
    {
        alert(check, "Text box is empty!");
    }
    else if(!esen)
    {
        esen = PM.check.edit.text;
    }
    check();
}

function scanCOnOK()
{
    if(!PM.C.edit.text)
    {
        alert(CIn, "Text box is empty!");
    }
    else
    {
        C = PM.C.edit.text;
    }
    Options();
}

function create()
{
    storage.append("InOut.txt", vari + "\t" + esen + "\t" + C + "\t" + n + " " + day + ", " + year + " " + hour + ":" + minute + ":" + second + " " + apm + "\x0d\x0a");
    esen = "";
    check();
}

function CIn()
{
    PM.C = new gui.Form(scanCOnOK);
    menu = PM.C;
    mode = "ScanC";
    PM.C.caption = "Sign In";
    PM.C.append(new gui.Label(" "));
    PM.C.append(new gui.Label("  Scan or type"));
    PM.C.append(new gui.Label("      User #:"));
    PM.C.append(new gui.Label(" "));
    PM.C.edit = new gui.Edit("", gui.inputMode.numeric, gui.inputMode.numeric);
    PM.C.append(PM.C.edit);

    gui.showForm(menu);
}

function timeCapture()
{
    d = new Date();
    n = month[d.getMonth()]
    apm = "AM";

    year  = d.getFullYear().toString();

    day   = d.getDate().toString();
    if( day.length   < 2 )
        day   = "0" + day;

    hour  = d.getHours().toString();
    if(hour > 12)
    {
        hour = hour-12;
        hour  = "0" + hour;
        apm = "PM";
    }

    minute = d.getMinutes().toString();
    if( minute.length < 2 )
        minute = "0" + minute;

    second = d.getSeconds().toString();
    if( second.length < 2 )
        second = "0" + second;
}

////////////Settings Screen/////////////
function lc()
{
    PM.set = new gui.Form();
    menu = PM.set;
    PM.set.caption = "Settings";
    PM.set.rightSoftkey = new gui.Softkey("Back", Options);
    PM.set.append(new gui.Button("Beep/Vibrate", beepVibrate));
    PM.set.append(new gui.Button("Shutdown", shutdown));
    gui.showForm(menu);
}

//////////Beep-Vibrate Screens//////////
function beepVibrate()
{
    PM.bv = new gui.Form();
    menu = PM.bv;
    PM.bv.caption = "Beep/Vibrate";
    PM.bv.append(new gui.ToggleButton("Beep", checked2, beepOnClick));
    PM.bv.append(new gui.ToggleButton("Vibrate", vibrate, vibrateOnClick));
    if(checked2)
    {
        PM.bv.append(new gui.Button("Beep Volume", bVolume));
    }
    PM.bv.rightSoftkey = new gui.Softkey("Back", Options);
    gui.showForm(menu);
}

function bVolume(key)
{
    var volume = reader.readSetting(0x26);
    PM.vol = new gui.Menu(go, beepVibrate);
    menu = PM.vol;
    PM.vol.caption = " ";
    PM.vol.leftSoftkey  = new gui.Softkey  ("Incr", increase);
    PM.vol.rightSoftkey = new gui.Softkey  ("Decr", decrease);
    PM.vol.append(new gui.Label(" "));
    PM.vol.append(new gui.Separator(0, gui.separatorStyle.horizontalLine));
    PM.vol.append(new gui.Label("  Volume%: " + volume));
    PM.vol.append(new gui.Separator(0, gui.separatorStyle.horizontalLine));
    PM.vol.append(new gui.Label("Press CLEAR to"));
    PM.vol.append(new gui.Label("      go back"));
    function increase()
    {
        if(volume<=99)
        {
            volume = volume+10;
        }
        reader.writeSetting(0x26, volume);
        reader.beep(1);
        bVolume();
    }

    function decrease()
    {
        if(volume>=9)
        {
            volume = volume-10;
        }
        reader.writeSetting(0x26, volume);
        reader.beep(1);
        bVolume();
    }

    function go()
    {
        reader.beep(1);
    }
    gui.showForm(menu);
}

function vibrateOnClick()
{
    if(vibrate)
    {
        reader.writeSetting(0xa1, 0);
        vibrate = false;
    }
    else
    {
        reader.writeSetting(0xa1, 1);
        var beepVib = reader.readSetting(0x26);
        reader.writeSetting(0x26, 1);
        reader.beep(1);
        reader.writeSetting(0x26, beepVib);
        vibrate = true;
    }
    gui.showForm(menu);
}

function beepOnClick()
{
    if(checked2)
    {
        beep = reader.readSetting(0x26);
        reader.writeSetting(0x26, 0);
        checked2 = false;
    }
    else
    {
        reader.writeSetting(0x26, beep);
        reader.beep(1);
        checked2 = true;
    }
    beepVibrate();
}

///////Reader Shutdown Screen//////
function shutdown()
{
    gui.confirm(confirmSD, lc, "Shut down the reader?", "Shutdown?", "Yes", "No");
}

function confirmSD()
{
    reader.processCommand('P', "(88)1");
    reader.processCommand('P', "(32)1");
    reader.processCommand('P', "(9e)1");
    reader.processCommand('P', "(9f)1");
    reader.processCommand('P', "(8e)1");
}

reader.onDecodeOld = reader.onDecode;
reader.onDecode = function(decode)
{
    reader.beep(1);
    switch(mode)
    {
        case "ScanSN":
            esen = decode.data;
            check();
            break;

        case "ScanC":
            C = decode.data;
            mode = "ScanSN";
            Options();
            break;
    }
}
