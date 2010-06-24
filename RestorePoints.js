//-----------------------------------------------------------------------
// <copyright>
//     Copyright (c) 2010 Garrett Serack. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------

var RestorePoints = {
    Create : function (restorePointName) {
        restorePointName = FormatArguments(arguments);
        var srp = GetObject('winmgmts:{impersonationLevel=impersonate}!root/default:SystemRestore');
        Assert.Value( (srp.CreateRestorePoint(restorePointName , 0, 100) == 0), "Unable to create a restore point.");  
    },
    List : function (driveLetter) {
        $$('{$$.GetSysNativeFolder()}\\vssadmin list shadows /for={0}', driveLetter);
        
        var point = {};
        var points = [];
        for(var each in $StdOut) {
            with(RegExp) {
                if( /creation.time.*:(.*)\/(.*)\/(.*) (.*):(.*):(.*) (.*)/ig.exec($StdOut[each]) )
                    point.date = new Date($3, $1, $2, (($7).Trim() == "PM"?12:0)+ $4 ,$5,$6);
                if( /Shadow Copy Volume: (.*)/ig.exec($StdOut[each]) ) {
                    point.mountPoint = $1;
                    points.push(point);
                    point = {};
                }
            }
        }
        //for( var i=0;i<points.length;i++)
        //    print("Point [{0}] at [{1}] ", points[i].date , points[i].mountPoint );
        return points;
    },
    FindPreviousVersions: function(filename) {
        
        var jsTemp = mkdir("{$TEMP}\\jsTemp");
        var results = [];
        
        filename = fullpath(FormatArguments(filename, arguments));
        Assert.Value( filename.charAt(1) == ":" , "File must be on a local drive");
        var hashes = [];
        
        if( exists( filename ) )
            hashes.push(md5(filename));
            
        var driveLetter = filename.substring(0,2);
        var subPath = filename.substring(2);
        var name = filename.replace( /(.*\\)(.*)/g , "$2" );
        var versions = this.List(driveLetter);
        
        found:
        for(var i=0;i<versions.length;i++) {
            var tmpSrc = "{0}{1}".Format( versions[i].mountPoint,subPath );
            var tmpFile = "{0}\\{1}-{2}".Format( jsTemp, name,i+1);
            
            erase(tmpFile);
            try {
                copyAsSymlink( tmpSrc , tmpFile );
            } catch( x ) {
                break found; // actually not, there isn't a file in that set!
            }
            var h = md5(tmpFile);
            for(var j=0;j<hashes.length;j++) 
                if( hashes[j] === h ) 
                    break found;
            
            hashes.push(h); // remember this one     
            results.push( { restorePath:tmpSrc , date:versions[i].date, hash:h, originalPath:filename, name:name, tmpFile:tmpFile  } );            
            erase(tmpFile); // clean up.
        }
        return results;
    },
    PrintPreviousVersions : function(filename) {
        filename = FormatArguments(arguments);
        var versions = this.FindPreviousVersions(filename);
        if( versions.length > 0 ) {
            Print("Available versions of file [{0}]", filename );
            Print("--------------------------");
            
            for(var i=0;i<versions.length;i++)
                Print("  {0}. [{1}]:[{2}]",i+1, versions[i].hash , versions[i].date );
            }
        else
            Print("No previous versions found that differ from the current version");
    },
    RestorePreviousVersion : function(srcFilename, destFilename, index ) {
        filename = FormatArguments(srcFilename, arguments);
        destFilename = destFilename || srcFilename;
        destFilename = FormatArguments(destFilename, arguments);
        var versions = this.FindPreviousVersions(filename);
        index = index || versions.length;
        
        if( 0 == index  )
            index = versions.length;
            
        if( index < 0 )
            index = versions.length + index +1;
            
        Assert.Value( index > 0 && index <= versions.length , "No previous version with that number present. "+ index );
        
        this.Restore( versions[index-1] , destFilename );
    },
    Restore : function( restoreObj , destFilename ) {
        if( restoreObj == null )
            return;
            
        var destFilename = FormatArguments(destFilename, arguments);
        
        mkdir("{$TEMP}\\jsTemp");
        erase(restoreObj.tmpFile);
        copyAsSymlink( restoreObj.restorePath , restoreObj.tmpFile );
        copy( restoreObj.tmpFile, destFilename );
        erase(restoreObj.tmpFile);
    }
};

RestorePoints;