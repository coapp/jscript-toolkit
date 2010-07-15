var CSharp = {
    compilers: "c:\\windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe;c:\\windows\\Microsoft.NET\\Framework\\v3.5\\csc.exe;c:\\windows\\Microsoft.NET\\Framework\\v2.0.50727\\csc.exe",
    GetCompiler : function() {
     with($$.fso)
        for(var x in p=(CSharp.compilers).split(";"))
            if(FileExists(p[x]))
                return p[x];
        return "";
    }, 
    
    Compile : function(path, targetPath) {
        path = Assert.File(FormatArguments(arguments));
        targetPath = $$.fso.GetAbsolutePathName(FormatArguments(targetPath, arguments));

        if( ($Globals.$CSC = CSharp.GetCompiler()) == '' ) 
            return false;
            
        return $$( '"{$CSC}" /nologo /out:"{1}" {0}',path, targetPath);

    },
    
    CompileW : function(path, targetPath) {
        path = Assert.File(FormatArguments(arguments));
        targetPath = $$.fso.GetAbsolutePathName(FormatArguments(targetPath, arguments));

        if( ($Globals.$CSC = CSharp.GetCompiler()) == '' ) 
            return false;
            
        return $$( '"{$CSC}" /nologo /t:winexe /out:"{1}" {0}',path, targetPath);
    },
    
    CompileTmp : function(path) {
        path = Assert.File(FormatArguments(arguments));
        var targetPath = '{$TMP}\\'+ (path.replace( /(.*\\)(.*)/g, "$2.exe")); 
        if( exists(targetPath) ) 
            try { erase( targetPath ) } catch(e) { return targetPath; }
        CSharp.Compile(path,targetPath);
        return targetPath;
    },
    
    CompileTmpW : function(path) {
        path = Assert.File(FormatArguments(arguments));
        var targetPath = '{$TMP}\\'+ (path.replace( /(.*\\)(.*)/g, "$2.exe")); 
        if( exists(targetPath) ) 
            try { erase( targetPath ) } catch(e) { return targetPath; }
        CSharp.CompileW(path,targetPath);
        return targetPath;    
    },
    
    Run : function(path, argstring) {
        path = Assert.File(FormatArguments(arguments));
        argstring = FormatArguments(argstring,arguments);
        
        targetPath = '{$TMP}\\'+path.replace( /(.*\\)(.*)/g, "$2"); 
        
        CSharp.Compile(path,targetPath);
        return $$( '"{0}" {1}', targetPath, argstring );
    },
    RunW : function(path, argstring) {
        path = Assert.File(FormatArguments(arguments));
        argstring = FormatArguments(argstring,arguments);
        
        targetPath = '{$TMP}\\'+ (path.replace( /(.*\\)(.*)/g, "$2")); 
        
        CSharp.CompileW(path,targetPath);
        return $$( '"{0}" {1}', targetPath, argstring );
    }
    
};

CSharp;

/*

    var args="";
    var exename = WScript.ScriptFullName.replace( /\.js$/gi , ".exe" ); 

    var et=" /t:exe"; if( WScript.FullName.toUpperCase().indexOf("WSCRIPT.EXE" ) != -1 ) et=" /t:winexe"; 
    for( each =0; each< WScript.Arguments.length; each++)
        args= args+" "+WScript.Arguments(each);
    var compilers = new Object(); compilers['.js.js'] = 'jsc.exe'; compilers['.cs.js'] = 'csc.exe'; compilers['.vb.js'] ='vbc.exe';
    var WSHShell = WScript.CreateObject("WScript.Shell") ;
    var fso = WScript.CreateObject("Scripting.FileSystemObject");
    var compiler = compilers[WScript.ScriptName.substr( WScript.ScriptName.length - 6).toLowerCase()];
    if( ""+compiler == "undefined" ) 
        WScript.quit(WSHShell.popup("Unable to determine compiler type from filename"));
    try {
        compiler = WSHShell.RegRead("HKLM\\Software\\Microsoft\\.NETFramework\\InstallRoot") + "v2.0.50727\\"+ compiler;
        if( !fso.FileExists( compiler ) )
            throw new Error(".NET 2.0 not found");
        if( fso.FileExists( exename ) )
            fso.DeleteFile( exename );
    } catch( e ) {WScript.quit(WSHShell.popup("You do not appear to have .NET 2.0 installed.\n\nYou must install .NET 2.0."));}
    var Pipe = WSHShell.Exec(compiler+et+" /nologo /out:\""+exename+"\" \""+WScript.ScriptFullName+"\"" );
    while(!Pipe.StdOut.AtEndOfStream)
        WScript.StdOut.WriteLine(Pipe.StdOut.ReadLine());
    if( fso.FileExists( exename) )
        var Pipe =WSHShell.Exec(exename);
    while(!Pipe.StdOut.AtEndOfStream)
        WScript.StdOut.WriteLine(Pipe.StdOut.ReadLine());
    WScript.quit(0);
    
*/