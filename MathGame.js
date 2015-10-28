include(".cre.js");

ready.oldShow = ready.show;
ready.show = function(text, busy)
{
}

var menu = "";
var a = "";
var b = "";
var c = "";
var x = "";
var y = Number(0);
var z = Number(0);

function Main()
{
    main = new gui.Form();
    menu = main;
    main.append(new gui.Label("  "));
    main.append(new gui.Label("   MATH MATH"));
    main.append(new gui.Label("     The Game"));
    main.append(new gui.Label("  "));
    main.append(new gui.Label(" by Val Jensen"));
    main.leftSoftkey = new gui.Softkey("Options", mainOptions);
    main.rightSoftkey = new gui.Softkey("Exit", function(){reader.runScript(".cre.js");});
    gui.showForm(menu);
}
Main();

function randNumb()
{
    a = Number(Math.floor((Math.random() * 11)));
    b = Number(Math.floor((Math.random() * 11)));
    c = Math.floor((Math.random() * 4)+1);
    if(c == 1)
    {
        c = "+";
        x = a+b;
    }
    else if(c == 2)
    {
        c = "-";
        if(a>b)
        {
            x = a-b;
        }
        else
        {
            x = b-a;
        }
    }
    else if(c == 3)
    {
        c = "*";
        x = a*b;
    }
    else if(c == 4)
    {
        c = "/";
        if(a == 0 || b == 0)
        {
            randNumb();
        }
        else if(a>b)
        {
            x = a/b;
        }
        else
        {
            x = b/a;
        }
        x = Math.floor(x);
    }
}

function mainOptions()
{
    main.options = new gui.Form();
    menu = main.options;
    main.options.append(new gui.Button("Start", Start));
    main.options.append(new gui.Button("How to Play", h2p));
    main.options.append(new gui.Button("Don't click this", oops));
    main.options.rightSoftkey = new gui.Softkey("Back", Main);
    gui.showForm(menu);
}

function h2p()
{
    gui.alert(mainOptions, "A series of simple math equations will show up on the screen. Your job is to get them right. Have fun!", "How to Play");
}

function Start()
{
    start = new gui.Form(mathCheck, function(){y=Number(0);z=Number(0);mainOptions();});
    menu = start;
    randNumb();
    if(a>b)
    {
        start.append(new gui.Label("Solve " + a+c+b));
    }
    else
    {
        start.append(new gui.Label("Solve " + b+c+a));
    }
    if(c == "/")
    {
        start.append(new gui.Label("Round Down"));
    }
    else
    {
        start.append(new gui.Label(" "));
    }
    start.edit = new gui.Edit("");
    start.append(start.edit);
    start.append(new gui.Label("Total: " + (y+z)));
    if(y !=0 || z !=0)
    {
        start.append(new gui.Label("Correct\x25: " + (y / (y + z) )*100));
    }
    gui.showForm(menu);
}

function mathCheck()
{
    if(x == start.edit.text)
    {
        y++;
    }
    else if(x != start.edit.text)
    {
        z++;
    }
    Start();
}

function oops()
{
    gui.alert(mainOptions, "Coming soon!");
}