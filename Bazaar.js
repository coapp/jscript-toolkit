var Bazaar = {
    $EXE: Assert.Executable("bzr.exe"),
    
    Status: function(path) {
        var result = {modified:[],unknown:[],added:[],removed:[],renamed:[]};
        path = cd( FormatArguments(arguments) || ".");
        $$.RunCaptured('"{Bazaar.$EXE}" status');
        var bucket = [];
        
        while( line = $StdOut.shift() ) {
            if( line.indexOf(':') > -1 )
                bucket = result[line.split(":")[0]];
            else
                bucket.push(line);
        }
        return result;
    },
    
    Commit: function(path,message) {
        path = cd( FormatArguments(path || ".",arguments) );
        message = FormatArguments(message || "" ,arguments);
 
        $$.RunCaptured('"{Bazaar.$EXE}" commit -m "{0}"', message);
        
        while( line = $StdErr.shift() ) {
            if( line.indexOf('Committed revision') == 0 )
                return 1*line.substring(19);
            if( line.indexOf('bzr: ERROR:') == 0 )
                return -1;
            }
        return -2;
    },
    Pull: function(path) {
        path = cd( FormatArguments(path || ".",arguments) );
        $$.RunCaptured('"{Bazaar.$EXE}" pull');
    }
}; 
Bazaar;