/* Filename: Cust_Inv.js
 * Description: Custom Inventory App
 * $Title: Inventory$
 * $Revision: 700 $
 * $Date: 2014-07-01 10:13:45 -0600 (Tue, 01 Jul 2014) $
 * $Author: val.jensen $
*/
include(".cre.js");

ready.oldShow = ready.show;
ready.show = function(text, busy)
{
}

/////////////Global Settings/////////////////
reader.writeSetting(0x08, 1);               //Raw data
reader.processCommand('C', "(1b)5");        //USB HID Communication (Downloader Mode)
reader.writeSetting(0x2d, 7);               //US English Keyboard w/Ctrl+Char for NPASCII
reader.writeSetting(0x93, 1);               //Let JavaScript handle the beep
///////////////End Settings/////////////////

/////////////Global Variables///////////////
var file = "";
var beep = "";
var vibrate = reader.readSetting(0xa1);
var checked2 = reader.readSetting(0x26);
if(checked2 != 1)
{
    checked2 = true;
}
else
{
    checked2 = false;
}
var hQ = "1";
var a = "";
var b = "";
var c = "";
var i = 0;
var x = "";
var z = "";
var mode = "";
var menu = "";
var scanSKU = "SKU";
var scanQty = "QTY";
var flag = 0;
var trip = 0;

function triggerOn()
{
    reader.processCommand('P', "(39)3");
    reader.processCommand('P', "(3a)3");
    reader.processCommand('P', "(3c)3");
}

function triggerOff()
{
    reader.processCommand('P', "(39)1");
    reader.processCommand('P', "(3a)1");
    reader.processCommand('P', "(3c)1");
}
///////////End Global Variables///////////

///////////Boot-up File Check/////////////
file = storage.findFirst(/^inventoryUpdate.txt$/);
if(file)
{
    gui.confirm(onYesClick, onNoClick, "Inventory file is present; Continue scanning or start over?", "Data Present", "Cont.", "New");
}
else
{
    Main();
}

////////////Undock File Check/////////////
reader.onIdle = function()
{
    file = storage.findFirst(/^inventoryUpdate.txt$/);
    if(reader.charging && file)
    {
        flag = 1;
    }
    else if(!reader.charging && flag == 1)
    {
        file = storage.findFirst(/^inventoryUpdate.txt$/);
        if(file)
        {
            gui.confirm(onYesClick, onNoClick, "Inventory file is present; Continue scanning or start over?", "Data Present", "Cont.", "New");
        }
        flag = 0;
    }
}

function onYesClick()
{
    Main();
}

function onNoClick()
{
    storage.erase("inventoryUpdate.txt");
    Main();
}

///////////////Main Screen////////////////
function Main()
{
    PM = new gui.Menu();
    menu = PM;
    PM.append(new gui.Label(" Customer A"));
    PM.append(new gui.Label("     Inventory"));
    PM.append(new gui.Label("   Application"));
    PM.leftSoftkey = new gui.Softkey("Options", function(){Options();});
    PM.rightSoftkey = new gui.Softkey("");
    mode = scanSKU;
    triggerOff();
    gui.showForm(menu);
}

/////////////Options Screen//////////////
function Options()
{
    PM.options = new gui.Form();
    menu = PM.options;
    gui.statusText = "Options";
    PM.options.rightSoftkey = new gui.Softkey("Back", function(){Main();});
    PM.options.append(new gui.Button("Add Inventory", addOnClick));
    PM.options.append(new gui.Button("Remove Inventory", subOnClick));
    PM.options.append(new gui.Button("Settings", function(){localSettings();}));
    gui.showForm(menu);
}

function addOnClick()
{
    c = "ADD";
    Sku();
}

function subOnClick()
{
    c = "SUBTRACT";
    Sku();
}

////////////Settings Screen/////////////
function localSettings()
{
    PM.settings = new gui.Form();
    menu = PM.settings;
    gui.statusText = "Settings";
    PM.settings.rightSoftkey = new gui.Softkey("Back", function(){Options();});
    PM.settings.append(new gui.Button("Beep/Vibrate", beepVibrate));
    file = storage.findFirst(/^inventoryUpdate.txt$/);
    if(file)
    {
        PM.settings.append(new gui.Button("Delete File", fileDelete));
        PM.settings.append(new gui.Button("Review Records", recordReview));
    }
    PM.settings.append(new gui.Button("Shutdown", shutdown));
    gui.showForm(menu);
}

////File Deletion Confirm Screen///
function fileDelete()
{
    gui.confirm(onNoClick, localSettings(), "Are you sure you want to delete the inventory file?", "Confirm?", "Yes", "No");
}

///////Reader Shutdown Screen//////
function shutdown()
{
    gui.confirm(confirmSD, localSettings(), "Shut down the reader?", "Shutdown?", "Yes", "No");
}

function confirmSD()
{
    reader.processCommand('P', "(88)1");
    reader.processCommand('P', "(32)1");
    reader.processCommand('P', "(9e)1");
    reader.processCommand('P', "(9f)1");
    reader.processCommand('P', "(8e)1");
}

//////////Beep-Vibrate Screen//////////
function beepVibrate()
{
    PM.bv = new gui.Form();
    menu = PM.bv;
    PM.bv.append(new gui.ToggleButton("Vibrate", vibrate, vibrateOnClick));
    PM.bv.append(new gui.ToggleButton("Beep", checked2, beepOnClick));
    PM.bv.rightSoftkey = new gui.Softkey("Back", function(){localSettings();});
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
        reader.writeSetting(0x26, 1);
        checked2 = false;
    }
    else
    {
        reader.writeSetting(0x26, beep);
        reader.beep(1);
        checked2 = true;
    }
    gui.showForm(menu);
}

/////////////SKU Screen///////////////
function Sku()
{
    PM.sku = new gui.Form(scanSkuOnOK, scanOncancel);
    menu = PM.sku;
    mode = scanSKU;
    if(c == "ADD")
    {
        PM.sku.caption = "Add";
        PM.sku.append(new gui.Label(" Add Inventory"));
        PM.sku.append(new gui.Label(" "));
    }
    else if(c == "SUBTRACT")
    {
        PM.sku.caption = "Remove";
        PM.sku.append(new gui.Label("       Remove"));
        PM.sku.append(new gui.Label("     Inventory"));
    }
    PM.sku.append(new gui.Separator(8, gui.separatorStyle.horizontalLine));
    PM.sku.edit = new gui.Edit("", gui.inputMode.numeric, gui.inputMode.numeric);
    PM.sku.append(PM.sku.edit);
    PM.sku.append(new gui.Label("Scan/Type SKU"));

    triggerOn();
    gui.showForm(menu);
}

function scanSkuOnOK()
{
    a = PM.sku.edit.text;
    if(!a)
    {
        alert(Sku, "SKU is empty!");
    }
    else
    {
        b = "1";
        populate();
    }
}

/////////////QTY Screen///////////////
function qty()
{
    PM.qty = new gui.Form(scanQtyOnOK, scanOnCancelQty);
    menu = PM.qty;
    mode = scanQty;
    PM.qty.edit = new gui.Edit("", gui.inputMode.numeric, gui.inputMode.numeric);
    PM.qty.append(PM.qty.edit);
    PM.qty.append(new gui.Label(" "));
    PM.qty.append(new gui.Label("  Scan or Type"));
    PM.qty.append(new gui.Label("      Qty for"));
    PM.qty.append(new gui.Label("  "+a));

    gui.showForm(menu);
}

function scanQtyOnOK()
{
    if(parseInt(PM.qty.edit.text, 10))
    {
        b = parseInt(PM.qty.edit.text, 10);
    }
    populate();
}

function scanOncancel()
{
    Main();
}

function scanOnCancelQty()
{
    populate();
}

/////////////Confirm Screen//////////
function populate()
{
    PM.popu = new gui.Form();
    PM.popu.leftSoftkey = new gui.Softkey("OK", function(){createFile();});
    PM.popu.rightSoftkey = new gui.Softkey("Quantity", function(){hQ = b.toString(); qty();});
    PM.popu.append(new gui.Label("SKU: "));
    PM.popu.append(new gui.Label("  "+a));
    PM.popu.append(new gui.Label("QTY: "));
    PM.popu.append(new gui.Label("  "+b));
    PM.popu.append(new gui.Label("ADD/SUB:  " + c));
    mode = scanQty;
    menu = PM.popu;
    gui.showForm(menu);
}

////////Record Review Screen//////////
function recordReview()
{
    triggerOff();
    if(trip == 0)
    {
        trip = 1;
        i = 0;
        var str = storage.read("inventoryUpdate.txt");
        z = str.split("\x0d\x0a");
        if(z[z.length] == null)
        {
            z.pop();
        }
    }
    PM.review = new gui.Menu();
    PM.review.onKey = function(key)
    {
        switch( key )
        {
            case gui.key.left:
                i--;
                if(i<0)
                {
                    i = z.length-1;
                }
                recordReview();
                break;
            case gui.key.right:
                i++;
                if(i == z.length)
                {
                    i = 0;
                }
                recordReview();
                break;
            default:
                gui.sendKey(Key);
        }
    }
    menu = PM.review;
    if(z[0] == null)
    {
        PM.review.leftSoftkey = new gui.Softkey("");
        PM.review.rightSoftkey = new gui.Softkey("Back", function(){storage.erase("inventoryUpdate.txt"); file = ""; trip = 0; Main();});
        PM.review.append(new gui.Label("No Data on"));
        PM.review.append(new gui.Label("reader"));
    }
    else
    {
        a = z[i].match(/^[^\x09]+/i).toString();
        b = z[i].match(/\x09[0-9]+\x09/).toString();
        b = b.replace(/\x09/g, "");
        c = z[i].match(/(ADD|SUBTRACT)$/).toString();
        c = c.replace(/,.+$/, "");
        PM.review.leftSoftkey = new gui.Softkey("Options", function(){reviewEdit();});
        PM.review.rightSoftkey = new gui.Softkey("Back", function(){cleanup();});
        PM.review.append(new gui.Label("Record "+ Number(i+1)));
        PM.review.append(new gui.Button(a));
        if(c.match(/ADD/)){PM.review.append(new gui.Button("Net QTY: " + b));}
        else{PM.review.append(new gui.Button("Net QTY: -" + b));}
    }
    gui.showForm(menu);
}

function cleanup()
{
    z = z.join("\x0d\x0a");
    storage.write("inventoryUpdate.txt", z + "\x0d\x0a");
    trip = 0;
    localSettings();
}

///////////Review Edit Screen//////////
function reviewEdit()
{
    triggerOff();
    PM.reviewedit = new gui.Menu();
    menu = PM.reviewedit;
    PM.reviewedit.rightSoftkey = new gui.Softkey("Back", function(){recordReview();});
    PM.reviewedit.append(new gui.Button("Delete Record", deleteRecord));
    PM.reviewedit.append(new gui.Button("Edit QTY", qtyEdit));
    gui.showForm(menu);
}

////Record Deletion Confirm Screen////
function deleteRecord()
{
    gui.confirm(confirmDelete, recordReview(), "Are you sure you want to delete this single item?", "Confirm?", "Yes", "No");
}

function confirmDelete()
{
    z.splice(i,1);
    i=0;
    recordReview();
}

/////Record Quantity Edit Screen////
function qtyEdit()
{
    triggerOff();
    PM.qtyedit = new gui.Form(editQtyOnOK, reviewEdit);
    menu = PM.qtyedit;
    PM.qtyedit.edit = new gui.Edit(b, gui.inputMode.numeric, gui.inputMode.numeric);
    PM.qtyedit.append(PM.qtyedit.edit);
    PM.qtyedit.append(new gui.Label(" "));
    PM.qtyedit.append(new gui.Label("Type Qty for"));
    PM.qtyedit.append(new gui.Label("  "+a));

    gui.showForm(menu);
}

function editQtyOnOK()
{
    b = parseInt(PM.qtyedit.edit.text, 10);
    z[i] = z[i].replace(/.+/, a + "\x09" + b + "\x09" + c);
    recordReview();
}

/////////Decode Functions////////
reader.onDecodeOld = reader.onDecode;
reader.onDecode = function(decode)
{
    switch (mode)
    {
        case scanSKU:
            reader.beep(1);
            a = decode.data;
            b = "1";
            b = Number(b);
            mode = scanQty;
            populate();
            break;

        case scanQty:
            reader.beep(1);
            if(decode.data == a)
            {
                hQ++;
                b++;
                if(menu == PM.popu)
                {
                    populate();
                }
                else
                {
                    qty();
                }
                break;
            }
            else if(decode.data.length>7)
            {
                x = decode.data;
                quickScan();
                break;
            }
            b = decode.data;
            populate();
            break;

        default:
            reader.beep(3);
    }
}

function quickScan()
{
    file = storage.findFirst(/^inventoryUpdate.txt$/);
    if(!file)
    {
        storage.write("inventoryUpdate.txt", a + "\t" + b + "\t" + c + "\x0d\x0a");
    }
    else
    {
        var str = storage.read("inventoryUpdate.txt");
        z = str.split("\x0d\x0a");
        z.pop();
        for (i=0; i<=z.length-1; i++)
        {
            if(z[i] == null)
            {
                z[i].pop();
            }
            var y = z[i].toString();
            var dataRegEx = new RegExp(a,"g")
            if(y.match(dataRegEx))
            {
                var r = z[i].match(/\x09[0-9]+\x09/);
                var dF = y.match(/(ADD|SUBTRACT)$/).toString();
                dF = dF.replace(/,.+$/, "");
                if(dF == c)
                {
                    r = Number(r) + 1;
                    z[i] = z[i].replace(/\x09[0-9]+\x09/, "\x09" + r + "\x09");
                    break;
                }
                else
                {
                    if(Number(r-b)>0)
                    {
                        r = Number(r-b);
                        z[i] = z[i].replace(/\x09[0-9]+\x09/, "\x09" + r + "\x09");
                        break;
                    }
                    else if(Number(r-b)==0)
                    {
                        z.splice(i,1);
                        break;
                    }
                    else if(Number(r-1)<0)
                    {
                        r = Number(r-qty)*-1;
                        z[i] = z[i].replace(/.+/, a + "\x09" + r + "\x09" + c);
                        break;
                    }
                    else if(i==z.length-1)
                    {
                        z.push(a + "\x091\x09" + c);
                        break;
                    }
                    else
                    {
                        continue;
                    }
                }
            }
            else if(i==z.length-1)
            {
                z.push(a + "\x09" + b + "\x09" + c);
                break;
            }
        }
        z = z.join("\x0d\x0a");
        if(z)
        {
            storage.write("inventoryUpdate.txt", z + "\x0d\x0a");
        }
        else if(!z)
        {
            storage.erase("inventoryUpdate.txt");
        }
    }
    a = x;
    b = "1";
    b = Number(b);
    if(menu == PM.popu)
    {
        populate();
    }
    else
    {
        qty();
    }
}

function createFile()
{
    file = storage.findFirst(/^inventoryUpdate.txt$/);
    if(!file)
    {
        storage.write("inventoryUpdate.txt", a + "\t" + b + "\t" + c + "\x0d\x0a");
    }
    else
    {
        var str = storage.read("inventoryUpdate.txt");
        z = str.split("\x0d\x0a");
        z.pop();
        for (i=0; i<=z.length-1; i++)
        {
            if(z[i] == null)
            {
                z[i].pop();
            }
            var y = z[i].toString();
            var dataRegEx = new RegExp(a,"g")
            if(y.match(dataRegEx))
            {
                var r = z[i].match(/\x09[0-9]+\x09/);
                var dF = y.match(/(ADD|SUBTRACT)$/).toString();
                dF = dF.replace(/,.+$/, "");
                if(dF == c)
                {
                    r = Number(r) + b;
                    z[i] = z[i].replace(/\x09[0-9]+\x09/, "\x09" + r + "\x09");
                    break;
                }
                else
                {
                    if(Number(r-b)>0)
                    {
                        r = Number(r-b);
                        z[i] = z[i].replace(/\x09[0-9]+\x09/, "\x09" + r + "\x09");
                        break;
                    }
                    else if(Number(r-b)==0)
                    {
                        z.splice(i,1);
                        break;
                    }
                    else if(Number(r-b)<0)
                    {
                        r = Number(r-b)*-1;
                        z[i] = z[i].replace(/.+/, a + "\x09" + r + "\x09" + c);
                        break;
                    }
                    else if(i==z.length-1)
                    {
                        z.push(a + "\x09" + b + "\x09" + c);
                        break;
                    }
                    else
                    {
                        continue;
                    }
                }
            }
            else if(i==z.length-1)
            {
                z.push(a + "\x09" + b + "\x09" + c);
                break;
            }
        }
        z = z.join("\x0d\x0a");
        if(z)
        {
            storage.write("inventoryUpdate.txt", z + "\x0d\x0a");
        }
        else if(!z)
        {
            storage.erase("inventoryUpdate.txt");
        }
    }
    hQ = "1";
    Sku();
}