/* Filename:    Match_DataStore.js
 * Description: Match program for Customer, Match for CR3600 with audible siren and data storage
 * $Title: Comp Store Match$
 * $Revision: 412 $
 * $Date: 2015-10-27 14:06:27 -0600 (Tue, 27 Oct 2015) $
 * $Author: val.jensen $
 *
 */

include(".cre.js");

ready.oldShow = ready.show;
ready.show = function(text, busy)
{
}

//////////////////////////////////////////////////////////////////////////
//Reader Setup
reader.processCommand('C', "(100)7fff");    //extend the backlight timeout to 30 seconds
reader.processCommand('C', "(32)ffff");    //extend the time before power save idle to 60 seconds
reader.processCommand('C', "(93)1");    //supress beep ON DECODE
reader.processCommand('C', "(14d)0");    //Allow JavaScript to control LED
reader.processCommand('C', "(a1)1");    //enable vibrate
reader.processCommand('C', "(26)64");  //turn beep volume to 0%
reader.processCommand('C', "(39)3");
reader.processCommand('C', "(3a)3");
reader.processCommand('C', "(c6)0"); //do not auto connect
reader.processCommand('C', "(1b)2"); //USB Keyboard Mode - Reader will be cradled to trasnfer the data
reader.processCommand('C', "(42)0"); //Don't expect acknowledge receipt from PC
reader.processCommand('C', "(08)1"); //Raw data
reader.setDisplayLed (reader.none);

//////////////////////////////////////////////////////////////////////////
//Global variables
var menu            = "";
var master          =
{
    symbology       : "",
    data            : ""
};
var enter           = "\x0d\x0a";
var tab             = "\x09";
var scanFlag = 1;
var errorFlag = 1;
var firstScan = "";
var secondScan = "";
var image;
var resText = "";
var name = "";
var rev = "";
var operator = "";
var file;
var flag;

//Create Menu
function logIn()
{
    file = storage.findFirst(/^Data.txt$/);
    lI = new gui.Menu(scanOpOnOK)
    lI.caption = "Please Login";
    if(!file)
    {
        lI.rightSoftkey = new gui.Softkey(" ");
    }
    else
    {
        flag = 1;
        lI.rightSoftkey = new gui.Softkey("Upload", fileUpload);
    }
    lI.append(new gui.Label(" "));
    lI.append(new gui.Label("  Scan or Enter"));
    lI.append(new gui.Label("      Operator"));
    lI.edit = new gui.Edit("", gui.inputMode.numeric, gui.inputMode.numeric);
    lI.append(lI.edit);
    menu = lI;
    gui.showForm(menu);
}

function scanOpOnOK()
{
    if(!lI.edit.text)
    {
        alert(logIn, "Please enter a value!");
    }
    else
    {
        operator = lI.edit.text;
        mainMenu();
    }
}

function mainMenu()
{
    flag = 0;
    UM = new gui.Menu();
    UM.caption = "SCAN MODE";
    if (scanFlag == 1)
    {
        UM.leftSoftkey = new gui.Softkey("Help",  helpMenu);
    }
    if (scanFlag == 2)
    {
        UM.rightSoftkey = new gui.Softkey("Clr/New", resetAll);
    }
    else
    {
        UM.rightSoftkey = new gui.Softkey("Options", Options);
    }
    UM.append(new gui.Label(""));
    UM.append(new gui.Label(" Scan 1>"));
    UM.append(new gui.Label("   " + firstScan));
    if (scanFlag == 2)
    {
        UM.append(new gui.Label(" Scan 2>"));
        UM.append(new gui.Label("   " + secondScan));
    }
    menu = UM;
    gui.showDialog(menu);
}

function Options()
{
    UM.options = new gui.Menu();
    UM.options.caption = "Options";
    UM.options.leftSoftkey = new gui.Softkey("");
    UM.options.rightSoftkey = new gui.Softkey("Back", mainMenu);
    file = storage.read("Data.txt");
    if(file)
    {
        UM.options.append(new gui.Button("Upload Data", fileUpload));
        UM.options.append(new gui.Button("Delete Data", fileDelete));
    }
    UM.options.append(new gui.Button("Logout", function(){firstScan = ""; secondScan = ""; operator = ""; logIn();}));
    menu = UM.options;
    gui.showForm(menu);
}

function fileUpload()
{
    if(!comm.isConnected && !reader.charging)
    {
        alert(fileUpload, "Please dock the reader in the cradle, then hit OK.");
    }
    else if(comm.isConnected && reader.charging)
    {
        file = storage.read("Data.txt");
        file = file.replace(/\x0d\x0a/g, "\x01X\x1ean//n\x04");
        file = file.split("\x09");
        for(var i=0; i<=file.length-1; i++)
        {
            comm.sendPacket('z', file[i]);
            comm.sendPacket('z', "\x01X\x1ean//t\x04");
        }
        if(flag == 1)
        {
            gui.confirm(fileDelete, logIn, "Transfer complete! Would you like to delete the data file?");
        }
        else
        {
           gui.confirm(fileDelete, Options, "Transfer complete! Would you like to delete the data file?");
        }
    }
}

function fileDelete()
{
    storage.erase("Data.txt");
    if (flag == 1)
    {
        alert(logIn, "Data file deleted");
    }
    else
    {
        alert(Options, "Data file deleted");
    }
}

function helpMenu()
{
    appendVersions();
    var hMenu = new gui.Menu();
    hMenu.caption = "HELP";
    hMenu.rightSoftkey = new gui.Softkey("Back", resetAll);
    hMenu.leftSoftkey = new gui.Softkey(" ", function(){});
    hMenu.append(new gui.Label("File: " + name));
    hMenu.append(new gui.Label("Rev: " + rev));
    hMenu.append(new gui.Label(""));
    hMenu.append(new gui.Label(" Customer B"));
    hMenu.append(new gui.Label(" XXX-XXX-XXXX"));
    menu = hMenu;
    gui.showDialog(menu);
}

function showResult()
{
    var matchForm = new gui.Form();
    matchForm.caption = resText;
    matchForm.leftSoftkey = new gui.Softkey(" ", function(){});
    matchForm.rightSoftkey = new gui.Softkey("Clr/New", resetAll);
    matchForm.append(image);
    gui.showForm(matchForm);
}

logIn();
reader.setInterval(siren, 1);  // Always running check for no match menu, will siren if yes.

//////////////////////////////////////////////////////////////////////////
// Decode overrides
reader.onDecodeOld = reader.onDecode;
reader.onDecode = function(decode)
{
    if(operator == "")
    {
        operator = decode.data;
        reader.beep(1);
        mainMenu();
    }
    else if(firstScan == "")
    {
        reader.beep(1);
        master.symbology = decode.symbology;
        master.data = decode.data;
        firstScan = decode.data;
        scanFlag = 2;
        mainMenu();
    }
    else
    {
        secondScan = decode.data;
        file = storage.findFirst(/^Data.txt$/);
        var dT = reader.processCommand('T', "h");
        dT = dT.substr(1);
        if(!file)
        {
            storage.write("Data.txt", operator + tab + firstScan + tab + secondScan + tab + dT + enter);
        }
        else
        {
            storage.append("Data.txt", operator + tab + firstScan + tab + secondScan + tab + dT + enter);
        }

        if (master.data == decode.data)
        {
            reader.beep(1);
            if(storage.read("check.img"))
            {
                yMatch(decode.data);
            }
        }
        else
        {
            reader.beep(1);
            if (storage.read("cross.img"))
            {
                nMatch(decode.data);
            }
        }
    }
}; //end onDecode()

reader.onCommandFinishOld = reader.onCommandFinish;
reader.onCommandFinish    = function(commandSuccess, responseType, responseData)
{
    reader.onCommandFinishOld(commandSuccess, responseType, responseData);
    gui.showDialog(menu);
}; //end reader.onCommandFinish()

reader.onDecodeAttempt = function(count)
{
    if( count == 0 )
        gui.showDialog(menu);
}; //end reader.onDecodeAttempt()

//////////////////////////////////////////////////////////////////////////
//Function Definitions

function yMatch(dCode)
{
    reader.processCommand('C', "(39)0");
    reader.processCommand('C', "(3a)0");
    image = new gui.Image("check.img");
    resText = "!! MATCH !!";
    showResult();
}

function nMatch(dCode)
{
    reader.processCommand('C', "(39)0");
    reader.processCommand('C', "(3a)0");
    image = new gui.Image("cross.img");
    resText = "MATCH ERROR";
    reader.setDisplayLed(reader.red);
    errorFlag = 2;
    showResult();
}

function resetAll()
{
    reader.processCommand('C', "(39)3");
    reader.processCommand('C', "(3a)3");
    reader.setDisplayLed (reader.none);
    scanFlag = 1;
    errorFlag = 1;
    firstScan = "";
    secondScan = "";
    master.symbology = "";
    master.data = "";
    mainMenu();
}

function siren()
{
    if (errorFlag == 2)
    {
        reader.beep(2);
    }
}

function appendVersions()
{
    name = storage.findFirst(/J490.+\.js$/);  // search for file name
    var file = storage.getHeader(name);
    if (file)
    {
        rev = file.match(/\$Revision: .*\$/);
        if (!rev)
        {
            rev = "N/A";     //didn't find a match
        }
        else                                //did find a match
        {
            rev = rev.toString();
            rev = rev.replace(/\$|Revision:|[ ]+/g, ""); //remove everything but the rev number
            if ( rev == "" ) rev = "N/A"; //if we are left with nothing...
        }
        while (rev.length < 4) //pad to 4 places
        {
            rev = " " + rev;
        }
    }
} //end appendVersions()
//////////////////////////////////////////////////////////////////////////
//EOF