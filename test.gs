// comments are still slashies

// you can execute command lines just like regular batch languages:
// (this just prints the robocopy usage)
robocopy 

// Or you can capture the results of a command:
// (this uses the command processor to get a list of files (as text))
var $RESULT = cmd /c dir /b c:\*.zip

// there are built-in commands:
// so far cd, md, rd, erase, echo, dir
echo {$RESULT}


// and when you want to do some jscript, start a jscript block:
js {
    // this is a jscript code block
    //any legal jscript is ok here!

    // of course, you have access to the js.js function library:
    print("hello World");

    // and functions work just fine:
    function foo() {
    
        // you can even run batch commands from where with hash-bang:
        $WGETHELP = #! wget --help

        #! cmd.exe /c ver

        // output from the last command is always captured as an array in
        // $StdOut and as a string in $StdOutString
        print($StdOutString);

        return $WGETHELP;
    }
   
}

// oh, and for loops work outside the js blocks in the batch-world too:
// prints out text:
for(var i=0;i<10;i++)
    echo {$RESULT} {i}