//-----------------------------------------------------------------------
// <copyright>
//     Copyright (c) 2010 Garrett Serack. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------

// bootstrap JS scripting library
with(new ActiveXObject("Scripting.FileSystemObject"))for(var x in p=(".;"+new ActiveXObject("WScript.Shell").Environment("PROCESS")("PATH")).split(";"))if(FileExists(j=BuildPath(p[x],"js.js"))){eval(OpenTextFile(j).ReadAll());break}

var Builtins = {
    cd : function(line) { return "cd('"+line+"');"; },
    md : function(line) { return "mkdir('"+line+"');"; },
    echo : function(line) { return "print('"+line+"');"; },
    dir: function(line) { return "dir( '"+line+"', /.*/);"; },
    erase : function(line) { return "erase('"+line+"');"; },
    del : function(line) { return "erase('"+line+"');"; },
    rd : function(line) { return "rmdir('"+line+"');"; },
    rmdir : function(line) { return "rmdir('"+line+"');"; }
}

if( $Arguments.length == 0 )
    Assert.Fail("Script name missing.\r\n\r\nUsage:\r\n   gs [/debug] <scriptname> [script-args...]");

var dumpScript = ($Arguments[0] == "/debug");

if( dumpScript )
    $Arguments.shift();

var gsScriptFilename = $Arguments[0] + (!/\.gs/i.exec($Arguments[0]) ? ".gs" : "");

try { gsScriptFilename = fullpath(Assert.Executable(gsScriptFilename)); } 
catch(ex) { Assert.Fail("Unable to find script {gsScriptFilename}\r\n\r\nUsage:\r\n   gs <scriptname> [script-args...]"); }

var script = ReadAll(gsScriptFilename).replace(/\r/g, "");

var jsblock =  /^\s*js\s*{/m ;

var ndx = script.search( jsblock );
var blocks = [];
var curblock = 0;
while(ndx > -1 ) {
    var blockname = "##JSBLOCK"+curblock;
    script = script.replace( jsblock , blockname );
    var blockstart = ndx+ blockname.length;
    var blockend = blockstart;
    var depth = 0;
    var cc = '';
    var end = script.length;
    while( depth >= 0 ) {
        if( blockend > end )
            Assert.Fail("Unmatched brace in js block!");
            
        switch( script.charAt(blockend++) ) {
            case '{':
                depth++;
                break;
            case '}':
                depth--;
                break;
        }
    }
    
    blocks[curblock++] = script.substring(blockstart, blockend-1);
    script = script.substring(0,blockstart)+script.substring(blockend);
    ndx = script.search( jsblock );
}

var scriptLines = script.split('\n');
var finalScript = [];
for(var i=0;i<scriptLines.length;i++) {
    var origline = scriptLines[i];
    var line = origline.Trim();
    
    if( line.length == 0  || /^(for)|(if)|(while)\s*\(/.exec(line) || /^[\{|\}]/.exec(line) || /^\/\//.exec(line) ) {
        finalScript.push(origline);
    } else if ( /^##JSBLOCK(.*)/.exec(line) ) {
        finalScript.push(blocks[RegExp.$1] );
    } else {
        var result = /^[a-zA-Z0-9_\$]*\s*=\s/.exec(line) || /^var\s*[a-zA-Z0-9_\$]*\s*=\s/.exec(line);
        
        if( result )
            line = line.substring(result[0].length) ;
        else 
            if( /^var\s*[a-zA-Z0-9_\$]*\s*;/.exec(line) ) {
                finalScript.push(line);
                continue;
            }
        line = line.replace("\\", "\\\\");
        
        var command = /^\S*/.exec(line);
        if( Builtins[command] ) {
            finalScript.push((result || '') +Builtins[command](line.substring(command[0].length+1)));
        }
        else {
            finalScript.push((result ?  result+'$$.RunQuiet': '$$') +'("'+line+'");');
        }
    }
}
$Arguments.shift();
finalScript = finalScript.join("\r\n").replace( /=\s#!\s*(.*)/g , '= $$$$.RunQuiet("$1");').replace( /#!\s*(.*)/g , '$$$$("$1");');
if( dumpScript )
    WScript.echo(finalScript);
else {
    WatchExpression = /.*/i
    eval(finalScript);
}


