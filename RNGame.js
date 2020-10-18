/* Filename: JXXX_RNG.js
 * Description: Random Number Game
 * $Title: RNG$
 * $Revision: 697 $
 * $Date: 2014-07-01 07:49:06 -0600 (Tue, 01 Jul 2014) $
 * $Author: val.jensen $
*/
include(".cre.js");
 
ready.oldShow = ready.show;
ready.show = function(text, busy)
{
}

var a = "10";
var b = "100";
var c = "1000";
var f = "";
var x = "";
var y = "";
var z = "";
var i = "";
var menu = "";

function Main()
{
    gui.clearSplash();
    reader.processCommand('P', "(39)1");
    reader.processCommand('P', "(3a)1");
    reader.processCommand('P', "(3c)1");
    MM = new gui.Form();
    menu = MM;
    MM.append(new gui.Label("Random"));
    MM.append(new gui.Label("      Number"));
    MM.append(new gui.Label("               Game"));
    MM.append(new gui.Label(" "));
    MM.append(new gui.Label(" by Val Jensen"));
    MM.leftSoftkey = new gui.Softkey("Menu", mainOptions);
    MM.rightSoftkey = new gui.Softkey("Exit", function(){reader.runScript(".cre.js");});
    gui.showForm(menu);
}

function mainOptions()
{
    MM.options = new gui.Form();
    menu = MM.options;
    MM.options.append(new gui.Button("Start", Start));
    MM.options.append(new gui.Button("How to Play", h2p));
    MM.options.append(new gui.Button("Blow up CR3600", blow));
    MM.options.rightSoftkey = new gui.Softkey("Back", Main);
    gui.showForm(menu);
}

function h2p()
{
    gui.alert(mainOptions, "The goal of the game is to guess the random number that the CR3600 generates. If you guess wrong, the number will change to a new number. It's your job to do the math, based on the given move value, to figure out/keep up with the new number. Have fun!", "How To Play");
}

function blow()
{
    reader.beep(15);
    reader.writeSetting(0x35, 3000);
    reader.processCommand('$', "\x03");
    gui.splash("pic.img", "Oops...");
    setTimeout(function(){gui.clearSplash(); reader.writeSetting(0x35, 0);mainOptions();}, 3000);
    gui.clearSplash();
}

function Start()
{
    MM.start = new gui.Form(StartOnOk, Main);
    menu = MM.start;
    MM.start.append(new gui.Label("Please choose"));
    MM.start.append(new gui.Label("a difficulty"));
    MM.start.append(new gui.Label("1 - EZ    2 - Med"));
    MM.start.append(new gui.Label("     3 - Hard"));
    MM.start.edit = new gui.Edit("", gui.inputMode.numeric, gui.inputMode.numeric);
    MM.start.append(MM.start.edit);
    i = 0;
    gui.showForm(menu);
}

function StartOnOk()
{
    if(parseInt(MM.start.edit.text, 10))
    {
        if(parseInt(MM.start.edit.text, 10) == 1)
        {
            z = Math.floor((Math.random() * 10) + 1);
            f = a;
        }
        else if(parseInt(MM.start.edit.text, 10) == 2)
        {
            z = Math.floor((Math.random() * 100) + 1);
            f = b;
        }
        else if(parseInt(MM.start.edit.text, 10) == 3)
        {
            z = Math.floor((Math.random() * 1000) + 1);
            f = c;
        }
        else
        {
            gui.alert(Start, "Not a valid choice.", "Not Valid");
        }
        f = Number(f);
        Guess();
    }
    else
    {
        gui.alert(Start, "Please enter a choice.", "Blank Entry");
    }
}

function Guess()
{
    guess = new gui.Form(GuessCheck, Main);
    menu = guess;
    guess.append(new gui.Label("I'm thinking of"));
    guess.append(new gui.Label("a number"));
    guess.append(new gui.Label("between 1 and"));
    guess.append(new gui.Label(f + ". Guess it!"));
    guess.edit = new gui.Edit("");
    guess.append(guess.edit);
    gui.showForm(menu);
}

function GuessCheck()
{
    i++;
    check = new gui.Form(GuessCheck, Main);
    menu = check;
    guess.edit.text = Number(guess.edit.text);
    if(guess.edit.text > f)
    {
        gui.alert(Guess, "Your guess is above the range. Try again!", "Out of Range");
    }
    else if(!guess.edit.text)
    {
        gui.alert(Guess, "Please enter in a value", "Blank answer");
    }
    else if(guess.edit.text.match(/^cheat$/i))
    {
        gui.alert(Guess, z + " is the answer, you cheater! Adding 1 to guess total!", "CHEATER!");
    }
    else if(z > guess.edit.text || z < guess.edit.text)
    {
        check.append(new gui.Label("Your number is"));
        if(z < guess.edit.text)
        {
            check.append(new gui.Label("too high. I move"));
        }
        else if(z > guess.edit.text)
        {
            check.append(new gui.Label("too low. I move"));
        }
        check.append(new gui.Label("my number by"));
        if(parseInt(MM.start.edit.text, 10) == 1)
        {
            x = Math.floor((Math.random() * 10) + 1);
        }
        else if(parseInt(MM.start.edit.text, 10) == 2)
        {
            x = Math.floor((Math.random() * 100) + 1);
        }
        else if(parseInt(MM.start.edit.text, 10) == 3)
        {
            x = Math.floor((Math.random() * 1000) + 1);
        }
        x = x + 1;
        y = x - z;
        y = y.toString();
        z = x;
        check.append(new gui.Label(y));
        guess.edit = new gui.Edit("");
        check.append(guess.edit);
        gui.showForm(menu);
    }
    else if(z == guess.edit.text)
    {
        check.append(new gui.Label("You guessed it!"));
        check.append(new gui.Label("The answer"));
        check.append(new gui.Label("was " + z));
        check.append(new gui.Label("Play again?"));
        check.append(new gui.Label("Guesses: " + i));
        check.leftSoftkey = new gui.Softkey("Yes", Start);
        check.rightSoftkey = new gui.Softkey("No", function(){reader.runScript(".cre.js");});
        gui.showForm(menu);
    }
}

Main();
